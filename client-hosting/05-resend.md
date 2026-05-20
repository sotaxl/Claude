# Resend Setup

Resend sends transactional emails from your app (welcome emails, password resets, invoices, etc.).

---

## Step 1 — Create Account

1. Go to [resend.com](https://resend.com) → **Sign up**
2. Verify your email

Free tier: **3,000 emails/month**, no credit card needed.

---

## Step 2 — Get Your API Key

1. Go to **API Keys** → **Create API Key**
2. Name it (e.g. `client-name-prod`)
3. Permission: **Sending access**
4. Click **Add** → copy the key immediately (only shown once)

Add to `env-template.txt`:
```
RESEND_API_KEY=re_...
```

---

## Step 3 — Verify Your Sending Domain

Without a verified domain, emails come from `onboarding@resend.dev` — not great for a client's brand.

1. **Domains** → **Add domain**
2. Enter the client's domain (e.g. `yourclientdomain.com`)
3. Resend shows DNS records to add — go to your domain registrar and add them:

| Type | Name | Value |
|------|------|-------|
| TXT | `resend._domainkey` | (Resend provides this) |
| TXT | `@` | `v=spf1 include:_spf.resend.com ~all` |

4. Click **Verify** in Resend — takes a few minutes
5. Once verified, you can send from `hello@yourclientdomain.com` or `no-reply@yourclientdomain.com`

---

## Step 4 — Install in Your App

```bash
npm install resend
```

Create a utility:

```ts
// lib/email.ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
```

---

## Step 5 — Create Email Templates

Use **React Email** for beautifully styled emails that render correctly in all clients:

```bash
npm install react-email @react-email/components
```

### Example: Welcome Email

```tsx
// emails/welcome.tsx
import {
  Body, Button, Container, Head, Heading,
  Html, Preview, Section, Text
} from '@react-email/components'

interface WelcomeEmailProps {
  userName: string
  loginUrl: string
}

export default function WelcomeEmail({ userName, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the platform, {userName}!</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto' }}>
          <Heading>Welcome, {userName} 👋</Heading>
          <Text>You're all set up. Click below to log in to your account.</Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={loginUrl} style={{ background: '#0070f3', color: '#fff', padding: '12px 24px', borderRadius: '5px' }}>
              Go to Dashboard
            </Button>
          </Section>
          <Text style={{ color: '#666', fontSize: '12px' }}>
            If you didn't sign up, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

### Send it

```ts
// In a Server Action or API route
import { resend } from '@/lib/email'
import WelcomeEmail from '@/emails/welcome'

await resend.emails.send({
  from: 'Your App <hello@yourclientdomain.com>',
  to: user.email,
  subject: 'Welcome to the platform!',
  react: <WelcomeEmail userName={user.name} loginUrl="https://yourclientdomain.com/login" />,
})
```

---

## Step 6 — Common Emails to Build

| Email | When to send |
|-------|-------------|
| **Welcome** | After signup |
| **Email verification** | Supabase handles this automatically |
| **Password reset** | Supabase handles this automatically |
| **Subscription started** | After successful Stripe checkout |
| **Payment failed** | Stripe webhook: `invoice.payment_failed` |
| **Subscription cancelled** | Stripe webhook: `customer.subscription.deleted` |
| **Weekly report** (optional) | Cron job (Vercel cron or Supabase Edge Functions) |

---

## Step 7 — Preview Emails Locally

```bash
npx react-email dev
```

Opens a browser preview at `http://localhost:3000` showing all your email templates.

---

## Supabase Auth Email Customisation

For auth emails (confirm signup, reset password), customise them in Supabase rather than Resend:

1. Supabase → **Authentication** → **Email Templates**
2. Edit the HTML directly in the template editor
3. Use `{{ .ConfirmationURL }}` for the action link

Or switch to a custom SMTP server using Resend:
1. Supabase → **Project Settings** → **Authentication** → **SMTP Settings**
2. Host: `smtp.resend.com`
3. Port: `465`
4. User: `resend`
5. Password: your Resend API key
6. Sender email: `no-reply@yourclientdomain.com`

---

## Checklist

- [ ] Resend account created
- [ ] API key copied to `env-template.txt`
- [ ] Sending domain verified (DNS records added)
- [ ] `resend` package installed
- [ ] Welcome email template created
- [ ] Payment confirmation email created
- [ ] Payment failed email created
- [ ] Supabase auth emails customised or using Resend SMTP
