import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || "postgres://admin:secretpassword@localhost:5434/finvortex";
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
