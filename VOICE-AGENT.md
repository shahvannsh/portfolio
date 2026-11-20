# Talk to the mascot (free voice agent)

Open **Ask me**, tap the **mic**, and ask a question out loud. The mascot answers in writing and **speaks the answer**, then
listens for your next question, like a phone call, until you tap stop (or stay quiet twice).

It costs nothing, needs no account, has no minute limit, and adds no outside scripts to the site, so the security rules
stay strict.

## How it works
1. **Hearing you:** the browser's built-in speech recognition turns your voice into text.
2. **Thinking:** the same chatbot as the text chat answers from your portfolio and resume (and the optional AI fallback, if switched on).
3. **Replying:** the answer is shortened to its first few sentences, cleaned of emoji and links, and spoken with the most natural voice on the visitor's device.
4. **Looping:** after it finishes speaking it listens again. It stops after two silences, on any error, when you tap stop, or when you close the chat.

## What to know
| Topic | Details |
| --- | --- |
| Browsers | Chrome, Edge and Safari (including iPhone) can listen. Firefox can't, so the mic simply doesn't appear there and the text chat works as before. |
| Privacy | The browser's own speech service hears the audio (Chrome sends it to Google, Safari to Apple). Nothing is recorded or stored by your site. Only the text of the question reaches your server, and only if the optional AI fallback is on. A short note under the chat says so. |
| Microphone permission | The browser asks the first time. The site's security headers allow the microphone on its own pages only (`Permissions-Policy: microphone=(self)`), never in embedded frames. If it's blocked, the chat says how to allow it. |
| Languages | Out of the box the chatbot understands **English questions** (spoken or typed), with Indian-English recognition. To ask in **Hindi, Marathi, Gujarati, German or Japanese**, switch on the AI fallback (`VITE_AI_CHAT=true` plus `ANTHROPIC_API_KEY`, see `.env.example`): a language picker appears next to the mic and answers come back in the same language. |
| Voice of the replies | Answers are different every time, so they use the device's voices (the clips from `npm run greetings:generate` are only for the fixed greetings). If a device has no voice for the answer's language, it stays quiet rather than reading it wrongly. |
| Accuracy | Recognition is good for clear speech and Indian English in Chrome, but it isn't perfect. You can always see what it heard in the box and correct it by typing. |

## Why not Wispr Flow or ElevenLabs?
| | What it is | Why it doesn't fit a public portfolio |
| --- | --- | --- |
| **Wispr Flow** | A dictation app that types what you say into other apps | It only turns speech into text. It doesn't answer, and it isn't a widget you can put on a website (its developer API is aimed at businesses). |
| **ElevenLabs Agents** | A hosted voice-agent platform with very natural voices | The free plan is about 15 minutes a month, so a handful of visitors would use it up, and the free plan is reported not to include a commercial licence. Beyond that it's paid per minute. It also needs a third-party script on your page, which means loosening the site's security rules. |
| **This built-in agent** | Browser speech-to-text, your own chatbot, device voices | Free and private, with the trade-off that the replies sound like the visitor's device voice rather than a studio voice. |

Plans change often, so check ElevenLabs' current pricing page before deciding. If you later want studio-quality replies, the
clean upgrade is a **server function that turns the answer text into audio with a TTS service** (the same kind of voices
as `npm run greetings:generate`), played in the chat. That keeps the strict security rules and adds a small cost per
reply. Tell me if you want it.
