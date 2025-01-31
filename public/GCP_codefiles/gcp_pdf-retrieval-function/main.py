import functions_framework
import json
import logging
from google.cloud import storage
import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel
from vertexai.generative_models import GenerativeModel, GenerationConfig
import os
from google.oauth2 import service_account
import numpy as np
from numpy.linalg import norm
from typing import List, Optional
import re
import datetime
import unicodedata

# Set up logging
logging.basicConfig(level=logging.INFO)

# Initialize credentials and Vertex AI
credentials = service_account.Credentials.from_service_account_file('nxs-txtembed-sa-key.json')

PROJECT_ID = "silver-idea-432502-c0"
REGION = "us-central1"
MODEL_NAME = "gemini-1.0-pro"
EMBEDDING_MODEL = "text-embedding-004"
BUCKET_NAME = "nxs_bucket1"

vertexai.init(project=PROJECT_ID, location=REGION, credentials=credentials)
GenAI_modelConfig = GenerationConfig(max_output_tokens=250)

def embed_text(texts: List[str], model_name: str = EMBEDDING_MODEL) -> List[List[float]]:
    model = TextEmbeddingModel.from_pretrained(model_name)
    embeddings = model.get_embeddings(texts)
    return [embedding.values for embedding in embeddings]

def load_pdf_embeddings():
    logging.info("Loading PDF embeddings")
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob('pageCoord_emb_IntroMLpaper.json')
    data = json.loads(blob.download_as_string())
    logging.info(f"Loaded PDF embeddings with {len(data)} items")
    return data

def cosine_similarity(vector_a, vector_b):
    vector_a = np.array(vector_a)
    vector_b = np.array(vector_b)
    cosine_score = np.dot(vector_a, vector_b) / (norm(vector_a) * norm(vector_b))
    return cosine_score

def preprocess_text(text):
    # Normalize Unicode characters
    text = unicodedata.normalize('NFKD', text)
    # Replace newlines and tabs with spaces
    text = re.sub(r'[\n\t]', ' ', text)
    # Remove other escape sequences
    text = re.sub(r'\\[a-zA-Z]', '', text)
    # Normalize spaces
    text = re.sub(r'\s+', ' ', text)
    # Remove non-printable characters
    text = ''.join(char for char in text if unicodedata.category(char)[0] != 'C')
    return text.strip()

def retrieve_pdf_snippets(query, pdf_data, top_k=20):
    logging.info(f"Retrieving PDF snippets for query: {query}")
    query_embedding = embed_text([query])[0]
    
    similarities = [(i, cosine_similarity(query_embedding, item['embeddings'])) 
                    for i, item in enumerate(pdf_data)]
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    top_snippets = [
        {
            'chunk_text': preprocess_text(pdf_data[i]['chunk']),
            'page': pdf_data[i]['page'],
            'coordinates': pdf_data[i]['coordinates'],
            'similarity': sim
        }
        for i, sim in similarities[:top_k]
    ]
    logging.info(f"Retrieved {len(top_snippets)} PDF snippets")
    return top_snippets

def generate_relation_summary(query, top_snippets):
    logging.info(f"Generating relation summary for query: {query}")
    try:
        model = GenerativeModel(MODEL_NAME)
        snippets_text = "\n\n".join([f"Snippet {i+1}: {s['chunk_text']}" for i, s in enumerate(top_snippets[:5])])
        prompt = f"""
You are Nexus.AI: an AI tutor assisting college students in their research process.
Your task is to explain how the following text snippets relate to the student's query.
Important: Do not answer the query directly. Instead, guide the student towards understanding
how these snippets are relevant to their question.

Student's Query: {query}

{snippets_text}

Provide a concise explanation (about 3-4 sentences) on how these snippets relate to the query.
Focus on the relevance of the information and how it might help answer the query, without giving away the answer.

YourNXS:"""
        
        response = model.generate_content(prompt, generation_config=GenAI_modelConfig)
        
        logging.info("Relation summary generated successfully")
        return response.text.strip()
    except Exception as e:
        logging.error(f"Error generating relation summary: {e}")
        return "Unable to generate relation summary due to an error."

def generate_signed_url(bucket_name, blob_name):
    logging.info(f"Generating signed URL for {bucket_name}/{blob_name}")
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=15),
        method="GET",
    )

    logging.info("Signed URL generated successfully")
    return url

@functions_framework.http
def process_pdf_query(request):
    logging.info("Received request")
    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    try:
        request_json = request.get_json(silent=True)
        query = request_json['input']
        logging.info(f"Received query: {query}")

        # Load PDF embeddings
        pdf_data = load_pdf_embeddings()

        # Retrieve top 20 relevant snippets
        snippets = retrieve_pdf_snippets(query, pdf_data, top_k=20)

        # Generate relation summary
        relation_summary = generate_relation_summary(query, snippets)

        # Process all 20 snippets for the response
        results = []
        for snippet in snippets:
            results.append({
                'text': snippet['chunk_text'],
                'page_number': snippet['page'],
                'coordinates': snippet['coordinates'],
                'similarity': snippet['similarity']
            })

        # Generate signed URL for the PDF
        pdf_url = generate_signed_url(BUCKET_NAME, 'IntroMLpaper.pdf')

        response = {
            "query": query,
            "relation_summary": relation_summary,
            "results": results,
            "pdf_url": pdf_url
        }

        logging.info("Sending response")
        return (json.dumps(response), 200, headers)
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return (json.dumps({"error": str(e)}), 500, headers)