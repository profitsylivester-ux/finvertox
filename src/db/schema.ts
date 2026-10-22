import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const financeTerms = pgTable('finance_terms', {
  id: serial('id').primaryKey(),
  term: text('term').notNull(),
  keywords: text('keywords').notNull(),
  definition: text('definition').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
