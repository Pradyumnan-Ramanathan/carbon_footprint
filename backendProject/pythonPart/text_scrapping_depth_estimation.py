
import easyocr
import cv2
import numpy as np
import torch

def get_ocr_reader(lang_list=["en"]):
    """
    Loads and returns the EasyOCR reader.
    """
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        reader = easyocr.Reader(lang_list, gpu=(device == "cuda"))
        return reader
    except Exception as e:
        print(f"Error loading EasyOCR reader: {e}")
        return None

def extract_text(reader, image_input, detail=0):
    """
    Extracts text from an image.
    image_input: File path (str) or numpy array (image).
    detail: 0 for simple list, 1 for details (bbox, text, conf).
    """
    if reader is None:
        raise ValueError("OCR reader is not loaded.")

    if isinstance(image_input, str):
        image = cv2.imread(image_input)
    elif isinstance(image_input, np.ndarray):
        image = image_input
    # EasyOCR handles bytes directly too, but let's stick to numpy for consistency if needed
    # If image_input is bytes, the caller should have decoded it or we handle it here.
    # For now assuming path or numpy array (cv2 image).
    else:
        # If it's bytes, try to decode
        if isinstance(image_input, bytes):
             nparr = np.frombuffer(image_input, np.uint8)
             image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
             raise ValueError("Unsupported image input type for OCR.")

    return reader.readtext(image, detail=detail)

if __name__ == "__main__":
    # Test path
    img_path = "test_ocr.jpg"
    reader = get_ocr_reader()
    if reader: 
        try:
            text = extract_text(reader, img_path)
            print(f"Extracted text: {text}")
        except Exception as e:
            print(f"Extraction failed: {e}")
