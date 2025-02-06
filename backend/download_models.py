import easyocr
import torch
import os

def download_models():
    print("Pre-downloading EasyOCR models...")
    model_dir = '/app/models'
    os.makedirs(model_dir, exist_ok=True)
    
    try:
        reader = easyocr.Reader(['en'], model_storage_directory=model_dir, download_enabled=True)
        # Force download by accessing the reader
        reader.readtext('dummy')
    except Exception as e:
        print(f"Error during model download: {str(e)}")
    
    print("Models downloaded successfully!")
    # List downloaded files
    print("Files in model directory:")
    for file in os.listdir(model_dir):
        print(f" - {file}")

if __name__ == "__main__":
    download_models() 