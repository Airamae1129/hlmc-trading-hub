import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 36, className = "", once = true }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once, margin: "-80px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export const SplitReveal = ({ text, className = "", delay = 0, as: Tag = "span" }) => {
  const words = text.split(" ");
  return (
    <Tag className={`inline-block ${className}`} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden align-bottom pb-1 -mb-1">
          <motion.span
            className="inline-block"
            initial={{ y: "115%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: delay + wi * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
            {wi < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

export const SectionHeading = ({ num, eyebrow, title, className = "" }) => (
  <div className={`relative mb-14 md:mb-20 ${className}`}>
    <div className="section-num absolute -top-10 md:-top-16 left-0 text-8xl md:text-[11rem] pointer-events-none" aria-hidden="true">
      {num}
    </div>
    <div className="relative pt-10 md:pt-20">
      <Reveal y={16}>
        <div className="flex items-center gap-4 mb-5">
          <span className="h-px w-12" style={{ background: "var(--gold)" }} />
          <span className="eyebrow">{eyebrow}</span>
        </div>
      </Reveal>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl">
        <SplitReveal text={title} />
      </h2>
    </div>
  </div>
);

export const CountUp = ({ value, suffix = "", isYear = false, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(isYear ? value : 0);

  useEffect(() => {
    if (!inView || isYear) return;
    const dur = 1600;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, isYear]);

  return (
    <span ref={ref} className={className}>
      {isYear ? value : display}
      {suffix}
    </span>
  );
};
