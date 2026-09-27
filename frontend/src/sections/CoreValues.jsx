import React from "react";
import { SectionHeading, Reveal } from "../components/Reveal";
import { VALUES } from "../data/content";

function ValueCard({ value, index }) {
  const Icon = value.icon;
  return (
    <Reveal delay={index * 0.07}>
      <div className="group h-64 [perspective:1200px]" data-cursor="Flip" data-testid={`value-card-${value.name.toLowerCase()}`}>
        <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          <div className="absolute inset-0 glass rounded-2xl p-7 flex flex-col justify-between [backface-visibility:hidden]">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl signature-gradient flex items-center justify-center">
                <Icon size={22} className="text-white" />
              </div>
              <span className="font-display text-3xl section-num">0{index + 1}</span>
            </div>
            <h3 className="font-display text-2xl font-bold">{value.name}</h3>
          </div>
          <div className="absolute inset-0 rounded-2xl p-7 flex flex-col justify-center signature-gradient [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <h3 className="font-display text-xl font-bold text-white mb-3">{value.name}</h3>
            <p className="text-sm leading-relaxed text-white/90">{value.desc}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function CoreValues() {
  return (
    <section id="values" className="relative py-28 md:py-40" data-testid="values-section">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading num="02" eyebrow="Core Values" title="Six principles behind every shipment." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <ValueCard key={v.name} value={v} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
