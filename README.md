# Vannsh Shah — Portfolio (React + Tailwind + Framer Motion)

A dark, HUD/terminal-themed personal portfolio built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (scroll reveals, magnetic hover, sticky stacking project cards)
- lucide-react (icons)

## Local development

```bash
npm install
npm run dev
```

Visit the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Vercel auto-detects Vite — leave the default build command (`npm run build`) and output directory (`dist`).
4. Deploy.

## Editing content

All real content (experience, projects, certifications, skills) lives in one place:

```
src/data/content.ts
```

Edit that file to update anything on the site — no need to touch the components themselves for text changes.

## Structure

```
src/
  components/   All UI sections (Hero, Journey, Projects, Contact, etc.)
  data/         content.ts — single source of truth for all copy
  index.css     Global styles, fonts, custom Tailwind tokens
  App.tsx       Wires all sections together
```
