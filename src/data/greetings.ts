/** Friendly phrases in every language listed on the resume. */
export type Phrase = { text: string; meaning: string };
export type Language = { language: string; lang: string; phrases: readonly Phrase[] };

const KINDS = [
  "Hello",
  "How are you?",
  "Welcome",
  "Thank you",
  "Nice to meet you",
  "Good luck",
  "See you soon",
  "Good night",
] as const;

const make = (language: string, lang: string, texts: readonly string[]): Language => ({
  language,
  lang,
  phrases: texts.map((text, i) => ({ text, meaning: KINDS[i] })),
});

// Order follows KINDS.
export const LANGUAGES: readonly Language[] = [
  make("English", "en", ["Hello", "How are you?", "Welcome", "Thank you", "Nice to meet you", "Good luck", "See you soon", "Good night"]),
  make("Hindi", "hi", ["नमस्ते", "आप कैसे हैं?", "स्वागत है", "धन्यवाद", "आपसे मिलकर खुशी हुई", "शुभकामनाएँ", "जल्द मिलते हैं", "शुभ रात्रि"]),
  make("Marathi", "mr", ["नमस्कार", "तुम्ही कसे आहात?", "स्वागत आहे", "धन्यवाद", "तुम्हाला भेटून आनंद झाला", "शुभेच्छा", "लवकरच भेटू", "शुभ रात्री"]),
  make("Gujarati", "gu", ["નમસ્તે", "તમે કેમ છો?", "સ્વાગત છે", "આભાર", "તમને મળીને આનંદ થયો", "શુભેચ્છા", "જલ્દી મળીશું", "શુભ રાત્રિ"]),
  make("German", "de", ["Hallo", "Wie geht's?", "Willkommen", "Danke", "Freut mich", "Viel Glück", "Bis bald", "Gute Nacht"]),
  make("Japanese", "ja", ["こんにちは", "お元気ですか？", "ようこそ", "ありがとうございます", "はじめまして", "がんばってください", "またね", "おやすみなさい"]),
  make("Sanskrit", "sa", ["नमो नमः", "भवान् कथम् अस्ति?", "स्वागतम्", "धन्यवादः", "भवन्तं दृष्ट्वा हर्षोऽभवत्", "शुभं भवतु", "पुनः मिलामः", "शुभरात्रिः"]),
];

/** One full loop: every language says each phrase in turn (hello in all seven, then how are you, ...). */
export const GREETING_STEPS = LANGUAGES.length * KINDS.length;

export type Greeting = { language: string; lang: string; text: string; meaning: string };

export function greetingAt(step: number): Greeting {
  const language = LANGUAGES[step % LANGUAGES.length];
  const phrase = language.phrases[Math.floor(step / LANGUAGES.length) % KINDS.length];
  return { language: language.language, lang: language.lang, ...phrase };
}

/** The greetings to rotate through: festival wishes first (when there's an occasion today), then the usual loop. */
export function greetingSequence(festival: { phrases: readonly Greeting[] } | null, hello: string): Greeting[] {
  const usual = Array.from({ length: GREETING_STEPS }, (_, step) => {
    const greeting = greetingAt(step);
    return step === 0 ? { ...greeting, text: hello } : greeting;
  });
  return festival ? [...festival.phrases, ...usual] : usual;
}
