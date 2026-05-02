import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const providerId = searchParams.get("providerId");

  const bookings = await prisma.booking.findMany({
    where: {
      ...(customerId ? { customerId } : {}),
      ...(providerId ? { providerId } : {}),
    },
    include: {
      provider: { select: { id: true, name: true, avatar: true, subcategory: true, hourlyRate: true } },
      customer: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const { customerId, providerId, service, date, time, address, notes, price } = await request.json();

  const booking = await prisma.booking.create({
    data: {
      customerId,
      providerId,
      service,
      date,
      time,
      address,
      notes,
      price: price ?? 0,
      status: "pending",
    },
    include: {
      provider: { select: { name: true, avatar: true } },
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
