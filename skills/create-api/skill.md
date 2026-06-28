# Skill: create-api

Cria uma nova rota de API do Next.js seguindo as convenções do projeto.

## Passos

1. Criar o arquivo em `src/app/api/<recurso>/route.ts`
2. Importar `getServerSession` de `next-auth` e `authOptions` de `src/lib/auth.ts` para rotas protegidas
3. Importar o singleton do Prisma de `src/lib/prisma.ts`
4. Definir um schema Zod para o body da requisição (apenas POST/PUT)
5. Implementar o handler: verificar sessão → validar body → consultar banco → retornar resposta
6. Nunca retornar o campo `password` — usar `select` para excluí-lo
7. Retornar códigos HTTP tipados: `200`, `201`, `400`, `401`, `403`, `404`, `409`

## Template

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  // definir campos aqui
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(result.error.errors, { status: 400 });
  }

  // lógica de negócio aqui

  return NextResponse.json(data, { status: 201 });
}
```