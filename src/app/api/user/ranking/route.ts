import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { points: "desc" },
    select: { id: true, username: true, house: true, points: true },
  });

  return NextResponse.json(users);
}
