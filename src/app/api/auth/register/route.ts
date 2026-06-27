import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(20, "Username deve ter no máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Username só pode conter letras, números e underscores"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  house: z.enum(["GRYFFINDOR", "HUFFLEPUFF", "RAVENCLAW", "SLYTHERIN"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, email, password, house } = result.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username }],
      },
      select: { email: true, username: true },
    });

    if (existing) {
      if (existing.email === normalizedEmail) {
        return NextResponse.json({ error: "Este e-mail já está em uso" }, { status: 409 });
      }
      return NextResponse.json({ error: "Este username já está em uso" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, email: normalizedEmail, password: hashedPassword, house },
      select: { id: true, username: true, email: true, house: true, points: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
