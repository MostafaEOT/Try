import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) return NextResponse.json(null);
  const dispute = await prisma.dispute.findUnique({ where: { bookingId } });
  return NextResponse.json(dispute);
}

export async function POST(request: Request) {
  const { bookingId, customerId, reason, description } = await request.json();
  try {
    const dispute = await prisma.dispute.create({
      data: { bookingId, customerId, reason, description },
    });
    return NextResponse.json(dispute, { status: 201 });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return NextResponse.json({ error: "Dispute already exists" }, { status: 409 });
    throw e;
  }
}
