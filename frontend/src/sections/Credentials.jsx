import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileBadge2, X, BadgeCheck } from "lucide-react";
import { SectionHeading, Reveal } from "../components/Reveal";
import Seal from "../components/Seal";
import { CREDENTIALS } from "../data/content";

export default function Credentials() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="credentials" className="relative py-28 md:py-40" data-testid="credentials-section">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading num="05" eyebrow="Permits & Credentials" title="Fully registered. Fully compliant." />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {CREDENTIALS.map((cred, i) => (
            <Reveal key={cred.id} delay={i * 0.05}>
              <button
                onClick={() => setSelected(cred)}
                data-testid={`credential-card-${cred.id}`}
                data-cursor="View"
                className="w-full text-left glass rounded-2xl p-6 h-full group transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--gold)]"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl signature-gradient flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <FileBadge2 size={20} className="text-white" />
                  </div>
                  <BadgeCheck size={18} style={{ color: "var(--brand-green)" }} />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 leading-snug">{cred.name}</h3>
                <p className="text-xs" style={{ color: "var(--teal)" }}>{cred.ref}</p>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{cred.issuer}</p>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[96] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="credential-lightbox"
          >
            <div className="absolute inset-0" style={{ background: "rgba(4,22,58,0.85)", backdropFilter: "blur(10px)" }} onClick={() => setSelected(null)} />
            <motion.div
              className="relative w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: "#FAF6EE", color: "#0B1220" }}
              initial={{ scale: 0.85, y: 40, rotateX: 12 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
            >
              <div className="p-8 md:p-10 relative">
                <div className="absolute inset-3 rounded-xl pointer-events-none" style={{ border: "2px solid rgba(11,61,126,0.25)" }} />
                <div className="flex flex-col items-center text-center pt-4">
                  <Seal size={90} idPrefix="lightbox-seal" />
                  <div className="mt-5 text-[10px] tracking-[0.3em] uppercase" style={{ color: "#0B3D7E" }}>
                    Republic of the Philippines
                  </div>
                  <h3 className="font-display text-2xl font-bold mt-2 mb-1">{selected.name}</h3>
                  <p className="text-xs" style={{ color: "#4E5D78" }}>{selected.issuer}</p>
                  <div className="my-6 h-px w-3/4" style={{ background: "linear-gradient(90deg, transparent, #0B3D7E55, transparent)" }} />
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">HLMC&#8217;S ENTERPRISE &amp; SERVICES, INC.</span></p>
                    <p className="text-xs" style={{ color: "#4E5D78" }}>{selected.ref}</p>
                    <p className="text-xs" style={{ color: "#4E5D78" }}>{selected.date}</p>
                  </div>
                  <div className="mt-7 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase"
                    style={{ background: "rgba(14,122,52,0.1)", color: "#0E7A34", border: "1px solid rgba(14,122,52,0.35)" }}>
                    <BadgeCheck size={14} /> Verified &amp; On File
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                data-testid="credential-lightbox-close"
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
