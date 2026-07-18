import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  const workerId = searchParams.get("workerId");
  const shopId = searchParams.get("shopId");

  const where: Record<string, string> = {};
  if (bookingId) where.bookingId = bookingId;
  if (workerId) where.workerId = workerId;
  if (shopId) where.shopId = shopId;

  const requests = await prisma.materialRequest.findMany({
    where,
    include: {
      items: { include: { product: { select: { id: true, name: true, unit: true } } } },
      shop: { select: { id: true, name: true } },
      booking: { select: { id: true, service: true, customerId: true } },
      worker: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const { bookingId, workerId, shopId, items, notes } = await request.json();

  if (!bookingId || !workerId || !shopId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "bookingId, workerId, shopId, and items are required" },
      { status: 400 }
    );
  }

  const productIds = items.map((i: { productId: string }) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const priceMap: Record<string, number> = Object.fromEntries(products.map((p) => [p.id, p.price]));

  const totalCost = items.reduce(
    (sum: number, item: { productId: string; quantity: number }) =>
      sum + (priceMap[item.productId] ?? 0) * item.quantity,
    0
  );

  const materialRequest = await prisma.materialRequest.create({
    data: {
      bookingId,
      workerId,
      shopId,
      notes: notes || "",
      totalCost,
      items: {
        create: items.map((item: { productId: string; quantity: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: priceMap[item.productId] ?? 0,
        })),
      },
    },
    include: {
      items: { include: { product: { select: { id: true, name: true, unit: true } } } },
      shop: { select: { id: true, name: true } },
    },
  });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { customerId: true, service: true },
  });
  if (booking) {
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: "material_request",
        message: `Your worker needs to purchase $${totalCost.toFixed(2)} in materials for your ${booking.service} job. Please review and approve.`,
        bookingId,
      },
    });
  }

  return NextResponse.json(materialRequest, { status: 201 });
}
