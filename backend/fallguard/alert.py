# fallguard/alert.py
import smtplib
import ssl
from config import SENDER_EMAIL, APP_PASSWORD
from email.message import EmailMessage

def send_fall_alert_email(to_emails, report_file, snapshot_file,name=None):
    sender_email = SENDER_EMAIL
    app_password = APP_PASSWORD  # Google App Password
    
    # Read report
    with open(report_file, "r") as f:
        report_content = f.read()
    
    msg = EmailMessage()
    msg["Subject"] = "⚠️ Fall Detected Alert!"
    msg["From"] = sender_email
    msg["To"] = ", ".join(to_emails)

    msg.set_content(f"""
Dear Caregiver,

A fall has been detected. Please find the attached report and snapshot.

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
        print(" Email sent to:", to_emails)
