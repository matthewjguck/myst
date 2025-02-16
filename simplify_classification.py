#!/usr/bin/env python3
import os
import json
import numpy as np
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import re
import ast

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Load Mistral API key
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
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

# File to store the running average and sample count
RUNNING_AVERAGE_FILE = "running_average.json"
CATEGORIES = list(CATEGORY_TEXTS.keys())

def get_mistral_embedding(text):
    """Fetch category similarity scores using Mistral."""
    headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}", "Content-Type": "application/json"}
    
    # Create a structured prompt using the given text.
    prompt = (
        f"The following text is an insight extracted from a screenshot:\n\n"
        f"'{text}'\n\n"
        f"Rate the similarity of this insight to the following categories on a scale from 0 to 1:\n"
        f"- Motivational\n"
        f"- Educational\n"
        f"- Financial\n"
        f"- Political\n\n"
        f"Return your response as a valid JSON object with double-quoted keys and values only. "
        f"Example output: {{\"Motivational\": 0.8, \"Educational\": 0.6, \"Financial\": 0.1, \"Political\": 0.05}}"
    )
    
    payload = {
        "model": "mistral-small",
        "messages": [
            {"role": "system", "content": "You are a model that classifies text into predefined categories and outputs valid JSON."},
            {"role": "user", "content": prompt}
        ]
    }
    
    response = requests.post(MISTRAL_API_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        category_scores_text = result["choices"][0]["message"]["content"].strip()
        
        try:
            category_scores = json.loads(category_scores_text)
        except json.JSONDecodeError:
            try:
                category_scores = ast.literal_eval(category_scores_text)
            except (SyntaxError, ValueError):
                # Fallback: extract key-value pairs via regex.
                pattern = r'"([^"]+)"\s*:\s*([\d.]+)'
                matches = re.findall(pattern, category_scores_text)
                category_scores = {key: float(val) for key, val in matches}
        
        return category_scores
    else:
        raise Exception(f"Mistral API Error: {response.json()}")

def load_running_average():
    """Load the running average and count from the file, or initialize if not present."""
    if os.path.exists(RUNNING_AVERAGE_FILE):
        with open(RUNNING_AVERAGE_FILE, "r") as f:
            data = json.load(f)
            return data.get("running_average", {cat: 0.0 for cat in CATEGORIES}), data.get("count", 0)
    else:
        return {cat: 0.0 for cat in CATEGORIES}, 0

def update_running_average(new_scores, running_avg, count):
    """
    Update the running average with new_scores.
    new_avg = (old_total * count + new_score) / (count + 1)
    """
    new_count = count + 1
    updated_avg = {}
    for cat in CATEGORIES:
        updated_avg[cat] = (running_avg.get(cat, 0.0) * count + new_scores.get(cat, 0.0)) / new_count
    return updated_avg, new_count

def save_running_average(running_avg, count):
    """Save the running average and sample count to a file."""
    with open(RUNNING_AVERAGE_FILE, "w") as f:
        json.dump({"running_average": running_avg, "count": count}, f, indent=2)

@app.route('/simplify_classification', methods=['POST'])
def simplify_classification():
    data = request.json
    if 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    # Here, image data is provided in base64 format.
    # (1) In a real implementation, you’d generate a text description from the image (e.g., via OCR or image captioning).
    # For now, we simulate by using a fixed description.
    description_text = "This screenshot shows various political ads and news headlines."

    # (2) Get classification scores using the description.
    scores = get_mistral_embedding(description_text)
    total_score = sum(scores.values())
    normalized_scores = {cat: round(scores.get(cat, 0.0) / total_score, 2) for cat in scores}

    # (3) Update the running average.
    current_avg, count = load_running_average()
    updated_avg, new_count = update_running_average(normalized_scores, current_avg, count)
    save_running_average(updated_avg, new_count)

    # (4) Return the results.
    return jsonify({
        "description": description_text,
        "normalized_scores": normalized_scores,
        "updated_running_average": updated_avg,
        "sample_count": new_count
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
