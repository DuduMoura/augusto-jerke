import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import characters from "@/app/data/characters.json";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const game = await prisma.game.findFirst({
    where: { userId: session.user.id },
    orderBy: { created_date: "desc" },
    select: { id: true, challenge_1_done: true },
  });

  if (!game) return NextResponse.json({ error: "Nenhum jogo ativo" }, { status: 404 });

  return NextResponse.json({
    gameId: game.id,
    characterPool: characters.map((c) => ({ id: c.id, name: c.name })),
    done: game.challenge_1_done,
  });
}
