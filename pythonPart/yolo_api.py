from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import cv2
import numpy as np

app = FastAPI()

model = YOLO("best.pt")  # path to your trained model

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    img_bytes = await file.read()
    np_img = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    results = model(img)

    output = []
    for r in results:
        for box in r.boxes:
            output.append({
                "class_id": int(box.cls),
                "confidence": float(box.conf),
                "bbox": box.xyxy[0].tolist()
            })

    return {"detections": output}
