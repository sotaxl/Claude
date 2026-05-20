# GitHub Setup

GitHub stores your code and triggers automatic Vercel deploys every time you push.

---

## Step 1 — Create the Repository

1. Go to [github.com](https://github.com) → **New repository**
2. Name it (e.g. `client-name-app`)
3. Set to **Private**
4. Do NOT add README or .gitignore (you'll push existing code)
5. Click **Create repository**

---

## Step 2 — Push Your Code

Run these in your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

---

## Step 3 — Branch Setup (Recommended)

Use two branches so you never accidentally break the live site:

| Branch | Purpose                          |
|--------|----------------------------------|
| `main` | Production — what Vercel deploys |
| `dev`  | Development — test here first    |

```bash
git checkout -b dev
git push -u origin dev
```

**Workflow:** work on `dev` → test it → merge to `main` → Vercel auto-deploys.

---

## Step 4 — Protect the Main Branch

Prevents anyone (including you) from pushing directly to production without a review:

1. GitHub repo → **Settings** → **Branches**
2. Click **Add branch ruleset**
3. Target: `main`
4. Enable **Require a pull request before merging**
5. Enable **Require status checks to pass** (optional but good)
6. Save

---

## Step 5 — Add Secrets (if running CI/CD)

If you want GitHub Actions to run tests or deployments:

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add any secrets your workflow needs (e.g. `SUPABASE_SERVICE_ROLE_KEY`)

> You don't need this for basic Vercel deploys — Vercel reads secrets from its own dashboard.

---

## Step 6 — Invite the Client (Optional)

1. Repo → **Settings** → **Collaborators**
2. Click **Add people**
3. Enter their GitHub username or email
4. Set role to **Read** (they can view but not change code)

---

## What Connects to GitHub

- **Vercel** — links directly to this repo and deploys on every push to `main`
- Nothing else needs direct GitHub access

---

## Checklist

- [ ] Repo created and set to Private
- [ ] Code pushed to `main`
- [ ] `dev` branch created
- [ ] Branch protection on `main` enabled
- [ ] Vercel connected (see `03-vercel.md`)
