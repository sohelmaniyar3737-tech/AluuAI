# AluuAI — independent backend migration

This version replaces Supabase Auth, Postgres table access, Storage, and the Supabase chat function with an Express API + PostgreSQL (Neon) + a configurable OpenAI-compatible AI endpoint.

## Local setup
1. Install Node.js 20+ and PostgreSQL access (Neon works).
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `JWT_SECRET`, and `AI_API_KEY`. Never commit `.env`.
3. In the project folder run `npm install`.
4. Run the schema once against your Neon database: `psql "$DATABASE_URL" -f server/schema.sql` (or paste `server/schema.sql` into Neon SQL Editor).
5. Terminal 1: `npm run dev` (Vite frontend). Terminal 2: `npm run dev:server` (API).
6. Vite uses `/api` on the same origin in development only if configured with a proxy; add `VITE_API_URL=http://localhost:5000` to your local `.env` for now.

## Render deployment
- Create a Render **Web Service** from this repo with build command `npm install` and start command `npm start`. Add `DATABASE_URL`, `JWT_SECRET`, `AI_API_KEY`, and optionally `AI_BASE_URL`/`AI_MODEL`.
- Create a Render **Static Site** for the frontend with build command `npm install && npm run build`, publish directory `dist`, and `VITE_API_URL=https://YOUR-API-SERVICE.onrender.com`. Configure SPA rewrite `/*` -> `/index.html`.
- Uploaded files on Render's ephemeral filesystem can disappear on redeploy. For durable uploads, connect object storage (e.g. Cloudinary/S3-compatible) before relying on attachments in production.

## Important migration notes
- This is a new authentication system. Existing Supabase users and sessions do not automatically migrate; users will need to create accounts again unless you securely export and migrate their user records. Passwords should not be copied from Supabase Auth.
- Password reset email and Google OAuth need dedicated provider configuration and are intentionally not treated as ready.
- Set a real AI provider key/model you are allowed to use. The previous `LOVABLE_API_KEY` is not reused.
