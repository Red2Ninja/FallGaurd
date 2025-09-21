# fallguard/enroll.py
'''import os
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

    print(f"✅ User {name} enrolled successfully with {len(new_encodings)} face(s).")'''


# fallguard/enroll.py
import os
import pickle
import json
import cv2
import face_recognition
from datetime import datetime

ENCODINGS_FILE = "fallguard/data/encodings.pickle"
USER_DB_FILE = "fallguard/data/users.json"
DATASET_PATH = "fallguard/data/face_database"

# Ensure directories exist
os.makedirs(os.path.dirname(ENCODINGS_FILE), exist_ok=True)
os.makedirs(DATASET_PATH, exist_ok=True)

# Initialize encodings file if missing
if not os.path.exists(ENCODINGS_FILE) or os.path.getsize(ENCODINGS_FILE) == 0:
    empty_data = {"encodings": [], "names": []}
    with open(ENCODINGS_FILE, "wb") as f:
        pickle.dump(empty_data, f)

# ------------------- Utility Functions -------------------

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
    return {}

def save_user_db(users):
    os.makedirs(os.path.dirname(USER_DB_FILE), exist_ok=True)
    with open(USER_DB_FILE, "w") as f:
        json.dump(users, f, indent=4)

# ------------------- Webcam Face Capture -------------------

def capture_faces_from_webcam(patient_id, max_images=50):
    person_folder = os.path.join(DATASET_PATH, str(patient_id))
    os.makedirs(person_folder, exist_ok=True)

    cap = cv2.VideoCapture(0)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    count = 0
    print("📸 Capturing faces... Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            face_img = frame[y:y+h, x:x+w]
            face_filename = os.path.join(person_folder, f"face_{count}.jpg")
            cv2.imwrite(face_filename, face_img)
            count += 1

        cv2.imshow("Face Capture", frame)

        if cv2.waitKey(1) & 0xFF == ord('q') or count >= max_images:
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"✅ Saved {count} face images for Patient ID {patient_id} in {person_folder}")
    return [os.path.join(person_folder, f) for f in os.listdir(person_folder) if f.endswith(".jpg")]

# ------------------- Enrollment -------------------

def enroll_new_user(patient_id, images, name, age, guardian_name, guardian_phone, guardian_email, medical_history):
    """
    Enrolls a user with images (from file or webcam) and metadata.
    """
    encodings_data = load_encodings()
    user_db = load_user_db()

    new_encodings = []
    for img_path in images:
        img = cv2.imread(img_path)
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb)
        if len(face_locations) == 0:
            continue
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
    user_db[str(patient_id)] = user_entry
    save_user_db(user_db)

    print(f"🎉 User {name} (ID: {patient_id}) enrolled successfully with {len(new_encodings)} encoding(s).")

# ------------------- One-Shot Enrollment -------------------

def start_patient_enrollment(patient_id, name, age, guardian_name, guardian_phone, guardian_email, medical_history, use_webcam=True, image_paths=None):
    """
    If use_webcam=True: capture faces from webcam.
    If use_webcam=False: use provided image_paths list.
    """
    if use_webcam:
        images = capture_faces_from_webcam(patient_id)
    else:
        if not image_paths:
            raise Exception("No images provided for enrollment!")
        images = image_paths

    enroll_new_user(
        patient_id=patient_id,
        images=images,
        name=name,
        age=age,
        guardian_name=guardian_name,
        guardian_phone=guardian_phone,
        guardian_email=guardian_email,
        medical_history=medical_history
    )

# ------------------- Example Usage -------------------
if __name__ == "__main__":
    # Example: webcam enrollment
    start_patient_enrollment(
        patient_id="P001",
        name="John Doe",
        age=70,
        guardian_name="Jane Doe",
        guardian_phone="1234567890",
        guardian_email="guardian@example.com",
        medical_history="Diabetic",
        use_webcam=True
    )
