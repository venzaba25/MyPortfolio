"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Trash2, RefreshCw, ArrowLeft, Loader2, Inbox, Search,
  CheckCircle2, Circle, Reply, Calendar, ShieldCheck, LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import {
  fetchInquiries,
  markInquiryRead,
  deleteInquiry,
  type Inquiry,
} from "@/lib/inquiriesApi";

export default function AdminInquiries() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" | "" });

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const rows = await fetchInquiries();
      setInquiries(rows);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setAuthChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const toggleRead = async (inquiry: Inquiry) => {
    const newVal = !inquiry.isRead;
    setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, isRead: newVal } : i));
    try {
      await markInquiryRead(inquiry.id, newVal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showMessage(`Failed to update: ${msg}`, "error");
      setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, isRead: !newVal } : i));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    try {
      await deleteInquiry(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (selectedId === id) setSelectedId(null);
      showMessage("Inquiry deleted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showMessage(`Delete failed: ${msg}`, "error");
    }
  };

  const filtered = inquiries
    .filter(i => {
      if (filter === "unread") return !i.isRead;
      if (filter === "read") return i.isRead;
      return true;
    })
    .filter(i => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        i.firstName.toLowerCase().includes(q) ||
        i.lastName.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
      );
    });

  const selected = filtered.find(i => i.id === selectedId) ?? null;
  const unreadCount = inquiries.filter(i => !i.isRead).length;

  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030014] text-neutral-300">
        <Loader2 className="h-6 w-6 animate-spin mr-3" />
        <span className="text-sm">Checking session…</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030014] text-neutral-300 p-6">
        <div className="text-center max-w-md">
          <ShieldCheck className="h-10 w-10 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin sign-in required</h2>
          <p className="text-sm text-neutral-500 mb-6">You need to be logged in to view inquiries.</p>
          <Link to="/admin" className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold transition-all">
            <ArrowLeft size={16} /> Go to admin login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-[#e8ebff] font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-blue-400 mb-3 transition-colors">
              <ArrowLeft size={12} /> Back to projects dashboard
            </Link>
            <h1 className="text-4xl font-extrabold flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              <Inbox className="text-blue-400 h-8 w-8" />
              Inquiries
              {unreadCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-sm font-bold rounded-full bg-blue-500 text-white">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-neutral-400 mt-2">All contact-form messages, oldest hidden by default.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 transition-all border border-neutral-700"
              title="Reload inquiries"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="hidden md:inline">{session.user?.email ?? "Admin"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 transition-all border border-neutral-700"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </header>

        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-2xl text-center font-medium border ${
                message.type === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-green-500/10 border-green-500/30 text-green-400"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {loadError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            <p className="font-semibold mb-1">Could not load inquiries from Supabase.</p>
            <p className="text-xs text-red-300/80 break-all">{loadError}</p>
            <p className="text-xs text-red-300/80 mt-2">
              Make sure you've run the latest <code className="font-mono bg-red-500/20 px-1 rounded">supabase/schema.sql</code>{" "}
              in your Supabase SQL editor — it adds the <code className="font-mono bg-red-500/20 px-1 rounded">inquiries</code> table.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message…"
              className="w-full pl-12 pr-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 outline-none focus:border-blue-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border capitalize ${
                  filter === f
                    ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                    : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <p className="text-neutral-500 text-sm mb-6">
          Showing {filtered.length} of {inquiries.length} inquiries
        </p>

        {loading && inquiries.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-neutral-900/30 border border-neutral-800 rounded-3xl">
            <Inbox className="h-12 w-12 text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-500">No inquiries to show.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {filtered.map(inq => (
                <motion.button
                  key={inq.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedId(inq.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedId === inq.id
                      ? "bg-blue-600/15 border-blue-500/50"
                      : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700"
                  } ${inq.isRead ? "" : "ring-1 ring-blue-500/20"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-white truncate">
                      {inq.firstName} {inq.lastName}
                    </span>
                    {!inq.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{inq.email}</p>
                  <p className="text-sm text-neutral-300 mt-2 truncate">{inq.subject}</p>
                  <p className="text-xs text-neutral-600 mt-2 flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(inq.createdAt).toLocaleString()}
                  </p>
                </motion.button>
              ))}
            </div>

            <div className="lg:col-span-3">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selected.subject}</h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        From <span className="text-white font-medium">{selected.firstName} {selected.lastName}</span>{" "}
                        &middot;{" "}
                        <a
                          href={`mailto:${selected.email}`}
                          className="text-blue-400 hover:underline"
                        >
                          {selected.email}
                        </a>
                      </p>
                      <p className="text-xs text-neutral-600 mt-1 flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(selected.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleRead(selected)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 border border-neutral-700"
                      >
                        {selected.isRead ? (
                          <><Circle size={12} /> Mark unread</>
                        ) : (
                          <><CheckCircle2 size={12} className="text-green-400" /> Mark read</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(selected.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-xs text-red-400 border border-red-500/30"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800 p-5 whitespace-pre-wrap text-sm text-neutral-200 leading-relaxed">
                    {selected.message}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={`mailto:${selected.email}?subject=Re:%20${encodeURIComponent(selected.subject)}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
                    >
                      <Reply size={14} /> Reply by email
                    </a>
                    <a
                      href={`mailto:${selected.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm transition-all border border-neutral-700"
                    >
                      <Mail size={14} /> {selected.email}
                    </a>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-10 text-center text-neutral-500">
                  <Mail className="h-10 w-10 text-neutral-700 mx-auto mb-3" />
                  Select an inquiry to read it.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
