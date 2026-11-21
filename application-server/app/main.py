from pathlib import Path
import sys

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

image_analysis_root = Path(__file__).resolve().parents[2] / "image-analysis"
if str(image_analysis_root) not in sys.path:
    sys.path.insert(0, str(image_analysis_root))

from hold_detector import decode_image, detect_holds

MAX_FILE_SIZE = 10 * 1024 * 1024
SUPPORTED_CONTENT_TYPES = {"image/jpeg", "image/png"}

app = FastAPI(title="ClimbAssist Application Server")

app.add_middleware(
    CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/holds/detect")
async def detect_holds_endpoint(file: UploadFile = File(...)):
    if file.content_type not in SUPPORTED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file format. Upload a JPEG or PNG image.",
        )

    contents = await file.read(MAX_FILE_SIZE + 1)
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File is too large. Maximum size is 10 MiB.",
        )

    try:
        pil_image, image_format = decode_image(contents)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    if pil_image.width <= 0 or pil_image.height <= 0:
        raise HTTPException(status_code=422, detail="Uploaded image has invalid dimensions")

    return {"holds": detect_holds(contents)}
