from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

try:
    from .image_utils import extract_image_features, load_image_array
except ImportError:  # pragma: no cover - fallback for direct script execution
    from image_utils import extract_image_features, load_image_array

try:
    import torch
    from torchvision.models import ResNet50_Weights, resnet50
except ImportError:  # pragma: no cover - torchvision is optional at runtime
    torch = None  # type: ignore[assignment]
    ResNet50_Weights = None  # type: ignore[assignment]
    resnet50 = None  # type: ignore[assignment]


LOGGER = logging.getLogger(__name__)


class ImageRouter:
    """Image router with lightweight pixel heuristics and a ResNet50-ready interface."""

    _PACKAGED_KEYWORDS = {
        "packet",
        "carton",
        "bottle",
        "wine bottle",
        "pill bottle",
        "beer bottle",
        "water bottle",
        "can opener",
        "corkscrew",
        "box",
        "crate",
        "cup",
        "coffee mug",
        "measuring cup",
        "plastic bag",
        "paper towel",
        "grocery store",
    }
    _NON_PACKAGED_KEYWORDS = {
        "banana",
        "pineapple",
        "lemon",
        "orange",
        "strawberry",
        "pomegranate",
        "fig",
        "bell pepper",
        "cucumber",
        "zucchini",
        "spaghetti squash",
        "Granny Smith",
        "apple",
        "tomato",
        "artichoke",
        "cauliflower",
        "mushroom",
        "broccoli",
        "cabbage",
    }

    def __init__(self, use_resnet: bool = True) -> None:
        self._model: Any | None = None
        self._weights: Any | None = None
        self._transforms: Any | None = None
        self.last_route_source = "heuristic"

        if use_resnet and torch is not None and resnet50 is not None and ResNet50_Weights is not None:
            try:
                self._weights = ResNet50_Weights.DEFAULT
                self._model = resnet50(weights=self._weights)
                self._model.eval()
                self._transforms = self._weights.transforms()
                LOGGER.info("Initialized torchvision ResNet50 router backend.")
            except Exception as exc:  # pragma: no cover - model download/runtime issues
                LOGGER.warning("Failed to initialize ResNet50 backend. Falling back to heuristics: %s", exc)
                self._model = None
                self._weights = None
                self._transforms = None

    def classify(self, image_path: str) -> dict[str, str | float]:
        if not image_path.strip():
            LOGGER.warning("Empty image path received by router.")
            return {"label": "manual_review", "confidence": 0.0}

        LOGGER.info("Routing image %s", image_path)
        if (
            Path(image_path).suffix.lower() != ".ppm"
            and self._model is not None
            and self._transforms is not None
            and self._weights is not None
        ):
            resnet_result = self._classify_with_resnet(image_path)
            if resnet_result is not None:
                self.last_route_source = "resnet50"
                return resnet_result

        try:
            image_array = load_image_array(image_path)
            features = extract_image_features(image_array)
        except (FileNotFoundError, RuntimeError, ValueError) as exc:
            LOGGER.warning("Router failed to load image: %s", exc)
            return {"label": "manual_review", "confidence": 0.0}

        packaged_score = (
            (0.45 if features["edge_density"] > 0.22 else 0.0)
            + (0.25 if features["channel_std"] > 0.25 else 0.0)
            + (0.20 if 0.80 <= features["aspect_ratio"] <= 1.35 else 0.0)
        )
        produce_score = (
            (0.40 if features["saturation"] > 0.35 else 0.0)
            + (0.30 if features["edge_density"] < 0.20 else 0.0)
            + (0.20 if features["aspect_ratio"] > 1.45 or features["aspect_ratio"] < 0.8 else 0.0)
        )

        if packaged_score >= produce_score:
            label = "packaged"
            confidence = min(0.99, round(0.55 + packaged_score / 2.0, 2))
        else:
            label = "non-packaged"
            confidence = min(0.99, round(0.55 + produce_score / 2.0, 2))

        if confidence < 0.8:
            LOGGER.info("Router confidence %.2f below threshold. Sending to manual review.", confidence)
            return {"label": "manual_review", "confidence": confidence}

        return {"label": label, "confidence": confidence}

    def _classify_with_resnet(self, image_path: str) -> dict[str, str | float] | None:
        try:
            image_array = load_image_array(image_path)
            if torch is None:
                return None

            image_tensor = torch.from_numpy(image_array / 255.0).permute(2, 0, 1)
            inputs = self._transforms(image_tensor).unsqueeze(0)
            with torch.inference_mode():
                probabilities = self._model(inputs).softmax(dim=1)[0]

            top_probability, top_index = probabilities.max(dim=0)
            category_name = self._weights.meta["categories"][int(top_index)]
            normalized_label = category_name.lower()
            confidence = round(float(top_probability.item()), 2)
        except Exception as exc:  # pragma: no cover - runtime inference issues
            LOGGER.warning("ResNet50 inference failed. Falling back to heuristics: %s", exc)
            return None

        if any(keyword in normalized_label for keyword in self._PACKAGED_KEYWORDS):
            label = "packaged"
        elif any(keyword in normalized_label for keyword in self._NON_PACKAGED_KEYWORDS):
            label = "non-packaged"
        else:
            label = "manual_review"
            confidence = min(confidence, 0.79)

        return {"label": label, "confidence": confidence}
