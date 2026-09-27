import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHeading } from "../components/Reveal";
import { PRODUCT_LINES } from "../data/content";

gsap.registerPlugin(ScrollTrigger);

function Panel({ line, index }) {
  return (
    <div
      className="product-panel shrink-0 w-[82vw] sm:w-[60vw] lg:w-[38rem] snap-center"
      data-testid={`product-panel-${index}`}
    >
      <div className="group relative h-[26rem] md:h-[30rem] rounded-3xl overflow-hidden glass" data-cursor="View">
        <img
          src={line.image}
          alt={line.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,22,58,0.15) 0%, rgba(4,22,58,0.92) 78%)" }} />
        <div className="absolute top-6 left-6 font-display text-5xl font-extrabold" style={{ color: "rgba(255,214,138,0.5)" }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8">
          <div className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: "var(--teal)" }}>{line.tag}</div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">{line.name}</h3>
          <ul className="mb-5 space-y-1">
            {line.items.slice(0, 3).map((it) => (
              <li key={it} className="text-xs md:text-sm flex items-center gap-2" style={{ color: "rgba(242,245,250,0.75)" }}>
                <span className="w-1 h-1 rounded-full" style={{ background: "var(--gold)" }} /> {it}
              </li>
            ))}
          </ul>
          <Link
            to={`/inquire?cat=product&item=${encodeURIComponent(line.name)}`}
            data-testid={`product-inquire-${index}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white transition-transform hover:scale-105"
            style={{ background: "var(--brand-red)" }}
          >
            Inquire <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProductGallery() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;
      const getAmount = () => track.scrollWidth - section.clientWidth + 64;
      const tween = gsap.to(track, {
        x: () => -getAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getAmount()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="products" ref={sectionRef} className="relative py-28 md:py-36 overflow-hidden" style={{ background: "var(--bg-alt)" }} data-testid="products-section">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading num="03" eyebrow="Product Lines" title="Eleven lines. One reliable supply chain." />
      </div>
      <div
        ref={trackRef}
        className="flex gap-6 md:gap-8 px-5 md:px-8 lg:px-[8vw] overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory lg:snap-none pb-4"
      >
        {PRODUCT_LINES.map((line, i) => (
          <Panel key={line.name} line={line} index={i} />
        ))}
        <div className="shrink-0 w-[70vw] sm:w-[40vw] lg:w-[24rem] flex items-center justify-center">
          <Link
            to="/inquire?cat=product"
            data-testid="product-view-catalog-button"
            className="group flex flex-col items-center gap-4 text-center"
            data-cursor="Catalog"
          >
            <div className="w-24 h-24 rounded-full glass glow-border flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowUpRight size={30} style={{ color: "var(--gold)" }} />
            </div>
            <span className="font-display text-xl font-bold">Browse the full catalog</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
