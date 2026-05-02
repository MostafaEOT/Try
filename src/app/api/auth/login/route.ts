import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { email, password, role, name, avatar } = await request.json();

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Auto-create on first login (demo behaviour)
    const hashed = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: { name: name ?? email.split("@")[0], email, password: hashed, role, avatar: avatar ?? "U" },
    });
  } else {
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }
  }

  // For workers, find their linked Provider profile by name
  let providerId: string | undefined;
  if (user.role === "worker") {
    const provider = await prisma.provider.findFirst({ where: { name: user.name } });
    if (provider) providerId = provider.id;
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
