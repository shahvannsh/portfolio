"""Regenerates public/intro.vtt (video captions), public/contact.vcf (with photo) and public/card-qr.svg.

Run from the repo root:  python3 scripts/make_assets.py     (needs: pip install reportlab pillow)
"""
import base64, io, textwrap
from pathlib import Path
from PIL import Image
from reportlab.graphics import renderSVG
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

# ---- 1. Captions for the intro video: same lines and timings as the recording ----
LINES = [
    ("Hi! I'm Vannsh Shah, a computer science engineer from Pune, India.", 0.55, 4.97),
    ("I love building with AI, machine learning, and full-stack development.", 5.72, 10.48),
    ("This summer I worked as an AI and machine learning intern at Nova Techset, using Python, deep learning, and PostgreSQL.", 10.78, 18.68),
    ("I also completed a Campus Ambassador internship with E-Cell, IIT Bombay.", 19.48, 23.97),
    ("I've coordinated tech events like Dishayam and Euraka 2026, and prototyped a migraine relief wearable at a twenty-four hour national hackathon.", 24.48, 33.50),
    ("My projects include CareerConnecting, Chotu, my own AI academic assistant, and DocParserEnvs, a reinforcement learning environment.", 34.16, 40.04),
    ("I also mentor school students in Python and Canva.", 40.59, 45.83),
    ("Scroll down to explore my work, or reach out from the contact section. Thanks for visiting!", 46.28, 52.85),
]

def stamp(t):
    h, rest = divmod(t, 3600); m, s = divmod(rest, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"

cues = []
for text, start, end in LINES:
    chunks = textwrap.wrap(text, 46)               # short lines read better as captions
    total = sum(len(c) for c in chunks); t = start
    for c in chunks:
        d = (end - start) * len(c) / total
        cues.append((t, t + d, c)); t += d
vtt = "WEBVTT\n\n" + "\n\n".join(f"{stamp(a)} --> {stamp(b)}\n{c}" for a, b, c in cues) + "\n"
(PUBLIC / "intro.vtt").write_text(vtt, encoding="utf-8")

# ---- 2. Contact card with photo, title and links ----
img = Image.open(ROOT / "src/assets/avatar.jpg").convert("RGB").crop((215, 150, 775, 710)).resize((256, 256), Image.LANCZOS)
buf = io.BytesIO(); img.save(buf, "JPEG", quality=82, optimize=True)
photo = base64.b64encode(buf.getvalue()).decode()

def fold(line):                                    # vCard 3.0: fold at 75 characters with CRLF + space
    out, first = [], True
    while len(line) > 75:
        out.append(line[:75] if first else " " + line[:74]); line = line[75:] if first else line[74:]; first = False
    out.append(line if first else " " + line)
    return "\r\n".join(out)

card = [
    "BEGIN:VCARD", "VERSION:3.0", "FN:Vannsh Shah", "N:Shah;Vannsh;;;",
    "TITLE:Computer Science Engineer | AI/ML & Full-Stack Development",
    "TEL;TYPE=CELL:+918668995892", "EMAIL;TYPE=INTERNET:shahvannsh@gmail.com",
    "URL:https://portfolio-mu-ruby-37.vercel.app/",
    "URL;TYPE=LinkedIn:https://linkedin.com/in/vannsh-shah-67271a309",
    "URL;TYPE=GitHub:https://github.com/shahvannsh",
    "URL;TYPE=Instagram:https://instagram.com/vannsh_shah_2006",
    "ADR;TYPE=HOME:;;;Pune;Maharashtra;;India",
    "NOTE:Open to ML/AI internships\\, jobs and freelance work. Best reached on WhatsApp or email.",
    "PHOTO;ENCODING=b;TYPE=JPEG:" + photo, "END:VCARD",
]
(PUBLIC / "contact.vcf").write_bytes(("\r\n".join(fold(l) for l in card) + "\r\n").encode("utf-8"))

# ---- 3. QR code for the card (static SVG, no runtime library needed) ----
URL = "https://portfolio-mu-ruby-37.vercel.app/card?utm_source=qr&utm_medium=card"
qr = QrCodeWidget(URL, barLevel="M")
x0, y0, x1, y1 = qr.getBounds()
size = 200
drawing = Drawing(size, size, transform=[size / (x1 - x0), 0, 0, size / (y1 - y0), 0, 0])
drawing.add(qr)
(PUBLIC / "card-qr.svg").write_text(renderSVG.drawToString(drawing), encoding="utf-8")
print("Wrote intro.vtt, contact.vcf and card-qr.svg to public/")
