import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading, Reveal } from "../components/Reveal";
import { HOUSES, REALTY_SERVICES } from "../data/content";

export default function RealEstate() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(() => setActive((a) => (a + 1) % HOUSES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const house = HOUSES[active];

  return (
    <section id="real-estate" className="relative py-28 md:py-40 overflow-hidden" data-testid="real-estate-section">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading num="04" eyebrow="Real Estate" title="Wimbledon Hills — British-inspired living, Philippine soil." />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="text-sm md:text-base leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
                Developed by <span className="font-semibold" style={{ color: "var(--soft-gold)" }}>Kimjao APSA HESI</span>,
                Wimbledon Hills brings the quiet prestige of London&#8217;s most coveted postcodes to a master-planned
                residential collection. Three house models — Clarence, Syon and Marble — each crafted for enduring value.
              </p>
            </Reveal>
            <div className="space-y-0">
              {REALTY_SERVICES.map((s, i) => (
                <Reveal key={s} delay={i * 0.05}>
                  <div className="flex items-center gap-5 py-3.5 group" style={{ borderBottom: "1px solid var(--line)" }}>
                    <span className="font-display text-sm font-bold w-8" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm md:text-base transition-transform duration-300 group-hover:translate-x-2">{s}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <Reveal>
              <div className="relative rounded-3xl overflow-hidden glass h-[24rem] md:h-[30rem]" data-cursor="View" data-testid="real-estate-showcase">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={house.name}
                    src={house.image}
                    alt={`${house.name} — Wimbledon Hills`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ clipPath: "inset(0 100% 0 0)", scale: 1.12 }}
                    animate={{ clipPath: "inset(0 0% 0 0)", scale: 1 }}
                    exit={{ clipPath: "inset(0 0 0 100%)", scale: 1.05 }}
                    transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(4,22,58,0.92) 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={house.name}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.45 }}
                    >
                      <div className="text-[10px] tracking-[0.25em] uppercase mb-1.5" style={{ color: "var(--gold)" }}>Wimbledon Hills Collection</div>
                      <h3 className="font-display text-3xl font-bold text-white mb-2">{house.name}</h3>
                      <p className="text-sm max-w-md" style={{ color: "rgba(242,245,250,0.8)" }}>{house.desc}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>
            <div className="flex gap-3 mt-5">
              {HOUSES.map((h, i) => (
                <button
                  key={h.name}
                  onClick={() => setActive(i)}
                  data-testid={`house-tab-${h.name.toLowerCase().replace(/\s/g, "-")}`}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-wide transition-colors glass ${i === active ? "border-[var(--gold)]" : ""}`}
                  style={i === active ? { color: "var(--soft-gold)", borderColor: "var(--gold)" } : { color: "var(--text-muted)" }}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
