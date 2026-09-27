import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOP_TEXT = "HLMC'S ENTERPRISE";
const BOTTOM_TEXT = "SERVICES, INC.";

export default function Preloader({ onDone }) {
  const [count, setCount] = useState(0);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const dur = 1900;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setExit(true);
        setTimeout(onDone, 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!exit ? (
        <motion.div
          key="preloader"
          data-testid="preloader"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "#04163A" }}
          exit={{ opacity: 0 }}
        >
          <motion.svg viewBox="0 0 200 200" className="w-56 h-56 md:w-72 md:h-72">
            <defs>
              <path id="pl-top" d="M 26,100 a 74,74 0 0,1 148,0" fill="none" />
              <path id="pl-bottom" d="M 26,100 a 74,74 0 0,0 148,0" fill="none" />
            </defs>
            <motion.circle
              cx="100" cy="100" r="95" fill="none" stroke="#E3161B" strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
            <motion.path
              d="M 34,100 A 66,66 0 0,1 166,100" fill="none" stroke="#E3161B" strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 0.6, ease: "easeInOut" }}
            />
            <motion.path
              d="M 166,100 A 66,66 0 0,1 34,100" fill="none" stroke="#E3161B" strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 0.75, ease: "easeInOut" }}
            />
            {[...TOP_TEXT].map((ch, i) => (
              <motion.text
                key={`t${i}`}
                fontSize="16.5" fontWeight="700" fill="#0E7A34" letterSpacing="3.5" fontFamily="Georgia, serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.04 }}
              >
                <textPath href="#pl-top" startOffset={`${14 + (i / (TOP_TEXT.length - 1)) * 72}%`} textAnchor="middle">
                  {ch}
                </textPath>
              </motion.text>
            ))}
            {[...BOTTOM_TEXT].map((ch, i) => (
              <motion.text
                key={`b${i}`}
                fontSize="16.5" fontWeight="700" fill="#0E7A34" letterSpacing="3.5" fontFamily="Georgia, serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 + i * 0.04 }}
              >
                <textPath href="#pl-bottom" startOffset={`${18 + (i / (BOTTOM_TEXT.length - 1)) * 64}%`} textAnchor="middle">
                  {ch}
                </textPath>
              </motion.text>
            ))}
            <motion.text
              x="78" y="121" textAnchor="middle" fontSize="48" fontWeight="800" fill="#E3161B"
              fontFamily="'Playfair Display', Georgia, serif"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35, duration: 0.4 }}
            >
              H
            </motion.text>
            <motion.text
              x="122" y="121" textAnchor="middle" fontSize="48" fontWeight="800" fill="#E3161B"
              fontFamily="'Playfair Display', Georgia, serif"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.45, duration: 0.4 }}
            >
              SI
            </motion.text>
            <motion.text
              x="100" y="119" textAnchor="middle" fontSize="40" fontWeight="800" fontStyle="italic" fill="#E3161B"
              fontFamily="'Playfair Display', Georgia, serif"
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 1.6, type: "spring", stiffness: 200, damping: 12 }}
            >
              &#38;
            </motion.text>
          </motion.svg>
          <div className="absolute bottom-10 right-10 font-display text-5xl md:text-7xl"
            style={{ color: "rgba(253,185,91,0.85)" }} data-testid="preloader-counter">
            {count}%
          </div>
          <div className="absolute bottom-12 left-10 eyebrow">Sourcing Strength. Supplying Progress.</div>
        </motion.div>
      ) : (
        <motion.div
          key="preloader-exit"
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ background: "#04163A" }}
          animate={{ background: "rgba(4,22,58,0)" }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2.4, opacity: 0, rotate: 20 }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          >
            <svg viewBox="0 0 200 200" className="w-56 h-56 md:w-72 md:h-72">
              <circle cx="100" cy="100" r="95" fill="none" stroke="#E3161B" strokeWidth="6" />
              <text x="100" y="118" textAnchor="middle" fontSize="46" fontWeight="800" fill="#E3161B" fontFamily="'Playfair Display', Georgia, serif">H&#38;SI</text>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
