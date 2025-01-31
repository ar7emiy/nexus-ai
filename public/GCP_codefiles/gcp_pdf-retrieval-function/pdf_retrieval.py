import json
import logging
from google.cloud import storage
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
import numpy as np
from typing import List, Dict, Any
from google.oauth2 import service_account
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize credentials and Vertex AI
credentials = service_account.Credentials.from_service_account_file(
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'])

PROJECT_ID = "silver-idea-432502-c0"
REGION = "us-central1"
MODEL_NAME = "gemini-1.0-pro"
BUCKET_NAME = "nxs_bucket1"

vertexai.init(project=PROJECT_ID, location=REGION, credentials=credentials)
GenAI_modelConfig = GenerationConfig(max_output_tokens=150)

def cosine_similarity(a: List[float], b: List[float]) -> float:
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def load_pdf_embeddings() -> Dict[str, Any]:
    logger.info("Loading PDF embeddings")
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob('PDF_embeddings.json')
    data = json.loads(blob.download_as_string())
    logger.info(f"Loaded PDF embeddings with {len(data['chunks'])} chunks")
    return data

def generate_summary(query: str, text_snippet: str) -> str:
    logger.info(f"Generating summary for query: {query}")
    try:
        model = GenerativeModel(MODEL_NAME)
        prompt = f"""In 2 sentences, explain why the following text snippet is helpful in answering the question posed in the query.

Query: {query}

Text snippet: {text_snippet}

YourNXS:"""
        
        response = model.generate_content(prompt, generation_config=GenAI_modelConfig)
        
        logger.info("Summary generated successfully")
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return "Summary placeholder due to model unavailability."

def retrieve_pdf_snippets(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    logger.info(f"Retrieving PDF snippets for query: {query}")
    
    # Load embeddings
    pdf_data = load_pdf_embeddings()
    chunks = pdf_data['chunks']
    embeddings = pdf_data['embeddings']
    
    # Embed the query
    query_embedding = vertexai.language_models.TextEmbeddingModel.from_pretrained("text-embedding-004").get_embeddings([query])[0].values
    
    # Calculate similarities
    similarities = [cosine_similarity(query_embedding, emb) for emb in embeddings]
    
    # Get top-k similar chunks
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    
    results = []
    for idx in top_indices:
        chunk = chunks[idx]
        summary = generate_summary(query, chunk['text'])
        results.append({
            'text': chunk['text'],
            'page': chunk['page'],
            'bbox': chunk['bbox'],  # Bounding box for highlighting in PDF
            'similarity': similarities[idx],
            'summary': summary
        })
    
    logger.info(f"Retrieved and summarized {len(results)} PDF snippets")
    return results

def pdf_retrieval(query: str) -> Dict[str, Any]:
    try:
        snippets = retrieve_pdf_snippets(query)
        
        # Generate signed URL for the PDF
        storage_client = storage.Client(credentials=credentials)
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob('IntroMLpaper.pdf')
        pdf_url = blob.generate_signed_url(expiration=300)  # URL valid for 5 minutes
        
        return {
            "query": query,
            "results": snippets,
            "pdf_url": pdf_url
        }
    except Exception as e:
        logger.error(f"Error in PDF retrieval: {e}")
        return {"error": str(e)}

# Example usage
if __name__ == "__main__":
    query = "What are the main types of machine learning?"
    result = pdf_retrieval(query)
    print(json.dumps(result, indent=2))
