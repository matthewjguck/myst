from flask import Flask, request, jsonify
import os
import json
import base64
import numpy as np
import requests
from dotenv import load_dotenv
from luma_api import send_to_luma
from io import BytesIO
from PIL import Image
from mistralai import Mistral


# Load environment variables
load_dotenv()

app = Flask(__name__)

# Load Mistral API key
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

if not MISTRAL_API_KEY:
    raise ValueError("Missing Mistral API Key! Set it in a .env file.")

# Mistral API Endpoint
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

# Reference categories for classification
CATEGORY_TEXTS = {
    "Motivational": "This content is about personal growth, inspiration, and motivation.",
    "Educational": "This content is focused on learning, courses, and tutorials.",
    "Financial": "This content is about money, business, and financial markets.",
    "Political": "This content covers government policies, elections, and social issues."
}

USER_EMBEDDINGS_FILE = "user_embeddings.json"  # Store embeddings locally

import re
import ast

def get_mistral_embedding(text):
    print("get_mistral_embedding")
    """Fetch category similarity scores using Mistral."""
    headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}", "Content-Type": "application/json"}

    # Create a structured prompt
    prompt = (
        f"The following text is an insight extracted from a screenshot:\n\n"
        f"'{text}'\n\n"
        f"Rate the similarity of this insight to the following categories on a scale from -10 to 10:\n"
        f"- Motivational (-10 = pessimistic, 10 = optimistic)\n"
        f"- Educational (-10 = uneducational, 10 = educational)\n"
        f"- Financial (-10 = capitalist, 10 = socialist)\n"
        f"- Political (-10 = Conservative, 10 = Liberal)\n\n"
        f"Return your response as a valid JSON object with double-quoted keys and values only."
        f"Example output: {{\"Motivational\": -1.8, \"Educational\": 7.6, \"Financial\": -8.12, \"Political\": -0.05}}"
    )

    payload = {
        "model": "mistral-large-latest",
        "messages": [
            {"role": "system", "content": "You are a model that classifies text into predefined categories and outputs valid JSON."},
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(MISTRAL_API_URL, headers=headers, json=payload)

    if response.status_code == 200:
        result = response.json()
        category_scores_text = result["choices"][0]["message"]["content"].strip()

        # Ensure the response is a valid JSON string
        try:
            # Clean up the response to ensure it is valid JSON
            category_scores_text = category_scores_text.split('```json')[1].split('```')[0].strip()
            category_scores = json.loads(category_scores_text)
        except (json.JSONDecodeError, IndexError):
            raise ValueError(f"Invalid JSON response from Mistral: {category_scores_text}")

        print(f"Category Scores: {category_scores}")
        return category_scores
    else:
        raise Exception(f"Mistral API Error: {response.json()}")

def generate_blob(category_scores):
    """Convert category scores into a structured binary format (Blob)."""
    # Convert dictionary values to a NumPy array
    category_values = np.array(list(category_scores.values()), dtype=np.float32)

    # Encode as base64 for easy storage and transmission
    blob_data = base64.b64encode(category_values.tobytes()).decode('utf-8')

    return blob_data

# Generate embeddings for predefined categories
CATEGORY_EMBEDDINGS = {
    category: get_mistral_embedding(text)
    for category, text in CATEGORY_TEXTS.items()
}

def cosine_similarity(vec1, vec2):
    """Compute the cosine similarity between two vectors."""
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

RUNNING_AVERAGE = {"Motivational": 0.0, "Educational": 0.0, "Financial": 0.0, "Political": 0.0}
RUNNING_COUNT = {"Motivational": 0, "Educational": 0, "Financial": 0, "Political": 0}

def update_running_average(new_scores):
    """
    Update the global rolling averages based on new_scores, which is a dictionary of category scores.
    Uses the formula:
        new_average = old_average + (new_score - old_average) / (count + 1)
    """
    global RUNNING_AVERAGE, RUNNING_COUNT
    for category, new_value in new_scores.items():
        # If the category isn't one of our predefined ones, assign it to "Other"
        if category not in RUNNING_AVERAGE:
            print(f"Unknown category: {category}")
            continue
        count = RUNNING_COUNT[category]
        old_avg = RUNNING_AVERAGE[category]
        # Update using incremental averaging formula
        new_avg = old_avg + (new_value - old_avg) / (count + 1)
        RUNNING_AVERAGE[category] = new_avg
        RUNNING_COUNT[category] = count + 1


@app.route('/analyze_screenshot', methods=['POST'])
def analyze_screenshot():
    print("analyze_screenshot")
    try:
        data = request.json
        if 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        # Extract base64 image
        image_base64 = data['image'].split(',')[1]
        image_url = f"data:image/png;base64,{image_base64}"

        # Get text insights from Mistral
        payload = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": "Analyze the screenshot and classify its content as Motivational, Educational, Financial, or Political."},
                {"role": "user", "content": [{"type": "image_url", "image_url": {"url": image_url}}]}
            ]
        }

        # print("anvbhjuhgvbnjuhygbnjuhyg")

        response = requests.post(OPENAI_API_URL, headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}, json=payload)

        if response.status_code != 200:
            return jsonify({'error': f"Mistral API Error: {response.json()}"}), 500

        insights = response.json()["choices"][0]["message"]["content"]

        # Generate embedding for insights
        category_scores = get_mistral_embedding(insights)

        # Generate blob from category scores
        blob = generate_blob(category_scores)

        # Send to Luma AI for visualization
        visualization = send_to_luma(blob)

        # Normalize scores
        total_score = sum(category_scores.values())
        if total_score == 0:
            normalized_scores = {cat: 0 for cat in category_scores}
        else:
            normalized_scores = {cat: round(score / total_score, 2) for cat, score in category_scores.items()}


        update_running_average(normalized_scores)
        global_running_average = RUNNING_AVERAGE

        return jsonify({
            "insights": insights,
            "category_scores": global_running_average,
            "blob": blob,
            "visualization_url": visualization
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
