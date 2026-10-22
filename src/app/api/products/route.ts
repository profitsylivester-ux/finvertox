import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    
    const list = await db.select().from(products).where(eq(products.tenantId, tenantId)).orderBy(desc(products.createdAt));
    
    return NextResponse.json({ products: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    const { code, name, description, costPrice, sellingPrice, stockQuantity } = await req.json();

    if (!code || !name || costPrice === undefined || sellingPrice === undefined) {
      return NextResponse.json({ error: "Code, Name, Cost, and Selling Price are required" }, { status: 400 });
    }

    const [newProduct] = await db.insert(products).values({
      tenantId,
      code,
      name,
      description,
      costPrice: costPrice.toString(),
      sellingPrice: sellingPrice.toString(),
      stockQuantity: stockQuantity ? stockQuantity.toString() : '0.00'
    }).returning();

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}