# 📧 EmailJS Service & Auto-Reply Setup Guide

To ensure emails are delivered to **venzaba25@gmail.com** and that your customers receive an **auto-reply**, please follow these 3 steps in your [EmailJS Dashboard](https://dashboard.emailjs.com/):

## 1. Connect Your Gmail Account
1. Go to **Email Services** > **Add New Service**.
2. Select **Gmail**.
3. Connect your account: `venzaba25@gmail.com`.
4. Set it as the **Default Service**.
5. Note your **Service ID** (e.g., `service_x248zmc`) and update it in `Contact.tsx` if it's different.

## 2. Configure the "New Message" Template
This is the email YOU receive when someone fills out the form.
1. Go to **Email Templates** > Create/Edit your template (ID: `template_r5hihjl`).
2. **Subject:** `New Portfolio Message: {{subject}}`
3. **Content:**
   ```text
   You have a new message from {{from_name}} ({{from_email}}):
   
   Subject: {{subject}}
   Message: {{message}}
   ```
4. **Reply To:** Set this to `{{reply_to}}` in the "Settings" tab.

## 3. Enable Auto-Reply (The "Auto-Responder")
EmailJS handles auto-responses by allowing you to trigger a second template or using their "Auto-Reply" feature.
1. In your **Email Template** settings, go to the **Auto-Reply** tab.
2. Toggle **Enable Auto-Reply**.
3. **Subject:** `Thanks for reaching out, {{from_name}}!`
4. **Content:**
   ```text
   Hi {{from_name}},
   
   Thank you for contacting me! This is an automated confirmation that I have received your message regarding "{{subject}}".
   
   I'll review your inquiry and get back to you at {{from_email}} as soon as possible.
   
   Best regards,
   Venz Aba
   ```
5. Click **Save**.

---
> [!TIP]
> **Testing:** After completing these steps, go to your website and send a test message. Check your Gmail for the notification and check your "Sent" folder/spam for the auto-reply!
