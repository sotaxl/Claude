import {
  pgTable, text, timestamp, integer, boolean, pgEnum,
  primaryKey, index, uniqueIndex, real, jsonb,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { nanoid } from "nanoid"

// ─── Enums ────────────────────────────────────────────────────────────────────
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing", "active", "past_due", "canceled", "cancel_pending", "paused", "unpaid",
])
export const projectStatusEnum = pgEnum("project_status", [
  "planning", "active", "review", "completed", "on-hold",
])
export const clientStatusEnum = pgEnum("client_status", [
  "active", "inactive", "prospect",
])

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  // Stripe
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { mode: "date" }),
  subscriptionStatus: subscriptionStatusEnum("subscription_status"),
  // Metadata
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
  stripeIdx: index("users_stripe_idx").on(t.stripeCustomerId),
}))

// ─── NextAuth tables ──────────────────────────────────────────────────────────
export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (t) => ({
  pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  userIdx: index("accounts_user_idx").on(t.userId),
}))

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => ({
  userIdx: index("sessions_user_idx").on(t.userId),
}))

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.identifier, t.token] }),
}))

// ─── Clients ──────────────────────────────────────────────────────────────────
export const clients = pgTable("clients", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  company: text("company"),
  avatar: text("avatar"),
  status: clientStatusEnum("status").default("active").notNull(),
  notes: text("notes"),
  portalToken: text("portal_token").unique().$defaultFn(() => nanoid(32)),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  userIdx: index("clients_user_idx").on(t.userId),
}))

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("planning").notNull(),
  dueDate: timestamp("due_date", { mode: "date" }),
  budget: integer("budget"),
  invoiced: integer("invoiced").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  userIdx: index("projects_user_idx").on(t.userId),
  clientIdx: index("projects_client_idx").on(t.clientId),
}))

// ─── Activity Feed ────────────────────────────────────────────────────────────
export const activities = pgTable("activities", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  entityId: text("entity_id"),
  entityType: text("entity_type"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  userIdx: index("activities_user_idx").on(t.userId),
}))

// ─── Relations ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  clients: many(clients),
  projects: many(projects),
  activities: many(activities),
}))

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  projects: many(projects),
}))

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Activity = typeof activities.$inferSelect

// ─── Autonomous SaaS OS ───────────────────────────────────────────────────────
export const autonomousPortfolio = pgTable("autonomous_portfolio", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  targetMarket: text("target_market").notNull(),
  revenue: real("revenue").notNull().default(0),
  growth: real("growth").notNull().default(0),
  churn: real("churn").notNull().default(0),
  score: real("score").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  scoreIdx: index("portfolio_score_idx").on(t.score),
}))

export const autonomousAnalytics = pgTable("autonomous_analytics", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  totalRevenue: real("total_revenue").notNull(),
  productCount: integer("product_count").notNull(),
  strategy: jsonb("strategy"),
  topAction: jsonb("top_action"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const autonomousSystemLog = pgTable("autonomous_system_log", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  level: text("level").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
  createdAtIdx: index("system_log_created_at_idx").on(t.createdAt),
}))

export type AutonomousProduct = typeof autonomousPortfolio.$inferSelect
export type NewAutonomousProduct = typeof autonomousPortfolio.$inferInsert
export type AutonomousAnalytics = typeof autonomousAnalytics.$inferSelect
