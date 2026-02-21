
import os
import torch
import numpy as np
import cv2
from PIL import Image

# Initialize function to load model
def get_depth_model():
    """
    Loads and returns the ZoeDepth model.
    """
    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        zoe = torch.hub.load(
            "isl-org/ZoeDepth",
            "ZoeD_NK",
            pretrained=True,
            trust_repo=True,
            force_reload=False # Changed to False for efficiency
        )
        zoe = zoe.to(device).eval()
        return zoe
    except Exception as e:
        print(f"Error loading ZoeDepth model: {e}")
        return None

def estimate_depth(model, image_input):
    """
    Estimates depth for a given image using the ZoeDepth model.
    image_input: Can be a file path (str), numpy array (cv2 image), or PIL Image.
    Returns: A numpy array representing the depth map.
    """
    if model is None:
        raise ValueError("Depth model is not loaded.")

    if isinstance(image_input, str):
        # Load from path
        img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, np.ndarray):
        # Convert numpy array (BGR or RGB) to PIL Image
        # Assume BGR if coming from cv2.imread, but let's be safe or just convert
        # ZoeDepth infer_pil handles PIL images best
        img = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
    elif isinstance(image_input, Image.Image):
        img = image_input
    else:
        raise ValueError("Unsupported image input type.")

    with torch.no_grad():
        depth_tensor = model.infer_pil(img)
    
    if isinstance(depth_tensor, torch.Tensor):
        return depth_tensor.cpu().numpy()
    return depth_tensor

# Example usage block (can be kept for testing)
if __name__ == "__main__":
    # Test path
    img_path = "test.jpg"
    if os.path.exists(img_path):
        model = get_depth_model()
        depth_map = estimate_depth(model, img_path)
        print(f"Depth map shape: {depth_map.shape}")
        print(f"Average depth: {np.mean(depth_map)}")
    else:
        print(f"Test image {img_path} not found.")
