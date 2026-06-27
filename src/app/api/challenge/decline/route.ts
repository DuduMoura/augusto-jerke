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
      challenger_user: { select: { id: true, points: true } },
      challenged_user: { select: { id: true, points: true } },
    },
  });

  if (!challenge) return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 });
  if (challenge.challenged_user_id !== session.user.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  if (challenge.is_finished) return NextResponse.json({ error: "Desafio já finalizado" }, { status: 400 });

  await prisma.$transaction([
    prisma.challenge.update({ where: { id: challengeId }, data: { is_finished: true } }),
    prisma.user.update({
      where: { id: challenge.challenger_user_id },
      data: { points: Math.max(0, challenge.challenger_user.points) + 5 },
    }),
    prisma.user.update({
      where: { id: challenge.challenged_user_id },
      data: { points: Math.max(0, challenge.challenged_user.points - 3) },
    }),
    prisma.history.create({
      data: {
        user_id: challenge.challenger_user_id,
        description: `Desafio recusado por ${challenge.challenged_user.id}. +5 pontos`,
        points: 5,
      },
    }),
    prisma.history.create({
      data: {
        user_id: challenge.challenged_user_id,
        description: `Você recusou um desafio. -3 pontos`,
        points: -3,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
