import { contactLinks, facts, STARTER_QUESTIONS } from "../data/knowledge";
import type { Link } from "../data/knowledge";

export { STARTER_QUESTIONS };

export type Reply = {
  id: string;
  text: string;
  links?: Link[];
  suggestions: string[];
  /** False when the question is outside the portfolio and resume. */
  known: boolean;
};

export const WELCOME =
  "Hi! 👋 Ask me anything about my career, projects, skills or resume. I only answer from my portfolio and resume.";

const STOP = new Set(
  "a an the is are was were be been do does did you your yours i me my we our tell about what which who whom how can could would should will of in on at to for with and or please some any give show let us it this that there have has had so if kind much very really also just".split(" "),
);

/** Lowercase, and join hyphenated / dotted words so "E-Cell" and "B.Tech" become "ecell" and "btech". */
export function normalize(text: string) {
  return text.toLowerCase().replace(/[-.](?=[a-z0-9])/g, "");
}

function tokenize(text: string) {
  return normalize(text).match(/[a-z0-9+#]+/g) ?? [];
}

function stem(word: string) {
  let w = word;
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  if (w.length > 7 && w.endsWith("ship")) w = w.slice(0, -4);
  return w.length > 7 ? w.slice(0, 7) : w;
}

type Compiled = { words: Map<string, number>; phrases: { stems: string[]; weight: number }[] };

const compiled: Compiled[] = facts.map((fact) => {
  const words = new Map<string, number>();
  const phrases: Compiled["phrases"] = [];
  for (const entry of fact.keywords) {
    const [raw, weightText] = entry.split("^");
    const weight = weightText ? Number(weightText) : 2;
    const tokens = tokenize(raw).map(stem);
    if (tokens.length === 1) words.set(tokens[0], Math.max(words.get(tokens[0]) ?? 0, weight));
    else if (tokens.length > 1) phrases.push({ stems: tokens, weight });
  }
  return { words, phrases };
});

function containsRun(haystack: string[], needle: string[]) {
  for (let i = 0; i + needle.length <= haystack.length; i += 1) {
    if (needle.every((word, j) => haystack[i + j] === word)) return true;
  }
  return false;
}

// Questions that read like general knowledge ("what is AWS?", "how to learn Python") must not be answered
// with a fact about Vannsh just because they share a keyword. They need to be about him.
const OWNER = /\b(you|your|yours|yourself|vannsh|he|his|him)\b/;
const EXPLAINER =
  /^(what is|what are|what's|whats|who is|who are|who's|who won|who wins|who will win|who is winning|explain|define|how to|how do|how does|how is|how are|why is|why are|why do|why does|meaning of|difference between)\b/;
const OFF_TOPIC = /\b(advice|recommend|suggest|translate|joke|poem|story|news|stock|lyrics|tips|tutorial|best way)\b/;
const NEEDS_OWNER = new Set([
  "skills", "skills-ai", "skills-db", "skills-prog", "certifications", "location", "spoken", "passions",
  "education", "availability", "hackathon", "internship", "ambassador",
]);

const FALLBACK_SUGGESTIONS = ["Tell me about yourself", "What are your skills?", "What's your work experience?"];

function reply(id: string, text: string, suggestions: string[], known = true, links?: Link[]): Reply {
  return { id, text, suggestions, known, links };
}

/** Answers a question using only the portfolio and resume knowledge base. */
export function ask(question: string): Reply {
  const text = question.trim().slice(0, 300);
  const normalized = normalize(text);
  const rawTokens = tokenize(text);
  const short = rawTokens.length <= 4;

  if (short && /^(hi+|hello+|hey+|hola|yo|namaste|good (morning|afternoon|evening)|sup)\b/.test(normalized)) {
    return reply("greeting", "Hi there! 👋 What would you like to know about my career, projects or skills?", STARTER_QUESTIONS.slice(0, 4));
  }
  if (short && /\b(thanks|thank you|thx|ty|awesome|great|cool|nice)\b/.test(normalized)) {
    return reply("thanks", "You're welcome! Ask me anything else about my work, or message me on WhatsApp.", FALLBACK_SUGGESTIONS, true, contactLinks.slice(0, 1));
  }
  if (/\b(bye|goodbye|see you|cya)\b/.test(normalized)) {
    return reply("bye", "Bye for now! Thanks for stopping by. 👋", FALLBACK_SUGGESTIONS);
  }
  if (/(\bwho are you\b|\bwhat are you\s*[?!.]*$|\bare you (a |an )?(bot|ai|real|human|robot|chatgpt|claude|person)\b|\byour name\b)/.test(normalized)) {
    return reply(
      "identity",
      "I'm Vannsh Shah's mascot, an automated Q&A bot that speaks on his behalf. I'm not a person or a general-purpose AI. I only know what's in his portfolio and resume.",
      FALLBACK_SUGGESTIONS,
    );
  }
  if (/\b(help|what can you (do|answer)|how does this work)\b/.test(normalized)) {
    return reply("help", "I can answer questions about my career, experience, projects, skills, certifications, education and how to contact me. Try one of these:", STARTER_QUESTIONS.slice(0, 4));
  }

  const stems = rawTokens.map(stem);
  const content = new Set(rawTokens.filter((w) => !STOP.has(w)).map(stem));

  let best = -1;
  let bestScore = 0;
  compiled.forEach((c, index) => {
    let score = 0;
    content.forEach((word) => {
      score += c.words.get(word) ?? 0;
    });
    for (const phrase of c.phrases) {
      if (containsRun(stems, phrase.stems)) score += phrase.weight;
    }
    if (score > bestScore) {
      best = index;
      bestScore = score;
    }
  });

  if (best < 0 || bestScore < 2) {
    return reply(
      "unknown",
      "That's outside what I know. I can only answer questions about my portfolio and resume, like my career, projects, skills, education or how to reach me. Try one of these:",
      FALLBACK_SUGGESTIONS,
      false,
    );
  }

  const fact = facts[best];
  const aboutHim = OWNER.test(normalized);
  if (!aboutHim && (OFF_TOPIC.test(normalized) || (EXPLAINER.test(normalized) && NEEDS_OWNER.has(fact.id)))) {
    return reply(
      "unknown",
      "That's outside what I know. I can only answer questions about my portfolio and resume, like my career, projects, skills, education or how to reach me. Try one of these:",
      FALLBACK_SUGGESTIONS,
      false,
    );
  }
  return reply(fact.id, fact.answer, fact.next ?? FALLBACK_SUGGESTIONS, true, fact.links);
}
