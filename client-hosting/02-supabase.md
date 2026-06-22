# Supabase Setup

Supabase is your database, authentication, and file storage — all in one.

---

## Step 1 — Create a Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it (e.g. `client-name-prod`)
3. Set a strong **database password** — save it somewhere safe
4. Choose a region **closest to your client's users**
5. Click **Create new project** (takes ~2 minutes to spin up)

> Create a second project called `client-name-dev` for your development environment.

---

## Step 2 — Get Your API Keys

Go to **Project Settings** → **API**:

| Key | Where to use |
|-----|-------------|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` in your app |
| **anon / public key** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe to expose in browser |
| **service_role key** | `SUPABASE_SERVICE_ROLE_KEY` — **never expose publicly**, server only |

Copy all three into `env-template.txt`.

---

## Step 3 — Set Up Authentication

Go to **Authentication** → **Providers**:

### Email / Password
- Toggle **Email** → **Enable**
- Set **Confirm email** to On (users verify email before logging in)

### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret** into Supabase → Authentication → Providers → Google

### Auth Email Templates
Go to **Authentication** → **Email Templates** to customise:
- Confirm signup
- Reset password
- Magic link

---

## Step 4 — Create Your Database Tables

Go to **Table Editor** → **New table**, or use the **SQL Editor**.

### Example schema (adapt to your app):

```sql
-- Users have a profile tied to their auth account
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  plan        TEXT DEFAULT 'free',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table (for SaaS with multiple client accounts)
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Projects belong to clients
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  owner_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  status      TEXT DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Step 5 — Enable Row Level Security (RLS)

**Critical:** RLS means users can only see their own data.
Run this in the **SQL Editor** for every table:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "users_own_profile" ON profiles
  FOR ALL USING (id = auth.uid());

-- Clients: users can only see clients they created
CREATE POLICY "users_own_clients" ON clients
  FOR ALL USING (owner_id = auth.uid());

-- Projects: users can only see their own projects
CREATE POLICY "users_own_projects" ON projects
  FOR ALL USING (owner_id = auth.uid());
```

> Without RLS, **any logged-in user can read any row in your database.** Always enable it.

---

## Step 6 — Auto-Create Profile on Signup

When a user signs up, automatically create their profile row:

```sql
-- Function: create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fire the function after every new auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 7 — Set Up Storage (if needed)

For file uploads (avatars, client documents, etc.):

1. Go to **Storage** → **New bucket**
2. Name it (e.g. `avatars`)
3. Set to **Public** if files should be viewable without login
4. Add a storage policy:

```sql
-- Allow users to upload to their own folder
CREATE POLICY "user_uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to view public files
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

---

## Step 8 — Add Your App's URL to Allowed Origins

Go to **Authentication** → **URL Configuration**:

- **Site URL:** `https://yourclientdomain.com`
- **Redirect URLs:** Add all environments:
  ```
  http://localhost:3000/**
  https://your-vercel-preview.vercel.app/**
  https://yourclientdomain.com/**
  ```

> Without this, OAuth logins will fail on production.

---

## Install Supabase in Your App

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Create these two files:

**`utils/supabase/client.ts`** — for Client Components
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`utils/supabase/server.ts`** — for Server Components & Actions
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    }
  )
}
```

**`middleware.ts`** — required, refreshes auth tokens on every request
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          supabaseResponse.cookies.set(name, value, options)
        }),
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Checklist

- [ ] Production project created
- [ ] Dev project created (separate)
- [ ] API keys copied to `env-template.txt`
- [ ] Auth providers configured (Email + Google)
- [ ] Database tables created
- [ ] RLS enabled on all tables
- [ ] Auto-profile trigger set up
- [ ] Production domain added to allowed URLs
- [ ] Supabase packages installed in app
