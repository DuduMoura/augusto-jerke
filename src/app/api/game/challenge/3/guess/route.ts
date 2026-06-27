import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const guessSchema = z.object({
  gameId: z.string(),
  spellId: z.string(),
  totalAttempts: z.number().default(0),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const result = guessSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { gameId, spellId, totalAttempts } = result.data;

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
    select: { game_3_spell_id: true, challenge_2_done: true },
  });

  if (!game) return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  if (!game.challenge_2_done) return NextResponse.json({ error: "Complete o desafio 2 primeiro" }, { status: 403 });

  const won = spellId === game.game_3_spell_id;

  if (won) {
    await prisma.game.update({
      where: { id: gameId },
      data: { attempts: totalAttempts },
    });
  }

  return NextResponse.json({ won });
}
