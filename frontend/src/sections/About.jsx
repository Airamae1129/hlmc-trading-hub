import React from "react";
import { motion } from "framer-motion";
import { Building2, Globe2 } from "lucide-react";
import { SectionHeading, Reveal } from "../components/Reveal";
import { LOGO_URL } from "../data/content";

export default function About() {
  return (
    <section id="about" className="relative py-28 md:py-40 overflow-hidden" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading num="01" eyebrow="Who We Are" title="A Philippine trading house with a London heartbeat." />

        <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16">
          <svg className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 z-10" viewBox="0 0 160 160" aria-hidden="true">
            <motion.path
              d="M 10 80 C 50 20, 110 20, 150 80 C 110 140, 50 140, 10 80"
              fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="6 5"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.8 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>

          <Reveal>
            <div className="glass rounded-3xl p-8 md:p-10 h-full glow-border" data-cursor="H&SI">
              <div className="flex items-center gap-5 mb-7">
                <img src={LOGO_URL} alt="HLMC'S Enterprise & Services, Inc. seal" className="w-16 h-16 rounded-full bg-white object-cover" />
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold">HLMC&#8217;S Enterprise &amp; Services, Inc.</h3>
                  <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--brand-red)" }}>
                    Philippines · SEC Registered June 15, 2023
                  </span>
                </div>
              </div>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                A Securities and Exchange Commission-registered company specializing in the sourcing and supply of
                commodities, construction materials, and all other related products — and in the acquisition of
                below-market-value property assets with high stable yields, development potential, and profitable
                exit strategies.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                {["Commodities", "Construction", "Medical", "Real Estate", "Heavy Equipment"].map((t) => (
                  <span key={t} className="text-[11px] px-3 py-1.5 rounded-full glass" style={{ color: "var(--soft-gold)" }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="glass rounded-3xl p-8 md:p-10 h-full" data-cursor="APSA">
              <div className="flex items-center gap-5 mb-7">
                <div className="w-16 h-16 rounded-full signature-gradient flex items-center justify-center font-display font-extrabold text-lg text-white">
                  <Globe2 size={26} />
                </div>
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold">APSA UK LTD</h3>
                  <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--teal)" }}>
                    London, United Kingdom · Est. 2014
                  </span>
                </div>
              </div>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Our strategic partner — a trading and investment company incorporated in 2014, trading in medical
                equipment, hospital consumables, commodities, real estate and construction across the UK and
                international markets from Berkeley Square, Mayfair.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                {["Medical Equipment", "Hospital Consumables", "Commodities", "UK Real Estate"].map((t) => (
                  <span key={t} className="text-[11px] px-3 py-1.5 rounded-full glass" style={{ color: "var(--teal)" }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-10">
          <div className="glass rounded-2xl px-8 py-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <Building2 size={22} style={{ color: "var(--gold)" }} className="shrink-0" />
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <span className="font-semibold" style={{ color: "var(--text)" }}>One supply chain, two hemispheres.</span>{" "}
              Together we connect Southeast Asian mills, quarries and manufacturers to Philippine project sites —
              and Philippine opportunity to global capital.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
