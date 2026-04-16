from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

try:
    from .main import process_grocery_image
except ImportError:  # pragma: no cover - fallback for direct script execution
    from main import process_grocery_image


LOGGER = logging.getLogger(__name__)
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".ppm", ".bmp", ".webp"}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run the grocery carbon-footprint ML pipeline on one image or all images in a folder."
    )
    parser.add_argument(
        "path",
        help="Path to an image file or a folder containing images.",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Recursively scan subfolders when the input path is a directory.",
    )
    return parser


def collect_images(input_path: Path, recursive: bool) -> list[Path]:
    if input_path.is_file():
        return [input_path] if input_path.suffix.lower() in SUPPORTED_EXTENSIONS else []

    if input_path.is_dir():
        pattern = "**/*" if recursive else "*"
        return sorted(
            path
            for path in input_path.glob(pattern)
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
        )

    return []


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    input_path = Path(args.path).expanduser().resolve()
    if not input_path.exists():
        parser.error(f"Path does not exist: {input_path}")

    image_paths = collect_images(input_path, recursive=args.recursive)
    if not image_paths:
        parser.error(f"No supported image files found at: {input_path}")

    for image_path in image_paths:
        LOGGER.info("Processing %s", image_path)
        result = process_grocery_image(str(image_path))
        payload = {
            "image_path": str(image_path),
            "result": result.model_dump(),
        }
        print(json.dumps(payload, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
