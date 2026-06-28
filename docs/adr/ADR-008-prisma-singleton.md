# ADR-008 — Singleton do Prisma Client para evitar esgotamento de conexões

**Data:** 2026-06-27
**Status:** Aceito

## Contexto

Em desenvolvimento com Next.js e Hot Module Replacement (HMR), cada re-avaliação do módulo cria uma nova instância de `PrismaClient`, abrindo um novo connection pool. Isso esgota rapidamente as conexões disponíveis no PostgreSQL. O problema não ocorre em produção (sem HMR), mas precisa ser tratado explicitamente.

## Decisão

O `PrismaClient` é instanciado uma única vez em `src/lib/prisma.ts`, armazenado em `globalThis` em modo de desenvolvimento para sobreviver ao HMR. Em produção, o módulo é avaliado uma única vez por processo, então `globalThis` não é usado.

```ts
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Nenhuma API Route instancia `new PrismaClient()` diretamente — todas importam de `src/lib/prisma.ts`.

## Consequências

**Positivas:**
- Sem erro de "too many connections" durante desenvolvimento com HMR ativo.
- Ponto único de configuração: o adaptador `PrismaPg` com `pg.Pool` é configurado uma só vez.
- Fácil de mockar em testes — basta substituir a exportação do módulo.

**Negativas:**
- Requer disciplina: qualquer `new PrismaClient()` fora de `src/lib/prisma.ts` quebra a garantia de singleton — coberto pela regra em `rules/backend-rules.md`.