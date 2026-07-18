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

  // For workers, create or link a Provider profile
  let providerId: string | undefined;
  if (role === "worker") {
    // Check if a seeded provider already has this name
    const existing = await prisma.provider.findFirst({ where: { name } });
    if (existing) {
      providerId = existing.id;
      // Link the userId if not already set
      if (!existing.userId) {
        await prisma.provider.update({ where: { id: existing.id }, data: { userId: user.id } }).catch(() => {});
      }
    } else {
      const categoryId = category || "cleaning";
      // Verify the category exists before creating the provider
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

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    providerId,
  });
}
