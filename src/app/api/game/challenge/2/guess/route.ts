import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import characters from "@/app/data/characters.json";

const MAX_ATTEMPTS = 8;

const guessSchema = z.object({
  gameId: z.string(),
  characterId: z.string(),
  previousGuesses: z.array(z.string()).default([]),
  attemptsUsed: z.number().default(0),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const result = guessSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { gameId, characterId, previousGuesses, attemptsUsed } = result.data;

  if (previousGuesses.includes(characterId)) {
    return NextResponse.json({ error: "Personagem já tentado" }, { status: 409 });
  }

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
    select: {
      game_2_character_id: true,
      challenge_1_done: true,
      challenge_2_done: true,
    },
  });

  if (!game) return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  if (!game.challenge_1_done) return NextResponse.json({ error: "Complete o desafio 1 primeiro" }, { status: 403 });
  if (game.challenge_2_done) return NextResponse.json({ error: "Desafio já concluído" }, { status: 400 });

  const won = characterId === game.game_2_character_id;
  const newAttempts = attemptsUsed + 1;

  if (won) {
    await prisma.game.update({
      where: { id: gameId },
      data: { challenge_2_done: true, challenge_2_penalty: 0 },
    });
    const character = characters.find((c) => c.id === game.game_2_character_id);
    return NextResponse.json({ won: true, attemptsUsed: newAttempts, character });
  }

  if (newAttempts >= MAX_ATTEMPTS) {
    await prisma.game.update({
      where: { id: gameId },
      data: { challenge_2_done: true, challenge_2_penalty: MAX_ATTEMPTS },
    });
    const character = characters.find((c) => c.id === game.game_2_character_id);
    return NextResponse.json({
      won: false,
      eliminated: true,
      attemptsUsed: newAttempts,
      character,
      penalty: MAX_ATTEMPTS,
    });
  }

  return NextResponse.json({ won: false, attemptsUsed: newAttempts });
}
