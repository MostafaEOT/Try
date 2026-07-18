import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const { name, email, password, role, avatar, category, bio, rate, location } = await request.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, avatar },
  });

  let providerId: string | undefined;
  let shopId: string | undefined;

  if (role === "worker") {
    const existingProvider = await prisma.provider.findFirst({ where: { name } });
    if (existingProvider) {
      providerId = existingProvider.id;
      if (!existingProvider.userId) {
        await prisma.provider.update({ where: { id: existingProvider.id }, data: { userId: user.id } }).catch(() => {});
      }
    } else {
      const categoryId = category || "cleaning";
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      const safeCategory = cat ? categoryId : "cleaning";

      const provider = await prisma.provider.create({
        data: {
          id: randomUUID(),
          name,
          avatar,
          categoryId: safeCategory,
          subcategory: "",
          rating: 0,
          reviewCount: 0,
          hourlyRate: Number(rate) || 50,
          bio: bio || "",
          location: location || "",
          experience: 0,
          completedJobs: 0,
          responseTime: "~1 hour",
          verified: false,
          badges: [],
          availability: [],
          portfolio: [],
          online: false,
          distanceKm: 0,
          acceptanceRate: 0,
          userId: user.id,
        },
      });
      providerId = provider.id;
    }
  }

  if (role === "shop") {
    const shop = await prisma.shop.create({
      data: {
        name,
        avatar,
        description: bio || "",
        location: location || "",
        userId: user.id,
      },
    });
    shopId = shop.id;
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    providerId,
    shopId,
  });
}
