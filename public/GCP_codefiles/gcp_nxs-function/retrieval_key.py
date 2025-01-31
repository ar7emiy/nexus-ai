import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel
import json
from typing import List, Optional
import numpy as np
from numpy.linalg import norm
import pandas as pd
from google.cloud import storage
import os
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'])



PROJECT_ID = "silver-idea-432502-c0"
REGION = "us-central1"
MODEL_ID = "text-embedding-004"
BUCKET_NAME_1 = "nxs_bucket1"

vertexai.init(project=PROJECT_ID, location=REGION, credentials=credentials)

def embed_text(
    texts: List[str],
    task: str = "RETRIEVAL_QUERY",
    model_name: str = "text-embedding-004",
    dimensionality: Optional[int] = 768,
) -> List[List[float]]:
    model = TextEmbeddingModel.from_pretrained(model_name)
    inputs = [TextEmbeddingInput(text, task) for text in texts]
    kwargs = dict(output_dimensionality=dimensionality) if dimensionality else {}
    embeddings = model.get_embeddings(inputs, **kwargs)
    return [embedding.values for embedding in embeddings]

def load_data():
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(BUCKET_NAME_1)
    blob = bucket.blob('transcription_embeddings.json')
    data = json.loads(blob.download_as_string())
    return data

def cosine_similarity(vector_a, vector_b):
    vector_a = np.array(vector_a)
    vector_b = np.array(vector_b)
    cosine_score = np.dot(vector_a,vector_b)/(norm(vector_a)*norm(vector_b))
    return cosine_score

def retrieve(query):
    data = load_data()
    embed_query = embed_text(texts=[query])
    df_data = {
        "transcript": [transcript["transcript"] for transcript in data],
        "time_stamp": [time_stamp["time_stamp"] for time_stamp in data],
        "embeddings": [embedding["embeddings"] for embedding in data]
    }
    cosine_scores = [cosine_similarity(embedding["embeddings"], embed_query[0]) for embedding in data]
    df_data["cosine_score"] = cosine_scores
    df = pd.DataFrame(df_data)
    df.sort_values(by=["cosine_score"], ascending=False, inplace=True)
    
    top_14 = df[["transcript", "time_stamp", "cosine_score"]].head(14).to_dict('records')
    
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(BUCKET_NAME_1)
    blob = bucket.blob('retrieved_segments.json')
    blob.upload_from_string(json.dumps(top_14, indent=2))

    return top_14
