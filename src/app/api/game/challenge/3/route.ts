import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import spells from "@/app/data/spells.json";

function randomItems<T>(arr: T[], count: number, exclude: T): T[] {
  const pool = arr.filter((item) => item !== exclude);
  const result: T[] = [];
  const used = new Set<number>();
  while (result.length < count && result.length < pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    if (!used.has(idx)) {
      used.add(idx);
      result.push(pool[idx]);
    }
  }
  return result;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");

  if (!gameId) return NextResponse.json({ error: "gameId obrigatório" }, { status: 400 });

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
    select: {
      game_3_spell_id: true,
      challenge_2_done: true,
    },
  });

  if (!game) return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  if (!game.challenge_2_done) return NextResponse.json({ error: "Complete o desafio 2 primeiro" }, { status: 403 });

  const secretSpell = spells.find((s) => s.id === game.game_3_spell_id)!;
  const distractors = randomItems(spells, 3, secretSpell);
  const options = [...distractors, secretSpell].sort(() => Math.random() - 0.5);

  return NextResponse.json({
    description: secretSpell.description,
    options: options.map((s) => ({ id: s.id, name: s.name })),
  });
}
