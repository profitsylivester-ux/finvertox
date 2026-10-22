import { pgTable, serial, text, timestamp, decimal, integer, boolean } from 'drizzle-orm/pg-core';

export const financeTerms = pgTable('finance_terms', { id: serial('id').primaryKey(), term: text('term').notNull(), keywords: text('keywords').notNull(), definition: text('definition').notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
export const users = pgTable('users', { 
  id: serial('id').primaryKey(), 
  tenantId: integer('tenant_id'), 
  email: text('email').notNull().unique(), 
  passwordHash: text('password_hash').notNull(), 
  firstName: text('first_name').notNull(), 
  lastName: text('last_name').notNull(), 
  companyName: text('company_name').notNull(), 
  role: text('role').default('admin').notNull(), 
  status: text('status').default('active').notNull(),
  currency: text('currency').default('TZS').notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull() 
});
export const accounts = pgTable('accounts', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), code: text('code').notNull(), name: text('name').notNull(), type: text('type').notNull(), balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00').notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
export const journalEntries = pgTable('journal_entries', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), date: text('date').notNull(), description: text('description').notNull(), reference: text('reference'), status: text('status').default('posted').notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
export const journalLines = pgTable('journal_lines', { id: serial('id').primaryKey(), journalId: integer('journal_id').references(() => journalEntries.id).notNull(), accountId: integer('account_id').references(() => accounts.id).notNull(), type: text('type').notNull(), amount: decimal('amount', { precision: 15, scale: 2 }).notNull() });
export const fiscalPeriods = pgTable('fiscal_periods', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), month: integer('month').notNull(), year: integer('year').notNull(), status: text('status').default('open').notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
export const customers = pgTable('customers', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), name: text('name').notNull(), email: text('email'), phone: text('phone'), address: text('address'), createdAt: timestamp('created_at').defaultNow().notNull() });
export const invoices = pgTable('invoices', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), customerId: integer('customer_id').references(() => customers.id).notNull(), invoiceNumber: text('invoice_number').notNull(), date: text('date').notNull(), dueDate: text('due_date').notNull(), status: text('status').default('unpaid').notNull(), subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(), total: decimal('total', { precision: 15, scale: 2 }).notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
export const invoiceItems = pgTable('invoice_items', { id: serial('id').primaryKey(), invoiceId: integer('invoice_id').references(() => invoices.id).notNull(), description: text('description').notNull(), quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(), unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(), total: decimal('total', { precision: 15, scale: 2 }).notNull() });

// UPDATED: Added bankAccountId to payments
export const payments = pgTable('payments', { 
  id: serial('id').primaryKey(), 
  tenantId: integer('tenant_id').references(() => users.id).notNull(), 
  invoiceId: integer('invoice_id').references(() => invoices.id).notNull(), 
  bankAccountId: integer('bank_account_id').references(() => bankAccounts.id), // NEW
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(), 
  date: text('date').notNull(), 
  method: text('method').default('Bank Transfer').notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull() 
});

export const suppliers = pgTable('suppliers', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), name: text('name').notNull(), email: text('email'), phone: text('phone'), address: text('address'), createdAt: timestamp('created_at').defaultNow().notNull() });
export const expenses = pgTable('expenses', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), supplierId: integer('supplier_id').references(() => suppliers.id).notNull(), expenseAccountId: integer('expense_account_id').references(() => accounts.id).notNull(), date: text('date').notNull(), description: text('description').notNull(), amount: decimal('amount', { precision: 15, scale: 2 }).notNull(), status: text('status').default('unpaid').notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });

// UPDATED: Added bankAccountId to expensePayments
export const expensePayments = pgTable('expense_payments', { 
  id: serial('id').primaryKey(), 
  tenantId: integer('tenant_id').references(() => users.id).notNull(), 
  expenseId: integer('expense_id').references(() => expenses.id).notNull(), 
  bankAccountId: integer('bank_account_id').references(() => bankAccounts.id), // NEW
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(), 
  date: text('date').notNull(), 
  method: text('method').default('Bank Transfer').notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull() 
});

export const companySettings = pgTable('company_settings', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull().unique(), tin: text('tin'), vatRate: decimal('vat_rate', { precision: 5, scale: 2 }).default('18.00').notNull(), address: text('address'), phone: text('phone'), email: text('email'), updatedAt: timestamp('updated_at').defaultNow().notNull() });
export const deletedRecords = pgTable('deleted_records', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), recordType: text('record_type').notNull(), recordId: integer('record_id').notNull(), recordData: text('record_data').notNull(), status: text('status').default('pending_deletion').notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
export const bankAccounts = pgTable('bank_accounts', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), name: text('name').notNull(), accountNumber: text('account_number'), type: text('type').notNull(), balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00').notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
export const activityLogs = pgTable('activity_logs', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), userName: text('user_name').notNull(), action: text('action').notNull(), details: text('details').notNull(), isRead: boolean('is_read').default(false).notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
export const budgets = pgTable('budgets', { id: serial('id').primaryKey(), tenantId: integer('tenant_id').references(() => users.id).notNull(), accountId: integer('account_id').references(() => accounts.id).notNull(), month: integer('month').notNull(), year: integer('year').notNull(), allocatedAmount: decimal('allocated_amount', { precision: 15, scale: 2 }).notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });