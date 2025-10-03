#!/usr/bin/env python3

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_html_email():
    # MailHog SMTP settings
    smtp_server = 'localhost'
    smtp_port = 1025  # MailHog SMTP port

    # Email details
    sender_email = 'test@example.com'
    receiver_email = 'test@local.test'
    subject = 'Test HTML Email for Accessibility Scanner'

    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Simple Test Email</title>,
</head>
<body>
    <h1>Welcome to Our Newsletter</h1>
    
    <img src="https://via.placeholder.com/150" />
    
    <form>
        <input type="text" placeholder="Your name" />
        <input type="email" placeholder="Your email" />
        <button type="submit">Subscribe</button>
    </form>
    
    <p>
        <a href="#">Click here</a> to read our latest articles.
        <a href="#">Learn more</a> about our services.
    </p>
    
    <button></button>
    <button><span>Save</span></button>
    
    <h1>Main Title</h1>
    <h4>Jumped heading!</h4>
    
</body>
</html>
    """

    # Create multipart message
    msg = MIMEMultipart('alternative')
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject

    # Add HTML content
    html_part = MIMEText(html_content, 'html')
    msg.attach(html_part)

    try:
        # Connect to MailHog
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        
        # Send email
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Test email sent successfully!")
        print(f"📧 From: {sender_email}")
        print(f"📧 To: {receiver_email}")
        print(f"📧 Subject: {subject}")
        print(f"🔗 Check MailHog UI: http://localhost:8025")
        
    except Exception as e:
        print(f"❌ Error sending email: {e}")

if __name__ == "__main__":
    send_html_email()
