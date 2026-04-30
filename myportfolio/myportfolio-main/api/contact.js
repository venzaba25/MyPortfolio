import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Allow CORS for local development if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { firstname, lastname, email, subject, message } = req.body;

  if (!firstname || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // Initialize Supabase client with service role key
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[contact-api] Missing Supabase credentials');
    return res.status(500).json({
      error: 'Could not save your message right now. Please try again or email me directly.',
      details: 'Database service not configured'
    });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // Save inquiry to Supabase
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
      console.error('[contact-api] Supabase inquiry insert failed:', error);
      return res.status(500).json({
        error: 'Could not save your message right now. Please try again or email me directly.',
        details: error.message,
      });
    }

    const inquiryId = data?.id ?? null;
    const savedToDb = true;

    // Email functionality (optional - can be added later)
    let ownerEmailSent = false;
    let autoReplySent = false;

    // For now, just return success for database save
    res.json({
      success: true,
      inquiryId,
      savedToDb,
      ownerEmailSent,
      autoReplySent,
    });

  } catch (error) {
    console.error('[contact-api] Unexpected error:', error);
    res.status(500).json({
      error: 'Could not save your message right now. Please try again or email me directly.',
      details: error.message,
    });
  }
}
