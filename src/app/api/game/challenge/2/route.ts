import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import characters from "@/app/data/characters.json";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");

  if (!gameId) return NextResponse.json({ error: "gameId obrigatório" }, { status: 400 });

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
    select: {
      game_2_character_id: true,
      challenge_1_done: true,
      challenge_2_done: true,
      challenge_2_penalty: true,
    },
  });

  if (!game) return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  if (!game.challenge_1_done) return NextResponse.json({ error: "Complete o desafio 1 primeiro" }, { status: 403 });

  const char = characters.find((c) => c.id === game.game_2_character_id);
  return NextResponse.json({
    imageUrl: char?.image ?? "",
    done: game.challenge_2_done,
    penalty: game.challenge_2_penalty,
  });
}
