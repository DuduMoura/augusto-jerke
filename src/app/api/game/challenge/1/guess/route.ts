import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import characters from "@/app/data/characters.json";
import { Character } from "@/types/character";

const guessSchema = z.object({
  gameId: z.string(),
  characterId: z.string(),
  previousGuesses: z.array(z.string()).default([]),
});

type AttributeResult = "correct" | "wrong" | { status: "partial"; hint: "higher" | "lower" };

function compareCharacters(
  guessed: Character,
  secret: Character
): { attributes: Record<string, AttributeResult>; won: boolean } {
  const stringAttrs = ["house", "gender", "species", "ancestry", "eyeColour", "hairColour", "patronus"] as const;
  const attributes: Record<string, AttributeResult> = {};

  for (const attr of stringAttrs) {
    const g = (guessed[attr] as string).toLowerCase().trim();
    const s = (secret[attr] as string).toLowerCase().trim();
    attributes[attr] = g === s ? "correct" : "wrong";
  }

  if (guessed.yearOfBirth === secret.yearOfBirth) {
    attributes.yearOfBirth = "correct";
  } else if (guessed.yearOfBirth !== null && secret.yearOfBirth !== null) {
    attributes.yearOfBirth = {
      status: "partial",
      hint: guessed.yearOfBirth < secret.yearOfBirth ? "higher" : "lower",
    };
  } else {
    attributes.yearOfBirth = "wrong";
  }

  const won = Object.values(attributes).every((v) => v === "correct");
  return { attributes, won };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const result = guessSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { gameId, characterId, previousGuesses } = result.data;

  if (previousGuesses.includes(characterId)) {
    return NextResponse.json({ error: "Personagem já tentado" }, { status: 409 });
  }

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
    select: { game_1_character_id: true, challenge_1_done: true },
  });

  if (!game) return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  if (game.challenge_1_done) return NextResponse.json({ error: "Desafio já concluído" }, { status: 400 });

  const guessedChar = characters.find((c) => c.id === characterId) as Character | undefined;
  const secretChar = characters.find((c) => c.id === game.game_1_character_id) as Character | undefined;

  if (!guessedChar || !secretChar) {
    return NextResponse.json({ error: "Personagem inválido" }, { status: 400 });
  }

  const { attributes, won } = compareCharacters(guessedChar, secretChar);

  if (won) {
    await prisma.game.update({
      where: { id: gameId },
      data: { challenge_1_done: true },
    });
  }

  return NextResponse.json({ attributes, won, guessedCharacter: guessedChar });
}
