import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = await prisma.materialRequest.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      shop: { select: { id: true, name: true, userId: true } },
      booking: { select: { id: true, service: true, customerId: true } },
      worker: { select: { id: true, name: true } },
    },
  });
  if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(req);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await request.json();

  if (!["approved", "rejected", "delivered"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.materialRequest.findUnique({
    where: { id },
    include: {
      booking: { select: { id: true, customerId: true, service: true } },
      shop: { select: { id: true, name: true, userId: true } },
    },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.materialRequest.update({ where: { id }, data: { status } });

  if (status === "approved") {
    await prisma.booking.update({
      where: { id: existing.bookingId },
      data: { materialsTotal: { increment: existing.totalCost } },
    });
    if (existing.shop.userId) {
      await prisma.notification.create({
        data: {
          userId: existing.shop.userId,
          type: "material_order",
          message: `New order received! $${existing.totalCost.toFixed(2)} for a ${existing.booking.service} job.`,
          bookingId: existing.bookingId,
        },
      });
    }
    await prisma.notification.create({
      data: {
        userId: existing.workerId,
        type: "material_approved",
        message: `Customer approved your $${existing.totalCost.toFixed(2)} material purchase.`,
        bookingId: existing.bookingId,
      },
    });
  }

  if (status === "rejected") {
    await prisma.notification.create({
      data: {
        userId: existing.workerId,
        type: "material_rejected",
        message: `Customer rejected the material purchase request for the ${existing.booking.service} job.`,
        bookingId: existing.bookingId,
      },
    });
  }

  if (status === "delivered") {
    await prisma.notification.create({
      data: {
        userId: existing.workerId,
        type: "material_delivered",
        message: `${existing.shop.name} has delivered your materials. Check the job site.`,
        bookingId: existing.bookingId,
      },
    });
  }

  return NextResponse.json(updated);
}
