import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const PROJECTS_FILE = path.join(process.cwd(), 'src/data/projects.json');

  // Allow CORS for local development if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
      return res.status(200).json(JSON.parse(data));
    } catch (error) {
      console.error('Read error:', error);
      return res.status(500).json({ error: 'Failed to read projects file' });
    }
  }

  if (req.method === 'POST') {
    const { projects } = req.body;
    if (!projects || !Array.isArray(projects)) {
      return res.status(400).json({ error: 'Request body must contain a "projects" array' });
    }

    // GITHUB SYNC LOGIC (FOR VERCEL PERSISTENCE)
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'venzaba25';
    const REPO_NAME = 'myportfolio';
    const FILE_PATH = 'src/data/projects.json';

    if (!GITHUB_TOKEN) {
      // Fallback for local development
      if (process.env.NODE_ENV !== 'production') {
        try {
          fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
          return res.status(200).json({ success: true, message: 'Local save successful' });
        } catch (localErr) {
          return res.status(500).json({ error: 'Local write failed', details: localErr.message });
        }
      }
      return res.status(500).json({ error: 'GITHUB_TOKEN is not configured on Vercel' });
    }

    try {
      // 1. Get the current file SHA from GitHub
      const getFileRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json',
          },
        }
      );
      
      if (!getFileRes.ok) {
        throw new Error(`Failed to fetch file SHA: ${getFileRes.statusText}`);
      }
      
      const fileData = await getFileRes.json();
      const sha = fileData.sha;

      // 2. Commit the update to GitHub
      const content = Buffer.from(JSON.stringify({ projects }, null, 2)).toString('base64');
      const updateRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Admin Dashboard: Update projects.json',
            content,
            sha,
            branch: 'main'
          }),
        }
      );

      if (updateRes.ok) {
        return res.status(200).json({ 
          success: true, 
          message: 'Update committed to GitHub. Vercel will redeploy in 1-2 minutes.' 
        });
      } else {
        const errorData = await updateRes.json();
        return res.status(500).json({ error: 'GitHub Sync failed', details: errorData });
      }
    } catch (error) {
      console.error('Vercel API Error:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
