import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { providerId, customerId, author, avatar, rating, comment, service, bookingId } = await request.json();

  const review = await prisma.review.create({
    data: { providerId, customerId, author, avatar, rating, comment, service, date: "Just now" },
  });

  if (bookingId) {
    await prisma.booking.update({ where: { id: bookingId }, data: { reviewed: true } });
  }

  const allReviews = await prisma.review.findMany({ where: { providerId } });
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  await prisma.provider.update({
    where: { id: providerId },
    data: { rating: Math.round(avg * 10) / 10, reviewCount: allReviews.length },
  });

  const provider = await prisma.provider.findUnique({ where: { id: providerId }, select: { name: true } });
  if (provider) {
    const providerUser = await prisma.user.findFirst({ where: { name: provider.name } });
    if (providerUser) {
      await prisma.notification.create({
        data: { userId: providerUser.id, type: "new_review", message: `${author} left you a ${rating}-star review.`, bookingId },
      });
    }
  }

  return NextResponse.json(review, { status: 201 });
}
