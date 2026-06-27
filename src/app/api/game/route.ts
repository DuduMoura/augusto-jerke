import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import characters from "@/app/data/characters.json";
import spells from "@/app/data/spells.json";

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const char1 = randomItem(characters);
  let char2 = randomItem(characters);
  while (char2.id === char1.id) char2 = randomItem(characters);
  const spell = randomItem(spells);

  const game = await prisma.game.create({
    data: {
      game_1_character_id: char1.id,
      game_2_character_id: char2.id,
      game_3_spell_id: spell.id,
      userId: session.user.id,
    },
    select: {
      id: true,
      game_1_character_id: true,
      game_2_character_id: true,
      game_3_spell_id: true,
    },
  });

  return NextResponse.json(
    {
      gameId: game.id,
      characterId1: game.game_1_character_id,
      characterId2: game.game_2_character_id,
      spellId3: game.game_3_spell_id,
    },
    { status: 201 }
  );
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const game = await prisma.game.findFirst({
    where: { userId: session.user.id },
    orderBy: { created_date: "desc" },
    select: {
      id: true,
      game_1_character_id: true,
      game_2_character_id: true,
      game_3_spell_id: true,
      attempts: true,
      challenge_1_done: true,
      challenge_2_done: true,
      challenge_2_penalty: true,
    },
  });

  if (!game) return NextResponse.json({ game: null });
  return NextResponse.json({ game });
}
