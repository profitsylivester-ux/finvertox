import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // In Next.js 15/16, params must be awaited
    const { id } = await params;
    const body = await req.json();
    
    await db.update(users).set({ status: body.status }).where(eq(users.id, parseInt(id)));
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if there are linked records before deleting to prevent DB crash
    // For now, we will just try to delete and catch the error if foreign keys exist
    await db.delete(users).where(eq(users.id, parseInt(id)));
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Cannot delete tenant. They likely have active invoices, accounts, or journals linked to them." }, { status: 500 });
  }
}