# H&SI Corporate Website + Inquiry Center — PRD

## Original problem statement
Premium, heavily animated corporate website for HLMC'S ENTERPRISE & SERVICES, INC. (brand mark "H&SI"), a Philippine SEC-registered company (June 15, 2023) sourcing commodities, construction materials, medical supplies, heavy equipment and real estate, partnered with APSA UK LTD (London, est. 2014). Brand colors: red #E3161B / green #0E7A34 sparks over navy #04163A → teal #4AA3B8 → gold #FDB95B/soft-gold #FFD68A signature gradient. Serif headlines (Playfair Display), geometric sans body (Manrope). Heavy motion: seal preloader, WebGL particle globe with PH/TH/VN/UK trade arcs, masked headline reveal, magnetic CTAs, custom gold cursor, pinned horizontal product gallery, marquees, 3D tilt/flip cards, credentials lightbox, dark/light mode, reduced-motion fallbacks.

Extended scope (user answer): full **Inquiry Center** with 7 categories (Company Profile, Product Inquiry w/ catalog+cart, New Product Sourcing w/ file upload, Order Inquiry w/ status timeline, RFQ w/ PDF summary, Outsourcing/Best Price, General), honeypot spam protection, RA 10173 consent, auto-reply + notification emails (Resend managed), and an **admin dashboard** (inquiry management, replies, status updates, product catalog CRUD, CSV export).

## User personas
- Procurement officer / contractor sourcing materials (product inquiry, RFQ, order tracking)
- Supplier / partner (partnership & supplier inquiries)
- Property investor / homebuyer (Wimbledon Hills real estate)
- H&SI admin staff (back office: respond, update statuses, manage catalog, export)

## Architecture
- Frontend: React 19 (CRA/craco), Tailwind + custom CSS design tokens, GSAP ScrollTrigger, Lenis, Framer Motion, Three.js globe. Routes: `/` landing, `/inquire` Inquiry Center, `/track` My Inquiries, `/admin` login, `/admin/dashboard`.
- Backend: FastAPI + Motor (MongoDB). Endpoints: `/api/auth/*` (JWT cookie auth, bcrypt, brute-force lockout), `/api/products`, `/api/admin/products` CRUD, `/api/uploads` (PDF/JPG/PNG/DOCX ≤10MB ×5), `/api/inquiries` + `/track` + `/{ref}/message` + `/{ref}/rfq.pdf` (reportlab), `/api/admin/inquiries*` (list/filter/reply/status/export CSV), `/api/admin/stats`.
- Email: Emergent managed Resend proxy (EMERGENT_EMAIL_KEY), from_name "HLMC'S Enterprise & Services, Inc.", notify → hlmcs.enterpriseservicesinc0621@gmail.com, auto-reply → customer, reply email on admin response. Guardrail gate (_assert_safe_email) on every send.
- Data: products (25 seeded from company profile PDF), inquiries (uuid id, HSI-XXXXXX reference, status flows: order → received/processing/sourcing/shipped/delivered; general → received/in_review/responded/closed), users, login_attempts.

## Implemented (2026-09-27)
- Full landing page: preloader (SVG seal stroke draw + counter), hero (Three.js particle globe + trade arcs + mesh gradient), ticker marquee, About (HLMC'S × APSA UK), Vision/Mission scroll-scrub, 6 flip Core Values cards, 11-panel pinned horizontal Product Lines gallery, Wimbledon Hills real estate showcase (3 house models, auto-advancing clip reveals), Clients + Partners dual marquees (names from company profile), Credentials lightbox (7 permits w/ real reference numbers), Contact (4 offices, embedded Google map, quick quote form), footer (rotating seal, back-to-top progress ring), dark/light toggle, custom cursor, floating Inquire Now button, wave dividers.
- Inquiry Center: 7 animated category tiles; product catalog (25 products, filter chips, search, detail modal, MOQ/lead time/specs, sample requests, add-to-inquiry-list cart with navbar counter); multi-step wizard (details → contact → review) with progress bar, floating labels, inline validation, drag-drop uploads, honeypot, RA 10173 consent; success screen (seal spin + brand confetti + reference); "Can't find it? We'll source it" bridge from empty search to New Product form; Company Profile panel with offices, map, PDF download (uploaded company profile).
- My Inquiries: reference + email lookup, animated status timeline, message thread (customer follow-ups), RFQ PDF download.
- Admin dashboard: login (JWT), stats cards, inquiry table w/ category/status/search filters, detail drawer (contact, details, items, attachments, reply → emails customer, status buttons), CSV export, products CRUD.
- SEO: title/description/OG/Twitter tags, JSON-LD Organization, noscript fallback, robots.txt (AI crawler groups, /api + /admin disallowed), llms.txt, SVG favicon. Canonical/og:url/sitemap intentionally omitted until a production domain is attached.
- Emails verified sending (HTTP 202 from managed proxy).

## Test credentials
See /app/memory/test_credentials.md — admin: admin@hlmcs-hesi.com / HesiAdmin@2026.

## Backlog
- P0: (none blocking)
- P1: Attach production domain → add canonical, og:url, og:image share card, sitemap.xml; enable bot-prerender toggle at deploy. Provide real Viber/WhatsApp/phone numbers (currently "available on request via email") and office operating hours (currently "to be provided" placeholders per instruction). Client/partner logo image files (currently elegant text badges).
- P2: reCAPTCHA (honeypot in place now); admin password change in-app; per-office map view switching polish; inquiry email notifications to additional staff addresses; product image uploads via object storage (currently admin pastes image URL).
