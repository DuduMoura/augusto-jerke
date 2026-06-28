# ADR-003 — Prisma ORM com PostgreSQL

**Data:** 2026-06-27
**Status:** Aceito

## Contexto

O projeto precisa de um banco de dados relacional para persistir usuários, jogos, desafios e histórico de pontos. Era necessário escolher o banco e a estratégia de acesso (ORM vs. query builder vs. SQL direto).

## Decisão

Usar **PostgreSQL** como banco de dados e **Prisma 6** como ORM, com o adaptador `@prisma/adapter-pg` e connection pool via `pg.Pool`. O schema é declarado em `prisma/schema.prisma` e as migrações são gerenciadas pelo Prisma Migrate.

## Consequências

**Positivas:**
- Schema tipado em `prisma/schema.prisma` gera tipos TypeScript automaticamente — erros de acesso ao banco aparecem em tempo de compilação.
- `prisma migrate dev` mantém banco e tipos sincronizados sem SQL manual.
- Query builder tipado elimina SQL injection sem necessidade de `$queryRaw`.
- `select` do Prisma garante exclusão explícita do campo `password` nas respostas.

**Negativas:**
- O adaptador `PrismaPg` é necessário para Prisma 6 com Next.js em ambiente serverless/edge; adiciona uma camada de configuração em `src/lib/prisma.ts`.
- Queries complexas (ex: joins com agregações) ficam mais verbosas no Prisma do que em SQL puro.