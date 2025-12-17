# Nexus Deployment Guide (Render)

This guide outlines how to deploy the Nexus backend to [Render](https://render.com).

## Prerequisites

1.  **Render Account:** Sign up at https://render.com.
2.  **GitHub/GitLab Account:** Ensure your Nexus code is in a repository connected to Render.
3.  **Database:** You will need a PostgreSQL database. You can use Render's managed PostgreSQL or an external provider (e.g., Supabase, Neon).
4.  **Cloudinary Account:** For file uploads (Evidence, Meeting Logs).

---

## Step 1: Create a PostgreSQL Database

If you don't have one:
1.  On Render Dashboard, click **New +** -> **PostgreSQL**.
2.  Name it (e.g., `nexus-db`).
3.  Choose a region.
4.  Select the **Free** plan (for testing) or a paid plan for production.
5.  Click **Create Database**.
6.  **Copy the `Internal Database URL`** (if deploying the web service in the same region) or `External Database URL`. This will be your `DATABASE_URL`.

---

## Step 2: Deploy the Web Service

1.  On Render Dashboard, click **New +** -> **Web Service**.
2.  Connect your Nexus repository.
3.  **Name:** `nexus-api` (or similar).
4.  **Region:** Same as your database.
5.  **Branch:** `main` (or your production branch).
6.  **Root Directory:** `server` (Since this is a monorepo structure with `server/` folder).
7.  **Runtime:** `Node`.
8.  **Build Command:** `pnpm install && pnpm build`
    *   *Note:* Ensure you have set the `pnpm` version or use `npm install && npm run build` if preferred, but our project uses `pnpm`. Render supports `pnpm` by default if `pnpm-lock.yaml` is present.
9.  **Start Command:** `pnpm start` (This runs `node dist/index.js`).

---

## Step 3: Configure Environment Variables

In the Web Service settings, scroll down to **Environment Variables** and add the following:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Set to production mode. |
| `PORT` | `10000` | Render expects the app to listen on port 10000 by default (or set `$PORT`). |
| `DATABASE_URL` | `postgres://...` | Connection string from Step 1. |
| `JWT_SECRET` | `your-secure-secret` | Generate a strong random string (e.g., `openssl rand -hex 32`). |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration. |
| `FRONTEND_URL` | `https://your-frontend-app.onrender.com` | URL of your deployed frontend (for CORS). |
| `SMTP_HOST` | `smtp.example.com` | Your email provider host (e.g., `smtp.resend.com`). |
| `SMTP_PORT` | `587` | Email provider port. |
| `SMTP_USER` | `user` | Email provider username/apikey. |
| `SMTP_PASS` | `password` | Email provider password. |
| `EMAIL_FROM` | `noreply@yourdomain.com` | Sender email address. |
| `CLOUDINARY_CLOUD_NAME` | `...` | Cloudinary Cloud Name. |
| `CLOUDINARY_API_KEY` | `...` | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | `...` | Cloudinary API Secret. |

---

## Step 4: Database Migrations (Production)

We need to run migrations to set up the database schema on the production DB.

**Option A: Build Command (Recommended for simple setups)**
Modify your **Build Command** in Render to:
```bash
pnpm install && pnpm build && pnpm db:migrate:deploy
```
*This ensures migrations run every time you deploy a new version.*

**Option B: Shell / Jobs**
You can run it manually via the Render "Shell" tab after deployment:
```bash
pnpm db:migrate:deploy
```

**Seed Data (Optional):**
If you need initial data (e.g., default Phases):
```bash
pnpm db:seed
```

---

## Step 5: Verify Deployment

1.  Wait for the deployment to finish. Render logs will show "Build successful" and "Live".
2.  Navigate to your service URL: `https://nexus-api.onrender.com/api/v1/health`.
3.  You should see: `{"status":"ok", "timestamp": "..."}`.
4.  Check API Docs: `https://nexus-api.onrender.com/documentation`.

---

## Troubleshooting

*   **Build Failures:** Check the "Logs" tab. Ensure `pnpm-lock.yaml` is up to date.
*   **Database Connection:** Verify `DATABASE_URL` is correct. If using Internal URL, ensure both services are in the same region.
*   **CORS Issues:** Ensure `FRONTEND_URL` exactly matches your frontend domain (no trailing slash usually).

---

**Frontend Deployment:**
For the frontend (`client/` folder), create a separate **Static Site** (if SSG) or **Web Service** (if SSR) on Render, setting the Root Directory to `client` and following Next.js deployment instructions.
