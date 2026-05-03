import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SETTINGS_PATH = join(__dirname, 'settings.json');

function readSettings() {
  try { return JSON.parse(readFileSync(SETTINGS_PATH, 'utf8')); }
  catch { return { chatbot_visible: true }; }
}
function writeSettings(data) {
  writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
}

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[admin-api] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Some features will be unavailable.');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, supabase: !!supabase });
});

// --- Site Settings ---
app.get('/api/settings', (_req, res) => {
  res.json(readSettings());
});

app.patch('/api/settings', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured.' });
  const authHeader = req.headers['authorization'];
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: user, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user?.user) return res.status(401).json({ error: 'Invalid token' });
  const current = readSettings();
  const updated = { ...current, ...req.body };
  writeSettings(updated);
  res.json(updated);
});

app.post('/api/contact', async (req, res) => {
  const { firstname, lastname, email, subject, message } = req.body;

  if (!firstname || !email || !message) {
    return res.status(400).json({ error: 'firstname, email, and message are required.' });
  }

  let inquiryId = null;
  let savedToDb = false;
  let ownerEmailSent = false;
  let autoReplySent = false;

  if (supabase) {
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
        console.error('[contact] DB insert error:', error.message);
      } else {
        inquiryId = data?.id ?? null;
        savedToDb = true;
      }
    } catch (err) {
      console.error('[contact] DB exception:', err);
    }
  }

  const transporter = getTransporter();
  if (transporter) {
    const ownerEmail = process.env.GMAIL_USER;
    const fullName = `${firstname} ${lastname}`.trim();

    // --- Notification email to owner ---
    try {
      await transporter.sendMail({
        from: `"Portfolio Contact" <${ownerEmail}>`,
        to: ownerEmail,
        replyTo: email,
        subject: `📬 New Inquiry from ${fullName}: ${subject || '(no subject)'}`,
        text: `New inquiry received\n\nName: ${fullName}\nEmail: ${email}\nSubject: ${subject || '(no subject)'}\n\nMessage:\n${message}\n\n---\nReply directly to this email to respond to ${firstname}.`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;color:#e8ebff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a,#4f46e5,#7c3aed);padding:28px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;">📬 New Inquiry</p>
            <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">Someone reached out via your portfolio</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.07);">
                  <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">From</p>
                  <p style="margin:0;font-size:16px;font-weight:600;color:#fff;">${fullName}</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#60a5fa;">${email}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
                  <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Subject</p>
                  <p style="margin:0;font-size:15px;font-weight:500;color:#e2e8f0;">${subject || '(no subject)'}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:20px;">
                  <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Message</p>
                  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;">
                    <p style="margin:0;font-size:15px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${message}</p>
                  </div>
                </td>
              </tr>
            </table>
            <div style="margin-top:28px;text-align:center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your inquiry')}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">↩ Reply to ${firstname}</a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.07);">
            <p style="margin:0;font-size:12px;color:#475569;text-align:center;">Sent from your portfolio contact form · <a href="mailto:${email}" style="color:#60a5fa;text-decoration:none;">${email}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });
      ownerEmailSent = true;
    } catch (err) {
      console.error('[contact] Owner email error:', err);
    }

    // --- Auto-reply to sender ---
    try {
      await transporter.sendMail({
        from: `"Venz Aba" <${ownerEmail}>`,
        to: email,
        subject: `Thanks for reaching out, ${firstname}! I'll be in touch soon.`,
        text: `Hi ${firstname},\n\nThank you for getting in touch! I've received your message and I'm excited to hear more about what you have in mind.\n\nI typically reply within 24 hours. In the meantime, feel free to check out my work at my portfolio or connect with me on LinkedIn.\n\nHere's a quick summary of what you sent:\n- Subject: ${subject || '(no subject)'}\n- Message: ${message}\n\nTalk soon!\n\nBest regards,\nVenz Aba\nFreelance Web, Software & AI Developer\n📧 venzaba25@gmail.com\n💼 linkedin.com/in/venz-aba`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a,#4f46e5,#7c3aed);padding:36px 32px;text-align:center;">
            <p style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Venz<span style="color:#67e8f9;">.</span></p>
            <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">Web · Software · AI Developer</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">Hey ${firstname}! 👋</p>
            <p style="margin:0 0 16px;font-size:16px;color:#475569;line-height:1.7;">
              Thanks for reaching out — I've received your message and I'm looking forward to reading it in detail.
            </p>
            <p style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.7;">
              I typically reply within <strong style="color:#1e293b;">24 hours</strong>. If it's urgent, feel free to message me directly on 
              <a href="https://wa.me/639512467291" style="color:#4f46e5;text-decoration:none;font-weight:600;">WhatsApp</a> or 
              <a href="https://facebook.com/venzaba25" style="color:#4f46e5;text-decoration:none;font-weight:600;">Messenger</a>.
            </p>

            <!-- Summary box -->
            <div style="background:#f1f5f9;border-left:4px solid #6366f1;border-radius:8px;padding:18px 20px;margin-bottom:28px;">
              <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6366f1;">Your message summary</p>
              <p style="margin:0 0 6px;font-size:14px;color:#334155;"><strong>Subject:</strong> ${subject || '(no subject)'}</p>
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;"><strong>Message:</strong> ${message}</p>
            </div>

            <p style="margin:0 0 6px;font-size:16px;color:#475569;line-height:1.7;">Talk soon!</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">— Venz Aba</p>
          </td>
        </tr>
        <!-- Divider -->
        <tr><td style="padding:0 32px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>
        <!-- Contact links -->
        <tr>
          <td style="padding:20px 32px;text-align:center;">
            <p style="margin:0 0 12px;font-size:13px;color:#94a3b8;">Connect with me</p>
            <a href="mailto:venzaba25@gmail.com" style="display:inline-block;margin:0 6px;color:#4f46e5;font-size:13px;text-decoration:none;font-weight:500;">📧 Email</a>
            <a href="https://wa.me/639512467291" style="display:inline-block;margin:0 6px;color:#4f46e5;font-size:13px;text-decoration:none;font-weight:500;">💬 WhatsApp</a>
            <a href="https://linkedin.com/in/venz-aba" style="display:inline-block;margin:0 6px;color:#4f46e5;font-size:13px;text-decoration:none;font-weight:500;">💼 LinkedIn</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">You're receiving this because you submitted a contact form at Venz Aba's portfolio.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });
      autoReplySent = true;
    } catch (err) {
      console.error('[contact] Auto-reply error:', err);
    }
  }

  res.json({ inquiryId, savedToDb, ownerEmailSent, autoReplySent });
});

app.get('/api/inquiries', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured.' });

  const authHeader = req.headers['authorization'];
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: user, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user?.user) return res.status(401).json({ error: 'Invalid token' });

  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ inquiries: data });
});

app.get('/api/inquiries/unread-count', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured.' });

  const authHeader = req.headers['authorization'];
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: user, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user?.user) return res.status(401).json({ error: 'Invalid token' });

  const { count, error } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: count ?? 0 });
});

app.patch('/api/inquiries/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured.' });

  const authHeader = req.headers['authorization'];
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: user, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user?.user) return res.status(401).json({ error: 'Invalid token' });

  const { id } = req.params;
  const { isRead } = req.body;

  const { error } = await supabase
    .from('inquiries')
    .update({ is_read: isRead })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/inquiries/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured.' });

  const authHeader = req.headers['authorization'];
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: user, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user?.user) return res.status(401).json({ error: 'Invalid token' });

  const { id } = req.params;
  const { error } = await supabase.from('inquiries').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[admin-api] Listening on port ${PORT}`);
});
