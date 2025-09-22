# backend/app.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import shutil
import os
from fallguard.detector import process_video
from fallguard.utils import capture_webcam_video
from fallguard.enroll import enroll_new_user
from fallguard.enroll import start_patient_enrollment

app = FastAPI(title="FallGuard API")

origins = [
    "http://localhost:3000",  # your React frontend
]

# Folder to store uploads
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # change to ["http://localhost:3000"] in production
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
async def upload_video(video: UploadFile = File(...)):
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Force save as mp4 to avoid OpenCV issues
    save_path = os.path.join(UPLOAD_FOLDER, "input_video.mp4")
    with open(save_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    # Process
    processed_video, report_file, snapshot_file = process_video(save_path, [])

    if processed_video is None:
        return {"message": "No fall detected in the video."}

    base_url = "http://127.0.0.1:8000/download"
    return {
        "processed_video": f"{base_url}/{os.path.basename(processed_video)}",
        "ai_report": f"{base_url}/{os.path.basename(report_file)}",
        "snapshot": f"{base_url}/{os.path.basename(snapshot_file)}"
    }


'''@app.post("/record-webcam/")
async def record_webcam(duration: int = Form(10)):
    # 1. Capture webcam video
    video_path = capture_webcam_video(duration=duration)

    # 2. Run the same detector logic as upload-video
    processed_video, report_file, snapshot_file = process_video(video_path, [])

    base_url = "http://127.0.0.1:8000/download"
    if processed_video is None:
        return {"message": "No fall detected in the video."}

    # 3. Return results in the SAME format
    return {
        "processed_video": f"{base_url}/{os.path.basename(processed_video)}",
        "ai_report": f"{base_url}/{os.path.basename(report_file)}",
        "snapshot": f"{base_url}/{os.path.basename(snapshot_file)}"
    }'''

    
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


@app.post("/register-face/")
async def register_face(
    patient_id: str = Form(...),
    name: str = Form(...),
    age: int = Form(...),   
    guardian_name: str = Form(...),
    guardian_phone: str = Form(...),
    guardian_email: str = Form(...),
    medical_history: str = Form(...),
    images: list[UploadFile] = File(...)
):
    """
    Register a new user with face images and guardian details.
    Updates encodings.pickle and users.json incrementally.
    """

    # Save uploaded face images
    image_paths = []
    for img in images:
        save_path = os.path.join(UPLOAD_FOLDER, img.filename)
        with open(save_path, "wb") as f:
            shutil.copyfileobj(img.file, f)
        image_paths.append(save_path)

    '''# Call the enrollment logic
    enroll_new_user(
        patient_id=patient_id,
        images=image_paths,
        name=name,
        age=age,
        guardian_name=guardian_name,
        guardian_phone=guardian_phone,
        guardian_email=guardian_email,
        medical_history=medical_history
    )'''

  


    # Start enrollment using the data submitted by the user
    start_patient_enrollment(
        patient_id=patient_id,
        name=name,
        age=age,
        guardian_name=guardian_name,
        guardian_phone=guardian_phone,
        guardian_email=guardian_email,
        medical_history=medical_history
    )

    return {"message": f"✅ User '{name}' registered successfully!"}


    return {"message": f"✅ User '{name}' registered successfully with {len(image_paths)} images."}



class LoginData(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(data: LoginData):
    if data.email == "carefall@hosp.com" and data.password == "powerpuff":
        return {"success": True, "message": "Login successful"}
    return {"success": False, "message": "Invalid email or password"}