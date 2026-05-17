import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

// Falls back to a placeholder so the module loads without DATABASE_URL.
// Any actual query will throw at runtime — auth routes will fail, but
// routes that don't touch the DB (e.g. /studio) are unaffected.
const sql = neon(process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost/placeholder")
export const db = drizzle(sql, { schema })
