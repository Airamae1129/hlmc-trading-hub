import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "../components/Reveal";

const VISION =
  "Ultimately, through our vision it is our strong will to win in the marketplace in every aspect of our business — a core of competitive advantage for our clients, society, and every corner of the marketing and procurement industry.";

const MISSION =
  "Our mission is to be recognized as a leading and reliable partner among our clients in the marketing and procurement industries — a trusted provider of exceptional, highest-quality products and a client-oriented service company, operating in an ethical and socially conscious manner.";

function ScrubbedParagraph({ text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="font-display text-xl sm:text-2xl lg:text-[1.7rem] leading-relaxed font-medium">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} word={w} />
      ))}
    </p>
  );
}

function Word({ progress, range, word }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  const color = useTransform(progress, range, ["#9DB1CF", "#FFD68A"]);
  return (
    <motion.span style={{ opacity, color }} className="inline-block mr-[0.3em]">
      {word}
    </motion.span>
  );
}

export default function VisionMission() {
  return (
    <section id="vision" className="relative py-28 md:py-40" style={{ background: "var(--bg-alt)" }} data-testid="vision-section">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <Reveal y={16}>
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-12" style={{ background: "var(--gold)" }} />
              <span className="eyebrow">Our Vision</span>
            </div>
          </Reveal>
          <ScrubbedParagraph text={VISION} />
          <Reveal delay={0.1} className="mt-8">
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              In property: to be a recognized leader in the property acquisition and development sector in the UK
              and internationally, while maintaining an authentic level of service founded on integrity and partnership.
            </p>
          </Reveal>
        </div>
        <div className="lg:pt-24">
          <Reveal y={16}>
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-12" style={{ background: "var(--teal)" }} />
              <span className="eyebrow">Our Mission</span>
            </div>
          </Reveal>
          <ScrubbedParagraph text={MISSION} />
        </div>
      </div>
    </section>
  );
}
