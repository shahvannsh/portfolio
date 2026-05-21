# Portfolio Website

This folder contains the static portfolio site for Vannsh Shah.

## What is already done
- `index.html` is ready for deployment
- `WhatsApp Image 2025-04-28 at 11.54.03_80be0dc1.jpg` is included
- `Screenshot 2026-05-20 162837.png` is included for hover preview
- A local git repository has been initialized and the first commit has been made

## Next steps to publish with a custom domain

### 1. Create a GitHub repository
- Create a new repo on GitHub (private or public)
- Do not add a README via GitHub because this repo is already initialized locally

### 2. Add the GitHub remote and push
```powershell
cd "C:\Users\itsva\Downloads\portfolio"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages
- In GitHub repo settings, go to Pages
- Select the `main` branch and `/` root folder
- Save and wait for the site URL to appear

### 4. Add a custom domain
- In Pages settings, set the custom domain to `www.xyz.com`
- GitHub will tell you the DNS records to create

### 5. Configure your domain DNS
- At your domain registrar, add the required `A` and/or `CNAME` records
- Example for GitHub Pages:
  - `www` -> `username.github.io` via CNAME
  - or `A` records to GitHub Pages IPs

## If you want, I can also help with:
- creating the `CNAME` file automatically
- generating Netlify / Cloudflare Pages instructions instead
- verifying the exact DNS records once you have the domain
