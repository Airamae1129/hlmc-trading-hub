import {
  ShieldCheck, Handshake, Award, Users, Lightbulb, Crown,
  Wheat, Blocks, Candy, Fuel, Cable, Layers, Mountain, Stethoscope,
  ShoppingBasket, Tractor, HardHat,
} from "lucide-react";

export const LOGO_URL =
  "https://customer-assets-lxgj4vgw.emergentagent.net/job_718e2fc3-74e5-48ac-937f-8f58e8f767c8/artifacts/rwdcauzo_HLMC%E2%80%99S%20ENTERPRISE%20%26%20SERVICES%2C%20INC.%20LOGO.png";

export const COMPANY_PROFILE_PDF =
  "https://customer-assets-lxgj4vgw.emergentagent.net/job_718e2fc3-74e5-48ac-937f-8f58e8f767c8/artifacts/suibvml8_HESI-Company-Profile-2026.pdf";

export const NAV_LINKS = [
  { label: "About", hash: "#about" },
  { label: "Products", hash: "#products" },
  { label: "Real Estate", hash: "#real-estate" },
  { label: "Clients", hash: "#clients" },
  { label: "Partners", hash: "#partners" },
  { label: "Credentials", hash: "#credentials" },
  { label: "Contact", hash: "#contact" },
];

export const TICKER_ITEMS = [
  "RICE", "CEMENT", "SUGAR", "DIESEL", "STEEL", "AGGREGATES",
  "MEDICAL SUPPLIES", "HEAVY EQUIPMENT", "CONTAINER VANS", "REAL ESTATE",
];

export const STATS = [
  { value: 2023, label: "SEC Registered", isYear: true },
  { value: 11, label: "Product Lines", suffix: "" },
  { value: 20, label: "Clients & Partners", suffix: "+" },
  { value: 4, label: "Global Offices", suffix: "" },
];

export const VALUES = [
  { icon: ShieldCheck, name: "Integrity", desc: "We embrace the highest standards of ethical behavior and transparency in every aspect of our business — a company trusted by its clients and stakeholders." },
  { icon: Handshake, name: "Partnership", desc: "Our success and delivery of quality products and services depend upon the partnerships we create with all internal and external stakeholders." },
  { icon: Award, name: "Excellence", desc: "Our commitment to professional excellence ensures clients receive the highest quality service — flawless execution and delivery." },
  { icon: Users, name: "Teamwork", desc: "Our culture of teamwork combines the quality and expertise of our professional staff to deliver optimum solutions." },
  { icon: Lightbulb, name: "Innovation", desc: "We thrive on creativity and ingenuity — innovative ideas, concepts and processes essential to continued success and growth." },
  { icon: Crown, name: "Leadership", desc: "The spirit of leadership is instilled in everyone we work with as a team. Teamwork makes the dream work." },
];

const IMG = {
  rice: "https://images.unsplash.com/photo-1723475158232-819e29803f4d?crop=entropy&cs=srgb&fm=jpg&q=85",
  cement: "https://images.unsplash.com/photo-1730627283177-f43b83c3850c?crop=entropy&cs=srgb&fm=jpg&q=85",
  sugar: "https://images.unsplash.com/photo-1621534416159-42d19eb5ed0b?crop=entropy&cs=srgb&fm=jpg&q=85",
  diesel: "https://images.unsplash.com/photo-1656988826404-bbb5ccb779bc?crop=entropy&cs=srgb&fm=jpg&q=85",
  steel: "https://images.unsplash.com/photo-1623428454598-1bfe414bac03?crop=entropy&cs=srgb&fm=jpg&q=85",
  aggregates: "https://images.unsplash.com/photo-1785791516517-aae4ca2fcfcb?crop=entropy&cs=srgb&fm=jpg&q=85",
  medical: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?crop=entropy&cs=srgb&fm=jpg&q=85",
  essentials: "https://images.unsplash.com/photo-1550963295-019d8a8a61c5?crop=entropy&cs=srgb&fm=jpg&q=85",
  heavy: "https://images.unsplash.com/photo-1575281923032-f40d94ef6160?crop=entropy&cs=srgb&fm=jpg&q=85",
  construction: "https://images.unsplash.com/photo-1635335874521-7987db781153?crop=entropy&cs=srgb&fm=jpg&q=85",
  containers: "https://images.unsplash.com/photo-1642864835712-a9e172ceeafe?crop=entropy&cs=srgb&fm=jpg&q=85",
};

export const PRODUCT_LINES = [
  { icon: Wheat, name: "Thailand & Vietnam Rice", image: IMG.rice, tag: "Jasmine · Thai White · Kohaku · DT8 Aroma", items: ["Jasmine Rice (Premium)", "Thai White Rice (Premium)", "Kohaku Jasmine Fragrant", "Jasmine DT8 Aroma (Super Premium)"] },
  { icon: Blocks, name: "Cement", image: IMG.cement, tag: "Holcim · SCG · Eagle · Vicem", items: ["Holcim Solido Type IP", "Holcim Excel", "SCG Smart Cement Type 1", "Eagle Cement Advance"] },
  { icon: Candy, name: "Sugar", image: IMG.sugar, tag: "Refined ICUMSA 45, bulk volumes", items: ["Refined Sugar ICUMSA 45", "Bulk container loads"] },
  { icon: Fuel, name: "Diesel", image: IMG.diesel, tag: "Industrial bulk supply, scheduled delivery", items: ["Industrial diesel (bulk)", "Fleet & site deliveries"] },
  { icon: Cable, name: "Construction Materials", image: IMG.construction, tag: "Electrical · Mechanical · MEPFS", items: ["Wires & cables (Orion, Philflex, Hypertech)", "Lighting (FSL, E Lighting)", "Electro-mechanical supplies"] },
  { icon: Layers, name: "Steel & Rebars", image: IMG.steel, tag: "Angle · Channel · H-Beam · I-Beam", items: ["Deformed rebar G40/G60", "H-Beam & I-Beam", "Steel sheet pile", "Angle & channel bars"] },
  { icon: Mountain, name: "Aggregates", image: IMG.aggregates, tag: "Mindoro · Zambales · Tarlac · Quezon", items: ["G1 & 3/4 gravel", "Vibro sand 4mm", "Boulders A/B/C", "White & river sand"] },
  { icon: Stethoscope, name: "Medical Supplies & Equipment", image: IMG.medical, tag: "Hospital consumables to diagnostics", items: ["Consumables & disposables", "Diagnostic equipment", "Ward & emergency equipment"] },
  { icon: ShoppingBasket, name: "Essential Supplies", image: IMG.essentials, tag: "For offices, schools & facilities", items: ["Cleaning supplies", "Paper products", "Personal care items"] },
  { icon: Tractor, name: "Heavy Equipment & Container Vans", image: IMG.heavy, tag: "Machinery sourcing · 20ft/40ft vans", items: ["Excavators & loaders", "Container vans (new & used)", "Site office conversions"] },
  { icon: HardHat, name: "Construction & Other Services", image: IMG.containers, tag: "Specialized construction activities", items: ["Specialized construction", "Allied project services"] },
];

export const HOUSES = [
  {
    name: "Clarence House",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=srgb&fm=jpg&q=85",
    desc: "The flagship model of Wimbledon Hills — generous family living with British-inspired architecture and premium finishes.",
  },
  {
    name: "Syon House",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=srgb&fm=jpg&q=85",
    desc: "Balanced elegance — open-plan interiors, natural light and refined proportions for modern living.",
  },
  {
    name: "Marble House",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?crop=entropy&cs=srgb&fm=jpg&q=85",
    desc: "A statement residence — bold lines, stone-clad details and spaces designed to impress.",
  },
];

export const REALTY_SERVICES = [
  "Off-market exclusive opportunities",
  "Property acquisition, planning & development",
  "Real estate brokerage",
  "Property management",
  "Advisory, consultancy & risk assessment",
  "Portfolio management",
];

export const CLIENTS = [
  "Philippine Arena", "New Era General Hospital", "Global Medical Center of Laguna",
  "Global Care Medical Center of Canlubang", "New Era University",
  "IVM Phils Services & Contractor", "ADHI–PTPP JV", "Vista Cinemas", "Kinder City",
];

export const PARTNERS = [
  "APSA UK LTD", "Vantaztic Incorporated", "Lucky 3R Trading", "FSL Lighting",
  "Orion Wire & Cable", "Philflex Wires & Cables", "Hypertech Wire & Cable",
  "Koubert Industries Inc.", "eVLa", "E Lighting", "Kimjao Builder & Trading Inc.",
];

export const CREDENTIALS = [
  { id: "sec", name: "SEC Certificate of Incorporation", ref: "Reg. No. 2023060103814-06", date: "June 15, 2023", issuer: "Securities and Exchange Commission, Philippines" },
  { id: "bir", name: "BIR Certificate of Registration", ref: "TIN 877-690-020-000", date: "June 29, 2023", issuer: "Bureau of Internal Revenue" },
  { id: "mayors", name: "Mayor's Permit", ref: "Permit No. 2005-01244", date: "Issued July 14, 2025", issuer: "City Government of Antipolo" },
  { id: "barangay", name: "Barangay Business Clearance", ref: "Ref. No. 02-1-02-2023-0004797", date: "Issued August 1, 2025", issuer: "Barangay San Luis, Antipolo City" },
  { id: "zoning", name: "Zoning Compliance Certificate", ref: "Decision No. 2025-012368", date: "Issued July 14, 2025", issuer: "City Planning Office, Antipolo" },
  { id: "environmental", name: "Environmental Permit to Operate", ref: "Permit No. 2025-012364", date: "Issued July 14, 2025", issuer: "City Environment Office, Antipolo" },
  { id: "sanitary", name: "Sanitary Permit to Operate", ref: "Permit No. 2025-01226", date: "Issued July 14, 2025", issuer: "City Health Office, Antipolo" },
];

export const OFFICES = [
  {
    id: "main", label: "Main Office", city: "Antipolo City, Philippines",
    address: "Block 3 Lot 6 Fairfield, Cascades 2, Cottonwood Heights, San Luis, Antipolo City, Rizal 1870",
    email: "hlmcs.enterpriseservicesinc0621@gmail.com",
    mapQuery: "Cottonwood Heights, San Luis, Antipolo City, Rizal, Philippines",
  },
  {
    id: "satellite", label: "Satellite Office", city: "Mandaluyong City, Philippines",
    address: "1808 Detifoss Tower, Acqua Private Residences, Coronado St., Brgy. Hulo, Mandaluyong City 1550",
    email: "hlmcs.enterpriseservicesinc0621@gmail.com",
    mapQuery: "Acqua Private Residences, Coronado St, Mandaluyong City, Philippines",
  },
  {
    id: "virtual", label: "Virtual Office", city: "Makati City, Philippines",
    address: "Kimjao Builder & Trading Inc., 3rd Floor Universal Re Bldg, 106 Paseo de Roxas, Legaspi Village, Makati",
    email: "kimjao.061118@gmail.com",
    mapQuery: "Universal Re Building, Paseo de Roxas, Makati, Philippines",
  },
  {
    id: "uk", label: "UK Office — APSA UK LTD", city: "London, United Kingdom",
    address: "Fourth Floor, 43 Berkeley Square, Mayfair, London W1J 5FJ",
    email: "info@apsauk.com",
    mapQuery: "43 Berkeley Square, Mayfair, London W1J 5FJ, UK",
  },
];

export const INQUIRY_CATEGORIES = [
  { slug: "profile", name: "Company Profile", desc: "Who we are, offices, and our full company profile." },
  { slug: "product", name: "Product Inquiry", desc: "Browse the catalog and inquire about listed products." },
  { slug: "new_product", name: "New Product Sourcing", desc: "Can't find it? We'll source it for you." },
  { slug: "order", name: "Order Inquiry", desc: "Place or follow up an order with delivery details." },
  { slug: "rfq", name: "Request for Quotation", desc: "Formal RFQ with specs, target price and PDF summary." },
  { slug: "outsourcing", name: "Outsourcing / Best Price", desc: "We source, compare and quote the best price for you." },
  { slug: "general", name: "More Inquiries", desc: "Partnerships, supplier, service or general questions." },
];
