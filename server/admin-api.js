import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 5174;

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
    try {
      await transporter.sendMail({
        from: ownerEmail,
        to: ownerEmail,
        subject: `New inquiry: ${subject || '(no subject)'}`,
        text: `From: ${firstname} ${lastname} <${email}>\n\n${message}`,
      });
      ownerEmailSent = true;
    } catch (err) {
      console.error('[contact] Owner email error:', err);
    }

    try {
      await transporter.sendMail({
        from: ownerEmail,
        to: email,
        subject: `Thanks for reaching out, ${firstname}!`,
        text: `Hi ${firstname},\n\nThank you for your message. I'll get back to you soon.\n\nBest,\nVenz Aba`,
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
