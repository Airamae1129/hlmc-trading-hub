import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Search, Download, X, Send, Plus, Pencil, Trash2,
  Loader2, Inbox, Package, Sparkles, ArrowLeft, Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "../lib/api";
import { useAuth } from "../context/AppContext";

const CATEGORY_LABELS = {
  profile: "Company Profile", product: "Product Inquiry", new_product: "New Product Sourcing",
  order: "Order Inquiry", rfq: "Request for Quotation", outsourcing: "Outsourcing / Best Price", general: "General Inquiry",
};
const FLOW_LABELS = {
  received: "Received", processing: "Processing", sourcing: "Sourcing", shipped: "Shipped", delivered: "Delivered",
  in_review: "In Review", responded: "Responded", closed: "Closed",
};
const STATUS_COLORS = {
  received: "#4AA3B8", in_review: "#FDB95B", responded: "#2ECC71", closed: "#8DA2C0",
  processing: "#FDB95B", sourcing: "#FDB95B", shipped: "#4AA3B8", delivered: "#2ECC71",
};
const PRODUCT_CATEGORIES = ["Rice", "Cement", "Sugar", "Diesel", "Construction Materials", "Steel & Rebars",
  "Aggregates", "Medical Supplies", "Essential Supplies", "Heavy Equipment", "Services"];

const EMPTY_PRODUCT = { name: "", category: "Rice", description: "", moq: "", lead_time: "", sample_available: false, image: "", specsText: "" };

function InquiryDetail({ inquiry, onClose, onChanged }) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const backend = process.env.REACT_APP_BACKEND_URL;

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/admin/inquiries/${inquiry.id}/reply`, { text: reply });
      toast.success("Reply sent and emailed to the customer.");
      setReply("");
      onChanged();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status) => {
    try {
      await api.patch(`/admin/inquiries/${inquiry.id}/status`, { status });
      toast.success(`Status → ${FLOW_LABELS[status] || status}`);
      onChanged();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <motion.div className="fixed inset-0 z-[96] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="inquiry-detail-drawer">
      <div className="absolute inset-0" style={{ background: "rgba(4,22,58,0.7)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-xl h-full overflow-y-auto glass-strong p-7"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: "var(--teal)" }}>{CATEGORY_LABELS[inquiry.category]}</div>
            <div className="font-display text-2xl font-extrabold" style={{ color: "var(--soft-gold)" }}>{inquiry.reference}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{new Date(inquiry.created_at).toLocaleString()}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full glass" aria-label="Close" data-testid="inquiry-detail-close"><X size={16} /></button>
        </div>

        <div className="glass rounded-2xl p-5 mb-5 text-sm space-y-1.5">
          <p className="font-bold">{inquiry.contact.full_name}{inquiry.contact.company ? ` · ${inquiry.contact.company}` : ""}</p>
          <p style={{ color: "var(--text-muted)" }}>{inquiry.contact.email} · {inquiry.contact.mobile}</p>
          <p className="text-xs" style={{ color: "var(--teal)" }}>Prefers: {inquiry.contact.preferred_contact}</p>
        </div>

        {inquiry.items?.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-5">
            <div className="eyebrow mb-3">Items</div>
            <div className="flex flex-wrap gap-2">
              {inquiry.items.map((it, i) => (
                <span key={i} className="text-xs glass rounded-full px-3 py-1.5">
                  {it.name}{it.sample ? " (sample)" : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {Object.keys(inquiry.data || {}).length > 0 && (
          <div className="glass rounded-2xl p-5 mb-5">
            <div className="eyebrow mb-3">Details</div>
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(inquiry.data).map(([k, v]) =>
                  v ? (
                    <tr key={k} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td className="py-2 pr-3 capitalize" style={{ color: "var(--text-muted)" }}>{k.replace(/_/g, " ")}</td>
                      <td className="py-2 font-medium text-right">{String(v)}</td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        )}

        {inquiry.attachments?.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-5">
            <div className="eyebrow mb-3">Attachments</div>
            <div className="flex flex-col gap-2">
              {inquiry.attachments.map((a, i) => (
                <a key={i} href={`${backend}${a.url}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs link-draw w-fit" style={{ color: "var(--soft-gold)" }}>
                  <Paperclip size={12} /> {a.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-5 mb-5">
          <div className="eyebrow mb-3">Status</div>
          <div className="flex flex-wrap gap-2">
            {inquiry.status_flow.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                data-testid={`status-btn-${s}`}
                className="text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all"
                style={inquiry.status === s
                  ? { background: STATUS_COLORS[s] || "var(--gold)", color: "#04163A" }
                  : { background: "transparent", border: "1px solid var(--line)", color: "var(--text-muted)" }}
              >
                {FLOW_LABELS[s] || s}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="eyebrow mb-3">Reply to customer</div>
          <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
            {inquiry.messages?.length === 0 && <p className="text-xs" style={{ color: "var(--text-muted)" }}>No messages yet.</p>}
            {inquiry.messages?.map((m, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${m.from === "admin" ? "ml-8" : "mr-8"}`}
                style={m.from === "admin"
                  ? { background: "rgba(253,185,91,0.1)", border: "1px solid rgba(253,185,91,0.25)" }
                  : { background: "rgba(74,163,184,0.12)", border: "1px solid var(--line)" }}>
                <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
                  {m.from === "admin" ? "You" : inquiry.contact.full_name} · {new Date(m.at).toLocaleString()}
                </div>
                {m.text}
              </div>
            ))}
          </div>
          <div className="field mb-3">
            <textarea id="reply-text" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} className={reply ? "has-value" : ""} data-testid="admin-reply-input" />
            <label htmlFor="reply-text">Type your reply (emailed to customer)…</label>
          </div>
          <button onClick={sendReply} disabled={sending || !reply.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white disabled:opacity-50"
            style={{ background: "var(--brand-red)" }} data-testid="admin-reply-send">
            {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send reply
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProductForm({ initial, onSave, onClose, saving }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target ? e.target.value : e }));
  return (
    <motion.div className="fixed inset-0 z-[96] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="product-form-modal">
      <div className="absolute inset-0" style={{ background: "rgba(4,22,58,0.7)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div className="relative w-full max-w-lg glass-strong rounded-3xl p-7 max-h-[88vh] overflow-y-auto"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold">{f.id ? "Edit product" : "Add product"}</h3>
          <button onClick={onClose} className="p-2 rounded-full glass" aria-label="Close"><X size={15} /></button>
        </div>
        <div className="space-y-4">
          <div className="field"><input id="pf-name" value={f.name} onChange={set("name")} className={f.name ? "has-value" : ""} data-testid="product-form-name" /><label htmlFor="pf-name">Product name</label></div>
          <div className="field">
            <select id="pf-cat" value={f.category} onChange={set("category")} className="has-value" data-testid="product-form-category">
              {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label htmlFor="pf-cat">Category</label>
          </div>
          <div className="field"><textarea id="pf-desc" rows={3} value={f.description} onChange={set("description")} className={f.description ? "has-value" : ""} /><label htmlFor="pf-desc">Description</label></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="field"><input id="pf-moq" value={f.moq} onChange={set("moq")} className={f.moq ? "has-value" : ""} /><label htmlFor="pf-moq">MOQ</label></div>
            <div className="field"><input id="pf-lead" value={f.lead_time} onChange={set("lead_time")} className={f.lead_time ? "has-value" : ""} /><label htmlFor="pf-lead">Lead time</label></div>
          </div>
          <div className="field"><input id="pf-img" value={f.image} onChange={set("image")} className={f.image ? "has-value" : ""} /><label htmlFor="pf-img">Image URL</label></div>
          <div className="field"><textarea id="pf-specs" rows={3} value={f.specsText} onChange={set("specsText")} className={f.specsText ? "has-value" : ""} /><label htmlFor="pf-specs">Specs — one per line: Key: Value</label></div>
          <label className="flex items-center gap-2.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <input type="checkbox" checked={f.sample_available} onChange={(e) => setF((p) => ({ ...p, sample_available: e.target.checked }))} className="accent-[#FDB95B]" data-testid="product-form-sample" />
            Samples available on request
          </label>
        </div>
        <button
          onClick={() => onSave(f)}
          disabled={saving || !f.name.trim()}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-white disabled:opacity-50"
          style={{ background: "var(--brand-red)" }}
          data-testid="product-form-save"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : null} {f.id ? "Save changes" : "Add product"}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("inquiries");
  const [stats, setStats] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ category: "", status: "", q: "" });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const loadInquiries = useCallback(async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.q) params.q = filters.q;
      const res = await api.get("/admin/inquiries", { params });
      setInquiries(res.data.inquiries);
      if (selected) {
        const fresh = res.data.inquiries.find((i) => i.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selected?.id]);

  const loadProducts = useCallback(async () => {
    const res = await api.get("/products");
    setProducts(res.data.products);
  }, []);

  useEffect(() => {
    if (user === false) navigate("/admin");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
    loadInquiries();
    loadProducts();
  }, [user, loadInquiries, loadProducts]);

  const exportCsv = async () => {
    try {
      const res = await api.get("/admin/inquiries-export", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hesi-inquiries.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const saveProduct = async (f) => {
    setSavingProduct(true);
    const specs = {};
    (f.specsText || "").split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
    const payload = { name: f.name, category: f.category, description: f.description, moq: f.moq, lead_time: f.lead_time, sample_available: f.sample_available, image: f.image, specs };
    try {
      if (f.id) await api.put(`/admin/products/${f.id}`, payload);
      else await api.post("/admin/products", payload);
      toast.success("Product saved.");
      setEditing(null);
      loadProducts();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await api.delete(`/admin/products/${p.id}`);
    toast.success("Product deleted.");
    loadProducts();
  };

  const statusOptions = useMemo(() => ["received", "in_review", "responded", "closed", "processing", "sourcing", "shipped", "delivered"], []);

  if (!user) {
    return (
      <div className="min-h-screen hero-mesh flex items-center justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--gold)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }} data-testid="admin-dashboard">
      <header className="glass-strong border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-lg" style={{ color: "var(--brand-red)" }}>H&amp;SI</span>
            <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>Back Office</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs link-draw hidden sm:inline-flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <ArrowLeft size={12} /> View site
            </Link>
            <span className="text-xs hidden md:inline" style={{ color: "var(--text-muted)" }}>{user.email}</span>
            <button onClick={async () => { await logout(); navigate("/admin"); }} className="p-2 rounded-full glass" aria-label="Log out" data-testid="admin-logout-button">
              <LogOut size={15} style={{ color: "var(--brand-red)" }} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: Inbox, label: "Total inquiries", value: stats.total },
              { icon: Sparkles, label: "New (unread)", value: stats.new },
              { icon: Package, label: "Catalog products", value: stats.products },
              { icon: Send, label: "RFQs", value: stats.by_category?.rfq || 0 },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-5" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
                <s.icon size={18} style={{ color: "var(--gold)" }} className="mb-3" />
                <div className="font-display text-3xl font-extrabold">{s.value}</div>
                <div className="text-[10px] tracking-[0.18em] uppercase mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mb-7">
          {["inquiries", "products"].map((t) => (
            <button key={t} onClick={() => setTab(t)} data-testid={`admin-tab-${t}`}
              className="px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-colors"
              style={tab === t ? { background: "var(--gold)", color: "var(--navy)" } : { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--line)" }}>
              {t}
            </button>
          ))}
        </div>

        {tab === "inquiries" && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                className="glass rounded-full px-4 py-2.5 text-xs font-semibold bg-transparent outline-none" data-testid="filter-category">
                <option value="">All categories</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k} style={{ color: "#0B1220" }}>{v}</option>)}
              </select>
              <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="glass rounded-full px-4 py-2.5 text-xs font-semibold bg-transparent outline-none" data-testid="filter-status">
                <option value="">All statuses</option>
                {statusOptions.map((s) => <option key={s} value={s} style={{ color: "#0B1220" }}>{FLOW_LABELS[s]}</option>)}
              </select>
              <div className="field flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 z-10" style={{ color: "var(--text-muted)" }} />
                <input value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  className={`!pl-10 !py-2.5 ${filters.q ? "has-value" : ""}`} data-testid="filter-search" />
                <label className="!left-10 !top-2.5 !text-xs">Search reference, name, email…</label>
              </div>
              <button onClick={exportCsv} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold glass"
                style={{ color: "var(--soft-gold)" }} data-testid="export-csv-button">
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden" data-testid="inquiries-table">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--line)" }}>
                      {["Reference", "Category", "Customer", "Date", "Status"].map((h) => (
                        <th key={h} className="text-left text-[10px] tracking-[0.2em] uppercase px-5 py-4" style={{ color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="px-5 py-12 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "var(--gold)" }} /></td></tr>
                    ) : inquiries.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>No inquiries yet.</td></tr>
                    ) : (
                      inquiries.map((inq) => (
                        <tr key={inq.id} onClick={() => setSelected(inq)} className="cursor-pointer transition-colors hover:bg-white/5"
                          style={{ borderBottom: "1px solid var(--line)" }} data-testid={`inquiry-row-${inq.reference}`}>
                          <td className="px-5 py-4 font-mono text-xs font-bold" style={{ color: "var(--soft-gold)" }}>{inq.reference}</td>
                          <td className="px-5 py-4 text-xs">{CATEGORY_LABELS[inq.category]}</td>
                          <td className="px-5 py-4">
                            <div className="text-xs font-semibold">{inq.contact.full_name}</div>
                            <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{inq.contact.email}</div>
                          </td>
                          <td className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(inq.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                              style={{ background: `${STATUS_COLORS[inq.status]}22`, color: STATUS_COLORS[inq.status] }}>
                              {FLOW_LABELS[inq.status] || inq.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "products" && (
          <>
            <div className="flex justify-end mb-6">
              <button onClick={() => setEditing({ ...EMPTY_PRODUCT })} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white"
                style={{ background: "var(--brand-red)" }} data-testid="add-product-button">
                <Plus size={14} /> Add product
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="products-grid">
              {products.map((p) => (
                <div key={p.id} className="glass rounded-2xl p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "var(--teal)" }}>{p.category}</div>
                      <div className="font-display font-bold text-sm leading-snug">{p.name}</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => setEditing({ ...p, specsText: Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join("\n") })}
                        className="p-2 rounded-full glass" aria-label={`Edit ${p.name}`} data-testid={`edit-product-${p.id}`}>
                        <Pencil size={12} style={{ color: "var(--gold)" }} />
                      </button>
                      <button onClick={() => deleteProduct(p)} className="p-2 rounded-full glass" aria-label={`Delete ${p.name}`} data-testid={`delete-product-${p.id}`}>
                        <Trash2 size={12} style={{ color: "#ff7a7e" }} />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] mt-auto pt-2" style={{ color: "var(--text-muted)" }}>
                    MOQ: {p.moq || "—"} · Lead: {p.lead_time || "—"} · Samples: {p.sample_available ? "Yes" : "No"}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <AnimatePresence>
        {selected && (
          <InquiryDetail
            inquiry={selected}
            onClose={() => setSelected(null)}
            onChanged={loadInquiries}
          />
        )}
        {editing && (
          <ProductForm initial={editing} onSave={saveProduct} onClose={() => setEditing(null)} saving={savingProduct} />
        )}
      </AnimatePresence>
    </div>
  );
}
