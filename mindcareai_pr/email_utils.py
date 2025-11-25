# email_utils.py
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from pathlib import Path

# Try to load .env from the same directory as this file
env_path = Path(__file__).parent / ".env"
print(f"🔍 Looking for .env file at: {env_path}")
if env_path.exists():
    print(f"✅ .env file found!")
    load_dotenv(env_path)
else:
    print(f"⚠️  .env file not found at {env_path}, trying default location...")
    load_dotenv()  # Try default location

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
EMAIL_FROM = os.getenv("EMAIL_FROM")

# Debug: Print SMTP configuration status
print(f"\n{'='*60}")
print(f"📧 EMAIL CONFIGURATION CHECK")
print(f"{'='*60}")
print(f"SMTP_HOST: {'✅ Set' if SMTP_HOST else '❌ NOT SET'}")
print(f"SMTP_PORT: {SMTP_PORT}")
print(f"SMTP_USER: {'✅ Set' if SMTP_USER else '❌ NOT SET'}")
print(f"SMTP_PASS: {'✅ Set' if SMTP_PASS else '❌ NOT SET'}")
print(f"EMAIL_FROM: {'✅ Set' if EMAIL_FROM else '❌ NOT SET'}")
print(f"{'='*60}\n")


def send_summary_email(to_email, subject, body, user_name="User"):
    """
    Send an email with both plain text and styled HTML versions.
    Args:
        to_email (str): Recipient email
        subject (str): Email subject
        body (str): Plain text body (summary)
        user_name (str): Recipient's name for personalization
    """
    print(f"\n📧 EMAIL FUNCTION CALLED")
    print(f"   To: {to_email}")
    print(f"   Subject: {subject}")
    print(f"   User: {user_name}")
    print(f"   Body length: {len(body)} chars")
    
    # Check if SMTP config is available
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS or not EMAIL_FROM:
        print(f"❌ EMAIL CONFIGURATION INCOMPLETE!")
        print(f"   Missing: ", end="")
        missing = []
        if not SMTP_HOST:
            missing.append("SMTP_HOST")
        if not SMTP_USER:
            missing.append("SMTP_USER")
        if not SMTP_PASS:
            missing.append("SMTP_PASS")
        if not EMAIL_FROM:
            missing.append("EMAIL_FROM")
        print(", ".join(missing))
        print(f"   Please configure these in your .env file")
        return False
    
    msg = EmailMessage()
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject

    # ✅ Plain text fallback
    msg.set_content(body)

    # ✅ HTML version with improved styling
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #eef2f7; padding: 20px; margin: 0;">
        <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 10px; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6a11cb, #2575fc); 
                      color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">🌿 MindCare AI</h1>
            <p style="margin: 5px 0 0; font-size: 14px;">Your Personal Mental Wellness Companion</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 25px; color: #2c3e50; line-height: 1.6;">
            <p>Dear <strong>{user_name}</strong>,</p>
            
            <p>Here’s a summary of your recent session with MindCare AI:</p>
            
            <div style="background: #f4f9ff; padding: 15px; border-left: 4px solid #3498db; 
                        border-radius: 6px; margin: 20px 0;">
              <pre style="white-space: pre-wrap; font-size: 15px; line-height: 1.5; color: #2c3e50; margin: 0;">
{body}
              </pre>
            </div>
            
            <p style="margin-top: 20px;">
              🌸 <em>Remember: Small steps lead to big changes. You are never alone in this journey.</em>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #fafafa; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            — MindCare AI Support Team <br>
            <span style="color:#aaa;">This is an automated email. Please do not reply.</span>
          </div>
        </div>
      </body>
    </html>
    """

    msg.add_alternative(html_content, subtype="html")

    try:
        print(f"🔌 Connecting to SMTP server: {SMTP_HOST}:{SMTP_PORT}")
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            print(f"🔐 Starting TLS...")
            server.starttls()
            print(f"🔑 Logging in as: {SMTP_USER}")
            server.login(SMTP_USER, SMTP_PASS)
            print(f"📤 Sending email...")
            server.send_message(msg)
        print(f"✅ Email successfully sent to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP Authentication failed: {e}")
        print(f"   Check your SMTP_USER and SMTP_PASS credentials")
        return False
    except smtplib.SMTPConnectError as e:
        print(f"❌ SMTP Connection failed: {e}")
        print(f"   Check SMTP_HOST and SMTP_PORT settings")
        return False
    except Exception as e:
        print(f"❌ Email sending failed with error: {type(e).__name__}")
        print(f"   Error details: {str(e)}")
        import traceback
        print(f"   Traceback:")
        traceback.print_exc()
        return False
