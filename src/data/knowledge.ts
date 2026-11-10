import { achievements, capabilities, passions, profile, spokenLanguages, stats } from "./content";

export type Link = { label: string; href: string; download?: string };

export type Fact = {
  id: string;
  /** "word^3" sets a weight (default 2); a space-separated entry is matched as a phrase. */
  keywords: string[];
  answer: string;
  links?: Link[];
  /** Follow-up questions offered as chips after this answer. */
  next?: string[];
};

const stat = (label: string) => stats.find((s) => s.label === label)?.value ?? "";
const list = (items: readonly string[]) => items.join(", ");

export const resumeLink: Link = {
  label: "Download my resume",
  href: "/Vannsh-Shah-Resume.pdf",
  download: "Vannsh-Shah-Resume.pdf",
};

export const contactLinks: Link[] = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "LinkedIn", href: profile.linkedinUrl },
  { label: "GitHub", href: profile.githubUrl },
  { label: "WhatsApp", href: profile.whatsappUrl },
  { label: "Instagram", href: profile.instagramUrl },
];

export const STARTER_QUESTIONS = [
  "Tell me about yourself",
  "What are your skills?",
  "What projects have you built?",
  "What's your work experience?",
  "Which certifications do you have?",
  "How can I contact you?",
];

/**
 * Everything the chatbot can say. Answers come only from the portfolio (content.ts) and the resume PDF.
 * Order matters: on a tie, the earlier fact wins.
 */
export const facts: Fact[] = [
  {
    id: "current",
    keywords: ["currently^3", "right now^5", "working on^5", "are you building^5", "these days^4", "at the moment^5", "present^2", "latest^2", "lately^2"],
    answer:
      "Right now I'm building Chotu (my AI academic assistant) and CareerConnecting (a swipe-based job-matching app), and I'm still volunteering as a Python and Canva mentor for school students. I'm also working through AWS modules on prompt engineering and SageMaker JumpStart. My Nova Techset internship (Jun–Aug 2026) and E-Cell IIT Bombay campus ambassadorship (Jun–Nov 2026) have wrapped up.",
    next: ["Tell me about Chotu", "What's your work experience?", "Which certifications do you have?"],
  },
  {
    id: "internship",
    keywords: ["nova^5", "techset^5", "intern^4", "aiml^3", "production^1"],
    answer:
      "From Jun to Aug 2026 I was an AI-ML Intern at Nova Techset Ltd. (full-time, on-site in Pune). I worked hands-on with Python and deep learning on applied AI/ML projects in a production environment, and built and queried PostgreSQL-backed data workflows that supported AI features.",
    next: ["What are your AI/ML skills?", "What's your work experience?", "What projects have you built?"],
  },
  {
    id: "ambassador",
    keywords: ["ecell^5", "cell^2", "iit^3", "bombay^3", "ambassador^5", "illuminate^4", "campus^2", "entrepreneurship^2"],
    answer:
      "From Jun to Nov 2026 I was a Campus Ambassador for E-Cell, IIT Bombay (a remote internship, now completed). I represented E-Cell on campus, promoting entrepreneurship and innovation programs like Illuminate, as part of a national student network fostering leadership and startup awareness.",
    next: ["What events have you led?", "What's your work experience?", "How can I contact you?"],
  },
  {
    id: "events",
    keywords: ["dishayam^5", "euraka^5", "coordinator^4", "event^3", "fest^3", "tech fest^5", "leadership^3", "leader^3", "judge^2", "ideathon^4", "proof of concept^5", "poc^2"],
    answer:
      "Dishayam 2026 (Mar 2026): I was Main Coordinator for the DES Pune University Innovation & Startup Association at the NAV-उन्मेष 2026 tech fest. I led a Proof-of-Concept showcase and a startup Ideathon with a 7-person team and helped promote the fest across colleges.\n\nEuraka 2026 (27 Aug 2026): as Technical Coordinator I invited and hosted the judges, managed the technical execution, and assigned work across the team, including late-night and full-day sessions.",
    next: ["Tell me about your hackathon", "Do you mentor students?", "What's your work experience?"],
  },
  {
    id: "hackathon",
    keywords: ["hackathon^5", "vibrarelief^5", "vibra^4", "migraine^5", "wearable^4", "shifthappens404^5", "shifthappens^5", "navonmesh^4", "imcc^4", "vibration^3", "24hour^4", "24 hour^4", "prototype^2"],
    answer: `I've attended ${stat("Hackathons Attended")} hackathons. At Navonmesh 2026, a 24-hour national hackathon at MES IMCC Pune, my team ShiftHappens404 built "VibraRelief Duo" — a non-invasive wearable prototype for migraine relief using targeted vibration therapy and gentle electronic stimulation.`,
    next: ["What events have you led?", "What projects have you built?", "What are your skills?"],
  },
  {
    id: "mentoring",
    keywords: ["mentor^5", "teach^4", "taught^4", "workshop^3", "canva^4", "volunteer^4", "9th^4", "ninth^4", "des new english^5", "school students^5", "9th grade^5"],
    answer:
      "It's ongoing: I volunteer as a student mentor at DES New English Medium School, together with DES Pune University. Across several sessions I've taught 9th-grade students Python basics, matplotlib data visualization, and Gen AI/Canva fundamentals.",
    next: ["What are your skills?", "What events have you led?", "What are your passions?"],
  },
  {
    id: "grades",
    keywords: ["gpa^6", "cgpa^6", "marks^5", "percentage^5", "score^3", "rank^3"],
    answer: "My portfolio and resume don't list grades or CGPA, so I can't share that here. You can ask me directly if you need it.",
    links: [{ label: "Email me", href: `mailto:${profile.email}` }],
    next: ["Tell me about your education", "How can I contact you?"],
  },
  {
    id: "education",
    keywords: ["education^5", "educated^5", "college^5", "university^4", "degree^5", "btech^5", "b tech^5", "school^3", "graduate^4", "graduation^4", "study^2", "studying^3", "studied^3", "12th^4", "10th^4", "des^2", "qualification^5", "third year^5", "3rd year^5", "year^1"],
    answer:
      "I'm in my third year of a B.Tech in Computer Science Engineering at DES Pune University (Aug 2024 – Aug 2028). Before that I did 12th grade at City International School (2022–2024) and 10th grade at Sankriti School (2018–2022).",
    next: ["What are your skills?", "Which certifications do you have?", "What projects have you built?"],
  },
  {
    id: "careerconnecting",
    keywords: ["careerconnecting^6", "career connecting^6", "jobswipe^6", "swipe^4", "job matching^5", "jobseeker^3", "qml^2"],
    answer:
      "CareerConnecting (JobSwipe) is a swipe-based job-matching platform for students and jobseekers that I've been building since Jan 2025. It has smart job suggestions, resume upload, XP tracking and AI-guided career paths, with an off-white and gold interface. It's built with C++ and QML, and there's a live demo online.",
    links: [{ label: "Live demo", href: "https://career-connect-221yt836g-shahvannsh-9258s-projects.vercel.app/" }],
    next: ["Tell me about Chotu", "Tell me about DocParserEnvs", "What are your programming skills?"],
  },
  {
    id: "chotu",
    keywords: ["chotu^6", "assistant^3", "academic^3", "ironman^4", "iron man^5", "jarvis^5", "focus^2", "roast^4", "study^2", "distraction^3", "resume builder^4"],
    answer:
      "Chotu is my Iron-Man-inspired personal AI academic assistant, in progress since Mar 2026. It has focus sessions, distraction tracking, an analytics dashboard, a \"roast mode\" for accountability, and a resume-building tool. It's built with Python and Flask/FastAPI.",
    next: ["Tell me about CareerConnecting", "Tell me about DocParserEnvs", "What are your AI/ML skills?"],
  },
  {
    id: "docparser",
    keywords: ["docparserenvs^6", "docparser^6", "reinforcement^5", "rl^4", "gymnasium^4", "environment^3", "agent^2", "documentation^3", "parser^3", "mock file system^5", "file system^4"],
    answer:
      "DocParserEnvs (Feb–Apr 2026) is a Gymnasium reinforcement-learning environment where an agent learns to navigate a mock file system to answer technical documentation queries, simulating a developer's search workflow. It's written in Python.",
    next: ["Tell me about Chotu", "What are your AI/ML skills?", "What are your mini projects?"],
  },
  {
    id: "miniprojects",
    keywords: ["mini^4", "weather dashboard^6", "weather app^6", "pokedex^5", "pokeapi^5", "stopwatch^5", "alarm clock^6", "digital clock^6", "openweathermap^5"],
    answer:
      "My 2026 mini-project series (Python, JavaScript, REST APIs) includes:\n• Real-Time Weather Dashboard: a desktop GUI app using the OpenWeatherMap API with JSON parsing and error handling.\n• Interactive Pokédex: fetches and renders Pokémon data from PokeAPI, searchable by name or ID.\n• GUI Stopwatch & Alarm Clock: Python desktop utilities with real-time state and audio triggers.\n• Real-Time Digital Clock: a JavaScript app using DOM manipulation and interval-based time sync.",
    next: ["What projects have you built?", "What are your programming skills?"],
  },
  {
    id: "projects",
    keywords: ["project^4", "built^2", "build^2", "made^1", "create^2", "created^2", "developed^2", "app^2", "application^2", "side project^5", "what have you built^6"],
    answer: `I've shipped ${stat("Projects Shipped")} projects. The highlights:\n• CareerConnecting (JobSwipe): a swipe-based job-matching app (C++, QML)\n• Chotu: an Iron-Man-inspired AI academic assistant (Python, Flask/FastAPI)\n• DocParserEnvs: a reinforcement-learning environment for documentation search (Python, Gymnasium)\n• A mini-project series: weather dashboard, Pokédex, stopwatch/alarm clock and digital clock.`,
    next: ["Tell me about CareerConnecting", "Tell me about Chotu", "Tell me about DocParserEnvs"],
  },
  {
    id: "skills-ai",
    keywords: ["ai^2", "ml^2", "machine learning^5", "machine^2", "deep^2", "nlp^4", "llm^4", "llms^4", "rag^4", "langchain^4", "llamaindex^4", "transformer^3", "vision^3", "opencv^3", "neural^3", "hugging^3", "embedding^3", "vector^3", "pinecone^4", "faiss^4", "chroma^4", "cnn^3", "rnn^3", "lstm^3", "xgboost^3", "regression^3", "classification^3", "clustering^3", "genai^3", "prompt^3", "agents^2"],
    answer: `AI/ML is my main focus.\n• Machine learning: ${list(capabilities.machineLearning)}\n• Computer vision: ${list(capabilities.computerVision)}\n• LLMs & NLP: ${list(capabilities.llmNlp)}\n• Vector databases: ${list(capabilities.vectorDatabases)}\nI've applied this in my Nova Techset AI-ML internship and in projects like Chotu and DocParserEnvs.`,
    next: ["What are your programming skills?", "Which certifications do you have?", "Tell me about your internship"],
  },
  {
    id: "skills-db",
    keywords: ["database^4", "databases^4", "mysql^4", "postgresql^4", "postgres^4", "mongodb^4", "access^2", "sql^3", "pandas^3", "numpy^3", "matplotlib^3", "seaborn^3", "plotly^3", "visualization^3", "anaconda^2", "nosql^3", "vector database^5"],
    answer: `Data and databases:\n• Databases: ${list(capabilities.databases)}\n• Vector databases: ${list(capabilities.vectorDatabases)}\n• Data & AI libraries: ${list(capabilities.aiData)}`,
    next: ["What are your AI/ML skills?", "What are your programming skills?", "Tell me about your internship"],
  },
  {
    id: "skills-prog",
    keywords: ["language^3", "programming^4", "code^2", "coding^3", "c++^5", "python^5", "java^4", "javascript^5", "js^3", "html^3", "css^3", "react^3", "flask^3", "fastapi^3", "framework^3", "docker^3", "git^3", "linux^3", "qml^3", "graphql^3", "api^2", "rest^2", "competitive^3", "leetcode^4", "hackerrank^4", "codechef^4", "dsa^3", "algorithm^3", "problem solving^4", "svg^3", "intellij^3", "visual studio^3", "replit^3", "jupyter^3", "tool^2", "framework^3"],
    answer: `Programming and tools:\n• Languages: ${list(capabilities.languages)}\n• Frameworks & APIs: ${list(capabilities.frameworks)}\n• Tools: ${list(capabilities.tools)}\n• Competitive coding: ${list(capabilities.competitive)}`,
    next: ["What are your AI/ML skills?", "What are your database skills?", "What projects have you built?"],
  },
  {
    id: "skills",
    keywords: ["skill^4", "stack^3", "tech stack^5", "tech^2", "technology^3", "strength^3", "expertise^4", "proficient^4", "proficiency^4", "good at^5", "know^1", "capability^4", "capabilities^4", "specialize^4", "specialise^4"],
    answer:
      "My core strengths are a solid C++ and Python foundation, applied AI/ML (deep learning, LLMs, RAG, computer vision), databases like PostgreSQL and MongoDB, and full-stack building with React, Flask and FastAPI. Ask me about any area for details.",
    next: ["What are your AI/ML skills?", "What are your programming skills?", "What are your database skills?"],
  },
  {
    id: "certifications",
    keywords: ["certification^5", "certificate^5", "certified^5", "aws^4", "google^2", "openai^4", "bedrock^4", "sololearn^4", "badge^3", "course^3", "credential^3", "learning plan^5", "sagemaker^4", "amazon^3", "in progress^5", "currently learning^6"],
    answer: `I've completed ${stat("Certifications")} certifications: AWS (AI/ML foundations, generative AI, applied and advanced AI such as building production-ready agents with Amazon Bedrock AgentCore, and public-sector generative AI), Google Cloud (Introduction to Generative AI and to Responsible AI), OpenAI (Accelerate Your Learning with ChatGPT) and SoloLearn (Introduction to C).\n\nIn progress: AWS Foundations of Prompt Engineering, Amazon SageMaker JumpStart Foundations, and Customizing and Evaluating LLMs Using SageMaker JumpStart.`,
    links: [resumeLink],
    next: ["What are your AI/ML skills?", "Tell me about your education", "What projects have you built?"],
  },
  {
    id: "achievements",
    keywords: ["achievement^5", "award^4", "accomplishment^5", "solar^5", "dipex^5", "robotics^4", "robot^4", "science^2", "expo^3", "iiser^5", "fergusson^5", "industry^3", "visit^3", "solanki^5", "arvind^5", "gupta^4", "padma^4", "energy^3", "swaraj^4", "lamp^4", "manipulator^4", "quantum^3", "iot^3", "smart factory^5", "recognition^4", "honour^4", "honor^4", "extracurricular^4"],
    answer: `Some highlights beyond coursework:\n${achievements.map((a) => `• ${a.title} (${a.org}, ${a.date}): ${a.note}`).join("\n")}`,
    next: ["Tell me about your hackathon", "What events have you led?", "What are your passions?"],
  },
  {
    id: "spoken",
    keywords: ["speak^5", "spoken^5", "hindi^5", "marathi^5", "gujarati^5", "german^5", "japanese^5", "sanskrit^5", "english^4", "fluent^5", "multilingual^5", "bilingual^5", "mother tongue^6"],
    answer: `I speak ${list(spokenLanguages)}.`,
    next: ["Tell me about yourself", "What are your passions?"],
  },
  {
    id: "passions",
    keywords: ["passion^5", "interest^5", "hobby^5", "hobbies^5", "enjoy^3", "love^2", "free time^6", "sustainability^5", "design^2", "trend^2", "curious^2", "outside work^5", "outside of work^5"],
    answer: `I'm passionate about ${list(passions)}. Outside of coding I'm a tech and sustainability enthusiast.`,
    next: ["Tell me about yourself", "What projects have you built?", "Do you mentor students?"],
  },
  {
    id: "location",
    keywords: ["location^5", "live^3", "based^4", "city^4", "pune^3", "india^2", "maharashtra^4", "relocate^5", "hometown^4", "country^3", "where do you live^6", "where are you from^6", "are you from^5", "come from^5", "where are you located^6"],
    answer: `I'm based in ${profile.location}.`,
    next: ["Tell me about your education", "How can I contact you?"],
  },
  {
    id: "resume",
    keywords: ["resume^6", "cv^6", "pdf^4", "download^4", "curriculum^5"],
    answer: "You can download my latest resume here. It covers my summary, experience, leadership, education, projects, skills and certifications.",
    links: [resumeLink],
    next: ["What's your work experience?", "Which certifications do you have?", "How can I contact you?"],
  },
  {
    id: "contact",
    keywords: ["contact^5", "email^5", "mail^4", "phone^5", "number^3", "call^4", "reach^5", "whatsapp^5", "linkedin^5", "github^5", "instagram^5", "insta^5", "social^4", "connect^3", "message^3", "dm^3", "handle^3", "get in touch^6", "touch^3"],
    answer: `The easiest ways to reach me:\n• Email: ${profile.email}\n• Phone / WhatsApp: ${profile.phone}\n• LinkedIn: ${profile.linkedin}\n• GitHub: ${profile.github}\n• Instagram: ${profile.instagram}`,
    links: contactLinks,
    next: ["Can I download your resume?", "Where are you based?", "What's your work experience?"],
  },
  {
    id: "availability",
    keywords: ["hire^5", "hiring^5", "available^5", "availability^5", "opportunity^5", "opportunities^5", "open to^6", "looking for^4", "freelance^5", "recruit^5", "join^3", "collaborate^5", "collaboration^5", "work together^6", "work with you^6", "salary^6", "ctc^6", "notice period^6", "job^2"],
    answer:
      "My portfolio and resume don't say anything about availability or compensation, so the best way to find out is to message me directly. Email or LinkedIn is the quickest.",
    links: contactLinks.slice(0, 2),
    next: ["Can I download your resume?", "What's your work experience?", "How can I contact you?"],
  },
  {
    id: "site",
    keywords: ["mascot^5", "video^4", "music^4", "song^3", "tune^4", "builder^2", "chibi^5", "avatar^4", "made this^6", "built this^6", "this site^4", "this website^4", "chatbot^4", "bot^3"],
    answer:
      "That's me as a chibi mascot! Tap \"Watch my intro\" for my video introduction, and use the speaker button to play \"Builder\", an original Indian × tech tune made for this site. I'm also a small Q&A bot: I can only answer from my portfolio and resume.",
    next: ["Tell me about yourself", "What projects have you built?"],
  },
  {
    id: "career",
    keywords: ["career^4", "journey^4", "experience^3", "work^1", "timeline^4", "history^3", "professional^4", "employment^4", "company^2", "work experience^6", "where have you worked^6", "roles^3", "positions^3"],
    answer: "Here's my journey so far:\n• Jun–Aug 2026: AI-ML Intern, Nova Techset Ltd.\n• Jun–Nov 2026: Campus Ambassador, E-Cell IIT Bombay\n• Mar 2026: Main Coordinator, Dishayam 2026 (DES Pune University)\n• Aug 2026: Technical Coordinator, Euraka 2026\n• 2026: Hackathon — \"VibraRelief Duo\" at Navonmesh 2026\n• Ongoing: Student mentor for Python & Canva workshops",
    links: [resumeLink],
    next: ["Tell me about your internship", "What events have you led?", "Tell me about your education"],
  },
  {
    id: "about",
    keywords: ["yourself^4", "introduce^4", "bio^4", "summary^4", "background^3", "about you^4", "who is vannsh^6", "vannsh^2", "describe^2", "overview^3", "introduction^3", "what do you do^6", "tell me about you^6"],
    answer: `I'm Vannsh Shah, a third-year B.Tech Computer Science Engineering student in ${profile.location}. I focus on AI/ML and full-stack development, with a strong C++ and Python foundation. I've completed an AI-ML internship at Nova Techset and built projects like Chotu, my AI study assistant, and CareerConnecting, a swipe-based job-matching app. I also hold ${stat("Certifications")} certifications across AWS, Google Cloud and OpenAI, and I'm a tech and sustainability enthusiast.`,
    next: ["What's your work experience?", "What are your skills?", "What projects have you built?"],
  },
  {
    id: "stats",
    keywords: ["how many^3", "number of^3", "stats^4", "statistics^4", "count^2", "total^2"],
    answer: `A few numbers: ${stats.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}.`,
    next: ["What projects have you built?", "Which certifications do you have?", "Tell me about your hackathon"],
  },
];
