import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const featured = searchParams.get("featured") === "true";

  const providers = await prisma.provider.findMany({
    where: categoryId ? { categoryId } : undefined,
    include: { reviews: true },
    orderBy: { rating: "desc" },
    take: featured ? 8 : undefined,
  });

  return NextResponse.json(providers);
}
