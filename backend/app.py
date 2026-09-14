"""
The Moonlit Haven — Backend
----------------------------
Flask API that receives a visitor's grievance from the frontend chatbot,
records the submission time, and sends an email notification to the
portal operator via the Resend email API.

Run with:
    python app.py

Configure via environment variables (see .env.example).
"""

import os
import logging
from datetime import datetime

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Allow the frontend (served from a different origin/port) to call this API.
# Restrict this in production to your actual deployed frontend origin.
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": FRONTEND_ORIGIN}})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("moonlit-haven")

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
RECIPIENT_EMAIL = os.getenv("RECIPIENT_EMAIL")
RESEND_API_URL = "https://api.resend.com/emails"

REQUIRED_FIELDS = ["name", "age", "location", "email", "grievance"]


def build_email_payload(data: dict, submitted_at: str) -> dict:
    """Compose the Resend API payload from a validated grievance payload."""
    text_body = (
        "A new grievance has been submitted through the Moonlit Haven portal.\n\n"
        f"Name: {data['name']}\n"
        f"Age: {data['age']}\n"
        f"Location: {data['location']}\n"
        f"Email: {data['email']}\n"
        f"Submitted: {submitted_at}\n\n"
        f"Grievance:\n{data['grievance']}\n"
    )

    html_body = f"""
    <html>
      <body style="font-family: Georgia, serif; background:#0b0b12; color:#eee; padding:24px;">
        <h2 style="color:#cfa15c;">A new voice has reached the Haven's door</h2>
        <table style="border-collapse: collapse; width:100%; max-width:520px;">
          <tr><td style="padding:6px 0; color:#9a97b3;">Name</td><td>{data['name']}</td></tr>
          <tr><td style="padding:6px 0; color:#9a97b3;">Age</td><td>{data['age']}</td></tr>
          <tr><td style="padding:6px 0; color:#9a97b3;">Location</td><td>{data['location']}</td></tr>
          <tr><td style="padding:6px 0; color:#9a97b3;">Email</td><td>{data['email']}</td></tr>
          <tr><td style="padding:6px 0; color:#9a97b3;">Submitted</td><td>{submitted_at}</td></tr>
        </table>
        <p style="margin-top:16px; color:#9a97b3;">Grievance:</p>
        <p style="white-space:pre-wrap;">{data['grievance']}</p>
      </body>
    </html>
    """

    return {
        "from": RESEND_FROM_EMAIL,
        "to": [RECIPIENT_EMAIL],
        "subject": f"🦸 Someone Needs Your Help! — {data['name']}",
        "text": text_body,
        "html": html_body,
    }


def send_notification_email(data: dict, submitted_at: str) -> bool:
    """Send the notification email via the Resend API. Returns True on success."""
    if not all([RESEND_API_KEY, RESEND_FROM_EMAIL, RECIPIENT_EMAIL]):
        logger.error(
            "Email is not fully configured. Check RESEND_API_KEY, "
            "RESEND_FROM_EMAIL, and RECIPIENT_EMAIL in your .env file."
        )
        return False

    payload = build_email_payload(data, submitted_at)
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(RESEND_API_URL, json=payload, headers=headers, timeout=10)
        if response.status_code >= 400:
            logger.error("Resend API error %s: %s", response.status_code, response.text)
            return False
        logger.info("Notification email sent for submission from %s", data.get("email"))
        return True
    except requests.RequestException:
        logger.exception("Failed to reach Resend API")
        return False


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "moonlit-haven-backend"})


@app.route("/api/grievance", methods=["POST"])
def submit_grievance():
    payload = request.get_json(silent=True) or {}

    missing = [f for f in REQUIRED_FIELDS if not str(payload.get(f, "")).strip()]
    if missing:
        return jsonify({
            "success": False,
            "error": f"Missing required field(s): {', '.join(missing)}"
        }), 400

    data = {field: str(payload[field]).strip() for field in REQUIRED_FIELDS}
    submitted_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    email_sent = send_notification_email(data, submitted_at)

    if not email_sent:
        # The grievance was received and logged, but notification failed.
        # Be honest with the frontend rather than pretending success.
        logger.warning("Grievance received but email notification failed: %s", data)
        return jsonify({
            "success": False,
            "error": "Your words were received, but the notification could not be sent. "
                     "Please try again shortly."
        }), 502

    return jsonify({"success": True, "submitted_at": submitted_at})


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)