import React from "react";
import Marquee from "../components/Marquee";
import { Reveal } from "../components/Reveal";
import { CLIENTS, PARTNERS } from "../data/content";

function LogoBadge({ name, accent = "gold" }) {
  return (
    <div
      className="mx-3 shrink-0 px-8 py-4 rounded-2xl glass opacity-60 hover:opacity-100 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold)]"
      data-cursor={name}
    >
      <span
        className="font-display text-base md:text-lg font-bold whitespace-nowrap tracking-wide"
        style={{ color: accent === "gold" ? "var(--soft-gold)" : "var(--teal)" }}
      >
        {name}
      </span>
    </div>
  );
}

export default function ClientsPartners() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden" style={{ background: "var(--bg-alt)" }}>
      <div id="clients" className="max-w-7xl mx-auto px-5 md:px-8 mb-10" data-testid="clients-section">
        <Reveal y={16}>
          <div className="flex items-center gap-4 mb-3">
            <span className="h-px w-12" style={{ background: "var(--gold)" }} />
            <span className="eyebrow">Our Clients</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">
            Trusted by landmarks and institutions.
          </h2>
        </Reveal>
      </div>
      <Marquee duration={48} pauseOnHover className="py-4" >
        {CLIENTS.map((c) => (
          <LogoBadge key={c} name={c} accent="gold" />
        ))}
      </Marquee>

      <div id="partners" className="max-w-7xl mx-auto px-5 md:px-8 mt-20 mb-10" data-testid="partners-section">
        <Reveal y={16}>
          <div className="flex items-center gap-4 mb-3 justify-end">
            <span className="eyebrow">Strategic Partners</span>
            <span className="h-px w-12" style={{ background: "var(--teal)" }} />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-right">
            Brands we build with.
          </h2>
        </Reveal>
      </div>
      <Marquee duration={52} reverse pauseOnHover className="py-4">
        {PARTNERS.map((p) => (
          <LogoBadge key={p} name={p} accent="teal" />
        ))}
      </Marquee>
    </section>
  );
}
