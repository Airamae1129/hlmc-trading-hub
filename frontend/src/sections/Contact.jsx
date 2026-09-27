import React, { useState } from "react";
import { MapPin, Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SectionHeading, Reveal } from "../components/Reveal";
import { OFFICES, PRODUCT_LINES } from "../data/content";
import { api, formatApiError } from "../lib/api";

export default function Contact() {
  const [mapQuery, setMapQuery] = useState(OFFICES[0].mapQuery);
  const [form, setForm] = useState({ full_name: "", email: "", mobile: "", product: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Please accept the data privacy consent to continue.");
      return;
    }
    setSending(true);
    try {
      const res = await api.post("/inquiries", {
        category: "general",
        data: { inquiry_type: "General Question", product_of_interest: form.product, message: form.message },
        items: [],
        contact: { full_name: form.full_name, company: "", email: form.email, mobile: form.mobile || "+63 ", preferred_contact: "Email" },
        consent,
        attachments: [],
        website: "",
      });
      toast.success(`Message sent. Reference: ${res.data.reference}`);
      setForm({ full_name: "", email: "", mobile: "", product: "", message: "" });
      setConsent(false);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative py-28 md:py-40" style={{ background: "var(--bg-alt)" }} data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading num="06" eyebrow="Contact" title="Four offices. Two countries. One team." />

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="grid sm:grid-cols-2 gap-5">
            {OFFICES.map((o, i) => (
              <Reveal key={o.id} delay={i * 0.07}>
                <button
                  onClick={() => setMapQuery(o.mapQuery)}
                  data-testid={`office-card-${o.id}`}
                  className={`w-full text-left glass rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-1 ${mapQuery === o.mapQuery ? "border-[var(--gold)]" : ""}`}
                  style={mapQuery === o.mapQuery ? { borderColor: "var(--gold)" } : {}}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="pulse-pin w-9 h-9 rounded-full signature-gradient flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-white" />
                    </span>
                    <div>
                      <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--teal)" }}>{o.label}</div>
                      <div className="font-display font-bold text-sm">{o.city}</div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{o.address}</p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full" style={{ background: "rgba(74,163,184,0.12)", color: "var(--teal)" }}>
                    Operating hours: to be provided
                  </span>
                </button>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="glass rounded-2xl p-6 sm:col-span-2">
                <div className="eyebrow mb-3">Direct Lines</div>
                <div className="flex flex-col gap-2">
                  {["hlmcs.enterpriseservicesinc0621@gmail.com", "info@apsauk.com"].map((em) => (
                    <a key={em} href={`mailto:${em}`} className="flex items-center gap-2.5 text-sm link-draw w-fit" style={{ color: "var(--soft-gold)" }}>
                      <Mail size={14} /> {em}
                    </a>
                  ))}
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                    Viber / WhatsApp / Messenger / phone lines available on request via email.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-3xl overflow-hidden glass h-full min-h-[26rem] relative" data-testid="contact-map">
              <iframe
                title="H&SI office locations map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`}
                className="w-full h-full min-h-[26rem] map-dark"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>

        <Reveal>
          <form onSubmit={submit} className="glass rounded-3xl p-8 md:p-10 max-w-4xl mx-auto glow-border" data-testid="quick-quote-form">
            <h3 className="font-display text-2xl font-bold mb-1.5">Quick message</h3>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              Tell us what you need — or open the full <span style={{ color: "var(--gold)" }}>Inquiry Center</span> for RFQs, orders and sourcing.
            </p>
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div className="field">
                <input id="qq-name" required value={form.full_name} onChange={set("full_name")} className={form.full_name ? "has-value" : ""} data-testid="quick-quote-name" />
                <label htmlFor="qq-name">Full name</label>
              </div>
              <div className="field">
                <input id="qq-email" type="email" required value={form.email} onChange={set("email")} className={form.email ? "has-value" : ""} data-testid="quick-quote-email" />
                <label htmlFor="qq-email">Email address</label>
              </div>
              <div className="field">
                <input id="qq-mobile" value={form.mobile} onChange={set("mobile")} placeholder=" " className={form.mobile ? "has-value" : ""} data-testid="quick-quote-mobile" />
                <label htmlFor="qq-mobile">Mobile (+63)</label>
              </div>
              <div className="field">
                <select id="qq-product" value={form.product} onChange={set("product")} className={form.product ? "has-value" : ""} data-testid="quick-quote-product">
                  <option value="">Select…</option>
                  {PRODUCT_LINES.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <label htmlFor="qq-product">Product of interest</label>
              </div>
            </div>
            <div className="field mb-5">
              <textarea id="qq-msg" rows={4} required value={form.message} onChange={set("message")} className={form.message ? "has-value" : ""} data-testid="quick-quote-message" />
              <label htmlFor="qq-msg">Your message</label>
            </div>
            <label className="flex items-start gap-3 mb-6 cursor-pointer text-xs" style={{ color: "var(--text-muted)" }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#FDB95B]" data-testid="quick-quote-consent" />
              I consent to the processing of my personal data in accordance with the Philippine Data Privacy Act of 2012 (RA 10173).
            </label>
            <button
              type="submit"
              disabled={sending}
              data-testid="quick-quote-submit"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
              style={{ background: "var(--brand-red)", boxShadow: "0 10px 30px rgba(227,22,27,0.35)" }}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sending ? "Sending…" : "Send Message"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
