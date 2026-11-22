import io
import unittest

from fastapi.testclient import TestClient
from PIL import Image
import numpy as np

from app.main import app
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "image-analysis"))
from hold_detector import _classify_color, detect_holds


def png_bytes(width=400, height=300, hold=False):
    image = Image.new("RGB", (width, height), (100, 100, 100))
    if hold:
        from PIL import ImageDraw

        ImageDraw.Draw(image).ellipse((80, 60, 180, 160), fill=(40, 90, 220))
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def jpeg_bytes():
    output = io.BytesIO()
    Image.new("RGB", (200, 200), (100, 100, 100)).save(output, format="JPEG")
    return output.getvalue()


class HoldDetectionEndpointTest(unittest.TestCase):
    def test_neutral_gray_image_is_not_detected_as_holds(self):
        image = Image.new("RGB", (400, 300), (145, 145, 145))
        from PIL import ImageDraw

        draw = ImageDraw.Draw(image)
        draw.ellipse((70, 50, 170, 150), fill=(140, 140, 140))
        draw.ellipse((220, 100, 320, 200), fill=(160, 160, 160))
        output = io.BytesIO()
        image.save(output, format="PNG")

        self.assertEqual(detect_holds(output.getvalue()), [])

    def test_uploaded_hold_returns_normalized_bounds(self):
        with TestClient(app) as client:
            response = client.post(
                "/api/holds/detect",
                files={"file": ("wall.png", png_bytes(hold=True), "image/png")},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertGreaterEqual(len(body["holds"]), 1)
        hold = body["holds"][0]
        self.assertTrue(hold["id"])
        self.assertIn("color", hold)
        for key in ("x", "y", "width", "height"):
            self.assertGreaterEqual(hold[key], 0)
            self.assertLessEqual(hold[key], 1)

    def test_empty_detection_result(self):
        with TestClient(app) as client:
            response = client.post(
                "/api/holds/detect",
                files={"file": ("empty.png", png_bytes(), "image/png")},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"holds": []})

    def test_jpeg_upload_is_supported(self):
        with TestClient(app) as client:
            response = client.post(
                "/api/holds/detect",
                files={"file": ("wall.jpg", jpeg_bytes(), "image/jpeg")},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"holds": []})

    def test_unsupported_format_returns_415(self):
        with TestClient(app) as client:
            response = client.post(
                "/api/holds/detect",
                files={"file": ("wall.gif", b"GIF89a", "image/gif")},
            )

        self.assertEqual(response.status_code, 415)
        self.assertIn("detail", response.json())

    def test_invalid_image_data_returns_422(self):
        with TestClient(app) as client:
            response = client.post(
                "/api/holds/detect",
                files={"file": ("wall.png", b"not an image", "image/png")},
            )

        self.assertEqual(response.status_code, 422)
        self.assertIn("detail", response.json())

    def test_oversized_file_returns_413(self):
        with TestClient(app) as client:
            response = client.post(
                "/api/holds/detect",
                files={"file": ("large.png", b"0" * (10 * 1024 * 1024 + 1), "image/png")},
            )

        self.assertEqual(response.status_code, 413)
        self.assertIn("detail", response.json())
