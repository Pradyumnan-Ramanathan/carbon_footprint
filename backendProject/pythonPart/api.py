from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import torch
import io
from PIL import Image

# Import from refactored modules
import carbon_finders_depth_estimation as depth_module
import text_scrapping_depth_estimation as ocr_module

app = FastAPI()

# --- Object Detection (YOLO) Setup ---
try:
    yolo_model = YOLO("best.pt")
except Exception as e:
    print(f"Warning: Could not load YOLO model: {e}")
    yolo_model = None

# --- Depth Estimation Setup ---
zoe_model = depth_module.get_depth_model()

# --- OCR Setup ---
ocr_reader = ocr_module.get_ocr_reader()

def load_image_from_bytes(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

@app.get("/")
def read_root():
    return {"message": "Carbon Predictor API is running"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    if yolo_model is None:
        raise HTTPException(status_code=500, detail="YOLO model not loaded")
    
    img_bytes = await file.read()
    img = load_image_from_bytes(img_bytes)
    
    results = yolo_model(img)
    
    output = []
    for r in results:
        for box in r.boxes:
            output.append({
                "class_id": int(box.cls),
                "confidence": float(box.conf),
                "bbox": box.xyxy[0].tolist(),
                "label": yolo_model.names[int(box.cls)]
            })
            
    return {"success": True, "detections": output}

@app.post("/depth")
async def depth(file: UploadFile = File(...)):
    """
    Estimate depth using the refactored carbon_finders_depth_estimation module.
    """
    if zoe_model is None:
        raise HTTPException(status_code=500, detail="ZoeDepth model not loaded")

    img_bytes = await file.read()
    
    # Use the module's estimate_depth function
    # It handles PIL/numpy conversion internally if we pass bytes converted to PIL
    try:
        pil_img = Image.open(io.BytesIO(img_bytes))
        depth_numpy = depth_module.estimate_depth(zoe_model, pil_img)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Depth estimation failed: {e}")

    min_depth = float(np.min(depth_numpy))
    max_depth = float(np.max(depth_numpy))
    avg_depth = float(np.mean(depth_numpy))
    
    return {
        "success": True,
        "min_depth": min_depth,
        "max_depth": max_depth,
        "average_depth": avg_depth,
        # "depth_map_shape": depth_numpy.shape
    }

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    """
    Perform OCR using the refactored text_scrapping_depth_estimation module.
    """
    if ocr_reader is None:
        raise HTTPException(status_code=500, detail="EasyOCR not loaded")
        
    img_bytes = await file.read()
    img = load_image_from_bytes(img_bytes)
    
    try:
        # Use simple detail=0 for text list
        text_results = ocr_module.extract_text(ocr_reader, img, detail=0)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

    return {
        "success": True,
        "text": text_results
    }

@app.post("/detect_ocr")
async def detect_ocr(file: UploadFile = File(...)):
    """
    Run YOLO detection, then run OCR on the cropped detections using the new module.
    """
    if yolo_model is None or ocr_reader is None:
        raise HTTPException(status_code=500, detail="Models not loaded")
        
    img_bytes = await file.read()
    img = load_image_from_bytes(img_bytes)
    
    results = yolo_model(img)
    
    detections_with_text = []
    
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            # Crop with padding
            h, w, _ = img.shape
            pad = 5
            crop = img[max(0, y1-pad):min(h, y2+pad), max(0, x1-pad):min(w, x2+pad)]
            
            detected_text = []
            if crop.size > 0:
                try:
                    # Use module function on crop
                    detected_text = ocr_module.extract_text(ocr_reader, crop, detail=0)
                except:
                    pass
            
            detections_with_text.append({
                "class_id": int(box.cls),
                "label": yolo_model.names[int(box.cls)],
                "bbox": [x1, y1, x2, y2],
                "confidence": float(box.conf),
                "text": detected_text
            })
            
    return {
        "success": True,
        "detections": detections_with_text
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
