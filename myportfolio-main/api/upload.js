import { put } from '@vercel/blob';

/**
 * Vercel Serverless Function for Image Uploads
 * Uses @vercel/blob for cloud storage.
 * 
 * Expectations:
 * - Method: POST
 * - Body: Raw file binary
 * - Header: x-filename (e.g. "my-project.jpg")
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const filename = req.headers['x-filename'] || `upload-${Date.now()}.jpg`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not configured on Vercel' });
  }

  try {
    // Vercel handles the body stream for us. We pass it directly to Vercel Blob.
    const blob = await put(filename, req, {
      access: 'public',
      token: token,
      contentType: req.headers['content-type'] || 'image/jpeg'
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
      size: 0 // Size is not easily accessible from stream in this context
    });
  } catch (error) {
    console.error('Vercel Blob Upload Error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing to handle binary stream
  },
};
