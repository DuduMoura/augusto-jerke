import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;

  const game = await prisma.game.findUnique({ where: { id }, select: { userId: true } });
  if (!game || game.userId !== session.user.id) {
    return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  }

  await prisma.game.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
