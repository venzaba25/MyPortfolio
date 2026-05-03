import { supabase } from "./supabase";

export interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface InquiryRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const fromRow = (r: InquiryRow): Inquiry => ({
  id: r.id,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  subject: r.subject,
  message: r.message,
  isRead: !!r.is_read,
  createdAt: r.created_at,
});

export interface NewInquiry {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.error || body.details || res.statusText;
    } catch {
      detail = res.statusText;
    }
    throw new Error(`${res.status} ${detail}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Submits a new inquiry through the bridge server. The server uses the
 * Supabase service role key to insert the row (bypassing RLS) and also
 * fires off owner notification + auto-reply emails via SMTP.
 */
export async function createInquiry(input: NewInquiry): Promise<{ inquiryId: string | null; savedToDb: boolean; ownerEmailSent: boolean; autoReplySent: boolean }> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstname: input.firstName,
      lastname: input.lastName,
      email: input.email,
      subject: input.subject,
      message: input.message,
    }),
  });
  return handle(res);
}

/**
 * Fetch inquiries — tries direct Supabase client first (fastest path),
 * falls back to the Express bridge server if that fails (e.g. RLS mismatch).
 */
export async function fetchInquiries(): Promise<Inquiry[]> {
  // Primary: direct Supabase query using the authenticated session
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return (data as InquiryRow[]).map(fromRow);
    }
    // If there's a specific error about missing table or permissions, throw it
    if (error) throw new Error(error.message);
  } catch (primaryErr) {
    // Fall back to Express bridge
    try {
      const res = await fetch("/api/inquiries", { headers: await authHeaders() });
      const body = await handle<{ inquiries: InquiryRow[] }>(res);
      return body.inquiries.map(fromRow);
    } catch {
      // Re-throw the original error so callers get a meaningful message
      throw primaryErr;
    }
  }
  return [];
}

/**
 * Fetch unread count — tries Supabase client first, falls back to Express.
 */
export async function fetchUnreadCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    if (!error) return count ?? 0;
    throw new Error(error.message);
  } catch {
    // Fallback to Express
    try {
      const res = await fetch("/api/inquiries/unread-count", { headers: await authHeaders() });
      const body = await handle<{ count: number }>(res);
      return body.count;
    } catch {
      return 0;
    }
  }
}

/**
 * Mark inquiry read/unread — tries Supabase client first, falls back to Express.
 */
export async function markInquiryRead(id: string, isRead: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from("inquiries")
      .update({ is_read: isRead })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } catch {
    // Fallback to Express
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ isRead }),
    });
    await handle(res);
  }
}

/**
 * Delete an inquiry — tries Supabase client first, falls back to Express.
 */
export async function deleteInquiry(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("inquiries")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  } catch {
    // Fallback to Express
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    await handle(res);
  }
}

/**
 * Send a reply email to an inquiry via the Express bridge (requires SMTP).
 * Also marks the inquiry as read server-side.
 */
export async function sendReply(
  id: string,
  payload: { toEmail: string; toName: string; subject: string; body: string }
): Promise<void> {
  const res = await fetch(`/api/inquiries/${id}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(payload),
  });
  await handle(res);
}
