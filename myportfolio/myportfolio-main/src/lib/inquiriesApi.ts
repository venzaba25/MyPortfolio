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

export async function fetchInquiries(): Promise<Inquiry[]> {
  const res = await fetch("/api/inquiries", { headers: await authHeaders() });
  const body = await handle<{ inquiries: InquiryRow[] }>(res);
  return body.inquiries.map(fromRow);
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch("/api/inquiries/unread-count", { headers: await authHeaders() });
  const body = await handle<{ count: number }>(res);
  return body.count;
}

export async function markInquiryRead(id: string, isRead: boolean): Promise<void> {
  const res = await fetch(`/api/inquiries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ isRead }),
  });
  await handle(res);
}

export async function deleteInquiry(id: string): Promise<void> {
  const res = await fetch(`/api/inquiries/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  await handle(res);
}
