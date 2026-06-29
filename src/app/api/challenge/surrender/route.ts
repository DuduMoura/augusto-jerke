import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ challengeId: z.string() });

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { challengeId } = result.data;

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      challenger_user: { select: { id: true, username: true, points: true } },
      challenged_user: { select: { id: true, username: true, points: true } },
    },
  });

  if (!challenge) return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 });
  if (challenge.is_finished) return NextResponse.json({ error: "Desafio já finalizado" }, { status: 400 });

  const surrenderingId = session.user.id;
  const isChallenger = surrenderingId === challenge.challenger_user_id;
  const challengerUser = challenge.challenger_user;
  const challengedUser = challenge.challenged_user;

  await prisma.$transaction([
    prisma.challenge.update({
      where: { id: challengeId },
      data: {
        is_finished: true,
        winner_user_id: isChallenger ? challengedUser.id : challengerUser.id,
      },
    }),
    prisma.user.update({
      where: { id: challengerUser.id },
      data: {
        points: isChallenger
          ? Math.max(0, challengerUser.points - 10)
          : challengerUser.points + 20,
      },
    }),
    prisma.user.update({
      where: { id: challengedUser.id },
      data: {
        points: isChallenger
          ? challengedUser.points + 20
          : Math.max(0, challengedUser.points - 10),
      },
    }),
    prisma.history.create({
      data: {
        user_id: challengerUser.id,
        description: isChallenger
          ? `Você desistiu do desafio contra ${challengedUser.username}. -10 pontos`
          : `${challengedUser.username} desistiu do desafio. +20 pontos`,
        points: isChallenger ? -10 : 20,
      },
    }),
    prisma.history.create({
      data: {
        user_id: challengedUser.id,
        description: isChallenger
          ? `${challengerUser.username} desistiu do desafio. +20 pontos`
          : `Você desistiu do desafio contra ${challengerUser.username}. -10 pontos`,
        points: isChallenger ? 20 : -10,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
