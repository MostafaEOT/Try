import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const { id, isActive } = await request.json();
  const user = await prisma.user.update({ where: { id }, data: { isActive } });
  return NextResponse.json({ id: user.id, isActive: user.isActive });
}
