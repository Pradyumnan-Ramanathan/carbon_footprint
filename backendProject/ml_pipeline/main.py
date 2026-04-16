from __future__ import annotations

import logging
from pathlib import Path

try:
    from .clip_engine import NonPackagedPipeline
    from .ocr_engine import PackagedPipeline
    from .rag_retriever import CarbonRAG
    from .router import ImageRouter
    from .schema import FinalOutput, SearchQueryObject
except ImportError:  # pragma: no cover - fallback for direct script execution
    from clip_engine import NonPackagedPipeline
    from ocr_engine import PackagedPipeline
    from rag_retriever import CarbonRAG
    from router import ImageRouter
    from schema import FinalOutput, SearchQueryObject


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
LOGGER = logging.getLogger(__name__)


def process_grocery_image(image_path: str) -> FinalOutput:
    """Run the full grocery ML pipeline and return structured output."""
    LOGGER.info("Starting grocery image processing for %s", image_path)

    router = ImageRouter()
    ocr_pipeline = PackagedPipeline()
    clip_pipeline = NonPackagedPipeline()
    retriever = CarbonRAG()

    route_result = router.classify(image_path)
    route_label = str(route_result["label"])
    route_confidence = float(route_result["confidence"])

    if route_label == "manual_review":
        LOGGER.warning("Router confidence is low. Attempting dual-path fallback for %s", image_path)
        parallel_resolution = _run_parallel_fallback(
            image_path=image_path,
            ocr_pipeline=ocr_pipeline,
            clip_pipeline=clip_pipeline,
        )
        if parallel_resolution is None:
            return FinalOutput(
                item_name="unknown",
                category="manual_review",
                confidence_score=route_confidence,
                carbon_footprint_kg=0.0,
                source_note="Low router confidence. Human review required before querying Agribalyse data.",
            )

        item_name, category, confidence_score = parallel_resolution
    elif route_label == "packaged":
        extracted_text = ocr_pipeline.extract_text(image_path)
        item_name = _normalize_packaged_item_name(extracted_text)
        category = "packaged"
        confidence_score = route_confidence
    else:
        clip_result = clip_pipeline.classify(image_path)
        item_name = str(clip_result["name"])
        category = "non-packaged"
        confidence_score = min(route_confidence, float(clip_result["confidence"]))

    query_obj = SearchQueryObject(
        type=category,
        name=item_name,
        attributes={
            "image_path": image_path,
            "router_confidence": route_confidence,
            "router_source": router.last_route_source,
        },
    )
    carbon_footprint = retriever.query(query_obj)

    return FinalOutput(
        item_name=item_name,
        category=category,
        confidence_score=round(confidence_score, 2),
        carbon_footprint_kg=carbon_footprint,
        source_note=retriever.last_source_note,
    )


def _run_parallel_fallback(
    image_path: str,
    ocr_pipeline: PackagedPipeline,
    clip_pipeline: NonPackagedPipeline,
) -> tuple[str, str, float] | None:
    extracted_text = ocr_pipeline.extract_text(image_path)
    packaged_item = _normalize_packaged_item_name(extracted_text)

    clip_result = clip_pipeline.classify(image_path)
    clip_item = str(clip_result["name"])
    clip_confidence = float(clip_result["confidence"])

    if ocr_pipeline.last_extraction_source == "paddleocr":
        packaged_confidence = 0.88 if packaged_item != "generic packaged grocery item" else 0.45
    else:
        packaged_confidence = 0.62 if packaged_item != "generic packaged grocery item" else 0.35

    if packaged_confidence >= max(clip_confidence, 0.0) and packaged_item != "generic packaged grocery item":
        return packaged_item, "packaged", packaged_confidence

    if clip_item != "unknown" and clip_confidence > 0.0:
        return clip_item, "non-packaged", clip_confidence

    return None


def _normalize_packaged_item_name(extracted_text: str) -> str:
    normalized = extracted_text.strip().lower()
    if "milk" in normalized:
        return "milk"
    if "juice" in normalized:
        return "orange juice"
    if "corn flakes" in normalized:
        return "corn flakes"
    return normalized or "generic packaged grocery item"


if __name__ == "__main__":
    sample_image = str(Path(__file__).resolve().parent / "sample_images" / "apple.ppm")
    output = process_grocery_image(sample_image)
    print(output.model_dump_json(indent=2))
