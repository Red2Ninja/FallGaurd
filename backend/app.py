# backend/app.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

import shutil
import os
from fallguard.detector import process_video
from fallguard.utils import capture_webcam_video

app = FastAPI(title="FallGuard API")

# Folder to store uploads
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


"""@app.post("/upload-video/")
async def upload_video(
    video: UploadFile = File(...),
    emails: str = Form(...),  # comma-separated emails
):
    
    Upload a video and list of emails (comma-separated)
    Returns processed video, snapshot, and AI report
    
    # Save uploaded video
    video_path = os.path.join(UPLOAD_FOLDER, video.filename)
    with open(video_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    # Convert emails string to list
    email_list = [e.strip() for e in emails.split(",")]

    print("Starting video processing...")
    # Process the video
    processed_video, report_file, snapshot_file = process_video(video_path, email_list)
    print("finish video processing...")

    if processed_video is None:
        return {"message": "No fall detected in the video."}

    return {
        "processed_video": processed_video,
        "ai_report": report_file,
        "snapshot": snapshot_file
    }


@app.post("/record-webcam/")
async def record_webcam(
    emails: str = Form(...),
    duration: int = Form(10)
):
    email_list = [e.strip() for e in emails.split(",")]

    print("🎥 Recording webcam...")
    video_path = capture_webcam_video(duration=duration)

    print("🔎 Starting fall detection...")
    processed_video, report_file, snapshot_file = process_video(video_path, email_list)
    print("✅ Finished processing webcam video")

    if processed_video is None:
        return {"message": "No fall detected in the video."}

    return {
        "processed_video": processed_video,
        "ai_report": report_file,
        "snapshot": snapshot_file
    }


@app.get("/download/{file_name}")
async def download_file(file_name: str):
    
    Endpoint to download processed files
    
    file_path = os.path.join(os.getcwd(), file_name)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=file_name)
    else:
        return {"error": "File not found."}


@app.get("/")
async def root():
    return {"message": "Welcome to FallGuard Backend!"}"""

@app.post("/upload-video/")
async def upload_video(video: UploadFile = File(...), emails: str = Form(...)):
    video_path = os.path.join(UPLOAD_FOLDER, video.filename)
    with open(video_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    email_list = [e.strip() for e in emails.split(",")]

    processed_video, report_file, snapshot_file = process_video(video_path, email_list)

    if processed_video is None:
        return {"message": "No fall detected in the video."}

    base_url = "http://127.0.0.1:8000/download"
    return {
        "processed_video": f"{base_url}/{os.path.basename(processed_video)}",
        "ai_report": f"{base_url}/{os.path.basename(report_file)}",
        "snapshot": f"{base_url}/{os.path.basename(snapshot_file)}"
    }

@app.post("/record-webcam/")
async def record_webcam(emails: str = Form(...), duration: int = Form(10)):
    email_list = [e.strip() for e in emails.split(",")]
    video_path = capture_webcam_video(duration=duration)

    processed_video, report_file, snapshot_file = process_video(video_path, email_list)

    if processed_video is None:
        return {"message": "No fall detected in the video."}

    base_url = "http://127.0.0.1:8000/download"
    return {
        "processed_video": f"{base_url}/{os.path.basename(processed_video)}",
        "ai_report": f"{base_url}/{os.path.basename(report_file)}",
        "snapshot": f"{base_url}/{os.path.basename(snapshot_file)}"
    }

@app.get("/download/{file_name}")
async def download_file(file_name: str):
    file_path = os.path.join(UPLOAD_FOLDER, file_name)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=file_name)
    else:
        return {"error": "File not found."}

@app.get("/")
async def root():
    return {"message": "Welcome to FallGuard Backend!"}