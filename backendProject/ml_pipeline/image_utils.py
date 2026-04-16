from __future__ import annotations

import logging
from pathlib import Path

import numpy as np


LOGGER = logging.getLogger(__name__)

try:
    from PIL import Image
except ImportError:  # pragma: no cover - Pillow is optional at runtime
    Image = None  # type: ignore[assignment]


def load_image_array(image_path: str) -> np.ndarray:
    """Load an image into an RGB numpy array.

    Supports common formats through Pillow when available and always supports
    plain-text PPM (P3) images as a zero-dependency fallback.
    """

    if not image_path.strip():
        raise ValueError("Image path cannot be empty.")

    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    suffix = path.suffix.lower()
    if suffix == ".ppm":
        return _load_ppm(path)

    if Image is None:
        raise RuntimeError(
            "Pillow is not installed, so only .ppm sample images can be loaded in fallback mode."
        )

    with Image.open(path) as image:
        return np.asarray(image.convert("RGB"), dtype=np.float32)


def load_pil_image(image_path: str) -> "Image.Image":
    """Load an image into a PIL RGB image.

    For .ppm files, this still uses Pillow when available because the format is
    supported natively there. This helper is intended for model-backed paths.
    """

    if not image_path.strip():
        raise ValueError("Image path cannot be empty.")

    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    if Image is None:
        raise RuntimeError("Pillow is required for PIL image loading.")

    with Image.open(path) as image:
        return image.convert("RGB")


def extract_image_features(image_array: np.ndarray) -> dict[str, float]:
    """Compute lightweight features for routing and semantic fallback logic."""

    if image_array.ndim != 3 or image_array.shape[2] != 3:
        raise ValueError("Expected an RGB image array with shape [H, W, 3].")

    image = image_array.astype(np.float32)
    normalized = image / 255.0

    red_mean = float(normalized[:, :, 0].mean())
    green_mean = float(normalized[:, :, 1].mean())
    blue_mean = float(normalized[:, :, 2].mean())

    channel_std = float(normalized.std())
    horizontal_edges = np.abs(np.diff(normalized, axis=1)).mean() if image.shape[1] > 1 else 0.0
    vertical_edges = np.abs(np.diff(normalized, axis=0)).mean() if image.shape[0] > 1 else 0.0
    edge_density = float((horizontal_edges + vertical_edges) / 2.0)

    channel_max = normalized.max(axis=2)
    channel_min = normalized.min(axis=2)
    saturation = float((channel_max - channel_min).mean())

    height, width = normalized.shape[:2]
    aspect_ratio = float(width / max(height, 1))

    return {
        "red_mean": red_mean,
        "green_mean": green_mean,
        "blue_mean": blue_mean,
        "channel_std": channel_std,
        "edge_density": edge_density,
        "saturation": saturation,
        "aspect_ratio": aspect_ratio,
        "height": float(height),
        "width": float(width),
    }


def _load_ppm(path: Path) -> np.ndarray:
    tokens: list[str] = []
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        stripped = raw_line.split("#", 1)[0].strip()
        if stripped:
            tokens.extend(stripped.split())

    if len(tokens) < 4 or tokens[0] != "P3":
        raise ValueError(f"Unsupported PPM format in {path}. Expected plain-text P3.")

    width = int(tokens[1])
    height = int(tokens[2])
    max_value = int(tokens[3])
    pixel_values = np.asarray([int(token) for token in tokens[4:]], dtype=np.float32)

    expected_values = width * height * 3
    if pixel_values.size != expected_values:
        raise ValueError(
            f"Invalid pixel count in {path}. Expected {expected_values}, got {pixel_values.size}."
        )

    if max_value <= 0:
        raise ValueError(f"Invalid max value {max_value} in {path}.")

    image = pixel_values.reshape((height, width, 3))
    if max_value != 255:
        image = (image / max_value) * 255.0

    LOGGER.info("Loaded fallback PPM image from %s", path)
    return image
