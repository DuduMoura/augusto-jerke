import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  challenged_user_id: z.string(),
  game_id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const result = createSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { challenged_user_id, game_id } = result.data;

  if (challenged_user_id === session.user.id) {
    return NextResponse.json({ error: "Você não pode desafiar a si mesmo" }, { status: 400 });
  }

  const challenge = await prisma.challenge.create({
    data: {
      challenger_user_id: session.user.id,
      challenged_user_id,
      game_id: game_id ?? null,
    },
  });

  return NextResponse.json(challenge, { status: 201 });
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const [received, sent, completed] = await Promise.all([
    prisma.challenge.findMany({
      where: { challenged_user_id: session.user.id, is_finished: false },
      include: {
        challenger_user: { select: { id: true, username: true, house: true, points: true } },
        game: true,
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.challenge.findMany({
      where: { challenger_user_id: session.user.id, is_finished: false },
      include: {
        challenged_user: { select: { id: true, username: true, house: true, points: true } },
        game: true,
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.challenge.findMany({
      where: {
        OR: [{ challenger_user_id: session.user.id }, { challenged_user_id: session.user.id }],
        is_finished: true,
      },
      include: {
        challenger_user: { select: { id: true, username: true, house: true, points: true } },
        challenged_user: { select: { id: true, username: true, house: true, points: true } },
        game: true,
      },
      orderBy: { created_at: "desc" },
    }),
  ]);

  return NextResponse.json({ received, sent, completed });
}
