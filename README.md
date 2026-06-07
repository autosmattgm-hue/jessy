# Jessy Nailed It Website

Production-ready static beauty studio website with multi-page navigation, a showroom gallery, pricing, service pages, and Jessy AI.

## Local Development

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create a local `.env` file from `.env.example` when running the AI locally.

```powershell
Copy-Item .env.example .env
```

Set these in Vercel before deploying:

- `NVIDIA_API_KEY`: your rotated NVIDIA API key.
- `JESSY_AI_TIMEOUT_MS`: optional, default `4000`.

Important: rotate any API key that has been pasted into chat or exposed publicly. Never commit `.env`.

## Check Before Deploy

```powershell
npm run check
```

## Upload To GitHub

Install Git if it is not already installed, then run:

```powershell
git init
git add .
git commit -m "Deploy Jessy Nailed It website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jessy-nailed-it.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username and create the repository on GitHub before pushing.

## Deploy To Vercel

1. Go to `https://vercel.com/new`.
2. Import the GitHub repository.
3. Use framework preset `Other`.
4. Leave the build command empty.
5. Leave the output directory empty.
6. Add the environment variables above.
7. Click Deploy.

The clean routes are configured in `vercel.json`, including `/pricing`, `/styles`, `/about`, `/showroom`, and `/jessy-ai`.
