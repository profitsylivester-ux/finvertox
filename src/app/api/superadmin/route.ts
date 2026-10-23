import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Fetch all users who have the role 'admin' (these are the Company Owners)
    const tenantsData = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'));

    // 2. Format the data for the Super Admin Dashboard
    const tenants = tenantsData.map((tenant) => ({
      id: tenant.id,
      name: tenant.companyName || "Unnamed Company",
      plan: "Pro", // Mocked until you build billing
      users: 1, // Mocked for now
      tokens: 500, // Mocked for now
      status: tenant.status === "active" ? "Active" : "Suspended",
      mrr: 50000, // Mocked MRR (Monthly Recurring Revenue)
    }));

    // 3. Calculate the metrics
    const totalMRR = tenants.reduce((sum, t) => sum + t.mrr, 0);
    const activeTenants = tenants.filter(t => t.status === "Active").length;
    const totalTokens = tenants.reduce((sum, t) => sum + t.tokens, 0);

    return NextResponse.json({
      success: true,
      tenants,
      metrics: { totalMRR, activeTenants, totalTokens }
    });

  } catch (error) {
    console.error("Super Admin API Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}