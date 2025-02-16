from flask import Flask, request, jsonify
import openai
import base64
import io
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Ensure API key is set
if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API Key! Set it in a .env file or environment variable.")

# Initialize OpenAI client with the API key
client = openai.OpenAI(api_key=OPENAI_API_KEY)

@app.route('/analyze_screenshot', methods=['POST'])
def analyze_screenshot():
    try:
        data = request.json
        if 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        # Extract base64 image content correctly
        image_base64 = data['image'].split(',')[1]

        # Correctly format image data for OpenAI API
        image_url = f"data:image/png;base64,{image_base64}"

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Analyze the screenshot and classify its content as Motivational, Educational, Informational, Financial, or Political."},
                {"role": "user", "content": [{"type": "image_url", "image_url": {"url": image_url}}]}
            ]
        )

        insights = response.choices[0].message.content

        return jsonify({'insights': insights})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)

