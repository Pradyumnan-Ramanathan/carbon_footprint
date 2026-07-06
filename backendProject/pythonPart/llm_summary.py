import os
import json
import time
import logging
from openai import OpenAI
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("carbon_footprint.llm_summary")

# Load environment variables from .env
load_dotenv()

def generate_environmental_summary(detections, depth_data=None):
    """
    Generates an environmental footprint summary using Groq LLM.
    Input:
    - detections: List of dicts, each with keys like name, confidence, carbon_footprint, etc.
    - depth_data: Dict with min_depth, max_depth, average_depth (optional).
    
    Returns:
    {
        "carbon_estimate": str,
        "charcoal_analogy": str,
        "petrol_car_analogy": str,
        "electricity_analogy": str,
        "observation": str,
        "recommendation": str
    } or {"error": str}
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("LLM Request: GROQ_API_KEY environment variable not found.")
        return {"error": "Environmental Insight is temporarily unavailable."}

    # Formulate prompt input
    detection_info = []
    total_input_footprint = 0.0
    for d in detections:
        name = d.get("name") or d.get("label") or "Unknown Item"
        conf = d.get("confidence", 1.0)
        footprint = d.get("carbon_footprint")
        try:
            val = float(footprint) if footprint is not None else 0.0
        except ValueError:
            val = 0.0
        total_input_footprint += val
        detection_info.append(f"- Object: {name}, Confidence: {conf:.2f}, Footprint: {footprint} kg CO2e")
    
    detection_str = "\n".join(detection_info) if detection_info else "No objects detected."
    
    depth_str = "Unavailable"
    if depth_data and not depth_data.get("error"):
        min_d = depth_data.get("min_depth")
        max_d = depth_data.get("max_depth")
        avg_d = depth_data.get("average_depth")
        depth_str = f"Min Depth: {min_d}m, Max Depth: {max_d}m, Avg Depth: {avg_d}m"

    system_prompt = (
        "You are an environmental awareness advisor.\n"
        "Your task is to analyze detected objects from an image and optional scene depth information, and estimate/summarize the environmental impact.\n"
        "Analyze the list of detected objects (their names and footprints in kg CO2e). Infer which object contributes most to the emissions.\n"
        "Do not explain your reasoning. Keep responses concise, inspiring, and educational. Avoid repetitive wording and do not mention uncertainty.\n\n"
        "Convert the estimated total carbon footprint of the detected objects into three real-world analogies:\n"
        "1. Charcoal comparison (ratio: 1 kg CO2e is equivalent to burning ~0.35 kg of charcoal). Format the value inside \"charcoal_analogy\" as 'X.XX kg of charcoal' (e.g. '0.47 kg of charcoal').\n"
        "2. Petrol car distance comparison (ratio: 1 kg CO2e is equivalent to driving ~5 km in a petrol car). Format the value inside \"petrol_car_analogy\" as 'X.X km in a petrol car' (e.g. '2.3 km in a petrol car').\n"
        "3. Electricity comparison (ratio: 1 kg CO2e is equivalent to powering a 10W LED bulb for ~250 hours). Format the value inside \"electricity_analogy\" as 'an LED bulb for X hours' (e.g. 'an LED bulb for 54 hours').\n\n"
        "Return ONLY a JSON object with exactly these six keys:\n"
        "{\n"
        "  \"carbon_estimate\": \"X.XX kg CO2e\",\n"
        "  \"charcoal_analogy\": \"X.XX kg of charcoal\",\n"
        "  \"petrol_car_analogy\": \"X.X km in a petrol car\",\n"
        "  \"electricity_analogy\": \"an LED bulb for X hours\",\n"
        "  \"observation\": \"A 1-2 sentence observation identifying which detected objects contribute most of the estimated emissions.\",\n"
        "  \"recommendation\": \"A 1-2 sentence sustainability recommendation tailored to the detected items encouraging reusable or eco-friendly alternatives.\"\n"
        "}\n"
        "Do not include markdown wrappers or any other text before or after the JSON."
    )

    user_content = (
        f"Detected Objects:\n{detection_str}\n\n"
        f"Scene Depth Information:\n{depth_str}\n"
    )

    # Models to try sequentially
    models = ["llama-3.1-8b-instant", "llama3-8b-8192", "gemma2-9b-it", "llama-3.3-70b-versatile"]
    
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=api_key,
    )
    
    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        model_name = models[(attempt - 1) % len(models)]
        logger.info(f"LLM Request: Sending request to model {model_name} (Attempt {attempt}/{max_attempts})")
        
        try:
            start_time = time.time()
            completion = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.2,
                max_tokens=250,
                timeout=10.0  # 10s timeout
            )
            elapsed = time.time() - start_time
            raw_output = completion.choices[0].message.content.strip()
            
            logger.info(f"API Response: Received response successfully in {elapsed:.2f}s (Attempt {attempt})")
            
            # Clean markdown code block wraps (if any)
            clean_output = raw_output
            if clean_output.startswith("```json"):
                clean_output = clean_output.split("```json")[1].split("```")[0].strip()
            elif clean_output.startswith("```"):
                clean_output = clean_output.split("```")[1].split("```")[0].strip()
            
            try:
                data = json.loads(clean_output)
                
                # Check for required keys and build output
                required_keys = [
                    "carbon_estimate", 
                    "charcoal_analogy", 
                    "petrol_car_analogy", 
                    "electricity_analogy", 
                    "observation", 
                    "recommendation"
                ]
                
                missing_keys = [k for k in required_keys if k not in data]
                if missing_keys:
                    logger.warning(f"Parsing Errors: Response missing keys {missing_keys}. Attempting recovery.")
                
                recovered_data = {
                    "carbon_estimate": data.get("carbon_estimate") or f"{total_input_footprint:.2f} kg CO2e",
                    "charcoal_analogy": data.get("charcoal_analogy") or f"{total_input_footprint * 0.35:.2f} kg of charcoal",
                    "petrol_car_analogy": data.get("petrol_car_analogy") or f"{total_input_footprint * 5:.1f} km in a petrol car",
                    "electricity_analogy": data.get("electricity_analogy") or f"an LED bulb for {int(total_input_footprint * 250)} hours",
                    "observation": data.get("observation") or "Emissions analysis loaded successfully.",
                    "recommendation": data.get("recommendation") or "Consider selecting reusable or lower-emission options."
                }
                return recovered_data
                
            except json.JSONDecodeError as je:
                logger.error(f"Parsing Errors: Failed to parse JSON from LLM output. Raw content: {raw_output}. Error: {je}")
                # Continue loop to next attempt
                
        except Exception as e:
            if "timeout" in str(e).lower() or "timed out" in str(e).lower():
                logger.error(f"Timeout Error: LLM request to model {model_name} timed out (Attempt {attempt})")
            else:
                logger.error(f"API Response: LLM request failed. Error: {e} (Attempt {attempt})")
            
            if attempt < max_attempts:
                logger.info("Waiting 1.0 second before retrying...")
                time.sleep(1.0)
                
    logger.error("LLM Request: All attempts to generate summary failed.")
    return {"error": "Environmental Insight is temporarily unavailable."}
