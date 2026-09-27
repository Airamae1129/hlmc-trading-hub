import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Globe from "../components/Globe";
import Marquee from "../components/Marquee";
import MagneticButton from "../components/MagneticButton";
import { CountUp } from "../components/Reveal";
import { TICKER_ITEMS, STATS } from "../data/content";

const line1 = "Sourcing Strength.";
const line2 = "Supplying Progress.";

function MaskedLine({ text, delay = 0, goldWords = [] }) {
  return (
    <span className="block overflow-hidden pb-2 -mb-2">
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className={`inline-block ${goldWords.includes(word.replace(".", "")) ? "gold-text" : ""}`}
            initial={{ y: "115%", rotate: 4 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{ duration: 0.9, delay: delay + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}{i < text.split(" ").length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden hero-mesh" data-testid="hero-section">
      <Globe className="absolute right-[-6%] top-1/2 -translate-y-1/2 w-[58vw] h-[58vw] max-w-[880px] max-h-[880px] opacity-90 hidden lg:block" />

      <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto w-full px-5 md:px-8 pt-32 pb-16">
        <div className="max-w-3xl">
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--brand-red)" }} />
            <span className="text-[11px] md:text-xs tracking-[0.3em] uppercase font-semibold" style={{ color: "var(--soft-gold)" }}>
              HLMC&#8217;S Enterprise &amp; Services, Inc. · SEC Reg. 2023
            </span>
          </motion.div>

          <h1 className="font-display font-extrabold tracking-tight leading-[1.02] text-5xl sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
            <MaskedLine text={line1} delay={0.3} goldWords={["Strength"]} />
            <MaskedLine text={line2} delay={0.55} goldWords={["Progress"]} />
          </h1>

          <motion.p
            className="mt-8 text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: "var(--text-muted)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.8 }}
          >
            From Thailand&#8217;s rice fields to London&#8217;s trading desks — H&amp;SI sources and supplies
            the commodities, construction materials, medical supplies and heavy equipment that build the nation,
            in partnership with APSA UK LTD.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.8 }}
          >
            <Link to="/inquire?cat=rfq">
              <MagneticButton
                data-testid="hero-request-quote-button"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm text-white"
                style={{ background: "var(--brand-red)", boxShadow: "0 12px 40px rgba(227,22,27,0.4)" }}
                data-cursor="Quote"
              >
                Request a Quote <ArrowRight size={16} />
              </MagneticButton>
            </Link>
            <Link to="/inquire?cat=product">
              <MagneticButton
                data-testid="hero-explore-products-button"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm glass glow-border"
                style={{ color: "var(--soft-gold)" }}
                data-cursor="Explore"
              >
                Explore Products
              </MagneticButton>
            </Link>
          </motion.div>

          <motion.div
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.9 }}
          >
            {STATS.map((s) => (
              <div key={s.label} data-testid={`hero-stat-${s.label.toLowerCase().replace(/\s|\+/g, "-")}`}>
                <div className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--soft-gold)" }}>
                  <CountUp value={s.value} suffix={s.suffix || ""} isYear={s.isYear} />
                </div>
                <div className="text-[11px] tracking-[0.14em] uppercase mt-1" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown size={18} style={{ color: "var(--gold)" }} />
      </motion.div>

      <motion.div
        className="relative z-10 py-4"
        style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "rgba(4,22,58,0.45)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <Marquee duration={38}>
          {TICKER_ITEMS.map((item) => (
            <span key={item} className="flex items-center shrink-0">
              <span className="font-display text-sm md:text-base tracking-[0.25em] font-semibold px-6" style={{ color: "var(--soft-gold)" }}>
                {item}
              </span>
              <span className="w-1.5 h-1.5 rotate-45" style={{ background: "var(--brand-red)" }} />
            </span>
          ))}
        </Marquee>
      </motion.div>
    </section>
  );
}
