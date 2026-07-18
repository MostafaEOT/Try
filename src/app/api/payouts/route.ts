import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId");
  if (!providerId) return NextResponse.json([]);
  const payouts = await prisma.payoutRequest.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payouts);
}

export async function POST(request: Request) {
  const { providerId, amount, bankAccount } = await request.json();
  await prisma.provider.update({ where: { id: providerId }, data: { bankAccount } });
  const payout = await prisma.payoutRequest.create({
    data: { providerId, amount, bankAccount, status: "pending" },
  });
  return NextResponse.json(payout, { status: 201 });
}
