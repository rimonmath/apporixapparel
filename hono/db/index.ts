import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'
import 'dotenv/config'

// for query purposes
const queryClient = postgres({
  host: process.env.VITE_DBHOST,
  port: Number(process.env.VITE_DBPORT),
  database: process.env.VITE_DBNAME,
  username: process.env.VITE_DBUSERNAME,
  password: process.env.VITE_DBPASSWORD,
})

export const db = drizzle(queryClient, { schema })
