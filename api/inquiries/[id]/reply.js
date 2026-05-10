import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

function validateJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (!payload.sub || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!supabase) return res.status(503).json({ error: 'Database not configured.' });

  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const payload = validateJWT(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

  const { id } = req.query;
  const { subject, body, toEmail, toName } = req.body || {};

  if (!subject || !body || !toEmail) {
    return res.status(400).json({ error: 'subject, body, and toEmail are required.' });
  }

  const transporter = getTransporter();
  if (!transporter) {
    return res.status(503).json({ error: 'Email (SMTP) is not configured.' });
  }

  const ownerEmail = process.env.GMAIL_USER;
  const firstName = (toName || toEmail).split(' ')[0];
  const htmlBody = body
    .split('\n')
    .map(line => `<p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.7;">${line || '&nbsp;'}</p>`)
    .join('');

  try {
    await transporter.sendMail({
      from: `"Venz Aba" <${ownerEmail}>`,
      to: toEmail,
      replyTo: ownerEmail,
      subject,
      text: body,
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1e3a8a,#4f46e5,#7c3aed);padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:26px;font-weight:800;color:#fff;">Venz<span style="color:#67e8f9;">.</span></p>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">Web · Software · AI Developer</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0f172a;">Hi ${firstName},</p>
          ${htmlBody}
        </td></tr>
        <tr><td style="padding:20px 32px;text-align:center;">
          <a href="mailto:${ownerEmail}" style="display:inline-block;margin:0 8px;color:#4f46e5;font-size:13px;text-decoration:none;font-weight:500;">📧 ${ownerEmail}</a>
          <a href="https://linkedin.com/in/venz-aba" style="display:inline-block;margin:0 8px;color:#4f46e5;font-size:13px;text-decoration:none;font-weight:500;">💼 LinkedIn</a>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">Reply from Venz Aba's portfolio admin.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    });

    await supabase.from('inquiries').update({ is_read: true }).eq('id', id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[reply] Send error:', err);
    res.status(500).json({ error: 'Failed to send reply email.' });
  }
}
