import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const history = await prisma.history.findMany({
    where: { user_id: session.user.id },
    orderBy: { created_at: "desc" },
    select: { id: true, description: true, points: true, created_at: true },
  });

  return NextResponse.json(history);
}
