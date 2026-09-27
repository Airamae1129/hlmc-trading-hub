import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Package, PackageSearch, Truck, FileText, Factory, MessageCircleMore } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Wizard from "../components/inquiry/Wizard";
import Catalog from "../components/inquiry/Catalog";
import CompanyProfile from "../components/inquiry/CompanyProfile";
import { INQUIRY_CATEGORIES } from "../data/content";

const ICONS = {
  profile: Building2,
  product: Package,
  new_product: PackageSearch,
  order: Truck,
  rfq: FileText,
  outsourcing: Factory,
  general: MessageCircleMore,
};

export default function InquiryCenter() {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "";
  const [sourcePrefill, setSourcePrefill] = useState("");
  const [wizardKey, setWizardKey] = useState(0);
  const detailRef = useRef(null);

  const select = (slug) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      if (slug) p.set("cat", slug);
      else p.delete("cat");
      p.delete("item");
      return p;
    });
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  useEffect(() => {
    if (cat) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prefillItem = params.get("item");
  const prefillItems = prefillItem ? [{ id: `line-${prefillItem}`, name: prefillItem, category: "Product Line", sample: false }] : [];
  const prefill = cat === "new_product" && sourcePrefill ? { product_name: sourcePrefill } : {};

  return (
    <div data-testid="inquiry-center-page">
      <Navbar />
      <main className="pt-32 pb-24 min-h-screen hero-mesh">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-14">
            <div className="flex items-center gap-4 mb-4">
              <span className="h-px w-12" style={{ background: "var(--gold)" }} />
              <span className="eyebrow">Inquiry Center</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Tell us what to <span className="gold-text">source</span>.
            </h1>
            <p className="mt-4 text-base max-w-2xl" style={{ color: "var(--text-muted)" }}>
              Seven ways to reach the team — pick a category and we&#8217;ll respond with pricing, specs and lead times.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            {INQUIRY_CATEGORIES.map((c, i) => {
              const Icon = ICONS[c.slug];
              const active = cat === c.slug;
              return (
                <motion.button
                  key={c.slug}
                  onClick={() => select(active ? "" : c.slug)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
                  data-testid={`category-tile-${c.slug}`}
                  data-cursor="Open"
                  className={`text-left glass rounded-2xl p-6 transition-colors ${active ? "glow-border" : ""}`}
                  style={active ? { borderColor: "var(--gold)" } : {}}
                >
                  <motion.div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: active ? "var(--brand-red)" : "rgba(74,163,184,0.15)" }}
                    animate={active ? { rotate: [0, -8, 8, 0], scale: [1, 1.12, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={20} style={{ color: active ? "#fff" : "var(--teal)" }} />
                  </motion.div>
                  <h3 className="font-display font-bold text-base md:text-lg mb-1.5 leading-snug">{c.name}</h3>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{c.desc}</p>
                </motion.button>
              );
            })}
          </div>

          <div ref={detailRef} className="scroll-mt-28">
            <AnimatePresence mode="wait">
              {cat === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                  <CompanyProfile />
                </motion.div>
              )}
              {cat === "product" && (
                <motion.div key="product" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-12">
                  <Catalog onSwitchToSourcing={(term) => { setSourcePrefill(term); select("new_product"); }} />
                  <Wizard key={`product-${wizardKey}`} category="product" prefillItems={prefillItems} onReset={() => setWizardKey((k) => k + 1)} />
                </motion.div>
              )}
              {["new_product", "order", "rfq", "outsourcing", "general"].includes(cat) && (
                <motion.div key={cat + wizardKey} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="max-w-3xl mx-auto">
                  <Wizard key={`${cat}-${wizardKey}`} category={cat} prefill={prefill} onReset={() => { setSourcePrefill(""); setWizardKey((k) => k + 1); }} />
                </motion.div>
              )}
            </AnimatePresence>
            {!cat && (
              <div className="glass rounded-3xl p-12 text-center" data-testid="inquiry-center-empty">
                <p className="font-display text-xl" style={{ color: "var(--text-muted)" }}>
                  Select a category above to begin — every submission gets a reference number you can track.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
