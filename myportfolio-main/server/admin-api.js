import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import nodemailer from 'nodemailer';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5174; // Bridge server port

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

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

  try {
    // 1. Send Inquiry Email to Venz
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `[Portfolio Inquiry] ${subject || 'No Subject'}`,
      text: `You have a new inquiry from venzaba.com:\n\nName: ${firstname} ${lastname || ''}\nEmail: ${email}\nSubject: ${subject || 'No Subject'}\n\nMessage:\n${message}`,
      replyTo: email,
    });

    // 2. Send Professional Auto-Reply back to the sender
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Thank you for contacting Venz Aba`,
      text: `Hi ${firstname},\n\nThank you for reaching out! This is an automated confirmation that I have received your message regarding "${subject || 'your inquiry'}".\n\nI'll review your inquiry and get back to you at this email address within 24-48 hours.\n\nBest regards,\nVenz Aba\nDigital Solutions Specialist`,
    });

    res.json({ success: true, message: 'Inquiry received and auto-reply sent!' });
  } catch (error) {
    console.error('SMTP Error:', error);
    res.status(500).json({ error: 'Failed to deliver email. Please check server credentials.' });
  }
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
