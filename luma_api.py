import os
import requests
from dotenv import load_dotenv

load_dotenv()

LUMA_API_KEY = os.getenv("LUMA_API_KEY")
LUMA_API_URL = "https://api.lumalabs.ai/v1/upload"

def send_to_luma(blob_data):
    """Send the generated category blob to Luma AI for visualization."""
    if not LUMA_API_KEY:
        raise ValueError("Missing Luma API Key! Set it in a .env file.")
    
    headers = {
        "Authorization": f"Bearer {LUMA_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": "User Browsing Insights",
        "blob": blob_data
    }

    response = requests.post(LUMA_API_URL, headers=headers, json=payload)

    if response.status_code == 200:
        result = response.json()
        return result.get("visualization_url", "No visualization generated.")
    else:
        return f"Luma AI Error: {response.json()}"
