# fallguard/report.py
from PIL import Image
import google.generativeai as genai
import os
import json
from config import GEMINI_API_KEY

# Configure your API key
genai.configure(api_key=GEMINI_API_KEY)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

USERS_FILE = os.path.join(BASE_DIR, "data", "users.json")
def get_user_info(patient_id):
    """Fetch user details from users.json using patient_id"""
    try:
        with open(USERS_FILE, "r") as f:
            users = json.load(f)
            # Assuming users is a list of dicts
            for user in users:
                if user.get("patient_id") == patient_id:
                    return {
                        "name": user.get("name", "Aarya"),
                        "patient_id": patient_id,
                        "age": user.get("age", "20"),
                        "medical_history": user.get("medical_history", "N/A")
                    }
    except Exception as e:
        print("⚠️ Could not read users.json:", e)

    # fallback if patient not found
    return {
        "name": "Aarya",
        "patient_id": patient_id,
        "age": "20",
        "medical_history": "N/A"
    }

def describe_fall_frames(fall_frames, fps=30):
    """
    Generates a concise AI report for each fall frame
    fall_frames: list of dicts containing 'snapshot_path', 'frame_id', 'bbox', 'pose', 'patient_id'
    """
    model = genai.GenerativeModel("models/gemini-2.5-pro")
    report = []

    for info in fall_frames:
        img = Image.open(info["snapshot_path"])
        frame_id = info["frame_id"]
        bbox = info["bbox"]
        pose = info["pose"]
        patient_id = info.get("patient_id", "701")

        user_info = get_user_info(patient_id)
        name = user_info["name"]
        age = user_info["age"]
        medical_history = user_info["medical_history"]

        timestamp = round(frame_id / fps, 2)  # approximate timestamp

        prompt = f"""
You are an AI assistant for fall monitoring in videos.

Attached is an image of a person, with detected pose keypoints: {pose}

Create a short report with the following:
- Patient ID: {patient_id}
- Name: {name}
- Age: {age}
- Medical history: {medical_history}
- Approximate timestamp: {timestamp} seconds
- Severity of the fall
- Person's posture: falling, lying, sitting, or standing
- Any visible hazards or surrounding context
- Recommended alert or safety notes (if necessary)

Keep it concise, 2-3 sentences max, in structured format, email/text friendly , don't use bold.
        """

        try:
            response = model.generate_content([prompt, img])
            description = response.text.strip()
        except Exception as e:
            description = f"GenAI failed: {e}"

        # Add frame report
        report.append({
            "patient_id": patient_id,
            "name": name,
            "age": age,
            "medical_history": medical_history,
            "description": description
        })

    # Save the report
    report_dir = "uploads"
    os.makedirs(report_dir, exist_ok=True)
    report_file = os.path.join(report_dir, "fall_report.txt")

    with open(report_file, "w") as f:
        for entry in report:
            f.write(f"Patient ID: {entry['patient_id']}\n")
            f.write(f"Name: {entry['name']}\n")
            f.write(f"Age: {entry['age']}\n")
            f.write(f"Medical History: {entry['medical_history']}\n")
            f.write(f"Description:\n{entry['description']}\n")
            f.write("="*50 + "\n")

    print(f"✅ Fall report saved as {report_file}")
    return report_file
