import functions_framework
import json
import logging
from google.cloud import storage
from google.cloud import aiplatform
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
import datetime

# Import the retrieve function from retrieval_key
from retrieval_key import retrieve

import logging
import google.cloud.logging
import os
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'])

# Instantiates a client
client = google.cloud.logging.Client()

# Connects the logger to the root logging handler
client.setup_logging()

# Set up logging
logging.basicConfig(level=logging.INFO)

# Initialize Vertex AI
PROJECT_ID = "silver-idea-432502-c0"
REGION = "us-central1"
MODEL_NAME = "gemini-1.0-pro"
BUCKET_NAME_1 = "nxs_bucket1"

vertexai.init(project=PROJECT_ID, location=REGION, credentials=credentials)
GenAI_modelConfig = GenerationConfig(max_output_tokens=150)

def convert_to_seconds(timestamp):
    logging.info(f"Converting timestamp: {timestamp}")
    h, m, s = map(float, timestamp.split(':'))
    return int(h * 3600 + m * 60 + s)

def group_intervals(snippets, gap=60):
    logging.info(f"Grouping intervals for {len(snippets)} snippets")
    grouped_snippets = []
    current_group = []
    last_end_time = None

    for snippet in snippets:
        start_time_sec = convert_to_seconds(snippet['time_stamp']['start_time'])
        end_time_sec = convert_to_seconds(snippet['time_stamp']['end_time'])

        if last_end_time is None or start_time_sec - last_end_time <= gap:
            current_group.append(snippet)
        else:
            grouped_snippets.append(current_group)
            current_group = [snippet]

        last_end_time = end_time_sec

    if current_group:
        grouped_snippets.append(current_group)

    logging.info(f"Grouped into {len(grouped_snippets)} groups")
    return grouped_snippets

def generate_summary(query, text_snippet):
    logging.info(f"Generating summary for query: {query}")
    try:
        model = GenerativeModel(MODEL_NAME)
        prompt = f"""You are Nexus.AI- an AI tutor assisting college students in their research process. Your task is to analyze how the contents of this text snippet can help the student understand their query.

Write 2 sentences explaining how this segment contributes to understanding the topic, without revealing specific answers or key details. Guide the student to understand why this section would be valuable for their research.

The snippet is never not related to the query. If the snippet doesn't answer the query directly, then look at the concepts mentioned in the snippet and how they could be connected. 

Query: {query}

Text snippet: {text_snippet}

YourNXS:"""
        
        response = model.generate_content(prompt, generation_config=GenAI_modelConfig)
        
        logging.info("Summary generated successfully")
        return response.text.strip()
    except Exception as e:
        logging.error(f"Error generating summary: {e}")
        return "Summary placeholder due to model unavailability."

def load_from_gcs(bucket_name, filename):
    logging.info(f"Loading from GCS: {bucket_name}/{filename}")
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(filename)
    data = json.loads(blob.download_as_string())
    logging.info(f"Loaded data with {len(data)} items")
    return data

def save_to_gcs(data, bucket_name, filename):
    logging.info(f"Saving to GCS: {bucket_name}/{filename}")
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(filename)
    blob.upload_from_string(json.dumps(data, indent=2))
    logging.info("Data saved successfully")

def process_snippets(query):
    logging.info(f"Processing snippets for query: {query}")
    try:
        # Use the imported retrieve function
        retrieved_data = retrieve(query)
        logging.info(f"Retrieved {len(retrieved_data)} snippets")
        
        # Sort snippets by start time
        sorted_snippets = sorted(retrieved_data, key=lambda x: convert_to_seconds(x['time_stamp']['start_time']))
        logging.info("Snippets sorted")

        # Group snippets based on their timestamps
        grouped_snippets = group_intervals(sorted_snippets)

        # Get the first 7 groups
        potential_groups = grouped_snippets[:7]
        logging.info(f"Selected {len(potential_groups)} potential groups")

        # Create the final output structure, only including relevant groups
        final_output = []
        for group in potential_groups:
            # Combine the transcript texts in the group
            combined_text = " ".join([snippet['transcript'] for snippet in group])

            # Generate a summary of the combined text
            summary = generate_summary(query, combined_text)
            
            # Only process and store groups that are deemed relevant
            if summary != "1":
                # Get the first and last timestamps in the group
                start_time = group[0]['time_stamp']['start_time']
                end_time = group[-1]['time_stamp']['end_time']

                # Add relevant group to final output
                final_output.append({
                    "summary": summary,
                    "time_stamp": {
                        "start_time": start_time,
                        "end_time": end_time
                    },
                    "transcript": combined_text,
                    "cosine_scores": [snippet['cosine_score'] for snippet in group],
                })
            else:
                logging.info("Skipping irrelevant group")

        logging.info(f"Final output contains {len(final_output)} relevant groups")

        # Save the final output to GCS
        save_to_gcs(final_output, BUCKET_NAME_1, 'final_output.json')

        logging.info("Final output saved to GCS as final_output.json")
        return "Processing complete"
    except Exception as e:
        logging.error(f"Error in process_snippets: {e}")
        return f"Error: {str(e)}"

def generate_signed_url(bucket_name, blob_name):
    logging.info(f"Generating signed URL for {bucket_name}/{blob_name}")
    storage_client = storage.Client()
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
def process_input(request):
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

        # Process the query
        result = process_snippets(query)
        logging.info(f"Snippets processing result: {result}")

        # Load the final output from GCS
        final_output = load_from_gcs(BUCKET_NAME_1, 'final_output.json')
        logging.info(f"Loaded final output with {len(final_output)} items")

        # Create a simplified version for the website response
        simplified_output = [{
            "time_stamp": item["time_stamp"],
            "summary": item["summary"]
        } for item in final_output]

        # Add video URL to the response
        video_url = generate_signed_url(BUCKET_NAME_1, 'cornellLecture.mp4')
        logging.info(f"Generated video URL: {video_url}")

        response = {
            "query": query,
            "results": simplified_output,
            "video_url": video_url
        }

        logging.info("Sending response")
        return (json.dumps(response), 200, headers)
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return (json.dumps({"error": str(e)}), 500, headers)