import React, { useRef, useState } from "react";
import { UploadCloud, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "../../lib/api";

export function Field({ label, name, type = "text", value, onChange, required = false, error, options = [], min, max, step }) {
  const has = value !== "" && value !== undefined && value !== null;
  if (type === "slider") {
    return (
      <div className="field" data-testid={`field-${name}`}>
        <label className="!static !transform-none block text-xs mb-2" style={{ color: "var(--text-muted)" }}>
          {label} {required && <span style={{ color: "var(--brand-red)" }}>*</span>}
        </label>
        <div className="glass rounded-xl px-4 py-4">
          <input type="range" min={min} max={max} step={step} value={value || min} onChange={onChange}
            className="w-full accent-[#FDB95B]" data-testid={`input-${name}`} />
          <div className="text-center font-display text-xl font-bold mt-2" style={{ color: "var(--soft-gold)" }}>
            ₱{Number(value || min).toLocaleString()}
          </div>
        </div>
        {error && <span className="error-msg">{error}</span>}
      </div>
    );
  }
  return (
    <div className="field" data-testid={`field-${name}`}>
      {type === "textarea" ? (
        <textarea id={name} rows={4} value={value || ""} onChange={onChange} className={`${has ? "has-value" : ""} ${error ? "input-error" : ""}`} data-testid={`input-${name}`} />
      ) : type === "select" ? (
        <select id={name} value={value || ""} onChange={onChange} className={`${has ? "has-value" : ""} ${error ? "input-error" : ""}`} data-testid={`input-${name}`}>
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input id={name} type={type} value={value || ""} onChange={onChange} className={`${has ? "has-value" : ""} ${error ? "input-error" : ""}`} data-testid={`input-${name}`} />
      )}
      <label htmlFor={name}>
        {label} {required && <span style={{ color: "var(--brand-red)" }}>*</span>}
      </label>
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
}

export function FileDrop({ files, setFiles }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList) => {
    const arr = Array.from(fileList).slice(0, 5 - files.length);
    if (!arr.length) return;
    const fd = new FormData();
    arr.forEach((f) => fd.append("files", f));
    setUploading(true);
    try {
      const res = await api.post("/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const uploaded = res.data.files.map((f) => ({
        ...f,
        preview: /\.(jpe?g|png)$/i.test(f.name) ? `${process.env.REACT_APP_BACKEND_URL}${f.url}` : null,
      }));
      setFiles((prev) => [...prev, ...uploaded]);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div data-testid="file-drop-zone">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${dragging ? "border-[var(--gold)]" : ""}`}
        style={{ borderColor: dragging ? "var(--gold)" : "var(--line)", background: dragging ? "rgba(253,185,91,0.06)" : "transparent" }}
      >
        {uploading ? (
          <Loader2 size={26} className="mx-auto animate-spin" style={{ color: "var(--gold)" }} />
        ) : (
          <UploadCloud size={26} className="mx-auto" style={{ color: "var(--teal)" }} />
        )}
        <p className="text-sm mt-3 font-medium">Drop files here or click to browse</p>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>PDF, JPG, PNG, DOCX · max 10MB each · up to 5 files</p>
        <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} data-testid="file-input" />
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {files.map((f, i) => (
            <div key={i} className="relative glass rounded-xl p-2.5 flex items-center gap-2.5 max-w-[220px]">
              {f.preview ? (
                <img src={f.preview} alt={f.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <FileText size={20} style={{ color: "var(--teal)" }} className="shrink-0" />
              )}
              <span className="text-[11px] truncate" title={f.name}>{f.name}</span>
              <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                className="p-1 rounded-full hover:bg-white/10" aria-label={`Remove ${f.name}`}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Consent({ checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 accent-[#FDB95B] w-4 h-4" data-testid="consent-checkbox" />
      <span>
        I consent to the collection and processing of my personal data by HLMC&#8217;S Enterprise &amp; Services, Inc.
        for the purpose of responding to this inquiry, in accordance with the Philippine Data Privacy Act of 2012 (RA 10173).
      </span>
    </label>
  );
}

export const Honeypot = ({ value, onChange }) => (
  <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
  </div>
);
