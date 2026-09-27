import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";

export default function FloatingInquire() {
  const location = useLocation();
  if (location.pathname.startsWith("/inquire") || location.pathname.startsWith("/admin")) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[70]"
      initial={{ opacity: 0, scale: 0, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 16 }}
    >
      <Link
        to="/inquire"
        data-testid="floating-inquire-button"
        className="relative flex items-center gap-2.5 pl-4 pr-5 py-3.5 rounded-full text-sm font-bold text-white glow-border"
        style={{ background: "var(--brand-red)", boxShadow: "0 10px 34px rgba(227,22,27,0.45)" }}
        data-cursor="Inquire"
      >
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid var(--gold)" }}
          animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <MessageSquareText size={18} />
        Inquire Now
      </Link>
    </motion.div>
  );
}
