import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["homeowner", "tradesperson", "admin"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending", "confirmed", "in_progress", "completed", "cancelled",
]);
export const jobStatusEnum = pgEnum("job_status", [
  "open", "quoted", "in_progress", "completed", "cancelled",
]);
export const tradeTypeEnum = pgEnum("trade_type", [
  "electrician", "plumber", "carpenter", "roofer", "painter",
  "hvac", "landscaper", "tiler", "builder", "plasterer",
  "locksmith", "handyman",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  password: text("password"),
  role: userRoleEnum("role").notNull().default("homeowner"),
  phone: text("phone"),
  location: text("location"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tradeProfiles = pgTable("trade_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tradeType: tradeTypeEnum("trade_type").notNull(),
  headline: text("headline"),
  description: text("description"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  dayRate: decimal("day_rate", { precision: 10, scale: 2 }),
  experienceYears: integer("experience_years"),
  licenseNumber: text("license_number"),
  insuranceVerified: boolean("insurance_verified").default(false),
  backgroundChecked: boolean("background_checked").default(false),
  verified: boolean("verified").default(false),
  available: boolean("available").default(true),
  responseTime: text("response_time").default("within 24 hours"),
  serviceRadius: integer("service_radius").default(25),
  skills: text("skills").array(),
  portfolioImages: text("portfolio_images").array(),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  completedJobs: integer("completed_jobs").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  homeownerId: uuid("homeowner_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tradeType: tradeTypeEnum("trade_type").notNull(),
  location: text("location").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  budgetType: text("budget_type").default("fixed"),
  status: jobStatusEnum("status").default("open").notNull(),
  urgency: text("urgency").default("flexible"),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id),
  tradespersonId: uuid("tradesperson_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  estimatedDays: integer("estimated_days"),
  accepted: boolean("accepted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").references(() => jobs.id),
  homeownerId: uuid("homeowner_id").notNull().references(() => users.id),
  tradespersonId: uuid("tradesperson_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  agreedPrice: decimal("agreed_price", { precision: 10, scale: 2 }),
  status: bookingStatusEnum("status").default("pending").notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  homeownerId: uuid("homeowner_id").notNull().references(() => users.id),
  tradespersonId: uuid("tradesperson_id").notNull().references(() => users.id),
  jobId: uuid("job_id").references(() => jobs.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id),
  senderId: uuid("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id),
  revieweeId: uuid("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  title: text("title"),
  comment: text("comment"),
  qualityRating: integer("quality_rating"),
  timelinessRating: integer("timeliness_rating"),
  valueRating: integer("value_rating"),
  communicationRating: integer("communication_rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NextAuth required tables
export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
}, (t) => ({ pk: primaryKey({ columns: [t.provider, t.providerAccountId] }) }));

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.identifier, t.token] }) }));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  tradeProfile: one(tradeProfiles, { fields: [users.id], references: [tradeProfiles.userId] }),
  postedJobs: many(jobs),
  bookingsAsHomeowner: many(bookings, { relationName: "homeownerBookings" }),
  bookingsAsTradesperson: many(bookings, { relationName: "tradespersonBookings" }),
  reviewsGiven: many(reviews, { relationName: "reviewsGiven" }),
  reviewsReceived: many(reviews, { relationName: "reviewsReceived" }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  homeowner: one(users, { fields: [bookings.homeownerId], references: [users.id], relationName: "homeownerBookings" }),
  tradesperson: one(users, { fields: [bookings.tradespersonId], references: [users.id], relationName: "tradespersonBookings" }),
  review: one(reviews, { fields: [bookings.id], references: [reviews.bookingId] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  homeowner: one(users, { fields: [conversations.homeownerId], references: [users.id] }),
  tradesperson: one(users, { fields: [conversations.tradespersonId], references: [users.id] }),
  messages: many(messages),
}));
