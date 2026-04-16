from __future__ import annotations

import logging
from collections import Counter
from pathlib import Path
from typing import Any

try:
    from .image_utils import extract_image_features, load_image_array, load_pil_image
except ImportError:  # pragma: no cover - fallback for direct script execution
    from image_utils import extract_image_features, load_image_array, load_pil_image

try:
    import torch
    from transformers import AutoProcessor, CLIPModel
except ImportError:  # pragma: no cover - transformers is optional at runtime
    torch = None  # type: ignore[assignment]
    AutoProcessor = None  # type: ignore[assignment]
    CLIPModel = None  # type: ignore[assignment]


LOGGER = logging.getLogger(__name__)


class NonPackagedPipeline:
    """CLIP-style semantic classifier with image-feature voting and model-ready structure."""

    def __init__(self, use_clip: bool = True) -> None:
        self._model: Any | None = None
        self._processor: Any | None = None
        self.last_classification_source = "heuristic"
        self._candidate_labels = [
            "apple",
            "banana",
            "tomato",
            "onion",
            "potato",
            "cucumber",
        ]

        if use_clip and CLIPModel is not None and AutoProcessor is not None:
            try:
                self._model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
                self._processor = AutoProcessor.from_pretrained("openai/clip-vit-base-patch32")
                self._model.eval()
                LOGGER.info("Initialized CLIP backend.")
            except Exception as exc:  # pragma: no cover - model download/runtime issues
                LOGGER.warning("Failed to initialize CLIP backend. Falling back to heuristics: %s", exc)
                self._model = None
                self._processor = None

    def classify(self, image_path: str) -> dict[str, str | float]:
        if not image_path.strip():
            LOGGER.warning("Empty image path received by CLIP pipeline.")
            return {"name": "unknown", "confidence": 0.0}

        LOGGER.info("Running CLIP-style classification on %s", image_path)
        if (
            Path(image_path).suffix.lower() != ".ppm"
            and self._model is not None
            and self._processor is not None
            and torch is not None
        ):
            clip_result = self._classify_with_clip(image_path)
            if clip_result is not None:
                self.last_classification_source = "clip-vit-base-patch32"
                return clip_result

        try:
            image_array = load_image_array(image_path)
            features = extract_image_features(image_array)
        except (FileNotFoundError, RuntimeError, ValueError) as exc:
            LOGGER.warning("CLIP fallback failed to load image: %s", exc)
            return {"name": "unknown", "confidence": 0.0}

        attribute_votes = {
            "name": self._vote_from_name(features),
            "color": self._vote_from_color(features),
            "texture": self._vote_from_texture(features),
        }

        winning_name, vote_count = Counter(attribute_votes.values()).most_common(1)[0]
        confidence = round(vote_count / len(attribute_votes), 2)
        self.last_classification_source = "heuristic"
        return {"name": winning_name, "confidence": confidence}

    def _classify_with_clip(self, image_path: str) -> dict[str, str | float] | None:
        try:
            image = load_pil_image(image_path)
            prompts = [f"a grocery photo of {label}" for label in self._candidate_labels]
            inputs = self._processor(
                text=prompts,
                images=image,
                return_tensors="pt",
                padding=True,
            )

            with torch.inference_mode():
                outputs = self._model(**inputs)
                logits_per_image = outputs.logits_per_image
                probabilities = logits_per_image.softmax(dim=1)[0]

            best_probability, best_index = probabilities.max(dim=0)
            return {
                "name": self._candidate_labels[int(best_index)],
                "confidence": round(float(best_probability.item()), 2),
            }
        except Exception as exc:  # pragma: no cover - runtime inference issues
            LOGGER.warning("CLIP inference failed. Falling back to heuristics: %s", exc)
            return None

    def _vote_from_name(self, features: dict[str, float]) -> str:
        if features["aspect_ratio"] > 1.45 and features["red_mean"] > 0.65 and features["green_mean"] > 0.65:
            return "banana"
        if (
            features["red_mean"] > 0.78
            and features["green_mean"] < 0.35
            and features["channel_std"] < 0.33
        ):
            return "tomato"
        return "apple"

    def _vote_from_color(self, features: dict[str, float]) -> str:
        if features["red_mean"] > 0.70 and features["green_mean"] > 0.70 and features["blue_mean"] < 0.35:
            return "banana"
        if (
            features["red_mean"] > 0.82
            and features["green_mean"] < 0.35
            and features["blue_mean"] < 0.35
            and features["channel_std"] < 0.33
        ):
            return "tomato"
        return "apple"

    def _vote_from_texture(self, features: dict[str, float]) -> str:
        if features["aspect_ratio"] > 1.50 and features["edge_density"] < 0.12:
            return "banana"
        if features["saturation"] > 0.45 and features["channel_std"] < 0.30:
            return "tomato"
        return "apple"
