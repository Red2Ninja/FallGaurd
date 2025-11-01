import smtplib
import ssl
import json
import os
from config import SENDER_EMAIL, APP_PASSWORD
from email.message import EmailMessage

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

USERS_FILE = os.path.join(BASE_DIR, "data", "users.json")

DEFAULT_EMAIL = "aryaanagvekar@gmail.com"

'''def get_user_emails():
    try:
        with open(USERS_FILE, "r") as f:
            users = json.load(f)
            emails = []
            for user in users:
                if user.get("email"):
                    emails.append(user["email"])
                if user.get("guardian_email"):
                    emails.append(user["guardian_email"])
            return emails
    except Exception as e:
        print("⚠️ Could not read users.json:", e)
        return []'''


def get_user_emails():
    try:
        with open(USERS_FILE, "r") as f:
            users = json.load(f)          # dict  id : record
            emails = []
            for uid, rec in users.items():        # <── iterate over items
                if rec.get("email"):
                    emails.append(rec["email"])
                if rec.get("guardian_email"):
                    emails.append(rec["guardian_email"])
            return emails
    except Exception as e:
        print("⚠️ Could not read users.json:", e)
        return []

def send_fall_alert_email(report_file, snapshot_file, user_info=None):
    sender_email = SENDER_EMAIL
    app_password = APP_PASSWORD  # Google App Password

    # Load emails from users.json + add default
    to_emails = get_user_emails()
    if DEFAULT_EMAIL not in to_emails:
        to_emails.append(DEFAULT_EMAIL)

    name = user_info.get("name", "Aarya") if user_info else "Aarya"
    age = user_info.get("age", "20") if user_info else "20"
    patient_id = user_info.get("patient_id", "701") if user_info else "701"
    guardian_name = user_info.get("guardian_name", "Anagha") if user_info else "Anagha"
    guardian_email = user_info.get("guardian_email", "aryaanagvekar@gmail.com") if user_info else "aryaanagvekar@gmail.com"
    
    # Read report
    with open(report_file, "r") as f:
        report_content = f.read()
    
    msg = EmailMessage()
    msg["Subject"] = "⚠️ Fall Detected Alert!"
    msg["From"] = sender_email
    msg["To"] = ", ".join(to_emails)

    msg.set_content(f"""
Dear Caregiver,

A fall has been detected.


Please find the attached report and snapshot.

Report Summary:
{report_content}

Regards,  
Fall Detection System
    """)

    # Attach report
    with open(report_file, "rb") as f:
        msg.add_attachment(f.read(), maintype="text", subtype="plain", filename="fall_report.txt")

    # Attach snapshot
    with open(snapshot_file, "rb") as f:
        msg.add_attachment(f.read(), maintype="image", subtype="jpeg", filename="fall_snapshot.jpg")

    # Send email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender_email, app_password)
        server.send_message(msg)
        print("📧 Email sent to:", to_emails)
