import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, LogIn, ArrowLeft } from "lucide-react";
import Seal from "../components/Seal";
import { useAuth } from "../context/AppContext";
import { formatApiError } from "../lib/api";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-mesh flex items-center justify-center px-5" data-testid="admin-login-page">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-9 w-full max-w-md glow-border"
      >
        <div className="flex justify-center mb-6">
          <Seal size={90} idPrefix="admin-seal" />
        </div>
        <h1 className="font-display text-2xl font-bold text-center mb-1">H&amp;SI Back Office</h1>
        <p className="text-xs text-center mb-8" style={{ color: "var(--text-muted)" }}>Authorized personnel only</p>
        <div className="space-y-5 mb-6">
          <div className="field">
            <input id="adm-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={email ? "has-value" : ""} data-testid="admin-email-input" />
            <label htmlFor="adm-email">Admin email</label>
          </div>
          <div className="field">
            <input id="adm-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={password ? "has-value" : ""} data-testid="admin-password-input" />
            <label htmlFor="adm-pass">Password</label>
          </div>
        </div>
        {error && <p className="text-xs mb-4 text-center" style={{ color: "#ff7a7e" }} data-testid="admin-login-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          data-testid="admin-login-submit"
          className="w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold text-white disabled:opacity-60"
          style={{ background: "var(--brand-red)" }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs link-draw" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={12} /> Back to site
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
