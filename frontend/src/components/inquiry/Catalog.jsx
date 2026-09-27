import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, ArrowUpRight, FlaskConical, X, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useCart } from "../../context/AppContext";

export default function Catalog({ onSwitchToSourcing }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const cart = useCart();

  useEffect(() => {
    api.get("/products").then((res) => {
      setProducts(res.data.products);
      setCategories(["All", ...res.data.categories]);
    }).catch(() => toast.error("Could not load the catalog."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
      ),
    [products, cat, search]
  );

  const add = (p, sample = false) => {
    cart.addItem(p, sample);
    toast.success(sample ? `Sample requested: ${p.name}` : `Added to inquiry list: ${p.name}`);
  };

  return (
    <div data-testid="product-catalog">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="field flex-1 max-w-md">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 z-10" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`!pl-11 ${search ? "has-value" : ""}`}
            data-testid="catalog-search"
          />
          <label className="!left-11">Search products…</label>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-7">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            data-testid={`catalog-chip-${c.toLowerCase().replace(/[\s&/]+/g, "-")}`}
            className="shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-colors glass"
            style={cat === c ? { background: "var(--gold)", color: "var(--navy)", borderColor: "var(--gold)" } : { color: "var(--text-muted)" }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center" data-testid="catalog-empty">
          <PackageSearch size={38} className="mx-auto mb-4" style={{ color: "var(--gold)" }} />
          <h3 className="font-display text-2xl font-bold mb-2">Can&#8217;t find it?</h3>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            We&#8217;ll source it for you — tell us what &#8220;{search}&#8221; means to your project.
          </p>
          <button
            onClick={() => onSwitchToSourcing(search)}
            data-testid="catalog-source-it-button"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white"
            style={{ background: "var(--brand-red)" }}
          >
            Source it for me <ArrowUpRight size={15} />
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              className="group glass rounded-2xl overflow-hidden flex flex-col hover:border-[var(--gold)] transition-colors"
              data-testid={`catalog-card-${p.id}`}
            >
              <button className="relative h-40 overflow-hidden text-left" onClick={() => setDetail(p)} data-cursor="View" aria-label={`View ${p.name}`}>
                <img src={p.image} alt={p.name} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(4,22,58,0.8)", color: "var(--soft-gold)" }}>
                  {p.category}
                </span>
              </button>
              <div className="p-5 flex flex-col flex-1">
                <button onClick={() => setDetail(p)} className="text-left font-display font-bold leading-snug mb-3 hover:text-[var(--soft-gold)] transition-colors">
                  {p.name}
                </button>
                <div className="text-[11px] space-y-1 mb-4" style={{ color: "var(--text-muted)" }}>
                  <p>MOQ: <span style={{ color: "var(--text)" }}>{p.moq || "On request"}</span></p>
                  <p>Lead time: <span style={{ color: "var(--text)" }}>{p.lead_time || "On request"}</span></p>
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <button
                    onClick={() => add(p)}
                    data-testid={`catalog-inquire-${p.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-[11px] font-bold text-white transition-transform hover:scale-[1.03]"
                    style={{ background: "var(--brand-red)" }}
                  >
                    <Plus size={13} /> Inquire
                  </button>
                  <button
                    onClick={() => add(p, true)}
                    data-testid={`catalog-sample-${p.id}`}
                    disabled={!p.sample_available}
                    title={p.sample_available ? "Request a sample with your inquiry" : "Samples not available for this product"}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full text-[11px] font-bold glass disabled:opacity-35"
                    style={{ color: "var(--teal)" }}
                  >
                    <FlaskConical size={13} /> Sample
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {detail && (
          <motion.div className="fixed inset-0 z-[96] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="product-detail-modal">
            <div className="absolute inset-0" style={{ background: "rgba(4,22,58,0.85)", backdropFilter: "blur(10px)" }} onClick={() => setDetail(null)} />
            <motion.div
              className="relative w-full max-w-2xl glass-strong rounded-3xl overflow-hidden max-h-[88vh] overflow-y-auto"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            >
              <div className="relative h-60">
                <img src={detail.image} alt={detail.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, var(--bg) 100%)" }} />
                <button onClick={() => setDetail(null)} className="absolute top-4 right-4 p-2 rounded-full glass" aria-label="Close" data-testid="product-detail-close">
                  <X size={16} />
                </button>
              </div>
              <div className="p-7 md:p-9 -mt-10 relative">
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--teal)" }}>{detail.category}</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold mt-1 mb-4">{detail.name}</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>{detail.description}</p>
                {Object.keys(detail.specs || {}).length > 0 && (
                  <table className="w-full text-sm mb-6">
                    <tbody>
                      {Object.entries(detail.specs).map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td className="py-2.5 pr-4 text-xs" style={{ color: "var(--text-muted)" }}>{k}</td>
                          <td className="py-2.5 text-xs font-medium text-right">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="grid grid-cols-3 gap-3 mb-7 text-center">
                  {[["MOQ", detail.moq || "On request"], ["Lead time", detail.lead_time || "On request"], ["Samples", detail.sample_available ? "Available" : "Not available"]].map(([k, v]) => (
                    <div key={k} className="glass rounded-xl p-3">
                      <div className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--teal)" }}>{k}</div>
                      <div className="text-xs font-bold">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { add(detail); setDetail(null); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold text-white"
                    style={{ background: "var(--brand-red)" }}
                    data-testid="product-detail-inquire"
                  >
                    <Plus size={15} /> Add to inquiry list
                  </button>
                  {detail.sample_available && (
                    <button
                      onClick={() => { add(detail, true); setDetail(null); }}
                      className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold glass"
                      style={{ color: "var(--teal)" }}
                      data-testid="product-detail-sample"
                    >
                      <FlaskConical size={15} /> Request sample
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
