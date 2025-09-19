# fallguard/report.py
from PIL import Image
import google.generativeai as genai
import os
from config import GEMINI_API_KEY

# Configure your API key
genai.configure(api_key=GEMINI_API_KEY)

def describe_fall_frames(fall_frames, fps=30):
    """
    Generates a concise AI report for the middle fall frame
    fall_frames: list of dicts containing 'snapshot_path', 'frame_id', 'bbox', 'pose'
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    report = []

    for info in fall_frames:
        img = Image.open(info["snapshot_path"])
        frame_id = info["frame_id"]
        bbox = info["bbox"]
        pose = info["pose"]
        name = info.get("name", "Unknown") 

        timestamp = round(frame_id / fps, 2)  # approximate timestamp

        prompt = f"""
You are an AI assistant for fall monitoring in videos.

Attached is an image of a person, with detected pose keypoints: {pose}

Create a short report with the following:
- Person's name: {name}
- Approximate timestamp: {timestamp} seconds
- Severity of the fall
- Person's posture: falling, lying, sitting, or standing
- Any visible hazards or describe surrounding context
- Recommended alert or safety notes (if necessary)

Keep it concise, 2-3 sentences max, in structured format, do not use bold keep it email text message appropriate.
        """

        try:
            response = model.generate_content([prompt, img])
            description = response.text.strip()
        except Exception as e:
            description = f"GenAI failed: {e}"

        report.append({
            "frame_id": frame_id,
            "bbox": bbox,
            "description": description,
            "name": name
        })

    # Save the report
   

    report_file = os.path.join("uploads", "fall_report.txt")
    os.makedirs("uploads", exist_ok=True)  

    with open(report_file, "w") as f:
        for entry in report:
            f.write(f"\n{entry['description']}\n\n")

    print(" Fall report saved as fall_report.txt")
    return report_file
