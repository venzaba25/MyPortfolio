import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstname, lastname, email, subject, message } = req.body || {};

  if (!firstname || !email || !message) {
    return res.status(400).json({ error: 'firstname, email, and message are required.' });
  }

  let inquiryId = null;
  let savedToDb = false;
  let dbError = null;
  let ownerEmailSent = false;
  let autoReplySent = false;

  if (!supabase) {
    const hasUrl = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    dbError = `Supabase not configured. SUPABASE_URL=${hasUrl}, SERVICE_ROLE_KEY=${hasKey}`;
    console.error('[contact]', dbError);
  } else {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          first_name: firstname,
          last_name: lastname || '',
          email,
          subject: subject || '(no subject)',
          message,
          is_read: false,
        })
        .select('id')
        .single();

      if (error) {
        dbError = error.message;
        console.error('[contact] DB insert error:', error.message);
      } else {
        inquiryId = data?.id ?? null;
        savedToDb = true;
      }
    } catch (err) {
      dbError = String(err);
      console.error('[contact] DB exception:', err);
    }
  }

  const transporter = getTransporter();
  if (transporter) {
    const ownerEmail = process.env.GMAIL_USER;
    const fullName = `${firstname} ${lastname || ''}`.trim();

    try {
      await transporter.sendMail({
        from: `"Portfolio Contact" <${ownerEmail}>`,
        to: ownerEmail,
        replyTo: email,
        subject: `📬 New Inquiry from ${fullName}: ${subject || '(no subject)'}`,
        text: `New inquiry received\n\nName: ${fullName}\nEmail: ${email}\nSubject: ${subject || '(no subject)'}\n\nMessage:\n${message}\n\n---\nReply directly to this email to respond to ${firstname}.`,
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;color:#e8ebff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1e3a8a,#4f46e5,#7c3aed);padding:28px 32px;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#fff;">📬 New Inquiry</p>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">Someone reached out via your portfolio</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#94a3b8;">From</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#fff;">${fullName}</p>
          <p style="margin:4px 0 16px;font-size:14px;color:#60a5fa;">${email}</p>
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#94a3b8;">Subject</p>
          <p style="margin:0 0 16px;font-size:15px;color:#e2e8f0;">${subject || '(no subject)'}</p>
          <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;color:#94a3b8;">Message</p>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;">
            <p style="margin:0;font-size:15px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </div>
          <div style="margin-top:28px;text-align:center;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your inquiry')}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">↩ Reply to ${firstname}</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
      });
      ownerEmailSent = true;
    } catch (err) {
      console.error('[contact] Owner email error:', err);
    }

    try {
      await transporter.sendMail({
        from: `"Venz Aba" <${ownerEmail}>`,
        to: email,
        subject: `Thanks for reaching out, ${firstname}! I'll be in touch soon.`,
        text: `Hi ${firstname},\n\nThank you for getting in touch! I've received your message and I'm excited to hear more.\n\nI typically reply within 24 hours.\n\nSubject: ${subject || '(no subject)'}\nMessage: ${message}\n\nBest regards,\nVenz Aba`,
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1e3a8a,#4f46e5,#7c3aed);padding:36px 32px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:800;color:#fff;">Venz<span style="color:#67e8f9;">.</span></p>
          <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">Web · Software · AI Developer</p>
        </td></tr>
        <tr><td style="padding:36px 32px;">
          <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">Hey ${firstname}! 👋</p>
          <p style="margin:0 0 16px;font-size:16px;color:#475569;line-height:1.7;">Thanks for reaching out — I've received your message and I'm looking forward to reading it in detail.</p>
          <p style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.7;">I typically reply within <strong style="color:#1e293b;">24 hours</strong>. If it's urgent, feel free to message me on <a href="https://wa.me/639512467291" style="color:#4f46e5;font-weight:600;text-decoration:none;">WhatsApp</a>.</p>
          <div style="background:#f1f5f9;border-left:4px solid #6366f1;border-radius:8px;padding:18px 20px;margin-bottom:28px;">
            <p style="margin:0 0 6px;font-size:14px;color:#334155;"><strong>Subject:</strong> ${subject || '(no subject)'}</p>
            <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;"><strong>Message:</strong> ${message}</p>
          </div>
          <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">— Venz Aba</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
      });
      autoReplySent = true;
    } catch (err) {
      console.error('[contact] Auto-reply error:', err);
    }
  }

  res.json({ inquiryId, savedToDb, dbError, ownerEmailSent, autoReplySent });
}
