# Image Analysis

Image analysis uses OpenCV and PyTorch to find holds in photos of climbing-wall courses so later steps can reason about the route.

Status: implements the Issue #4 hold detector.

Install the application-server dependencies before running it:

```bash
cd application-server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

The detector uses Pillow for correctly oriented JPEG/PNG decoding and OpenCV for
saturated-region contour detection. It returns normalized bounding boxes relative
to the EXIF-transposed image.

The current HSV pipeline reliably detects brightly colored holds. It is not
effective for gray/monochrome holds or clear/transparent acrylic holds because
wall shadows, glare, and low background contrast interfere with color-based
segmentation. A later implementation should fine-tune a pretrained object
detection model, such as YOLOv8 on PyTorch, using labeled climbing-wall images
so monochrome and clear holds can be recognized by shape and edges.
