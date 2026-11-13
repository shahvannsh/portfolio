import type { Greeting } from "./greetings";

export type Festival = { name: string; phrases: readonly Greeting[] };

const g = (language: string, lang: string, text: string, meaning: string): Greeting => ({ language, lang, text, meaning });

// Dates are only listed where several calendars agree. Moving festivals cover 2026 and 2027; add the next years later.
const DIWALI: Festival = {
  name: "Diwali",
  phrases: [
    g("Hindi", "hi", "दीपावली की हार्दिक शुभकामनाएँ!", "Diwali"),
    g("Marathi", "mr", "दिवाळीच्या हार्दिक शुभेच्छा!", "Diwali"),
    g("Gujarati", "gu", "દિવાળીની શુભેચ્છાઓ!", "Diwali"),
    g("English", "en", "Happy Diwali!", "Diwali"),
  ],
};
const GANESH: Festival = {
  name: "Ganesh Chaturthi",
  phrases: [
    g("Marathi", "mr", "गणपती बाप्पा मोरया!", "Ganesh Chaturthi"),
    g("Hindi", "hi", "गणेश चतुर्थी की शुभकामनाएँ!", "Ganesh Chaturthi"),
    g("English", "en", "Happy Ganesh Chaturthi!", "Ganesh Chaturthi"),
  ],
};
const HOLI: Festival = {
  name: "Holi",
  phrases: [g("Hindi", "hi", "होली की हार्दिक शुभकामनाएँ!", "Holi"), g("English", "en", "Happy Holi!", "Holi")],
};
const SANKRANTI: Festival = {
  name: "Makar Sankranti",
  phrases: [
    g("Marathi", "mr", "तिळगूळ घ्या, गोड गोड बोला!", "Makar Sankranti"),
    g("Hindi", "hi", "मकर संक्रांति की शुभकामनाएँ!", "Makar Sankranti"),
    g("English", "en", "Happy Makar Sankranti!", "Makar Sankranti"),
  ],
};
const DUSSEHRA: Festival = {
  name: "Dussehra",
  phrases: [g("Hindi", "hi", "दशहरा की हार्दिक शुभकामनाएँ!", "Dussehra"), g("English", "en", "Happy Dussehra!", "Dussehra")],
};
const RAKHI: Festival = {
  name: "Raksha Bandhan",
  phrases: [g("Hindi", "hi", "रक्षाबंधन की हार्दिक शुभकामनाएँ!", "Raksha Bandhan"), g("English", "en", "Happy Raksha Bandhan!", "Raksha Bandhan")],
};
const GUDI_PADWA: Festival = {
  name: "Gudi Padwa",
  phrases: [g("Marathi", "mr", "गुढीपाडव्याच्या हार्दिक शुभेच्छा!", "Gudi Padwa"), g("English", "en", "Happy Gudi Padwa!", "Gudi Padwa")],
};

// Same date every year: [month (1-12), day].
const FIXED: { month: number; day: number; festival: Festival }[] = [
  {
    month: 1,
    day: 1,
    festival: {
      name: "New Year",
      phrases: [
        g("English", "en", "Happy New Year!", "New Year"),
        g("Hindi", "hi", "नववर्ष की शुभकामनाएँ!", "New Year"),
        g("Marathi", "mr", "नवीन वर्षाच्या शुभेच्छा!", "New Year"),
        g("Gujarati", "gu", "નવા વર્ષની શુભેચ્છા!", "New Year"),
        g("German", "de", "Frohes neues Jahr!", "New Year"),
        g("Japanese", "ja", "あけましておめでとうございます！", "New Year"),
      ],
    },
  },
  { month: 1, day: 26, festival: { name: "Republic Day", phrases: [g("Hindi", "hi", "गणतंत्र दिवस की शुभकामनाएँ!", "Republic Day"), g("English", "en", "Happy Republic Day!", "Republic Day")] } },
  { month: 8, day: 15, festival: { name: "Independence Day", phrases: [g("Hindi", "hi", "स्वतंत्रता दिवस की शुभकामनाएँ!", "Independence Day"), g("English", "en", "Happy Independence Day!", "Independence Day")] } },
  { month: 9, day: 5, festival: { name: "Teachers' Day", phrases: [g("Hindi", "hi", "शिक्षक दिवस की शुभकामनाएँ!", "Teachers' Day"), g("English", "en", "Happy Teachers' Day!", "Teachers' Day")] } },
  { month: 9, day: 15, festival: { name: "Engineers' Day", phrases: [g("Hindi", "hi", "अभियंता दिवस की शुभकामनाएँ!", "Engineers' Day"), g("English", "en", "Happy Engineers' Day!", "Engineers' Day")] } },
];

// Moving festivals: inclusive [start, end] as YYYY-MM-DD.
const MOVING: { from: string; to: string; festival: Festival }[] = [
  { from: "2026-01-14", to: "2026-01-14", festival: SANKRANTI },
  { from: "2026-03-04", to: "2026-03-04", festival: HOLI },
  { from: "2026-03-19", to: "2026-03-19", festival: GUDI_PADWA },
  { from: "2026-08-28", to: "2026-08-28", festival: RAKHI },
  { from: "2026-09-14", to: "2026-09-14", festival: GANESH },
  { from: "2026-10-20", to: "2026-10-20", festival: DUSSEHRA },
  { from: "2026-11-07", to: "2026-11-09", festival: DIWALI },
  { from: "2027-01-14", to: "2027-01-15", festival: SANKRANTI },
  { from: "2027-03-22", to: "2027-03-23", festival: HOLI },
  { from: "2027-08-17", to: "2027-08-17", festival: RAKHI },
  { from: "2027-09-03", to: "2027-09-04", festival: GANESH },
  { from: "2027-10-09", to: "2027-10-09", festival: DUSSEHRA },
  { from: "2027-10-28", to: "2027-10-30", festival: DIWALI },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** The festival or occasion on this (local) date, if any. */
export function festivalOn(date: Date): Festival | null {
  const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const moving = MOVING.find((m) => iso >= m.from && iso <= m.to);
  if (moving) return moving.festival;
  return FIXED.find((f) => f.month === date.getMonth() + 1 && f.day === date.getDate())?.festival ?? null;
}
