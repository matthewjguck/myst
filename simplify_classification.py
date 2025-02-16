#!/usr/bin/env python3
import os
import json
import numpy as np
import requests
from dotenv import load_dotenv
import re
import ast

# Load environment variables
load_dotenv()

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

# Categories list (used for initializing running average)
CATEGORIES = list(CATEGORY_TEXTS.keys())

def get_mistral_embedding(text):
    """Fetch category similarity scores using Mistral."""
    headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}", "Content-Type": "application/json"}
    
    # Create a structured prompt
    prompt = (
        f"The following text is an insight extracted from a screenshot:\n\n"
        f"'{text}'\n\n"
        f"Rate the similarity of this insight to the following categories on a scale from 0 to 1:\n"
        f"- Motivational\n"
        f"- Educational\n"
        f"- Financial\n"
        f"- Political\n\n"
        f"Return your response as a valid JSON object with double-quoted keys and values only."
        f" Example output: {{\"Motivational\": 0.8, \"Educational\": 0.6, \"Financial\": 0.1, \"Political\": 0.05}}"
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
        
        # Attempt to parse the response as JSON
        try:
            category_scores = json.loads(category_scores_text)
        except json.JSONDecodeError:
            try:
                category_scores = ast.literal_eval(category_scores_text)
            except (SyntaxError, ValueError):
                # Fallback: use regex to extract key-value pairs
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
    Update the running average given new_scores.
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

def main():
    # Example insight text to classify
    sample_text = "This is a sample insight regarding political policies and elections."
    
    # Get category scores from Mistral
    scores = get_mistral_embedding(sample_text)
    
    # Normalize scores: ensure they sum to 1
    total_score = sum(scores.values())
    normalized_scores = {cat: round(score / total_score, 2) for cat, score in scores.items()}
    
    print("Normalized scores:", normalized_scores)
    
    # Load current running average and count
    running_avg, count = load_running_average()
    print("Previous running average (over", count, "samples):", running_avg)
    
    # Update running average with the new normalized scores
    running_avg, count = update_running_average(normalized_scores, running_avg, count)
    
    # Save the updated running average back to the file
    save_running_average(running_avg, count)
    
    print("Updated running average (over", count, "samples):", running_avg)

if __name__ == '__main__':
    main()
