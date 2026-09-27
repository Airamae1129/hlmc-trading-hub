import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Check, Download, PackageSearch, X } from "lucide-react";
import { toast } from "sonner";
import Seal from "../Seal";
import { Field, FileDrop, Consent, Honeypot } from "./Fields";
import { api, formatApiError, API } from "../../lib/api";
import { useCart } from "../../context/AppContext";

const UNITS = ["pcs", "kg", "MT", "liters", "bags", "sets", "units", "cu.m", "containers"];

const CONFIGS = {
  product: {
    title: "Product Inquiry",
    fields: [
      { name: "notes", label: "Notes — quantities, specs, delivery site (optional)", type: "textarea" },
    ],
  },
  new_product: {
    title: "New Product Sourcing",
    fields: [
      { name: "product_name", label: "Product name", required: true },
      { name: "description", label: "Describe the product you need", type: "textarea", required: true },
      { name: "quantity", label: "Quantity needed" },
      { name: "unit", label: "Unit", type: "select", options: UNITS },
      { name: "files", label: "Specs, images or references", type: "file" },
    ],
  },
  order: {
    title: "Order Inquiry",
    fields: [
      { name: "product_details", label: "Product / order details", type: "textarea", required: true },
      { name: "quantity", label: "Quantity", required: true },
      { name: "delivery_location", label: "Delivery location", required: true },
      { name: "preferred_date", label: "Preferred delivery date", type: "date" },
    ],
  },
  rfq: {
    title: "Request for Quotation",
    fields: [
      { name: "product_service", label: "Product / service", required: true },
      { name: "quantity", label: "Quantity", required: true },
      { name: "specifications", label: "Specifications", type: "textarea" },
      { name: "target_price", label: "Target price (optional)" },
      { name: "delivery_location", label: "Delivery location", required: true },
      { name: "required_date", label: "Required delivery date", type: "date" },
      { name: "other_requirements", label: "Other requirements", type: "textarea" },
      { name: "files", label: "Specification files", type: "file" },
    ],
  },
  outsourcing: {
    title: "Outsourcing / Best Price",
    fields: [
      { name: "product_name", label: "Product to be manufactured / sourced", required: true },
      { name: "quantity_volume", label: "Quantity / volume", required: true },
      { name: "specifications_materials", label: "Specifications & materials", type: "textarea", required: true },
      { name: "target_budget", label: "Target cost / budget", type: "slider", min: 50000, max: 50000000, step: 50000 },
      { name: "delivery_requirements", label: "Delivery requirements", type: "textarea" },
      { name: "files", label: "Reference files", type: "file" },
    ],
  },
  general: {
    title: "More Inquiries",
    fields: [
      { name: "inquiry_type", label: "Inquiry type", type: "select", required: true,
        options: ["General Question", "Partnership Inquiry", "Supplier Inquiry", "Service Inquiry", "Other Concerns"] },
      { name: "message", label: "Message", type: "textarea", required: true },
      { name: "files", label: "Attachment (optional)", type: "file" },
    ],
  },
};

const HOW_IT_WORKS = ["Submit", "We Source", "Compare Best Price", "Quotation", "Delivery"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 2 + Math.random() * 1.6,
        size: 5 + Math.random() * 7,
        color: ["#E3161B", "#0E7A34", "#FDB95B", "#FFD68A", "#4AA3B8"][i % 5],
        round: Math.random() > 0.5,
      })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-[-5%]"
          style={{
            left: `${p.x}%`, width: p.size, height: p.size * (p.round ? 1 : 0.45),
            background: p.color, borderRadius: p.round ? "50%" : "2px",
          }}
          initial={{ y: "-10vh", opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0.6], rotate: 360 + Math.random() * 360 }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export default function Wizard({ category, prefill = {}, prefillItems = [], onReset }) {
  const config = CONFIGS[category];
  const cart = useCart();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(prefill);
  const [files, setFiles] = useState([]);
  const [contact, setContact] = useState({ full_name: "", company: "", email: "", mobile: "", preferred_contact: "Email" });
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState(null);

  const items = category === "product" ? [...cart.items, ...prefillItems.filter((p) => !cart.items.some((c) => c.id === p.id))] : prefillItems;
  const steps = ["Details", "Contact", "Review"];

  const setField = (name) => (e) => {
    const v = e?.target ? e.target.value : e;
    setData((d) => ({ ...d, [name]: v }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };
  const setContactField = (name) => (e) => {
    setContact((c) => ({ ...c, [name]: e.target.value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validateStep = () => {
    const er = {};
    if (step === 0) {
      config.fields.forEach((f) => {
        if (f.required && !String(data[f.name] || "").trim()) er[f.name] = "Required";
      });
      if (category === "product" && items.length === 0) er.items = "Add at least one product to your inquiry list.";
    } else if (step === 1) {
      if (!contact.full_name.trim() || contact.full_name.trim().length < 2) er.full_name = "Required";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email)) er.email = "Valid email required";
      if (!/^(\+63|0)?[\d\s-]{7,15}$/.test(contact.mobile.trim())) er.mobile = "Valid PH mobile required (e.g. +63 9xx xxx xxxx)";
    } else if (step === 2) {
      if (!consent) er.consent = "Consent is required to submit.";
    }
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/inquiries", {
        category,
        data,
        items: items.map((i) => ({ id: i.id, name: i.name, category: i.category, sample: !!i.sample })),
        contact,
        consent,
        attachments: files.map((f) => ({ name: f.name, url: f.url, size: f.size })),
        website: honeypot,
      });
      setReference(res.data.reference);
      if (category === "product") cart.clearItems();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <motion.div
        className="relative glass rounded-3xl p-10 md:p-14 text-center overflow-hidden"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        data-testid="inquiry-success"
      >
        <Confetti />
        <motion.div
          className="mx-auto w-fit"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        >
          <Seal size={110} idPrefix="success-seal" />
        </motion.div>
        <h3 className="font-display text-3xl font-bold mt-7 mb-2">Inquiry received.</h3>
        <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
          A confirmation email is on its way to <span style={{ color: "var(--soft-gold)" }}>{contact.email}</span>.
        </p>
        <div className="inline-block glass rounded-2xl px-8 py-4 my-6">
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--teal)" }}>Your reference</div>
          <div className="font-display text-3xl font-extrabold tracking-wider" style={{ color: "var(--soft-gold)" }} data-testid="inquiry-reference">
            {reference}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3.5 mt-2">
          <Link
            to={`/track?ref=${reference}&email=${encodeURIComponent(contact.email)}`}
            data-testid="success-track-button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white"
            style={{ background: "var(--brand-red)" }}
          >
            Track this inquiry <ArrowRight size={15} />
          </Link>
          {category === "rfq" && (
            <a
              href={`${API}/inquiries/${reference}/rfq.pdf?email=${encodeURIComponent(contact.email)}`}
              data-testid="success-rfq-pdf-button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold glass"
              style={{ color: "var(--soft-gold)" }}
            >
              <Download size={15} /> Download RFQ Summary (PDF)
            </a>
          )}
          <button onClick={onReset} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold glass" style={{ color: "var(--text-muted)" }} data-testid="success-new-inquiry">
            New inquiry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 md:p-10 relative" data-testid={`wizard-${category}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-2xl font-bold">{config.title}</h3>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Step {step + 1} of 3</span>
      </div>

      <div className="h-1.5 rounded-full mb-8 overflow-hidden" style={{ background: "var(--line)" }}>
        <motion.div
          className="h-full rounded-full signature-gradient"
          animate={{ width: `${((step + 1) / 3) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          data-testid="wizard-progress"
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            {category === "outsourcing" && (
              <div className="flex flex-wrap items-center gap-2 mb-7">
                {HOW_IT_WORKS.map((h, i) => (
                  <React.Fragment key={h}>
                    <span className="text-[11px] font-bold px-3 py-1.5 rounded-full glass" style={{ color: "var(--soft-gold)" }}>{h}</span>
                    {i < HOW_IT_WORKS.length - 1 && <ArrowRight size={13} style={{ color: "var(--teal)" }} />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {category === "product" && (
              <div className="mb-6">
                <div className="text-xs font-semibold mb-2.5 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <PackageSearch size={15} style={{ color: "var(--gold)" }} /> Your inquiry list ({items.length})
                </div>
                {items.length === 0 ? (
                  <p className="text-xs glass rounded-xl p-4" style={{ color: "var(--text-muted)" }}>
                    Your list is empty — pick products from the catalog above.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {items.map((it, i) => (
                      <span key={`${it.id}-${i}`} className="inline-flex items-center gap-2 text-xs glass rounded-full pl-4 pr-2 py-1.5">
                        {it.name}
                        {it.sample && <em className="not-italic text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(14,122,52,0.25)", color: "#7fe0a4" }}>SAMPLE</em>}
                        <button type="button" onClick={() => cart.removeItem(it.id, !!it.sample)} aria-label={`Remove ${it.name}`} className="hover:text-red-400">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.items && <span className="error-msg">{errors.items}</span>}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              {config.fields.map((f) =>
                f.type === "file" ? (
                  <div key={f.name} className="sm:col-span-2">
                    <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{f.label}</div>
                    <FileDrop files={files} setFiles={setFiles} />
                  </div>
                ) : (
                  <div key={f.name} className={f.type === "textarea" || f.type === "slider" ? "sm:col-span-2" : ""}>
                    <Field {...f} value={data[f.name]} onChange={setField(f.name)} error={errors[f.name]} />
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field name="full_name" label="Full name" required value={contact.full_name} onChange={setContactField("full_name")} error={errors.full_name} />
              <Field name="company" label="Company name" value={contact.company} onChange={setContactField("company")} />
              <Field name="email" label="Email address" type="email" required value={contact.email} onChange={setContactField("email")} error={errors.email} />
              <Field name="mobile" label="Mobile (+63)" required value={contact.mobile} onChange={setContactField("mobile")} error={errors.mobile} />
              <Field name="preferred_contact" label="Preferred contact method" type="select"
                options={["Email", "Phone", "Viber", "WhatsApp", "Messenger"]}
                value={contact.preferred_contact} onChange={setContactField("preferred_contact")} />
            </div>
            <Honeypot value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="glass rounded-2xl p-6 mb-6 text-sm space-y-2.5" data-testid="wizard-review">
              {items.length > 0 && (
                <p><span style={{ color: "var(--teal)" }}>Items:</span> {items.map((i) => i.name + (i.sample ? " (sample)" : "")).join(", ")}</p>
              )}
              {Object.entries(data).map(([k, v]) =>
                v ? (
                  <p key={k}>
                    <span style={{ color: "var(--teal)" }}>{k.replace(/_/g, " ")}:</span>{" "}
                    {k === "target_budget" ? `₱${Number(v).toLocaleString()}` : String(v)}
                  </p>
                ) : null
              )}
              {files.length > 0 && <p><span style={{ color: "var(--teal)" }}>Files:</span> {files.map((f) => f.name).join(", ")}</p>}
              <p><span style={{ color: "var(--teal)" }}>From:</span> {contact.full_name}{contact.company ? ` · ${contact.company}` : ""} · {contact.email} · {contact.mobile}</p>
              <p><span style={{ color: "var(--teal)" }}>Preferred contact:</span> {contact.preferred_contact}</p>
            </div>
            <Consent checked={consent} onChange={(v) => { setConsent(v); setErrors((er) => ({ ...er, consent: undefined })); }} />
            {errors.consent && <span className="error-msg">{errors.consent}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-9">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold glass disabled:opacity-40"
          data-testid="wizard-back-button"
        >
          <ArrowLeft size={15} /> Back
        </button>
        {step < 2 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold"
            style={{ background: "var(--ocean)", color: "#fff" }}
            data-testid="wizard-next-button"
          >
            Continue <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white disabled:opacity-60"
            style={{ background: "var(--brand-red)", boxShadow: "0 8px 28px rgba(227,22,27,0.35)" }}
            data-testid="inquiry-submit-button"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {submitting ? "Submitting…" : "Submit inquiry"}
          </button>
        )}
      </div>
    </div>
  );
}
