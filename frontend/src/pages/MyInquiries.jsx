import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Check, Download, Send, Loader2, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { api, formatApiError, API } from "../lib/api";

const CATEGORY_LABELS = {
  profile: "Company Profile", product: "Product Inquiry", new_product: "New Product Sourcing",
  order: "Order Inquiry", rfq: "Request for Quotation", outsourcing: "Outsourcing / Best Price", general: "General Inquiry",
};

const FLOW_LABELS = {
  received: "Received", processing: "Processing", sourcing: "Sourcing", shipped: "Shipped", delivered: "Delivered",
  in_review: "In Review", responded: "Responded", closed: "Closed",
};

function Timeline({ flow, status }) {
  const idx = Math.max(0, flow.indexOf(status));
  return (
    <div className="flex items-start" data-testid="status-timeline">
      {flow.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-2 min-w-[3.4rem]">
            <motion.div
              className="w-9 h-9 rounded-full flex items-center justify-center border-2"
              initial={false}
              animate={{
                borderColor: i <= idx ? "var(--gold)" : "var(--line)",
                background: i < idx ? "var(--brand-green)" : i === idx ? "var(--brand-red)" : "transparent",
                scale: i === idx ? [1, 1.15, 1] : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              {i < idx ? <Check size={15} className="text-white" /> : i === idx ? <PackageCheck size={15} className="text-white" /> : <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-muted)" }} />}
            </motion.div>
            <span className={`text-[9.5px] tracking-wide uppercase text-center ${i <= idx ? "font-bold" : ""}`} style={{ color: i <= idx ? "var(--soft-gold)" : "var(--text-muted)" }}>
              {FLOW_LABELS[s] || s}
            </span>
          </div>
          {i < flow.length - 1 && (
            <div className="flex-1 h-0.5 mt-[17px] mx-1 rounded" style={{ background: "var(--line)" }}>
              <motion.div className="h-full rounded" style={{ background: "var(--gold)" }}
                initial={false} animate={{ width: i < idx ? "100%" : "0%" }} transition={{ duration: 0.6 }} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function MyInquiries() {
  const [params] = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") || "");
  const [email, setEmail] = useState(params.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [inquiry, setInquiry] = useState(null);
  const [message, setMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const lookup = async (r = ref, e = email) => {
    if (!r.trim() || !e.trim()) return;
    setLoading(true);
    try {
      const res = await api.get("/inquiries/track", { params: { ref: r, email: e } });
      setInquiry(res.data.inquiry);
    } catch (err) {
      setInquiry(null);
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("ref") && params.get("email")) lookup(params.get("ref"), params.get("email"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSendingMsg(true);
    try {
      await api.post(`/inquiries/${inquiry.reference}/message`, { email, text: message });
      setMessage("");
      toast.success("Message sent to our team.");
      lookup();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div data-testid="my-inquiries-page">
      <Navbar />
      <main className="pt-32 pb-24 min-h-screen hero-mesh">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <span className="eyebrow">My Inquiries</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold mt-3">Track your <span className="gold-text">inquiry</span>.</h1>
          </motion.div>

          <div className="glass rounded-3xl p-7 md:p-9 mb-8 glow-border">
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div className="field">
                <input id="trk-ref" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} className={ref ? "has-value" : ""} data-testid="track-reference-input" />
                <label htmlFor="trk-ref">Reference number (e.g. HSI-ABC123)</label>
              </div>
              <div className="field">
                <input id="trk-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={email ? "has-value" : ""} data-testid="track-email-input" />
                <label htmlFor="trk-email">Email used in the inquiry</label>
              </div>
            </div>
            <button
              onClick={() => lookup()}
              disabled={loading}
              data-testid="track-lookup-button"
              className="w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold text-white disabled:opacity-60"
              style={{ background: "var(--brand-red)" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? "Looking up…" : "Track inquiry"}
            </button>
          </div>

          {inquiry && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" data-testid="track-result">
              <div className="glass rounded-3xl p-7 md:p-9">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
                  <div>
                    <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: "var(--teal)" }}>{CATEGORY_LABELS[inquiry.category]}</div>
                    <div className="font-display text-2xl font-extrabold" style={{ color: "var(--soft-gold)" }}>{inquiry.reference}</div>
                  </div>
                  <span className="text-xs px-4 py-1.5 rounded-full font-bold" style={{ background: "rgba(253,185,91,0.12)", color: "var(--soft-gold)" }} data-testid="track-status-badge">
                    {FLOW_LABELS[inquiry.status] || inquiry.status}
                  </span>
                </div>
                <Timeline flow={inquiry.status_flow} status={inquiry.status} />
                {inquiry.items?.length > 0 && (
                  <p className="text-xs mt-7" style={{ color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--teal)" }}>Items:</span> {inquiry.items.map((i) => i.name).join(", ")}
                  </p>
                )}
                {inquiry.category === "rfq" && (
                  <a
                    href={`${API}/inquiries/${inquiry.reference}/rfq.pdf?email=${encodeURIComponent(email)}`}
                    className="mt-6 inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full glass"
                    style={{ color: "var(--soft-gold)" }}
                    data-testid="track-rfq-pdf"
                  >
                    <Download size={14} /> Download RFQ summary (PDF)
                  </a>
                )}
              </div>

              <div className="glass rounded-3xl p-7 md:p-9">
                <h3 className="font-display text-xl font-bold mb-5">Messages</h3>
                <div className="space-y-3.5 mb-6 max-h-80 overflow-y-auto pr-1" data-testid="message-thread">
                  {inquiry.messages?.length === 0 && (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No messages yet — our team will reply here and by email.</p>
                  )}
                  {inquiry.messages?.map((m, i) => (
                    <div key={i} className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${m.from === "admin" ? "" : "ml-auto"}`}
                      style={m.from === "admin"
                        ? { background: "rgba(74,163,184,0.14)", border: "1px solid var(--line)" }
                        : { background: "rgba(253,185,91,0.12)", border: "1px solid rgba(253,185,91,0.25)" }}>
                      <div className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                        {m.from === "admin" ? "H&SI Team" : "You"} · {new Date(m.at).toLocaleString()}
                      </div>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="field flex-1">
                    <input id="trk-msg" value={message} onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className={message ? "has-value" : ""} data-testid="track-message-input" />
                    <label htmlFor="trk-msg">Follow-up message</label>
                  </div>
                  <button onClick={sendMessage} disabled={sendingMsg || !message.trim()}
                    className="self-center p-3.5 rounded-full text-white disabled:opacity-50"
                    style={{ background: "var(--brand-red)" }} data-testid="track-message-send" aria-label="Send message">
                    {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
