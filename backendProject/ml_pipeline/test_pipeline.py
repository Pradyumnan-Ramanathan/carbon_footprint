from __future__ import annotations

import unittest
from pathlib import Path

try:
    from .main import process_grocery_image
except ImportError:  # pragma: no cover - fallback for direct script execution
    from main import process_grocery_image


SAMPLE_DIR = Path(__file__).resolve().parent / "sample_images"


class GroceryPipelineTests(unittest.TestCase):
    def test_non_packaged_apple_flow(self) -> None:
        output = process_grocery_image(str(SAMPLE_DIR / "apple.ppm"))
        self.assertEqual(output.category, "non-packaged")
        self.assertEqual(output.item_name, "apple")
        self.assertGreater(output.carbon_footprint_kg, 0.0)

    def test_non_packaged_banana_flow(self) -> None:
        output = process_grocery_image(str(SAMPLE_DIR / "banana.ppm"))
        self.assertEqual(output.category, "non-packaged")
        self.assertEqual(output.item_name, "banana")
        self.assertAlmostEqual(output.carbon_footprint_kg, 0.4, places=2)

    def test_packaged_flow(self) -> None:
        output = process_grocery_image(str(SAMPLE_DIR / "milk_carton.ppm"))
        self.assertEqual(output.category, "packaged")
        self.assertEqual(output.item_name, "milk")
        self.assertAlmostEqual(output.carbon_footprint_kg, 1.2, places=2)


if __name__ == "__main__":
    unittest.main()
