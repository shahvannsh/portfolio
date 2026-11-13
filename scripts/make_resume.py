"""Builds public/Vannsh-Shah-Resume.pdf from src/data/resume.json (the single source of truth for the resume).

Run from the repo root:  npm run resume        (needs: pip install reportlab pillow)
A GitHub Action (.github/workflows/resume.yml) does this automatically whenever resume.json changes.
"""
import io, json
from pathlib import Path
from xml.sax.saxutils import escape
from PIL import Image, ImageDraw
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import Image as RLImage, SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "src/data/resume.json").read_text(encoding="utf-8"))
OUT = ROOT / "public/Vannsh-Shah-Resume.pdf"

ORANGE = HexColor("#C2661A"); INK = HexColor("#1B1B1B"); GRAY = HexColor("#555555"); LIGHT = HexColor("#6B6B6B")
S = {
    "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=24, leading=28, alignment=TA_CENTER, textColor=INK),
    "sub": ParagraphStyle("sub", fontName="Helvetica-Bold", fontSize=10.5, leading=14, alignment=TA_CENTER, textColor=ORANGE, spaceBefore=3),
    "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=9, leading=12.5, alignment=TA_CENTER, textColor=GRAY),
    "h": ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=ORANGE, spaceBefore=9, spaceAfter=2),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.3, leading=13, textColor=INK),
    "title": ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=9.8, leading=12.5, textColor=INK),
    "date": ParagraphStyle("date", fontName="Helvetica-Oblique", fontSize=8.6, leading=12, textColor=LIGHT, alignment=2),
    "meta": ParagraphStyle("meta", fontName="Helvetica-Oblique", fontSize=8.6, leading=11.5, textColor=GRAY, leftIndent=12),
    "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=9.3, leading=12.4, textColor=INK, leftIndent=26, bulletIndent=14, spaceBefore=1.5),
    "skill": ParagraphStyle("skill", fontName="Helvetica", fontSize=9.3, leading=13, textColor=INK, spaceBefore=1),
}
E = escape
def link(url, text): return f'<a href="{E(url)}" color="#555555">{E(text)}</a>'
def section(name): return [Paragraph(E(name), S["h"]), HRFlowable(width="100%", thickness=0.8, color=ORANGE, spaceAfter=5)]
def head(title, date):
    t = Table([[Paragraph(E(title), S["title"]), Paragraph(E(date), S["date"])]], colWidths=[512 - 130, 130], hAlign="LEFT")
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                           ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    return t
def bullet_text(b):
    return E(b) if isinstance(b, str) else E(b["text"]) + link(b["url"], b["label"])
def entry(item, gap=5):
    flow = [head(item["title"], item["date"])]
    if item.get("meta"): flow.append(Paragraph(E(item["meta"]), S["meta"]))
    flow += [Paragraph(bullet_text(b), S["bullet"], bulletText="•") for b in item.get("bullets", [])]
    flow.append(Spacer(1, gap))
    return KeepTogether(flow)

def circular_photo():
    img = Image.open(ROOT / "src/assets/avatar.jpg").convert("RGB").crop((215, 150, 775, 710)).resize((420, 420), Image.LANCZOS)
    size, ring = 420, 10
    mask = Image.new("L", (size * 4, size * 4), 0); ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0)); out.paste(img, (0, 0), mask.resize((size, size), Image.LANCZOS))
    rm = Image.new("L", (size * 4, size * 4), 0); d = ImageDraw.Draw(rm)
    d.ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255); d.ellipse((ring * 4, ring * 4, size * 4 - 1 - ring * 4, size * 4 - 1 - ring * 4), fill=0)
    out.paste((194, 102, 26, 255), (0, 0), rm.resize((size, size), Image.LANCZOS))
    buf = io.BytesIO(); out.save(buf, "PNG"); buf.seek(0)
    return RLImage(buf, 64, 64)

r = DATA
doc = SimpleDocTemplate(str(OUT), pagesize=letter, leftMargin=50, rightMargin=50, topMargin=34, bottomMargin=30,
                        title=f"{r['name'].title()} - Resume", author=r["name"].title(), subject="Resume")
f = []
head_rows = [Paragraph(E(r["name"]), S["name"]), Paragraph(E(r["headline"]), S["sub"]),
             Paragraph(f'{E(r["location"])} &nbsp;|&nbsp; {E(r["phone"])} &nbsp;|&nbsp; ' + link("mailto:" + r["email"], r["email"]), S["contact"])]
header = Table([["", head_rows, circular_photo()]], colWidths=[64, 512 - 128, 64], hAlign="LEFT")
header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ALIGN", (2, 0), (2, 0), "RIGHT"),
                            ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                            ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
f += [header, Spacer(1, 3), Paragraph(" &nbsp;|&nbsp; ".join(link(l["url"], l["label"]) for l in r["links"]), S["contact"])]

f += section("SUMMARY") + [Paragraph(E(r["summary"]), S["body"])]
f += section("EXPERIENCE") + [entry(x) for x in r["experience"]]
f += section("LEADERSHIP & COMMUNITY") + [entry(x) for x in r["leadership"]]
f += section("EDUCATION")
f.append(KeepTogether([x for e in r["education"] for x in (head(e["title"], e["date"]), Spacer(1, 3))] + [Spacer(1, 4)]))
f += section("PROJECTS") + [entry(x) for x in r["projects"]]
f += section("SKILLS") + [Paragraph(f'<b>{E(s["label"])}:</b> {E(s["text"])}', S["skill"]) for s in r["skills"]]
c = r["certifications"]
f += section(f'CERTIFICATIONS ({c["count"]})')
f += [Paragraph(f'<b>{E(i["label"])}:</b> {E(i["text"])}', S["bullet"], bulletText="•") for i in c["items"]]
f += [Spacer(1, 4), Paragraph(f'<b>In Progress:</b> {E(c["inProgress"])}', S["skill"])]

# keep every section heading and its rule together with the first item below it
grouped, i = [], 0
while i < len(f):
    item = f[i]
    if isinstance(item, Paragraph) and item.style.name == "h" and i + 2 < len(f):
        nxt = f[i + 2]
        content = list(nxt._content) if isinstance(nxt, KeepTogether) else [nxt]
        grouped.append(KeepTogether([f[i], f[i + 1]] + content)); i += 3
    else:
        grouped.append(item); i += 1
doc.build(grouped)
print(f"Built {OUT.relative_to(ROOT)}")
