import sys
import json
import easyocr
import numpy as np
from PIL import Image

def process_image(image_path):
    try:
        print("Initializing EasyOCR...", file=sys.stderr)
        reader = easyocr.Reader(['en'], model_storage_directory='/app/models')
        
        print("Loading image...", file=sys.stderr)
        image = Image.open(image_path)
        
        print("Processing image with OCR...", file=sys.stderr)
        result = reader.readtext(image_path)
        
        # Convert numpy arrays to lists for JSON serialization
        processed_result = []
        for bbox, text, conf in result:
            processed_result.append({
                'bbox': [[float(x) for x in point] for point in bbox],
                'text': text,
                'confidence': float(conf)
            })
        
        print(json.dumps({
            'success': True,
            'data': processed_result
        }))
        
    except Exception as e:
        print(f"Error processing image: {str(e)}", file=sys.stderr)
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            'success': False,
            'error': 'Image path not provided'
        }))
        sys.exit(1)
        
    image_path = sys.argv[1]
    process_image(image_path)
