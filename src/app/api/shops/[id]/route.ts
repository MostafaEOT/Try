import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shop = await prisma.shop.findUnique({
    where: { id },
    include: { products: { orderBy: { name: "asc" } } },
  });
  if (!shop) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(shop);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const allowed = ["name", "description", "location", "phone", "specialties", "online"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  try {
    const shop = await prisma.shop.update({ where: { id }, data });
    return NextResponse.json(shop);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw e;
  }
}
