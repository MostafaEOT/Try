import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, email, avatar } = await request.json();
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(avatar && { avatar }),
      },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });
    return NextResponse.json(user);
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    throw e;
  }
}
