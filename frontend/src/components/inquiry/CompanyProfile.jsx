import React, { useState } from "react";
import { Download, MapPin, Mail, Building2 } from "lucide-react";
import { OFFICES, COMPANY_PROFILE_PDF, LOGO_URL } from "../../data/content";

export default function CompanyProfile() {
  const [mapQuery, setMapQuery] = useState(OFFICES[0].mapQuery);

  return (
    <div data-testid="company-profile-panel">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-8 glow-border">
            <img src={LOGO_URL} alt="H&SI seal" className="w-20 h-20 rounded-full bg-white object-cover mb-6" />
            <h3 className="font-display text-2xl font-bold mb-1">HLMC&#8217;S Enterprise &amp; Services, Inc.</h3>
            <p className="text-xs tracking-[0.2em] uppercase mb-5" style={{ color: "var(--brand-red)" }}>
              SEC Registered · June 15, 2023 · Reg. No. 2023060103814-06
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
              Sourcing and supply of commodities, construction materials, medical supplies, heavy equipment and
              real estate — in partnership with <span style={{ color: "var(--soft-gold)" }}>APSA UK LTD</span>,
              a London trading and investment company established in 2014.
            </p>
            <a
              href={COMPANY_PROFILE_PDF}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="download-profile-button"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold text-white transition-transform hover:scale-105"
              style={{ background: "var(--brand-red)", boxShadow: "0 8px 28px rgba(227,22,27,0.35)" }}
            >
              <Download size={16} /> Download Company Profile (PDF)
            </a>
          </div>
          <div className="glass rounded-3xl p-7">
            <div className="eyebrow mb-4">Direct contact</div>
            <div className="space-y-2.5 text-sm">
              <a href="mailto:hlmcs.enterpriseservicesinc0621@gmail.com" className="flex items-center gap-2.5 link-draw w-fit" style={{ color: "var(--soft-gold)" }}>
                <Mail size={14} /> hlmcs.enterpriseservicesinc0621@gmail.com
              </a>
              <a href="mailto:info@apsauk.com" className="flex items-center gap-2.5 link-draw w-fit" style={{ color: "var(--soft-gold)" }}>
                <Mail size={14} /> info@apsauk.com
              </a>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Viber / WhatsApp / Messenger / phone lines available on request via email.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {OFFICES.map((o) => (
              <button
                key={o.id}
                onClick={() => setMapQuery(o.mapQuery)}
                data-testid={`profile-office-${o.id}`}
                className="text-left glass rounded-2xl p-5 transition-all hover:-translate-y-1"
                style={mapQuery === o.mapQuery ? { borderColor: "var(--gold)" } : {}}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="pulse-pin w-7 h-7 rounded-full signature-gradient flex items-center justify-center shrink-0">
                    <MapPin size={13} className="text-white" />
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase font-bold" style={{ color: "var(--teal)" }}>{o.label}</span>
                </div>
                <p className="text-xs leading-relaxed mb-2.5" style={{ color: "var(--text)" }}>{o.address}</p>
                <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full" style={{ background: "rgba(253,185,91,0.1)", color: "var(--soft-gold)" }}>
                  <Building2 size={10} /> Hours: to be provided
                </span>
              </button>
            ))}
          </div>
          <div className="rounded-3xl overflow-hidden glass" data-testid="profile-map">
            <iframe
              title="Office map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`}
              className="w-full h-80 map-dark"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
