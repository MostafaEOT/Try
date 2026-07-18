import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const shop = await prisma.shop.findUnique({
      where: { userId },
      include: { products: { orderBy: { name: "asc" } } },
    });
    return NextResponse.json(shop);
  }

  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      name: true,
      avatar: true,
      description: true,
      location: true,
      specialties: true,
      online: true,
      products: { where: { inStock: true }, select: { id: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(shops);
}
