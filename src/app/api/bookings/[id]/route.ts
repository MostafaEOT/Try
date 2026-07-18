import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const notificationMessages: Record<string, string> = {
  confirmed: "Your booking has been confirmed by the provider.",
  "in-progress": "Your provider has started the job.",
  completed: "Your job is complete! Please leave a review.",
  cancelled: "Your booking has been cancelled.",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      provider: { select: { id: true, name: true, avatar: true, subcategory: true, hourlyRate: true } },
      customer: { select: { id: true, name: true, avatar: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      dispute: true,
    },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(booking);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, jobPhotos } = body;

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (jobPhotos) data.jobPhotos = jobPhotos;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  let booking;
  try {
    booking = await prisma.booking.update({
      where: { id },
      data,
      include: { customer: { select: { id: true } } },
    });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    throw e;
  }

  if (status && notificationMessages[status]) {
    await prisma.notification.create({
      data: {
        userId: booking.customer.id,
        type: "booking_" + status,
        message: notificationMessages[status],
        bookingId: id,
      },
    });
  }

  return NextResponse.json(booking);
}
