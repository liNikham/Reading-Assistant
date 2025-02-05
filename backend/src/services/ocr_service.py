import easyocr
import json
import sys
from PIL import Image

def perform_ocr(image_path):
    try:
        # Print status messages to stderr instead of stdout
        sys.stderr.write("Initializing EasyOCR...\n")
        reader = easyocr.Reader(['en'], verbose=False)  # Set verbose to False to reduce output
        
        sys.stderr.write("Processing image...\n")
        result = reader.readtext(image_path)
        
        # Format the results
        words = []
        for bbox, text, conf in result:
            x0 = min(point[0] for point in bbox)
            y0 = min(point[1] for point in bbox)
            x1 = max(point[0] for point in bbox)
            y1 = max(point[1] for point in bbox)
            
            words.append({
                'text': text,
                'confidence': float(conf),
                'x0': int(x0),
                'y0': int(y0),
                'x1': int(x1),
                'y1': int(y1)
            })
        
        # Only print the JSON result to stdout
        print(json.dumps({'success': True, 'data': words}))
        
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        perform_ocr(sys.argv[1])
    else:
        print(json.dumps({'success': False, 'error': 'No image path provided'}))
        sys.exit(1)
