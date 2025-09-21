# fallguard/enroll.py
import os
import pickle
import json
import cv2
import face_recognition
import json
from datetime import datetime

ENCODINGS_FILE = "fallguard/data/encodings.pickle"
USER_DB_FILE = "fallguard/data/users.json"

os.makedirs(os.path.dirname(ENCODINGS_FILE), exist_ok=True)

empty_data = {"encodings": [], "names": []}

with open(ENCODINGS_FILE, "wb") as f:
    pickle.dump(empty_data, f)

def load_encodings():
    os.makedirs(os.path.dirname(ENCODINGS_FILE), exist_ok=True)

    if not os.path.exists(ENCODINGS_FILE) or os.path.getsize(ENCODINGS_FILE) == 0:
        empty_data = {"encodings": [], "names": []}
        with open(ENCODINGS_FILE, "wb") as f:
            pickle.dump(empty_data, f)
        return empty_data

    with open(ENCODINGS_FILE, "rb") as f:
        try:
            return pickle.load(f)
        except (EOFError, pickle.UnpicklingError):
            # If file is corrupt or empty, reset
            empty_data = {"encodings": [], "names": []}
            with open(ENCODINGS_FILE, "wb") as fw:
                pickle.dump(empty_data, fw)
            return empty_data

def save_encodings(encodings):
    os.makedirs(os.path.dirname(ENCODINGS_FILE), exist_ok=True)
    with open(ENCODINGS_FILE, "wb") as f:
        pickle.dump(encodings, f)

def load_user_db():
    if os.path.exists(USER_DB_FILE):
        with open(USER_DB_FILE, "r") as f:
            return json.load(f)
    return []

def save_user_db(users):
    os.makedirs(os.path.dirname(USER_DB_FILE), exist_ok=True)
    with open(USER_DB_FILE, "w") as f:
        json.dump(users, f, indent=4)

def enroll_new_user(patient_id,images, name,age , guardian_name, guardian_phone, guardian_email, medical_history):
    """
    images: list of file paths (or webcam frames) for the user
    metadata: user + guardian details
    """
    encodings_data = load_encodings()
    user_db = load_user_db()

    new_encodings = []
    for img_path in images:
        img = cv2.imread(img_path)
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb)
        if len(face_locations) == 0:
            continue  # skip if no face
        face_encoding = face_recognition.face_encodings(rgb, face_locations)[0]
        new_encodings.append(face_encoding)

    if not new_encodings:
        raise Exception("No face detected in the provided images!")

    # Save encodings incrementally
    encodings_data["encodings"].extend(new_encodings)
    encodings_data["names"].extend([patient_id] * len(new_encodings))
    save_encodings(encodings_data)

    # Save metadata in users.json
    user_entry = {
        "patient_id": patient_id,
        "name": name,
        "age": age,
        "guardian_name": guardian_name,
        "guardian_phone": guardian_phone,
        "guardian_email": guardian_email,
        "medical_history": medical_history,
        "images": images,
        "added_on": str(datetime.now())
    }
    
    user_db[user_entry['name']] = user_entry
    with open(USER_DB_FILE, "w") as f:
        json.dump(user_db, f, indent=4)

    save_user_db(user_db)

    print(f"✅ User {name} enrolled successfully with {len(new_encodings)} face(s).")
