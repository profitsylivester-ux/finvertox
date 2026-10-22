import { db } from './index';
import { accounts } from './schema';

async function seedAccounts() {
  console.log("Seeding Chart of Accounts for Tenant ID 1...");
  
  const standardAccounts = [
    { tenantId: 1, code: '1000', name: 'Cash and Cash Equivalents', type: 'Asset' },
    { tenantId: 1, code: '1100', name: 'Accounts Receivable', type: 'Asset' },
    { tenantId: 1, code: '2000', name: 'Accounts Payable', type: 'Liability' },
    { tenantId: 1, code: '3000', name: 'Owner Equity', type: 'Equity' },
    { tenantId: 1, code: '4000', name: 'Sales Revenue', type: 'Revenue' },
    { tenantId: 1, code: '5000', name: 'Cost of Goods Sold', type: 'Expense' },
    { tenantId: 1, code: '6000', name: 'Operating Expenses', type: 'Expense' },
  ];

  for (const acc of standardAccounts) {
    await db.insert(accounts).values(acc);
  }
  
  console.log("Chart of Accounts seeded successfully!");
  process.exit(0);
}

seedAccounts();
