from flask import Flask, request, jsonify
import easyocr
import base64
import io
from PIL import Image
import numpy as np

app = Flask(__name__)
reader = easyocr.Reader(['en'])  # Load OCR model for English

@app.route('/extract_text', methods=['POST'])
def extract_text():
    try:
        data = request.json
        if 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        # Decode base64 image
        image_data = base64.b64decode(data['image'].split(',')[1])
        image = Image.open(io.BytesIO(image_data))

        # Convert image to a NumPy array (required by EasyOCR)
        image_np = np.array(image)

        # Extract text
        results = reader.readtext(image_np, detail=0)
        extracted_text = " ".join(results)

        return jsonify({'text': extracted_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
