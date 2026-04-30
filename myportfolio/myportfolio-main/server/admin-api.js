import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5174; // Bridge server port

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// --- Supabase service-role client (server-side only — bypasses RLS) ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[admin-api] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — inquiry persistence disabled.');
}

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// Ensures the inquiries table exists by attempting a no-op select.
// We do NOT try to create policies here — service role bypasses RLS,
// so the table just needs to exist (which it does, per the schema file).
async function ensureInquiriesReady() {
  if (!supabaseAdmin) return false;
  const { error } = await supabaseAdmin.from('inquiries').select('id').limit(1);
  if (error) {
    console.error('[admin-api] inquiries table not reachable:', error.message);
    return false;
  }
  return true;
}
ensureInquiriesReady();

// Verify a Supabase JWT from a Bearer header. Returns user or null.
async function verifyAdminAuth(req) {
  if (!supabaseAdmin || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  // Use a per-request client carrying the user's JWT to validate it.
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

const PROJECTS_FILE = path.join(__dirname, '../src/data/projects.json');
const BACKUP_DIR = path.join(__dirname, '../src/data/backups');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// --- Multer config for image uploads ---

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // multer parses non-file fields first, so req.body should be available
    const folder = (req.body && req.body.folder) ? req.body.folder.replace(/[^a-zA-Z0-9\-_/]/g, '') : 'uploads';
    if (!req.body || !req.body.folder) {
      console.log('Multer: folder field missing in req.body, defaulting to "uploads"');
    }
    const uploadPath = path.join(PUBLIC_DIR, folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`Created folder: ${uploadPath}`);
    } else {
      console.log(`Using existing folder: ${uploadPath}`);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg|jfif)$/i;
    const ext = path.extname(file.originalname);
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp, svg)'));
    }
  }
});

// Nodemailer Transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// --- Middleware ---

function validateProject(project) {
  const errors = [];
  if (!project.title || typeof project.title !== 'string') errors.push('title is required');
  if (!project.description || typeof project.description !== 'string') errors.push('description is required');
  if (!Array.isArray(project.technologies)) errors.push('technologies must be an array');
  if (!Array.isArray(project.features)) errors.push('features must be an array');
  if (typeof project.id !== 'number') errors.push('id must be a number');
  return errors;
}

function createBackup(data) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `projects-${timestamp}.json`);
    fs.writeFileSync(backupFile, data, 'utf8');
    console.log(`Backup created: ${backupFile}`);

    // Keep only last 10 backups
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('projects-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (backups.length > 10) {
      backups.slice(10).forEach(f => {
        fs.unlinkSync(path.join(BACKUP_DIR, f));
      });
    }
  } catch (err) {
    console.error('Backup failed:', err);
  }
}

// --- Contact Form Endpoint (SMTP) ---

app.post('/api/contact', async (req, res) => {
  const { firstname, lastname, email, subject, message } = req.body;

  if (!firstname || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // 1. Persist the inquiry to Supabase using the service role key (bypasses RLS).
  //    This is the source of truth for the admin inbox; emails are best-effort.
  let inquiryId = null;
  let savedToDb = false;
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .insert({
        first_name: firstname,
        last_name: lastname || '',
        email,
        subject: subject || '',
        message,
      })
      .select()
      .single();
    if (error) {
      console.error('[admin-api] Supabase inquiry insert failed:', error);
      return res.status(500).json({
        error: 'Could not save your message right now. Please try again or email me directly.',
        details: error.message,
      });
    }
    inquiryId = data?.id ?? null;
    savedToDb = true;
  }

  const fullName = `${firstname} ${lastname || ''}`.trim();
  const ownerSubject = `[Portfolio Inquiry] ${subject || 'No Subject'}`;
  const ownerBody = `You have a new inquiry from venzaba.com:\n\nName: ${fullName}\nEmail: ${email}\nSubject: ${subject || 'No Subject'}\n\nMessage:\n${message}`;
  const replyBody = `Hi ${firstname},\n\nThank you for reaching out! This is an automated confirmation that I have received your message regarding "${subject || 'your inquiry'}".\n\nI'll review your inquiry and get back to you at this email address within 24-48 hours.\n\nBest regards,\nVenz Aba\nDigital Solutions Specialist`;
  const gmailReady = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && !/^x+/i.test(process.env.GMAIL_APP_PASSWORD || ''));

  // 2. Best-effort owner notification: try Gmail SMTP first, then Web3Forms.
  let ownerEmailSent = false;
  if (gmailReady) {
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: ownerSubject,
        text: ownerBody,
        replyTo: email,
      });
      ownerEmailSent = true;
    } catch (err) {
      console.error('[admin-api] Gmail owner notification failed:', err.message);
    }
  }
  // (Web3Forms can't be called server-side — Cloudflare blocks non-browser
  // requests. The frontend handles Web3Forms as its own fallback after the
  // server response.)

  // 3. Best-effort auto-reply: try Gmail SMTP first, then EmailJS HTTP API.
  let autoReplySent = false;
  if (gmailReady) {
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: `Thank you for contacting Venz Aba`,
        text: replyBody,
      });
      autoReplySent = true;
    } catch (err) {
      console.error('[admin-api] Gmail auto-reply failed:', err.message);
    }
  }
  if (!autoReplySent) {
    try {
      const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'origin': 'http://localhost' },
        body: JSON.stringify({
          service_id: 'service_r3ea868',
          template_id: 'template_iocxuri',
          user_id: '7aBDLiLT77bSivMrz',
          template_params: {
            from_name: 'Venz Aba',
            name: firstname,
            email,
            title: subject || '',
            message,
            reply_to: 'venzaba25@gmail.com',
          },
        }),
      });
      if (r.ok) autoReplySent = true;
      else console.error('[admin-api] EmailJS fallback failed:', r.status, await r.text());
    } catch (err) {
      console.error('[admin-api] EmailJS fallback error:', err.message);
    }
  }

  // The form is "successful" as long as we either saved the lead or
  // notified the owner — never silently drop a real inquiry.
  if (!savedToDb && !ownerEmailSent) {
    return res.status(500).json({
      error: 'Could not save or deliver your message. Please try again or email me directly.',
    });
  }

  res.json({
    success: true,
    inquiryId,
    savedToDb,
    ownerEmailSent,
    autoReplySent,
  });
});

// --- Inquiries Admin API (service-role; auth-gated) ---

async function requireAdmin(req, res) {
  const user = await verifyAdminAuth(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

app.get('/api/inquiries', async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  if (!(await requireAdmin(req, res))) return;
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ inquiries: data });
});

app.get('/api/inquiries/unread-count', async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  if (!(await requireAdmin(req, res))) return;
  const { count, error } = await supabaseAdmin
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: count ?? 0 });
});

app.patch('/api/inquiries/:id', async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  if (!(await requireAdmin(req, res))) return;
  const { id } = req.params;
  const { isRead } = req.body || {};
  if (typeof isRead !== 'boolean') {
    return res.status(400).json({ error: 'isRead (boolean) is required' });
  }
  const { error } = await supabaseAdmin
    .from('inquiries')
    .update({ is_read: isRead })
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.delete('/api/inquiries/:id', async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  if (!(await requireAdmin(req, res))) return;
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from('inquiries')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Projects API ---

// Get all projects
app.get('/api/projects', (req, res) => {
  fs.readFile(PROJECTS_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Read error:', err);
      return res.status(500).json({ error: 'Failed to read projects file' });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      console.error('Parse error:', parseErr);
      res.status(500).json({ error: 'Invalid JSON in projects file' });
    }
  });
});

// Get single project by ID
app.get('/api/projects/:id', (req, res) => {
  fs.readFile(PROJECTS_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read projects file' });
    }
    try {
      const parsed = JSON.parse(data);
      const project = parsed.projects.find(p => p.id === parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON in projects file' });
    }
  });
});

// Update projects (bulk save with backup & validation)
app.post('/api/projects', (req, res) => {
  const newData = req.body;

  // Validate structure
  if (!newData.projects || !Array.isArray(newData.projects)) {
    return res.status(400).json({ error: 'Request body must contain a "projects" array' });
  }

  // Validate each project
  const allErrors = [];
  newData.projects.forEach((project, index) => {
    const errors = validateProject(project);
    if (errors.length > 0) {
      allErrors.push({ index, title: project.title || 'Unknown', errors });
    }
  });

  if (allErrors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: allErrors });
  }

  // Check for duplicate IDs
  const ids = newData.projects.map(p => p.id);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicateIds.length > 0) {
    return res.status(400).json({ error: `Duplicate project IDs found: ${duplicateIds.join(', ')}` });
  }

  // Create backup before writing
  fs.readFile(PROJECTS_FILE, 'utf8', (readErr, existingData) => {
    if (!readErr) {
      createBackup(existingData);
    }

    // Write new data
    const jsonContent = JSON.stringify(newData, null, 2);
    fs.writeFile(PROJECTS_FILE, jsonContent, 'utf8', (err) => {
      if (err) {
        console.error('Write error:', err);
        return res.status(500).json({ error: 'Failed to save projects file' });
      }
      res.json({ message: 'Projects updated successfully', count: newData.projects.length });
    });
  });
});

// List backups
app.get('/api/backups', (req, res) => {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .map(f => ({
        filename: f,
        path: path.join(BACKUP_DIR, f),
        created: fs.statSync(path.join(BACKUP_DIR, f)).birthtime
      }));
    res.json({ backups });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Restore from backup
app.post('/api/restore/:filename', (req, res) => {
  const backupFile = path.join(BACKUP_DIR, req.params.filename);

  // Security: ensure the file is within the backup directory
  if (!backupFile.startsWith(BACKUP_DIR)) {
    return res.status(400).json({ error: 'Invalid backup file path' });
  }

  fs.readFile(backupFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    try {
      JSON.parse(data); // Validate JSON before restoring
    } catch (e) {
      return res.status(400).json({ error: 'Backup file contains invalid JSON' });
    }

    // Create backup of current state before restoring
    fs.readFile(PROJECTS_FILE, 'utf8', (readErr, currentData) => {
      if (!readErr) {
        createBackup(currentData);
      }

      fs.writeFile(PROJECTS_FILE, data, 'utf8', (writeErr) => {
        if (writeErr) {
          return res.status(500).json({ error: 'Failed to restore backup' });
        }
        res.json({ message: `Restored from ${req.params.filename}` });
      });
    });
  });
});

// --- Image Upload API ---

// Upload single image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  const folder = (req.body && req.body.folder) ? req.body.folder.replace(/[^a-zA-Z0-9\-_/]/g, '') : 'uploads';
  const url = `/${folder}/${req.file.filename}`;
  console.log(`Uploaded: ${req.file.filename} to /${folder}/`);
  res.json({
    success: true,
    filename: req.file.filename,
    url,
    folder,
    path: req.file.path,
    size: req.file.size
  });
});

// Upload multiple images (up to 10)
app.post('/api/upload-multiple', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No image files provided' });
  }
  const folder = (req.body && req.body.folder) ? req.body.folder.replace(/[^a-zA-Z0-9\-_/]/g, '') : 'uploads';
  const files = req.files.map(f => ({
    filename: f.filename,
    url: `/${folder}/${f.filename}`,
    path: f.path,
    size: f.size
  }));
  console.log(`Uploaded ${files.length} files to /${folder}/`);
  res.json({ success: true, files, folder });
});

// List folders in public directory
app.get('/api/folders', (req, res) => {
  try {
    const folders = fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list folders' });
  }
});

// List images in a specific folder
app.get('/api/images/:folder', (req, res) => {
  const folderPath = path.join(PUBLIC_DIR, req.params.folder);
  if (!folderPath.startsWith(PUBLIC_DIR)) {
    return res.status(400).json({ error: 'Invalid folder path' });
  }
  try {
    if (!fs.existsSync(folderPath)) {
      return res.json({ images: [] });
    }
    const images = fs.readdirSync(folderPath)
      .filter(f => /\.(jpg|jpeg|png|gif|webp|svg|jfif)$/i.test(f))
      .map(f => ({
        filename: f,
        url: `/${req.params.folder}/${f}`,
        size: fs.statSync(path.join(folderPath, f)).size
      }));
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list images' });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio Admin API Bridge running at http://localhost:${PORT}`);
  console.log(`Backup directory: ${BACKUP_DIR}`);
});
