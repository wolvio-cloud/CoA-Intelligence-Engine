# CoA Intelligence Engine — Frontend

Next.js app for submitting CoAs, watching pipeline progress, and reviewing extraction results. It talks to the **CoA Intelligence Engine backend** (FastAPI) and optionally uses Supabase from the browser where configured.

---

## Prerequisites

- **Node.js 18+** and npm.
- A running **backend** (see the sibling repo **`CoA-Intelligence-Engine-backend`**) and a configured Supabase project if you use client-side Supabase features.

---

## 1. Backend first

Complete at least through **tables**, **bucket**, and **`.env`** in the backend README, and start the API, for example:

```bash
cd "/path/to/CoA-Intelligence-Engine-backend"
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Smoke-check: **`http://localhost:8000/`** should return JSON with **`"status": "ok"`**.

---

## 2. Frontend environment

1. Copy **`.env.example`** → **`.env.local`** (Next.js loads `.env.local` for local dev).
2. Set:
   - **`NEXT_PUBLIC_API_BASE_URL`** — CoA API base, e.g. **`http://localhost:8000/api/coa`** (or your deployed API URL including `/api/coa`).
   - **`NEXT_PUBLIC_SUPABASE_URL`** — Same Supabase **project URL** as in the dashboard, e.g. `https://YOUR_PROJECT_REF.supabase.co`.
   - **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — From Supabase **Project Settings → API**: the **anon public** key (typically starts with **`eyJ`**).

**Important:** Use the **anon** key in the frontend only. Do **not** put the **service role** / `sb_secret_` key in any `NEXT_PUBLIC_*` variable or in client-side code.

---

## 3. Install and run

```bash
cd "/path/to/CoA-Intelligence-Engine"
npm install
npm run dev
```

Open **http://localhost:3000**, submit a CoA, and confirm the browser network tab calls your API and that the backend terminal stays clean.

---

## 4. Optional checks

- **Seed demo specs** on the backend (`scripts/seed_specs.py` or `POST /api/specs/parameters`) so product/spec matching has data to work with.
- After everything works, **rotate** any API or Supabase keys that were ever exposed.

---

## Build

```bash
npm run build
npm start
```

---

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
