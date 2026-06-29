import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  challengeId: z.string(),
  challengerAttempts: z.number(),
  challengedAttempts: z.number(),
});

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { challengeId, challengerAttempts, challengedAttempts } = result.data;

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      challenger_user: { select: { id: true, username: true, points: true } },
      challenged_user: { select: { id: true, username: true, points: true } },
    },
  });

  if (!challenge) return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 });
  if (challenge.is_finished) return NextResponse.json({ error: "Desafio já finalizado" }, { status: 400 });

  const challengedWon = challengedAttempts < challengerAttempts;
  const winnerId = challengedWon ? challenge.challenged_user_id : challenge.challenger_user_id;

  const challengerGain = challengedWon ? -10 : 10;
  const challengedGain = challengedWon ? 20 : -10;

  const challengerDesc = challengedWon
    ? `Você perdeu o desafio contra ${challenge.challenged_user.username}. -10 pontos`
    : `Você venceu o desafio contra ${challenge.challenged_user.username}. +10 pontos`;

  const challengedDesc = challengedWon
    ? `Você venceu o desafio contra ${challenge.challenger_user.username}. +20 pontos`
    : `Você perdeu o desafio contra ${challenge.challenger_user.username}. -10 pontos`;

  await prisma.$transaction([
    prisma.challenge.update({
      where: { id: challengeId },
      data: { is_finished: true, winner_user_id: winnerId },
    }),
    prisma.user.update({
      where: { id: challenge.challenger_user_id },
      data: { points: Math.max(0, challenge.challenger_user.points + challengerGain) },
    }),
    prisma.user.update({
      where: { id: challenge.challenged_user_id },
      data: { points: Math.max(0, challenge.challenged_user.points + challengedGain) },
    }),
    prisma.history.create({
      data: { user_id: challenge.challenger_user_id, description: challengerDesc, points: challengerGain },
    }),
    prisma.history.create({
      data: { user_id: challenge.challenged_user_id, description: challengedDesc, points: challengedGain },
    }),
  ]);

  return NextResponse.json({ success: true, winnerId });
}
