import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchUnreadCount } from "@/lib/inquiriesApi";
import type { Session } from "@supabase/supabase-js";

const POLL_INTERVAL_MS = 30_000;

export default function AdminInquiriesBadge() {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [unread, setUnread] = useState<number>(0);
  const [pulse, setPulse] = useState(false);
  const previousUnreadRef = useRef<number>(0);

  // Track auth session
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Poll unread count when logged in
  useEffect(() => {
    if (!session) {
      setUnread(0);
      previousUnreadRef.current = 0;
      return;
    }

    let active = true;

    const fetchCount = async () => {
      try {
        const next = await fetchUnreadCount();
        if (!active) return;
        if (next > previousUnreadRef.current) {
          setPulse(true);
          setTimeout(() => setPulse(false), 1800);
        }
        previousUnreadRef.current = next;
        setUnread(next);
      } catch {
        // Bridge server may be offline; swallow silently.
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [session]);

  // Hide on the inquiries page itself (already there) and during sign-in checks
  if (!session) return null;
  if (location.pathname.startsWith("/admin/inquiries")) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="admin-inquiries-badge"
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.9 }}
        className="fixed bottom-6 left-6 z-[60]"
      >
        <Link
          to="/admin/inquiries"
          className="group relative flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-zinc-900/90 backdrop-blur-md border border-blue-500/40 shadow-lg shadow-blue-900/20 text-sm text-white hover:bg-zinc-800 transition-all"
          title={
            unread > 0
              ? `${unread} unread inquir${unread === 1 ? "y" : "ies"} — open inbox`
              : "Open admin inbox"
          }
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
            <Inbox size={14} />
            {unread > 0 && (
              <>
                {pulse && (
                  <span className="absolute inset-0 rounded-full bg-blue-400/40 animate-ping" />
                )}
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-blue-500 text-white text-[11px] font-bold leading-none border-2 border-zinc-900">
                  {unread > 99 ? "99+" : unread}
                </span>
              </>
            )}
          </span>
          <span className="hidden sm:inline font-medium">
            {unread > 0
              ? `${unread} new ${unread === 1 ? "message" : "messages"}`
              : "Inbox"}
          </span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
