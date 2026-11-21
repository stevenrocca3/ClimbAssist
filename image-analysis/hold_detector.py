from io import BytesIO

import cv2
import numpy as np
from PIL import Image, ImageOps


def _classify_color(hsv_pixel: np.ndarray) -> str:
    hue, saturation, value = (int(hsv_pixel[0]), int(hsv_pixel[1]), int(hsv_pixel[2]))
    if saturation < 55 or value < 35:
        return "unknown"
    if hue <= 5 or hue >= 170:
        return "red"
    if hue < 25:
        return "orange"
    if hue < 35:
        return "yellow"
    if hue < 85:
        return "green"
    if hue < 135:
        return "blue"
    if hue < 170:
        return "purple"
    return "unknown"


def decode_image(contents: bytes) -> tuple[Image.Image, str]:
    try:
        image = Image.open(BytesIO(contents))
        image_format = (image.format or "").upper()
        image.load()
        image = ImageOps.exif_transpose(image).convert("RGB")
    except Exception as exc:
        raise ValueError("The uploaded file is not valid JPEG or PNG image data") from exc

    if image_format not in {"JPEG", "PNG"}:
        raise ValueError("The uploaded file is not valid JPEG or PNG image data")
    return image, image_format


def detect_holds(contents: bytes) -> list[dict]:
    pil_image, _ = decode_image(contents)
    rgb = np.asarray(pil_image)
    height, width = rgb.shape[:2]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)

    saturation_mask = cv2.inRange(hsv[:, :, 1], 55, 255)
    value_mask = cv2.inRange(hsv[:, :, 2], 35, 255)
    mask = cv2.bitwise_and(saturation_mask, value_mask)
    mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_CLOSE,
        np.ones((9, 9), np.uint8),
        iterations=2,
    )

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    candidates: list[tuple[int, int, int, int, str, float]] = []
    minimum_area = height * width * 0.0005

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < minimum_area:
            continue
        x, y, box_width, box_height = cv2.boundingRect(contour)
        if box_width < 8 or box_height < 8:
            continue

        sample_mask = np.zeros((height, width), dtype=np.uint8)
        cv2.drawContours(sample_mask, [contour], -1, 255, thickness=cv2.FILLED)
        pixels = hsv[sample_mask > 0]
        if pixels.size == 0:
            continue

        median_hsv = np.median(pixels, axis=0)
        color = _classify_color(median_hsv)
        candidates.append((x, y, box_width, box_height, color, area))

    candidates.sort(key=lambda candidate: (candidate[1], candidate[0]))
    holds = []
    for index, (x, y, box_width, box_height, color, _) in enumerate(candidates, start=1):
        holds.append(
            {
                "id": f"hold-{index}",
                "color": color,
                "x": x / width,
                "y": y / height,
                "width": box_width / width,
                "height": box_height / height,
            }
        )
    return holds
