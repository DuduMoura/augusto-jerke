import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: { id: true, username: true, house: true, points: true },
    orderBy: { username: "asc" },
  });

  return NextResponse.json(users);
}

const updateSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e underscore"),
});

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { username } = result.data;

  const existing = await prisma.user.findFirst({
    where: { username, id: { not: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "Username já em uso" }, { status: 409 });

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { username },
    select: { id: true, username: true, email: true, house: true, points: true },
  });

  return NextResponse.json(user);
}
