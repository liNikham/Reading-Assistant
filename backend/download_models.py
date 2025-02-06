import easyocr
import torch

def download_models():
    print("Pre-downloading EasyOCR models...")
    reader = easyocr.Reader(['en'])
    print("Models downloaded successfully!")

if __name__ == "__main__":
    download_models() 