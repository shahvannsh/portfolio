# Make the spoken greetings sound better

The mascot's greetings are spoken in a voice chosen by the visitor's phone or computer. Two things make that sound good.

## 1. Already done: it picks the best voice available
For each language the page now chooses the **most natural voice the device has** (for example Microsoft "Natural" voices
on Edge/Windows, Google voices on Android, Siri / Enhanced voices on iPhone), and avoids robotic ones. English prefers
Indian English. It speaks a little slower, which is clearer for a greeting. Voices load a moment after the page opens, so
it now waits for them instead of staying silent. If a device has **no** voice for a language, the page says
"No Marathi voice on this device" instead of staying silent without explanation.

Limits of device voices: Marathi, Gujarati and especially Sanskrit voices are missing on many phones, and quality varies
by phone. Nothing in code can fix that, which is why step 2 exists.

## 2. Best sound: use your own voice (recommended)
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
