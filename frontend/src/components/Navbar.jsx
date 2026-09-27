import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ClipboardList } from "lucide-react";
import { useTheme, useCart } from "../context/AppContext";
import { NAV_LINKS, LOGO_URL } from "../data/content";

export function scrollToHash(hash) {
  const el = document.querySelector(hash);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const cart = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (hash) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + hash);
    } else {
      scrollToHash(hash);
    }
  };

  return (
    <>
      <motion.header
        data-testid="navbar"
        className={`fixed top-0 left-0 right-0 z-[80] transition-[padding,background-color,border-color,backdrop-filter] duration-500 ${
          scrolled ? "glass-strong border-b" : "bg-transparent border-b border-transparent"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between transition-[height] duration-500 ${scrolled ? "h-14" : "h-20"}`}>
          <Link to="/" className="flex items-center gap-3 group" data-testid="nav-logo" data-cursor="Home">
            <img src={LOGO_URL} alt="H&SI logo" className={`rounded-full object-cover bg-white transition-[width,height] duration-500 ${scrolled ? "w-8 h-8" : "w-11 h-11"}`} />
            <span className="leading-none">
              <span className="font-display font-extrabold text-lg tracking-wide block" style={{ color: "var(--brand-red)" }}>
                H<span className="italic">&amp;</span>SI
              </span>
              <span className="hidden sm:block text-[8.5px] tracking-[0.22em] uppercase" style={{ color: "var(--brand-green)" }}>
                HLMC&#8217;S Enterprise &amp; Services
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <button
                key={l.hash}
                onClick={() => go(l.hash)}
                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                className="link-draw text-[13px] font-medium tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              to="/inquire?cat=product"
              data-testid="nav-inquiry-list"
              className="relative p-2 rounded-full glass hover:border-[var(--gold)] transition-colors"
              aria-label="Inquiry list"
            >
              <ClipboardList size={17} style={{ color: "var(--gold)" }} />
              {cart.count > 0 && (
                <span data-testid="nav-inquiry-count" className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] px-0.5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--brand-red)", color: "#fff" }}>
                  {cart.count}
                </span>
              )}
            </Link>
            <button
              onClick={toggleTheme}
              data-testid="theme-toggle-button"
              className="p-2 rounded-full glass hover:border-[var(--gold)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} style={{ color: "var(--gold)" }} /> : <Moon size={16} style={{ color: "var(--ocean)" }} />}
            </button>
            <Link
              to="/inquire?cat=rfq"
              data-testid="nav-get-quote-button"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold text-white transition-transform hover:scale-105 active:scale-95"
              style={{ background: "var(--brand-red)", boxShadow: "0 6px 24px rgba(227,22,27,0.35)" }}
            >
              Get a Quote
            </Link>
            <button
              className="lg:hidden p-2 rounded-full glass"
              onClick={() => setOpen(true)}
              data-testid="nav-mobile-menu-button"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[95] flex flex-col"
            style={{ background: "var(--navy)" }}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            data-testid="nav-mobile-menu"
          >
            <div className="flex items-center justify-between h-20 px-5">
              <span className="font-display font-extrabold text-xl" style={{ color: "var(--brand-red)" }}>H&amp;SI</span>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full glass" data-testid="nav-mobile-close" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-8 gap-2" aria-label="Mobile">
              {NAV_LINKS.map((l, i) => (
                <motion.button
                  key={l.hash}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  onClick={() => go(l.hash)}
                  className="text-left font-display text-3xl font-bold py-2 text-white hover:text-[var(--gold)] transition-colors"
                >
                  {l.label}
                </motion.button>
              ))}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mt-8">
                <Link
                  to="/inquire?cat=rfq"
                  onClick={() => setOpen(false)}
                  className="inline-flex px-7 py-3.5 rounded-full font-bold text-white"
                  style={{ background: "var(--brand-red)" }}
                  data-testid="nav-mobile-quote-button"
                >
                  Get a Quote
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
