import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // @ts-expect-error DrizzleAdapter type mismatch between auth.js versions
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1)

        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          subscriptionStatus: user.subscriptionStatus,
          stripePriceId: user.stripePriceId,
          stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.subscriptionStatus = user.subscriptionStatus ?? null
        token.stripePriceId = user.stripePriceId ?? null
        token.stripeCurrentPeriodEnd = user.stripeCurrentPeriodEnd ?? null
      }

      // Refresh subscription data from DB on each request
      if (token.id) {
        const [dbUser] = await db
          .select({
            subscriptionStatus: users.subscriptionStatus,
            stripePriceId: users.stripePriceId,
            stripeCurrentPeriodEnd: users.stripeCurrentPeriodEnd,
          })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1)

        if (dbUser) {
          token.subscriptionStatus = dbUser.subscriptionStatus ?? null
          token.stripePriceId = dbUser.stripePriceId ?? null
          token.stripeCurrentPeriodEnd = dbUser.stripeCurrentPeriodEnd ?? null
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          subscriptionStatus: token.subscriptionStatus as string | null,
          stripePriceId: token.stripePriceId as string | null,
          stripeCurrentPeriodEnd: token.stripeCurrentPeriodEnd as Date | null,
        },
      }
    },
  },
  events: {
    async createUser({ user }) {
      // Trigger welcome email on signup
      if (user.email) {
        try {
          const { sendWelcomeEmail } = await import("@/lib/email")
          await sendWelcomeEmail({ to: user.email, name: user.name ?? "there" })
        } catch (e) {
          console.error("Failed to send welcome email:", e)
        }
      }
    },
  },
}
