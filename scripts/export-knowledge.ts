// Writes api/_knowledge.json from src/data/knowledge.ts so the optional AI endpoint answers from the same facts.
// Run with: npm run export-knowledge   (and again whenever you edit knowledge.ts or content.ts)
import { writeFileSync } from "node:fs";
import { facts } from "../src/data/knowledge.ts";

const out = new URL("../api/_knowledge.json", import.meta.url);
writeFileSync(out, JSON.stringify({ facts: facts.map((f) => ({ topic: f.id, answer: f.answer })) }, null, 2) + "\n");
console.log(`Wrote ${facts.length} facts to api/_knowledge.json`);
