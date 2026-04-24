# Sunny Archer Services — Netlify Backend

This folder contains the serverless backend that handles Google OAuth token exchange and refresh, so users stay signed in permanently without re-authenticating.

---

## Setup (~5 minutes)

### Step 1 — Create a Netlify account
Go to [netlify.com](https://netlify.com) → Sign up (use GitHub to connect easily).

---

### Step 2 — Deploy this backend

1. Create a new repository on GitHub (e.g. `sunny-archer-backend`)
2. Upload these two files keeping the folder structure:
   ```
   netlify.toml
   netlify/functions/auth.js
   ```
3. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
4. Connect your GitHub and select the `sunny-archer-backend` repo
5. Click **Deploy site**
6. Your backend URL will be something like:
   ```
   https://amazing-archer-123.netlify.app
   ```

---

### Step 3 — Get your Google Client Secret

You already have your Client ID. Now you need the Client Secret:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID name
4. Copy the **Client Secret** (shown on the right side)

---

### Step 4 — Add environment variables in Netlify

1. In Netlify dashboard → your site → **Site configuration** → **Environment variables**
2. Click **Add a variable** and add these two:

   | Key | Value |
   |-----|-------|
   | `GOOGLE_CLIENT_ID` | `200245296438-jdg3eeg4cmis29fk58r01i1stjfp0bfp.apps.googleusercontent.com` |
   | `GOOGLE_CLIENT_SECRET` | *(paste your client secret here)* |

3. Click **Save**
4. Go to **Deploys** → **Trigger deploy** → **Deploy site** to apply the new variables

---

### Step 5 — Add your Netlify URL to Google Cloud

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials** → click your OAuth Client ID
3. Under **Authorised redirect URIs** → **+ Add URI** → add:
   ```
   https://sunny-archer-es.github.io/Pro-Clean-Photos-/
   ```
   (This should already be there — just confirm it exists)

---

### Step 6 — Update the frontend

In `sunny-archer-services.html`, find this line:
```javascript
const BACKEND_URL = 'https://reliable-sorbet-2c7d57.netlify.app.netlify.app/.netlify/functions/auth';
```

Replace `YOUR-NETLIFY-SITE` with your actual Netlify site name, e.g.:
```javascript
const BACKEND_URL = 'https://amazing-archer-123.netlify.app/.netlify/functions/auth';
```

Then upload the updated HTML to your GitHub Pages repo.

---

## How it works

```
iPhone app                  Netlify Function              Google OAuth
    │                             │                             │
    │── Sign in tap ─────────────►│                             │
    │                             │── /o/oauth2/v2/auth ───────►│
    │◄── redirect with ?code= ────│◄── authorization code ──────│
    │── POST /auth (exchange) ───►│                             │
    │                             │── POST /token ─────────────►│
    │◄── access_token + ──────────│◄── tokens ──────────────────│
    │    refresh_token            │                             │
    │                             │                             │
    │  (55 min later)             │                             │
    │── POST /auth (refresh) ────►│                             │
    │                             │── POST /token (refresh) ───►│
    │◄── new access_token ────────│◄── new access_token ────────│
```

The refresh token is stored in the user's browser localStorage. The client secret never leaves the Netlify backend.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Server not configured` error | Check environment variables are set in Netlify |
| `Exchange failed` error | Make sure redirect URI matches exactly in Google Cloud |
| CORS error | Check `netlify.toml` has the correct GitHub Pages origin |
| Still asking to sign in | Clear localStorage in Safari → Settings → Safari → Advanced → Website Data |
