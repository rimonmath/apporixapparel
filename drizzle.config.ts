import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
  dialect: 'postgresql',
  schema: './hono/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env.VITE_DBHOST!,
    port: Number(process.env.VITE_DBPORT),
    database: process.env.VITE_DBNAME!,
    user: process.env.VITE_DBUSERNAME,
    password: process.env.VITE_DBPASSWORD,
    ssl: false,
  },
})
