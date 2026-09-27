from dotenv import load_dotenv
load_dotenv()

import os
import re
import io
import csv
import json
import uuid
import random
import string
import logging
import ipaddress
from datetime import datetime, timezone, timedelta
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from pathlib import Path
from typing import Optional, List, Dict, Any

import bcrypt
import jwt
import httpx
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
NOTIFY_EMAIL = os.environ.get("NOTIFY_EMAIL", "hlmcs.enterpriseservicesinc0621@gmail.com")

# ---------------------------------------------------------------- email (Emergent managed Resend)
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "HLMC'S Enterprise & Services, Inc.")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: Optional[str] = None) -> Optional[str]:
    _assert_safe_email(subject, html)
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY missing; skipping email")
        return None
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as http_client:
            resp = await http_client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return None


def _email_shell(title: str, body_rows: str) -> str:
    return (
        '<table role="presentation" width="100%" style="background:#04163A;padding:32px 0">'
        '<tr><td align="center"><table role="presentation" width="560" style="background:#071F4A;'
        'border:1px solid rgba(255,214,138,.25);border-radius:12px;padding:32px;font-family:Arial,sans-serif;color:#F2F5FA">'
        f'<tr><td><div style="font-family:Georgia,serif;font-size:22px;color:#FDB95B;letter-spacing:2px">H&amp;SI</div>'
        f'<div style="font-size:11px;letter-spacing:3px;color:#4AA3B8;margin:4px 0 18px">HLMC&apos;S ENTERPRISE &amp; SERVICES, INC.</div>'
        f'<h2 style="font-family:Georgia,serif;color:#FFD68A;font-size:20px;margin:0 0 16px">{title}</h2>'
        f"{body_rows}"
        '<p style="font-size:11px;color:#8DA2C0;margin-top:28px;border-top:1px solid rgba(255,214,138,.15);padding-top:14px">'
        'Sent by HLMC\'S Enterprise &amp; Services, Inc. · Antipolo City, Rizal, Philippines · '
        'In partnership with APSA UK LTD, London. We never ask for passwords or card details by email.</p>'
        "</td></tr></table></td></tr></table>"
    )


def _kv_rows(pairs) -> str:
    rows = ""
    for k, v in pairs:
        if v in (None, "", []):
            continue
        rows += (f'<tr><td style="padding:6px 12px 6px 0;font-size:12px;color:#8DA2C0;vertical-align:top;white-space:nowrap">{escape(str(k))}</td>'
                 f'<td style="padding:6px 0;font-size:13px;color:#F2F5FA">{escape(str(v))}</td></tr>')
    return f'<table role="presentation" style="margin:10px 0">{rows}</table>'


CATEGORY_LABELS = {
    "profile": "Company Profile Request",
    "product": "Product Inquiry",
    "new_product": "New Product Sourcing",
    "order": "Order Inquiry",
    "rfq": "Request for Quotation",
    "outsourcing": "Outsourcing / Best Price",
    "general": "General Inquiry",
}

ORDER_FLOW = ["received", "processing", "sourcing", "shipped", "delivered"]
GEN_FLOW = ["received", "in_review", "responded", "closed"]


async def notify_new_inquiry(inq: dict):
    contact = inq["contact"]
    label = CATEGORY_LABELS.get(inq["category"], inq["category"])
    pairs = [("Reference", inq["reference"]), ("Category", label),
             ("Name", contact.get("full_name")), ("Company", contact.get("company")),
             ("Email", contact.get("email")), ("Mobile", contact.get("mobile")),
             ("Preferred contact", contact.get("preferred_contact"))]
    if inq.get("items"):
        pairs.append(("Items", ", ".join(i.get("name", "") for i in inq["items"])))
    for k, v in inq.get("data", {}).items():
        if isinstance(v, (str, int, float)) and str(v).strip():
            pairs.append((k.replace("_", " ").title(), v))
    body = (f'<p style="font-size:13px;color:#F2F5FA">A new {escape(label.lower())} was submitted through the H&amp;SI Inquiry Center.</p>'
            + _kv_rows(pairs))
    await send_email(to=NOTIFY_EMAIL, subject=f"[H&SI] New {label} — {inq['reference']}", html=_email_shell(f"New {label}", body))


async def send_customer_confirmation(inq: dict):
    label = CATEGORY_LABELS.get(inq["category"], inq["category"])
    name = escape(inq["contact"].get("full_name", ""))
    body = (f'<p style="font-size:13px">Hi {name},</p>'
            f'<p style="font-size:13px;line-height:1.6">Thank you for reaching out to HLMC&apos;S Enterprise &amp; Services, Inc. '
            f'Your <strong>{escape(label)}</strong> has been received and our team will get back to you shortly.</p>'
            + _kv_rows([("Your reference number", inq["reference"]),
                        ("Keep this number", "Quote it in all follow-ups and on the My Inquiries tracker page.")])
            + '<p style="font-size:13px;line-height:1.6">Sourcing Strength. Supplying Progress.</p>')
    await send_email(to=inq["contact"]["email"],
                     subject=f"H&SI — We received your inquiry ({inq['reference']})",
                     html=_email_shell("Inquiry Received", body))


async def send_reply_email(inq: dict, message: str):
    name = escape(inq["contact"].get("full_name", ""))
    body = (f'<p style="font-size:13px">Hi {name},</p>'
            f'<p style="font-size:13px;line-height:1.6">Our team has replied to your inquiry '
            f'<strong>{escape(inq["reference"])}</strong>:</p>'
            f'<div style="background:#04163A;border-left:3px solid #FDB95B;padding:14px 16px;font-size:13px;line-height:1.7;color:#F2F5FA">{escape(message)}</div>'
            '<p style="font-size:13px;line-height:1.6">You can view the full thread anytime on the My Inquiries page using your reference number and email.</p>')
    await send_email(to=inq["contact"]["email"],
                     subject=f"H&SI — Update on your inquiry ({inq['reference']})",
                     html=_email_shell("You have a reply", body))


# ---------------------------------------------------------------- auth
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


class LoginBody(BaseModel):
    email: EmailStr
    password: str


@api_router.post("/auth/login")
async def login(body: LoginBody, request: Request, response: Response):
    email = body.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    ident = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": ident},
            {"$inc": {"count": 1},
             "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": ident})
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=43200, path="/")
    return {"user": {"email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")}, "token": token}


@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return {"email": user["email"], "name": user.get("name"), "role": user.get("role")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"status": "ok"}


# ---------------------------------------------------------------- products
PRODUCT_CATEGORIES = ["Rice", "Cement", "Sugar", "Diesel", "Construction Materials", "Steel & Rebars",
                      "Aggregates", "Medical Supplies", "Essential Supplies", "Heavy Equipment", "Services"]

IMG = {
    "rice": "https://images.unsplash.com/photo-1723475158232-819e29803f4d?crop=entropy&cs=srgb&fm=jpg&q=85",
    "cement": "https://images.unsplash.com/photo-1730627283177-f43b83c3850c?crop=entropy&cs=srgb&fm=jpg&q=85",
    "sugar": "https://images.unsplash.com/photo-1621534416159-42d19eb5ed0b?crop=entropy&cs=srgb&fm=jpg&q=85",
    "diesel": "https://images.unsplash.com/photo-1656988826404-bbb5ccb779bc?crop=entropy&cs=srgb&fm=jpg&q=85",
    "steel": "https://images.unsplash.com/photo-1623428454598-1bfe414bac03?crop=entropy&cs=srgb&fm=jpg&q=85",
    "aggregates": "https://images.unsplash.com/photo-1785791516517-aae4ca2fcfcb?crop=entropy&cs=srgb&fm=jpg&q=85",
    "medical": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?crop=entropy&cs=srgb&fm=jpg&q=85",
    "essentials": "https://images.unsplash.com/photo-1550963295-019d8a8a61c5?crop=entropy&cs=srgb&fm=jpg&q=85",
    "heavy": "https://images.unsplash.com/photo-1575281923032-f40d94ef6160?crop=entropy&cs=srgb&fm=jpg&q=85",
    "construction": "https://images.unsplash.com/photo-1635335874521-7987db781153?crop=entropy&cs=srgb&fm=jpg&q=85",
    "containers": "https://images.unsplash.com/photo-1642864835712-a9e172ceeafe?crop=entropy&cs=srgb&fm=jpg&q=85",
}

SEED_PRODUCTS = [
    {"name": "Jasmine Rice (Premium Quality)", "category": "Rice", "image": IMG["rice"], "moq": "1 × 20ft container (≈25 MT)", "lead_time": "2–4 weeks", "sample_available": True,
     "description": "Premium fragrant Jasmine rice sourced directly from Thailand and Vietnam millers.",
     "specs": {"Origin": "Thailand / Vietnam", "Broken": "5% max", "Moisture": "14% max", "Packaging": "25kg / 50kg PP bags"}},
    {"name": "Thai White Rice (Premium Quality)", "category": "Rice", "image": IMG["rice"], "moq": "1 × 20ft container (≈25 MT)", "lead_time": "2–4 weeks", "sample_available": True,
     "description": "Premium Thai white rice for retail, institutional and industrial buyers.",
     "specs": {"Origin": "Thailand", "Broken": "5–25% options", "Moisture": "14% max", "Packaging": "25kg / 50kg PP bags"}},
    {"name": "Kohaku Jasmine (Special Fragrant Rice)", "category": "Rice", "image": IMG["rice"], "moq": "1 × 20ft container", "lead_time": "2–4 weeks", "sample_available": True,
     "description": "Special fragrant rice variety with soft texture and natural aroma.",
     "specs": {"Origin": "Vietnam", "Grade": "Special Fragrant", "Packaging": "25kg / 50kg bags"}},
    {"name": "Jasmine DT8 Aroma Rice (Super Premium)", "category": "Rice", "image": IMG["rice"], "moq": "1 × 20ft container", "lead_time": "2–4 weeks", "sample_available": True,
     "description": "Super premium DT8 aroma rice for high-end retail and hospitality.",
     "specs": {"Origin": "Vietnam", "Grade": "Super Premium", "Packaging": "25kg / 50kg bags"}},
    {"name": "Holcim Solido (Type IP, 40kg)", "category": "Cement", "image": IMG["cement"], "moq": "1,000 bags", "lead_time": "3–7 days", "sample_available": False,
     "description": "Premium Portland-pozzolan blended cement with high-performance formulation.",
     "specs": {"Type": "IP Portland-Pozzolan", "Net weight": "40 kg/bag", "Advantage": "7-Star Solido"}},
    {"name": "Holcim Excel (Premium Portland)", "category": "Cement", "image": IMG["cement"], "moq": "1,000 bags", "lead_time": "3–7 days", "sample_available": False,
     "description": "Premium Portland cement with admixture for general construction.",
     "specs": {"Type": "Portland with admixture", "Net weight": "40 kg/bag"}},
    {"name": "SCG Smart Cement (Type 1, 40kg)", "category": "Cement", "image": IMG["cement"], "moq": "1,000 bags", "lead_time": "1–2 weeks", "sample_available": False,
     "description": "Portland Cement Type 1 for structural reinforced concrete, developed for high strength.",
     "specs": {"Type": "Portland Type 1", "Net weight": "40 kg/bag", "Use": "Structural reinforced concrete"}},
    {"name": "Eagle Cement Advance", "category": "Cement", "image": IMG["cement"], "moq": "1,000 bags", "lead_time": "3–7 days", "sample_available": False,
     "description": "High early-strength cement for fast-track construction schedules.",
     "specs": {"Type": "Type IP", "Net weight": "40 kg/bag"}},
    {"name": "Refined Sugar (ICUMSA 45)", "category": "Sugar", "image": IMG["sugar"], "moq": "25 MT", "lead_time": "2–4 weeks", "sample_available": True,
     "description": "Premium refined white sugar for food manufacturing and retail distribution.",
     "specs": {"Grade": "ICUMSA 45", "Packaging": "50kg bags", "Origin": "Thailand / Philippines"}},
    {"name": "Industrial Diesel (Bulk)", "category": "Diesel", "image": IMG["diesel"], "moq": "10,000 liters", "lead_time": "3–10 days", "sample_available": False,
     "description": "Bulk industrial diesel supply with scheduled deliveries for sites and fleets.",
     "specs": {"Type": "Automotive / industrial diesel", "Delivery": "Tanker truck", "Terms": "Scheduled bulk supply"}},
    {"name": "Electrical & Mechanical Materials", "category": "Construction Materials", "image": IMG["construction"], "moq": "Per BOQ / purchase order", "lead_time": "1–3 weeks", "sample_available": False,
     "description": "Wires, cables, lighting and electro-mechanical supplies from partner brands (FSL, Orion, Philflex, Hypertech).",
     "specs": {"Scope": "Electrical / Mechanical / MEPFS", "Basis": "Supplied per project BOQ"}},
    {"name": "Deformed Rebar (Grade 40 / 60)", "category": "Steel & Rebars", "image": IMG["steel"], "moq": "10 MT", "lead_time": "1–2 weeks", "sample_available": False,
     "description": "Deformed steel rebars in standard commercial lengths, mill-certified.",
     "specs": {"Grades": "Grade 40 / Grade 60", "Lengths": "6m – 12m", "Sizes": "10mm – 32mm"}},
    {"name": "H-Beam / I-Beam", "category": "Steel & Rebars", "image": IMG["steel"], "moq": "5 MT", "lead_time": "1–3 weeks", "sample_available": False,
     "description": "Wide-flange structural beams for building and infrastructure frameworks.",
     "specs": {"Types": "H-Beam, I-Beam", "Standard": "ASTM / JIS", "Lengths": "6m – 12m"}},
    {"name": "Steel Sheet Pile", "category": "Steel & Rebars", "image": IMG["steel"], "moq": "5 MT", "lead_time": "2–4 weeks", "sample_available": False,
     "description": "Hot-rolled steel sheet piles for excavation, waterfront and earth-retention works.",
     "specs": {"Types": "Type II / III / IV", "Standard": "JIS A 5528"}},
    {"name": "Angle & Channel Steel", "category": "Steel & Rebars", "image": IMG["steel"], "moq": "5 MT", "lead_time": "1–2 weeks", "sample_available": False,
     "description": "Equal/unequal angle bars and channel bars for fabrication and structural use.",
     "specs": {"Types": "Angle bar, Channel bar", "Lengths": "6m standard"}},
    {"name": "G1 Gravel (Mindoro)", "category": "Aggregates", "image": IMG["aggregates"], "moq": "100 cu.m", "lead_time": "3–7 days", "sample_available": True,
     "description": "G1 crushed gravel from Mindoro quarries for structural concrete.",
     "specs": {"Source": "Mindoro", "Sizes": "G1, 3/4\"", "Delivery": "Barge / truck"}},
    {"name": "Vibro Sand 4mm (Zambales)", "category": "Aggregates", "image": IMG["aggregates"], "moq": "100 cu.m", "lead_time": "3–7 days", "sample_available": True,
     "description": "Vibro-processed sand from Zambales, washed and graded for concrete and plastering.",
     "specs": {"Source": "Zambales", "Size": "4mm", "Delivery": "Barge / truck"}},
    {"name": "Boulders (Mindoro)", "category": "Aggregates", "image": IMG["aggregates"], "moq": "100 cu.m", "lead_time": "5–10 days", "sample_available": False,
     "description": "Quarry boulders for riprap, slope protection and reclamation works.",
     "specs": {"Source": "Mindoro", "Class": "A / B / C"}},
    {"name": "White Sand & River Sand", "category": "Aggregates", "image": IMG["aggregates"], "moq": "100 cu.m", "lead_time": "3–7 days", "sample_available": True,
     "description": "White sand (Tarlac) and river sand (Lopez, Quezon) for finishing and masonry.",
     "specs": {"Sources": "Tarlac, Lopez Quezon", "Types": "White sand, river sand, S1-brown"}},
    {"name": "Medical Consumables Set", "category": "Medical Supplies", "image": IMG["medical"], "moq": "Per purchase order", "lead_time": "1–2 weeks", "sample_available": True,
     "description": "Hospital consumables: first aid kits, plasters, cotton wool, surgical masks, syringes, bandages and more.",
     "specs": {"Range": "Consumables & disposables", "Buyers": "Hospitals, clinics, LGUs"}},
    {"name": "Hospital & Diagnostic Equipment", "category": "Medical Supplies", "image": IMG["medical"], "moq": "Per unit / PO", "lead_time": "2–6 weeks", "sample_available": False,
     "description": "Stethoscopes, BP monitors, thermometers, examining tables, stretchers, oxygen therapy and general medical equipment.",
     "specs": {"Range": "Diagnostics to ward equipment", "Partner": "APSA UK LTD sourcing network"}},
    {"name": "Essential Supplies (Household & Janitorial)", "category": "Essential Supplies", "image": IMG["essentials"], "moq": "Per purchase order", "lead_time": "3–7 days", "sample_available": False,
     "description": "Household cleaning supplies, paper products and personal care items for offices and institutions.",
     "specs": {"Range": "Cleaning, paper, personal care", "Buyers": "Offices, schools, facilities"}},
    {"name": "Heavy Equipment (Sale & Rental Sourcing)", "category": "Heavy Equipment", "image": IMG["heavy"], "moq": "Per unit", "lead_time": "2–8 weeks", "sample_available": False,
     "description": "Excavators, loaders, bulldozers and other heavy machinery sourced for contractors and developers.",
     "specs": {"Options": "Brand new / refurbished", "Brands": "CAT and equivalents"}},
    {"name": "Container Vans (20ft / 40ft)", "category": "Heavy Equipment", "image": IMG["containers"], "moq": "1 unit", "lead_time": "1–2 weeks", "sample_available": False,
     "description": "Shipping container vans for storage, site offices and conversion, with partner Vantaztic Incorporated.",
     "specs": {"Sizes": "20ft / 40ft", "Condition": "New & used", "Mods": "Office / storage conversion"}},
    {"name": "Construction & Other Services", "category": "Services", "image": IMG["construction"], "moq": "Per project scope", "lead_time": "Per schedule", "sample_available": False,
     "description": "Specialized construction activities and allied services delivered with partner contractors.",
     "specs": {"Scope": "Specialized construction", "Basis": "Per project contract"}},
]


class ProductBody(BaseModel):
    name: str
    category: str
    description: str = ""
    specs: Dict[str, str] = {}
    moq: str = ""
    lead_time: str = ""
    sample_available: bool = False
    image: str = ""


@api_router.get("/products")
async def list_products(category: Optional[str] = None, search: Optional[str] = None):
    query: Dict[str, Any] = {}
    if category and category != "All":
        query["category"] = category
    if search:
        query["name"] = {"$regex": re.escape(search), "$options": "i"}
    products = await db.products.find(query, {"_id": 0}).sort("name", 1).to_list(500)
    return {"products": products, "categories": PRODUCT_CATEGORIES}


@api_router.post("/admin/products")
async def create_product(body: ProductBody, user=Depends(get_current_user)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, body: ProductBody, user=Depends(get_current_user)):
    res = await db.products.update_one({"id": product_id}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "ok"}


@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, user=Depends(get_current_user)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "ok"}


# ---------------------------------------------------------------- uploads
ALLOWED_EXT = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024


@api_router.post("/uploads")
async def upload_files(files: List[UploadFile] = File(...)):
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 files")
    results = []
    for f in files:
        ext = Path(f.filename or "").suffix.lower()
        if ext not in ALLOWED_EXT:
            raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")
        content = await f.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File exceeds 10MB limit")
        fname = f"{uuid.uuid4().hex}{ext}"
        (UPLOAD_DIR / fname).write_bytes(content)
        results.append({"name": f.filename, "url": f"/api/uploads/{fname}", "size": len(content)})
    return {"files": results}


# ---------------------------------------------------------------- inquiries
class ContactBody(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    company: str = ""
    email: EmailStr
    mobile: str = Field(min_length=7, max_length=20)
    preferred_contact: str = "Email"


class InquiryBody(BaseModel):
    category: str
    data: Dict[str, Any] = {}
    items: List[Dict[str, Any]] = []
    contact: ContactBody
    consent: bool
    attachments: List[Dict[str, Any]] = []
    website: str = ""  # honeypot


def gen_reference() -> str:
    return "HSI-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def sanitize_inquiry(doc: dict) -> dict:
    doc = {k: v for k, v in doc.items() if k != "_id"}
    doc.pop("website", None)
    return doc


@api_router.post("/inquiries")
async def create_inquiry(body: InquiryBody, request: Request):
    if body.website:  # honeypot filled → silently accept
        return {"reference": gen_reference(), "status": "received"}
    if body.category not in CATEGORY_LABELS:
        raise HTTPException(status_code=400, detail="Invalid category")
    if not body.consent:
        raise HTTPException(status_code=400, detail="Data privacy consent is required")
    now = datetime.now(timezone.utc).isoformat()
    flow = ORDER_FLOW if body.category == "order" else GEN_FLOW
    doc = {
        "id": str(uuid.uuid4()),
        "reference": gen_reference(),
        "category": body.category,
        "status": flow[0],
        "status_flow": flow,
        "data": body.data,
        "items": body.items,
        "contact": body.contact.model_dump(),
        "attachments": body.attachments[:5],
        "messages": [],
        "created_at": now,
        "updated_at": now,
    }
    doc["contact"]["email"] = doc["contact"]["email"].lower()
    await db.inquiries.insert_one(doc)
    try:
        await send_customer_confirmation(doc)
        await notify_new_inquiry(doc)
    except Exception as e:
        logger.error(f"Inquiry email error: {e}")
    return {"reference": doc["reference"], "status": "received"}


@api_router.get("/inquiries/track")
async def track_inquiry(ref: str, email: str):
    doc = await db.inquiries.find_one(
        {"reference": ref.strip().upper(), "contact.email": email.strip().lower()})
    if not doc:
        raise HTTPException(status_code=404, detail="No inquiry found for that reference and email.")
    return {"inquiry": sanitize_inquiry(doc)}


class CustomerMessageBody(BaseModel):
    email: EmailStr
    text: str = Field(min_length=1, max_length=4000)


@api_router.post("/inquiries/{ref}/message")
async def customer_message(ref: str, body: CustomerMessageBody):
    res = await db.inquiries.update_one(
        {"reference": ref.strip().upper(), "contact.email": body.email.lower()},
        {"$push": {"messages": {"from": "customer", "text": body.text[:4000],
                                "at": datetime.now(timezone.utc).isoformat()}},
         "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"status": "ok"}


@api_router.get("/inquiries/{ref}/rfq.pdf")
async def rfq_pdf(ref: str, email: str):
    doc = await db.inquiries.find_one(
        {"reference": ref.strip().upper(), "contact.email": email.strip().lower(), "category": "rfq"})
    if not doc:
        raise HTTPException(status_code=404, detail="RFQ not found")
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas as pdf_canvas
    buf = io.BytesIO()
    c = pdf_canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    c.setFillColorRGB(0.016, 0.086, 0.227)
    c.rect(0, h - 34 * mm, w, 34 * mm, fill=1, stroke=0)
    c.setFillColorRGB(0.992, 0.729, 0.357)
    c.setFont("Times-Bold", 20)
    c.drawString(18 * mm, h - 20 * mm, "H&SI — HLMC'S ENTERPRISE & SERVICES, INC.")
    c.setFont("Helvetica", 10)
    c.drawString(18 * mm, h - 27 * mm, "Request for Quotation — Summary")
    y = h - 48 * mm
    c.setFillColorRGB(0.043, 0.07, 0.125)
    c.setFont("Times-Bold", 14)
    c.drawString(18 * mm, y, f"RFQ Reference: {doc['reference']}")
    y -= 12 * mm
    c.setFont("Helvetica", 10)
    rows = [("Date submitted", doc["created_at"][:10]),
            ("Name", doc["contact"].get("full_name", "")),
            ("Company", doc["contact"].get("company", "")),
            ("Email", doc["contact"].get("email", "")),
            ("Mobile", doc["contact"].get("mobile", ""))]
    for k, v in doc.get("data", {}).items():
        if isinstance(v, (str, int, float)) and str(v).strip():
            rows.append((k.replace("_", " ").title(), str(v)))
    for k, v in rows:
        c.setFont("Helvetica-Bold", 9)
        c.drawString(18 * mm, y, f"{k}:")
        c.setFont("Helvetica", 10)
        for i, line in enumerate(str(v)[:90].split("\n")):
            c.drawString(62 * mm, y - i * 5 * mm, line)
        y -= max(1, len(str(v)[:90].split("\n"))) * 5 * mm + 3 * mm
        if y < 30 * mm:
            c.showPage()
            y = h - 25 * mm
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(18 * mm, 15 * mm, "This is a system-generated summary of your RFQ submission. Sourcing Strength. Supplying Progress.")
    c.save()
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename={doc['reference']}-RFQ.pdf"})


# ---------------------------------------------------------------- admin
@api_router.get("/admin/inquiries")
async def admin_list_inquiries(category: Optional[str] = None, status: Optional[str] = None,
                               q: Optional[str] = None, user=Depends(get_current_user)):
    query: Dict[str, Any] = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [{"reference": rx}, {"contact.full_name": rx},
                        {"contact.email": rx}, {"contact.company": rx}]
    docs = await db.inquiries.find(query).sort("created_at", -1).to_list(500)
    return {"inquiries": [sanitize_inquiry(d) for d in docs]}


@api_router.get("/admin/stats")
async def admin_stats(user=Depends(get_current_user)):
    total = await db.inquiries.count_documents({})
    by_cat = {c: await db.inquiries.count_documents({"category": c}) for c in CATEGORY_LABELS}
    new_count = await db.inquiries.count_documents({"status": "received"})
    products = await db.products.count_documents({})
    return {"total": total, "by_category": by_cat, "new": new_count, "products": products}


class ReplyBody(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


@api_router.post("/admin/inquiries/{inquiry_id}/reply")
async def admin_reply(inquiry_id: str, body: ReplyBody, user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    res = await db.inquiries.update_one(
        {"id": inquiry_id},
        {"$push": {"messages": {"from": "admin", "text": body.text[:4000], "at": now}},
         "$set": {"updated_at": now, "status": "responded" if True else "received"}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    doc = await db.inquiries.find_one({"id": inquiry_id})
    try:
        await send_reply_email(doc, body.text)
    except Exception as e:
        logger.error(f"Reply email error: {e}")
    return {"status": "ok"}


class StatusBody(BaseModel):
    status: str


@api_router.patch("/admin/inquiries/{inquiry_id}/status")
async def admin_update_status(inquiry_id: str, body: StatusBody, user=Depends(get_current_user)):
    doc = await db.inquiries.find_one({"id": inquiry_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    if body.status not in doc.get("status_flow", GEN_FLOW):
        raise HTTPException(status_code=400, detail="Invalid status for this inquiry type")
    await db.inquiries.update_one({"id": inquiry_id},
                                  {"$set": {"status": body.status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"status": "ok"}


@api_router.get("/admin/inquiries-export")
async def admin_export_csv(user=Depends(get_current_user)):
    docs = await db.inquiries.find({}).sort("created_at", -1).to_list(2000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Reference", "Date", "Category", "Status", "Name", "Company", "Email", "Mobile",
                     "Preferred Contact", "Items", "Details"])
    for d in docs:
        c = d.get("contact", {})
        writer.writerow([d.get("reference"), d.get("created_at", "")[:19],
                         CATEGORY_LABELS.get(d.get("category"), d.get("category")), d.get("status"),
                         c.get("full_name"), c.get("company"), c.get("email"), c.get("mobile"),
                         c.get("preferred_contact"),
                         "; ".join(i.get("name", "") for i in d.get("items", [])),
                         json.dumps(d.get("data", {}), ensure_ascii=False)[:500]])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=hesi-inquiries.csv"})


@api_router.get("/")
async def root():
    return {"message": "H&SI API"}


# ---------------------------------------------------------------- startup
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.inquiries.create_index("reference", unique=True)
    await db.inquiries.create_index("contact.email")
    await db.products.create_index("category")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"_id": str(uuid.uuid4()), "email": admin_email, "password_hash": hash_password(admin_password),
                                   "name": "H&SI Admin", "role": "admin",
                                   "created_at": datetime.now(timezone.utc).isoformat()})
    elif not isinstance(existing.get("_id"), str) or not verify_password(admin_password, existing["password_hash"]):
        await db.users.delete_one({"email": admin_email})
        await db.users.insert_one({"_id": str(uuid.uuid4()), "email": admin_email, "password_hash": hash_password(admin_password),
                                   "name": "H&SI Admin", "role": "admin",
                                   "created_at": datetime.now(timezone.utc).isoformat()})

    if await db.products.count_documents({}) == 0:
        now = datetime.now(timezone.utc).isoformat()
        await db.products.insert_many([{**p, "id": str(uuid.uuid4()), "created_at": now} for p in SEED_PRODUCTS])
    logger.info("Startup seed complete")


app.include_router(api_router)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
