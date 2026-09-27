import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useScroll, useSpring, useTransform } from "framer-motion";
import Seal from "./Seal";
import { NAV_LINKS, OFFICES } from "../data/content";
import { scrollToHash } from "./Navbar";

export default function Footer() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });
  const dash = useTransform(progress, [0, 1], [151, 0]);
  const location = useLocation();

  const goTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative pt-24 pb-12 overflow-hidden" style={{ background: "var(--bg-alt)" }} data-testid="footer">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-4 flex flex-col items-start gap-6">
            <div className="spin-slow">
              <Seal size={150} idPrefix="footer-seal" />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              HLMC&#8217;S Enterprise &amp; Services, Inc. — SEC-registered June 15, 2023.
              In partnership with APSA UK LTD, London (est. 2014).
            </p>
          </div>
          <div className="md:col-span-3">
            <h4 className="eyebrow mb-5">Explore</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.hash}>
                  <button
                    onClick={() => (location.pathname === "/" ? scrollToHash(l.hash) : (window.location.href = "/" + l.hash))}
                    className="link-draw text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              <li><Link to="/inquire" className="link-draw text-sm" style={{ color: "var(--gold)" }}>Inquiry Center</Link></li>
              <li><Link to="/track" className="link-draw text-sm" style={{ color: "var(--gold)" }}>Track My Inquiry</Link></li>
            </ul>
          </div>
          <div className="md:col-span-5">
            <h4 className="eyebrow mb-5">Offices</h4>
            <ul className="space-y-4">
              {OFFICES.map((o) => (
                <li key={o.id} className="text-sm">
                  <span className="font-semibold block" style={{ color: "var(--text)" }}>{o.label} — {o.city}</span>
                  <span style={{ color: "var(--text-muted)" }} className="text-xs leading-relaxed">{o.address}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-1.5 text-sm">
              <a href="mailto:hlmcs.enterpriseservicesinc0621@gmail.com" className="link-draw w-fit" style={{ color: "var(--gold)" }}>hlmcs.enterpriseservicesinc0621@gmail.com</a>
              <a href="mailto:info@apsauk.com" className="link-draw w-fit" style={{ color: "var(--gold)" }}>info@apsauk.com</a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--line)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 HLMC&#8217;S Enterprise &amp; Services, Inc. All rights reserved. SEC Reg. No. 2023060103814-06
          </p>
          <button
            onClick={goTop}
            data-testid="back-to-top-button"
            aria-label="Back to top"
            className="relative w-12 h-12 rounded-full glass flex items-center justify-center hover:border-[var(--gold)] transition-colors"
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--line)" strokeWidth="2" />
              <motion.circle cx="24" cy="24" r="20" fill="none" stroke="var(--gold)" strokeWidth="2"
                strokeDasharray="151" style={{ strokeDashoffset: dash }} strokeLinecap="round" />
            </svg>
            <ArrowUp size={16} style={{ color: "var(--gold)" }} />
          </button>
        </div>
      </div>
    </footer>
  );
}
