import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) return NextResponse.json([]);
  const messages = await prisma.message.findMany({
    where: { bookingId },
    include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const { bookingId, senderId, content } = await request.json();
  const message = await prisma.message.create({
    data: { bookingId, senderId, content },
    include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
  });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { id: true } },
      provider: { select: { name: true } },
    },
  });

  if (booking) {
    let recipientId: string | undefined;
    if (senderId === booking.customerId) {
      const providerUser = await prisma.user.findFirst({ where: { name: booking.provider.name } });
      recipientId = providerUser?.id;
    } else {
      recipientId = booking.customerId;
    }
    if (recipientId) {
      await prisma.notification.create({
        data: { userId: recipientId, type: "new_message", message: "You have a new message about your booking.", bookingId },
      });
    }
  }

  return NextResponse.json(message, { status: 201 });
}
