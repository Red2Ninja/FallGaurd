import cv2
import os
from datetime import datetime

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def capture_webcam_video(duration: int = 10) -> str:
    """
    Capture video from webcam using OpenCV and save to uploads folder.
    Returns path of the saved video file.
    """
    cap = cv2.VideoCapture(0)  # 0 = default webcam

    # Define codec and create VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_path = os.path.join(UPLOAD_FOLDER, f"webcam_{timestamp}.mp4")

    fps = 20.0
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    out = cv2.VideoWriter(video_path, fourcc, fps, (frame_width, frame_height))

    frame_count = int(fps * duration)
    for _ in range(frame_count):
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)

    cap.release()
    out.release()
    cv2.destroyAllWindows()

    print(f"✅ Saved webcam video to {video_path}")
    return video_path
