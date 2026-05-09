export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers['authorization'];

  if (req.method === 'GET') {
    return res.json({ chatbot_visible: true });
  }

  if (req.method === 'PATCH') {
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({ chatbot_visible: true, ...req.body });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
