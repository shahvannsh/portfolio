#!/usr/bin/env python3
"""Turns your own voice recordings of the greetings into web-ready clips for the /card page.

  npm run greetings:list      writes recordings/greetings/SCRIPT.md: every file name and the words to say
  npm run greetings           processes the recordings in recordings/greetings/ into public/greetings/

Name each recording <language code>-<phrase>.<any audio extension>, for example hi-hello.m4a, mr-welcome.mp3,
ja-thank-you.wav (SCRIPT.md lists them all). With ffmpeg installed, clips are trimmed, volume-matched and converted to
small mp3 files; without it they're copied as they are. Missing clips are fine: the page falls back to the device voice.

Options: --input DIR (default recordings/greetings)   --root DIR (the project folder, for testing)
"""
import argparse, json, re, shutil, subprocess, sys
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--list", action="store_true", help="write the recording script and exit")
parser.add_argument("--input", default=None)
parser.add_argument("--root", default=str(Path(__file__).resolve().parent.parent))
args = parser.parse_args()

ROOT = Path(args.root)
INPUT = Path(args.input) if args.input else ROOT / "recordings/greetings"
OUT = ROOT / "public/greetings"
EXTENSIONS = {".mp3", ".m4a", ".wav", ".ogg", ".aac", ".webm", ".flac", ".opus", ".mp4"}

def slugify(text):  # must match slugify() in src/lib/voices.ts
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")

def load_phrases():
    ts = (ROOT / "src/data/greetings.ts").read_text(encoding="utf-8")
    kinds = [slugify(k) for k in re.findall(r'"([^"]+)"', re.search(r"const KINDS = \[(.*?)\] as const", ts, re.S).group(1))]
    languages = {}
    for m in re.finditer(r'make\("([^"]+)", "([^"]+)", \[(.*?)\]\),', ts, re.S):
        name, code, body = m.groups()
        texts = re.findall(r'"((?:[^"\\]|\\.)*)"', body)
        languages[code] = (name, dict(zip(kinds, texts)))
    return languages, kinds

languages, kinds = load_phrases()
known = {(code, slug) for code, (_, phrases) in languages.items() for slug in phrases}

if args.list:
    INPUT.mkdir(parents=True, exist_ok=True)
    lines = ["# Greeting recording script", "",
             "Record each phrase clearly, about 1-3 seconds, in a quiet room, then save it with the file name shown.",
             "Start with the **hello** row (7 clips): they're heard most. Any audio format works (m4a from a phone is fine).", ""]
    for slug in kinds:
        lines += [f"## {slug}", "", "| File name | Say |", "| --- | --- |"]
        lines += [f"| `{code}-{slug}.m4a` | {phrases[slug]} ({name}) |" for code, (name, phrases) in languages.items() if slug in phrases]
        lines.append("")
    (INPUT / "SCRIPT.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {INPUT / 'SCRIPT.md'}")
    sys.exit(0)

if not INPUT.exists():
    sys.exit(f"No recordings folder at {INPUT}. Run `npm run greetings:list` first, then add your recordings.")

OUT.mkdir(parents=True, exist_ok=True)
ffmpeg = shutil.which("ffmpeg")
if not ffmpeg:
    print("ffmpeg not found: copying clips as they are (install ffmpeg for trimming and volume matching).")

done = 0
for source in sorted(INPUT.iterdir()):
    if source.suffix.lower() not in EXTENSIONS:
        continue
    code, _, slug = source.stem.lower().partition("-")
    if (code, slug) not in known:
        print(f"  skipped {source.name}: not a known name (expected e.g. hi-hello.m4a; see SCRIPT.md)")
        continue
    if ffmpeg:
        target = OUT / f"{code}-{slug}.mp3"
        command = [ffmpeg, "-y", "-loglevel", "error", "-i", str(source), "-af",
                   "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=1:stop_duration=0.4:stop_threshold=-45dB,loudnorm=I=-18:TP=-2:LRA=7",
                   "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "80k", str(target)]
        if subprocess.run(command).returncode != 0:
            print(f"  FAILED {source.name}")
            continue
    else:
        target = OUT / f"{code}-{slug}{source.suffix.lower()}"
        shutil.copyfile(source, target)
    print(f"  ok  {source.name} -> {target.name}")
    done += 1

# Rebuild the manifest from every clip in public/greetings so runs add up.
manifest = {}
for clip in sorted(OUT.iterdir()):
    if clip.suffix.lower() in EXTENSIONS:
        code, _, slug = clip.stem.partition("-")
        if (code, slug) in known:
            manifest.setdefault(code, {})[slug] = clip.name
(OUT / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
total = sum(len(v) for v in manifest.values())
print(f"Processed {done} clip(s). {total} clip(s) now listed in public/greetings/manifest.json. Commit public/greetings/.")
