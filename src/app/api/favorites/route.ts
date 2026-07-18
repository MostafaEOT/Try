import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json([]);
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { provider: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(favorites.map((f: { provider: unknown }) => f.provider));
}

export async function POST(request: Request) {
  const { userId, providerId } = await request.json();
  const existing = await prisma.favorite.findUnique({
    where: { userId_providerId: { userId, providerId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { userId_providerId: { userId, providerId } } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId, providerId } });
  return NextResponse.json({ favorited: true });
}
