import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: { reviews: { orderBy: { id: "desc" } }, category: true },
  });
  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(provider);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const allowed = ["bio", "hourlyRate", "location", "availability", "online", "responseTime", "bankAccount", "subcategory"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }
  const provider = await prisma.provider.update({ where: { id }, data });
  return NextResponse.json(provider);
}
