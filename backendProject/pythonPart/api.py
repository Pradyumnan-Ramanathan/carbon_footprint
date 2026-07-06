from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import numpy as np
import io
import base64
import json
import os
import hashlib
import asyncio
import logging
from PIL import Image
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("carbon_footprint.api")

# Import from refactored modules
import carbon_finders_depth_estimation as depth_module
import text_scrapping_depth_estimation as ocr_module
import llm_summary

class SummaryRequest(BaseModel):
    detections: List[Dict[str, Any]]
    depth: Optional[Dict[str, Any]] = None

app = FastAPI()

# --- Depth Estimation Setup ---
logger.info("ZoeDepth: Loading model...")
zoe_model = depth_module.get_depth_model()
if zoe_model is None:
    logger.warning("ZoeDepth: Model could not be loaded at startup.")
else:
    logger.info("ZoeDepth: Model loaded successfully.")

# Cache to prevent double API call for the same image (concurrent /detect and /ocr)
vlm_cache = {}
vlm_lock = asyncio.Lock()

async def get_vlm_result(image_bytes: bytes) -> dict:
    md5_hash = hashlib.md5(image_bytes).hexdigest()
    async with vlm_lock:
        if md5_hash in vlm_cache:
            logger.info(f"Cache hit for MD5: {md5_hash}")
            return vlm_cache[md5_hash]
        
        logger.info(f"Cache miss for MD5: {md5_hash}. Fetching from OpenRouter VLM...")
        result = await asyncio.to_thread(ocr_module.detect_objects_and_text_openrouter, image_bytes)
        vlm_cache[md5_hash] = result
        return result

@app.get("/")
def read_root():
    return {"message": "Carbon Predictor API is running"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    img_bytes = await file.read()
    logger.info("Object Detection: Starting object detection...")
    
    try:
        pil_img = Image.open(io.BytesIO(img_bytes))
        width, height = pil_img.size
    except Exception as e:
        logger.error(f"Object Detection: Invalid image file: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")
        
    try:
        vlm_res = await get_vlm_result(img_bytes)
    except Exception as e:
        logger.error(f"Object Detection: Failed. Error: {e}")
        raise HTTPException(status_code=500, detail=f"Object detection failed: {e}")
    
    output = []
    for i, det in enumerate(vlm_res.get("detections", [])):
        # Normalize box to actual pixels
        box = det.get("box", [0, 0, 1000, 1000])
        xmin, ymin, xmax, ymax = box
        bbox = [
            (xmin / 1000.0) * width,
            (ymin / 1000.0) * height,
            (xmax / 1000.0) * width,
            (ymax / 1000.0) * height
        ]
        
        name = det.get("name", "Unknown Item")
        carbon_val = float(det.get("carbon_footprint", 0.0))
        label = f"{name} (CO2e: {carbon_val:.2f} kg)"
        
        output.append({
            "class_id": i,
            "confidence": 1.0,
            "bbox": bbox,
            "label": label,
            "name": name,
            "carbon_footprint": carbon_val,
            "footprint_explanation": det.get("footprint_explanation", "")
        })
            
    logger.info(f"Object Detection: Successfully detected {len(output)} objects")
    return {"success": True, "detections": output}

@app.post("/depth")
async def depth(file: UploadFile = File(...)):
    if zoe_model is None:
        logger.warning("ZoeDepth: Model not loaded")
        raise HTTPException(status_code=500, detail="ZoeDepth model not loaded")

    img_bytes = await file.read()
    logger.info("ZoeDepth: Starting depth estimation...")
    
    try:
        pil_img = Image.open(io.BytesIO(img_bytes))
        depth_numpy = depth_module.estimate_depth(zoe_model, pil_img)
    except Exception as e:
        logger.error(f"ZoeDepth: Depth estimation failed. Error: {e}")
        raise HTTPException(status_code=500, detail=f"Depth estimation failed: {e}")

    min_depth = float(np.min(depth_numpy))
    max_depth = float(np.max(depth_numpy))
    avg_depth = float(np.mean(depth_numpy))
    
    logger.info(f"ZoeDepth: Depth estimation successful. Min: {min_depth:.3f}m, Max: {max_depth:.3f}m, Avg: {avg_depth:.3f}m")
    return {
        "success": True,
        "min_depth": min_depth,
        "max_depth": max_depth,
        "average_depth": avg_depth,
    }

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    img_bytes = await file.read()
    vlm_res = await get_vlm_result(img_bytes)
    
    return {
        "success": True,
        "text": vlm_res.get("text", [])
    }

@app.post("/detect_ocr")
async def detect_ocr(file: UploadFile = File(...)):
    img_bytes = await file.read()
    
    try:
        pil_img = Image.open(io.BytesIO(img_bytes))
        width, height = pil_img.size
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")
        
    vlm_res = await get_vlm_result(img_bytes)
    
    output = []
    for i, det in enumerate(vlm_res.get("detections", [])):
        box = det.get("box", [0, 0, 1000, 1000])
        xmin, ymin, xmax, ymax = box
        bbox = [
            (xmin / 1000.0) * width,
            (ymin / 1000.0) * height,
            (xmax / 1000.0) * width,
            (ymax / 1000.0) * height
        ]
        
        name = det.get("name", "Unknown Item")
        carbon_val = float(det.get("carbon_footprint", 0.0))
        label = f"{name} (CO2e: {carbon_val:.2f} kg)"
        
        output.append({
            "class_id": i,
            "label": label,
            "bbox": bbox,
            "confidence": 1.0,
            "text": vlm_res.get("text", []),
            "name": name,
            "carbon_footprint": carbon_val,
            "footprint_explanation": det.get("footprint_explanation", "")
        })
            
    return {
        "success": True,
        "detections": output
    }

@app.post("/footprint")
async def footprint(file: UploadFile = File(...)):
    img_bytes = await file.read()
    try:
        res = await get_vlm_result(img_bytes)
        return {"success": True, "detections": res.get("detections", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Carbon footprint estimation failed: {e}")

@app.post("/summary")
async def summary(req: SummaryRequest):
    logger.info("LLM Request: Received summary request")
    try:
        summary_result = await asyncio.to_thread(llm_summary.generate_environmental_summary, req.detections, req.depth)
        return summary_result
    except Exception as e:
        logger.error(f"LLM Request: Failed to generate summary. Error: {e}")
        return {"error": "Environmental Insight is temporarily unavailable."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
