# Deployment Guide

This document covers deploying the backend to Render (free tier) and the frontend to Vercel (free tier). It also explains env var setup and security notes.

## Backend (Render)
- Create a new Web Service on Render.
- Connect your GitHub/GitLab repo and select the `backend` folder.
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod` (ensure this script exists in `backend/package.json`)
- Add environment variables in Render's Dashboard using values from `backend/.env.example`.
- Use Render's Secrets/Environment section to add `DATABASE_URL`, `JWT_SECRET`, SMTP and payment keys.
- If using Prisma, set up a managed Postgres addon or provide a remote Postgres URL in `DATABASE_URL`.
- Run migrations/seed via Render's `Deploy Hook` shell commands or manually run a one-off deploy command:

```bash
# Example (run in Render one-off shell or CI step)
npx prisma migrate deploy
node prisma/seed.js # or ts-node prisma/seed.ts if using ts
```

### Using Neon (production Postgres)

- Neon provides serverless Postgres and requires a connection string with SSL enabled. Use the connection string format you provided as the `DATABASE_URL` in Render:

```
postgresql://neondb_owner:npg_s9YEhtOzW5Qj@ep-autumn-rain-aycty5b2-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

- Steps:
	1. In Neon dashboard, create a project and a database. Whitelist Render's outbound IPs if required (Neon may require connection policies).
	2. Add the Neon connection string as `DATABASE_URL` in Render service env vars (do NOT commit this to git).
	3. On first deploy, run `npx prisma migrate deploy` in a Render one-off shell to apply migrations.
	4. Run the seeder with `npm run seed` (careful: ensure seeder uses env passwords or generate passwords)

Note: Neon may require `pg` to support the `sslmode` parameters; Prisma and Node must be configured to accept the connection string (this repo already reads `process.env.DATABASE_URL`).

## Frontend (Vercel)
- Import the repo into Vercel and set the root to the `frontend` folder.
- Build command: `npm run build`
- Output directory: usually `dist` for Vite projects.
- Add production environment variables in Vercel dashboard (for public keys use `VITE_` prefix if needed).
- Vercel will build and serve the frontend; point your domain to Vercel following their docs.

## Domain
- You can buy a domain from any registrar and add it in Vercel (frontend) and optionally in Render (backend) if needed.
- Configure CORS `FRONTEND_URL` in backend to your frontend domain.

## Security & Best Practices
- NEVER commit real secrets to the repository. Remove commits that contain secrets from history if necessary (`git filter-repo` or `git filter-branch`).
- Use strong `JWT_SECRET` and rotate if leaked.
- Store production secrets in your hosting provider's secret manager.
- Enable HTTPS/SSL on both frontend and backend.
- Use a production-ready database and restrict access with secure credentials.

## Notes
- This is a minimal guide. Adjust build/start commands if your `package.json` uses different script names.
