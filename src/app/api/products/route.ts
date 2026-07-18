import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("shopId");

  const products = await prisma.product.findMany({
    where: shopId ? { shopId } : {},
    include: { shop: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const { shopId, name, description, price, unit, category } = await request.json();
  if (!shopId || !name || price === undefined) {
    return NextResponse.json({ error: "shopId, name, and price are required" }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: {
      shopId,
      name,
      description: description || "",
      price: Number(price),
      unit: unit || "unit",
      category: category || "",
    },
  });
  return NextResponse.json(product, { status: 201 });
}
