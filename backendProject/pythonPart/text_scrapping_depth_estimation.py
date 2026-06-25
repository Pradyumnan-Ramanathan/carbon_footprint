import base64
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

def detect_objects_and_text_openrouter(image_bytes: bytes, api_key: str = None) -> dict:
    """
    Sends image bytes to OpenRouter vision VLM (nvidia/nemotron-nano-12b-v2-vl:free)
    to perform object detection, carbon footprint estimation, and text extraction (OCR).
    Returns a dictionary:
    {
        "detections": [
            {
                "name": str, 
                "category": str, 
                "box": [xmin, ymin, xmax, ymax],
                "carbon_footprint": float,
                "footprint_explanation": str
            }
        ],
        "text": [str]
    }
    """
    if not api_key:
        api_key = os.getenv("My_Openrouter_key")
        if not api_key:
            raise ValueError("OpenRouter API Key not found. Please set OPENROUTER_API_KEY or My_Openrouter_key in your .env file.")

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    image_url_data = f"data:image/jpeg;base64,{base64_image}"

    prompt_content = (
        "Analyze this image and perform object detection, carbon footprint estimation, and OCR (text extraction).\n"
        "Respond ONLY with a valid JSON object. Do not include markdown headers or any explanation.\n"
        "The JSON object must have exactly these keys:\n"
        "1. \"detections\": an array of objects. Each object must have:\n"
        "   - \"name\": name of the detected object.\n"
        "   - \"category\": category of the object.\n"
        "   - \"box\": bounding box in [xmin, ymin, xmax, ymax] format (normalized 0 to 1000 where 0 is top/left and 1000 is bottom/right).\n"
        "   - \"carbon_footprint\": estimated carbon footprint in kg CO2e per standard unit or kg of this item (as a float, e.g. 1.2).\n"
        "   - \"footprint_explanation\": a very short 1-sentence reason for this footprint.\n"
        "2. \"text\": an array of strings representing each line of text found in the image.\n"
        "Example output format:\n"
        "{\n"
        "  \"detections\": [\n"
        "    {\n"
        "      \"name\": \"orange juice\",\n"
        "      \"category\": \"beverage\",\n"
        "      \"box\": [100, 200, 300, 400],\n"
        "      \"carbon_footprint\": 1.2,\n"
        "      \"footprint_explanation\": \"Emissions due to packaging, transportation, and agricultural energy consumption.\"\n"
        "    }\n"
        "  ],\n"
        "  \"text\": [\n"
        "    \"Fresh Produce\"\n"
        "  ]\n"
        "}"
    )

    try:
        completion = client.chat.completions.create(
            model="nvidia/nemotron-nano-12b-v2-vl:free",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_content},
                    {"type": "image_url", "image_url": {"url": image_url_data}}
                ]
            }]
        )

        if not completion or not completion.choices:
            raise ValueError("OpenRouter API returned an empty response.")

        model_output = completion.choices[0].message.content

        # Clean markdown wrappers
        clean_output = model_output.strip()
        if clean_output.startswith("```json"):
            clean_output = clean_output.split("```json")[1].split("```")[0].strip()
        elif clean_output.startswith("```"):
            clean_output = clean_output.split("```")[1].split("```")[0].strip()

        data = json.loads(clean_output)
        
        # Validate keys
        if "detections" not in data:
            data["detections"] = []
        if "text" not in data:
            data["text"] = []
            
        return data

    except Exception as e:
        print(f"Error querying OpenRouter VLM: {e}")
        return {"detections": [], "text": []}


