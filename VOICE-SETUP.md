# Make the spoken greetings sound better

The mascot's greetings are spoken in a voice chosen by the visitor's phone or computer. Two things make that sound good.

## 1. Already done: it picks the best voice available
For each language the page now chooses the **most natural voice the device has** (for example Microsoft "Natural" voices
on Edge/Windows, Google voices on Android, Siri / Enhanced voices on iPhone), and avoids robotic ones. English prefers
Indian English. It speaks a little slower, which is clearer for a greeting. Voices load a moment after the page opens, so
it now waits for them instead of staying silent. If a device has **no** voice for a language, the page says
"No Marathi voice on this device" instead of staying silent without explanation.

Limits of device voices: Marathi, Gujarati and especially Sanskrit voices are missing on many phones, and quality varies
by phone. Nothing in the page itself can fix that, which is why steps 2 and 3 exist.

## 2. Fill the gaps automatically with a cloud voice (new)
Phones often have no Marathi, Gujarati or Sanskrit voice at all. This step creates real audio clips of **every
greeting in all 7 languages**, once, on your computer. The page plays those clips on every phone, so the language is
never missing again. Hindi, Marathi, Gujarati, English, German and Japanese get proper neural voices. **Sanskrit** has no
text-to-speech voice anywhere, so a Hindi voice reads it (understandable, but record it yourself for the best result).

Pick **one** service and get a key (both have a free allowance that is far more than these ~60 short phrases need, but
check the provider's current limits and pricing):

**Google Cloud Text-to-Speech**
1. In <https://console.cloud.google.com> create (or pick) a project and **enable "Cloud Text-to-Speech API"**.
2. APIs & Services → Credentials → **Create credentials → API key**. Restrict the key to the Text-to-Speech API.
3. Run (Mac/Linux): `GOOGLE_TTS_API_KEY=your-key npm run greetings:generate`
   Windows PowerShell: `$env:GOOGLE_TTS_API_KEY="your-key"; npm run greetings:generate`

**Microsoft Azure Speech** (alternative)
1. In <https://portal.azure.com> create a **Speech** resource (free F0 plan) and copy its **Key** and **Region**.
2. Run: `AZURE_SPEECH_KEY=your-key AZURE_SPEECH_REGION=centralindia npm run greetings:generate`
   (PowerShell: `$env:AZURE_SPEECH_KEY="..."; $env:AZURE_SPEECH_REGION="centralindia"; npm run greetings:generate`)

Then commit `public/greetings/` and deploy. Notes:
- The key stays on your computer only. Never paste it into code or commit it. Delete or rotate it afterwards if you like.
- Only the greeting phrases are sent to the service. Nothing personal.
- Only some languages? Add `--languages mr,gu,sa`. Only some phrases? Add `--kinds hello,welcome`.
- Clips you recorded yourself are **never overwritten** (use `--force` to replace them). Running it again skips what exists.
- If Google rejects a voice name it tries the next best one automatically. See what's available with
  `npm run greetings:generate -- --list-voices mr`.
- It needs Node 22+ and, for the final conversion step, Python and ffmpeg (without them the clips are still created;
  run `npm run greetings` later, or the raw mp3 files work as they are).

## 3. Best sound of all: use your own voice (optional)
Recorded clips always win over device voices, sound the same on every phone, and work for languages phones don't have.

1. Run `npm run greetings:list`. It writes `recordings/greetings/SCRIPT.md`: every file name and the words to say.
2. Record the clips on your phone's voice recorder (quiet room, 1-3 seconds each, speak clearly). Save them in
   `recordings/greetings/` with the names from the script, for example `hi-hello.m4a`, `mr-hello.m4a`, `gu-welcome.m4a`.
3. **Start with the 7 "hello" clips** (English, Hindi, Marathi, Gujarati, German, Japanese, Sanskrit): they're heard most.
   You can add the rest later, and any clip you skip falls back to the device voice.
4. Run `npm run greetings`. It trims the silence, evens out the volume, converts each clip to a small mp3 (needs
   ffmpeg; without it the files are copied as they are) and updates `public/greetings/manifest.json`.
5. Commit `public/greetings/` and deploy. Raw recordings stay on your computer (`recordings/` is git-ignored).

You don't need to speak every language yourself: ask a family member or friend who speaks it to record the line.

## Check it
On `/card`, tap **Hear it** in the mascot's bubble. Each greeting plays in turn. If a language is silent, either record
that clip or the device has no voice for it.
