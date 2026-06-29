# ADR-001 — Next.js 15 como framework full-stack único

**Data:** 2026-06-27
**Status:** Aceito

## Contexto

O Potterdle precisa de um frontend interativo (React) e de uma camada de API (rotas protegidas, acesso ao banco, lógica de pontuação). A equipe precisava decidir entre separar frontend e backend em projetos distintos ou usar um único framework que cobrisse os dois lados.

## Decisão

Usar **Next.js 15 com App Router** como framework único, colocando as API Routes em `src/app/api/` e as páginas em `src/app/`. Frontend e backend vivem no mesmo repositório e são servidos pelo mesmo processo.

## Consequências

**Positivas:**
- Um único repositório, um único deploy, sem CORS a configurar.
- Tipos TypeScript compartilhados entre cliente e servidor sem pacotes extras.
- Server Components permitem buscar dados sem expô-los ao cliente.
- Turbopack acelera o ciclo de desenvolvimento.

**Negativas:**
- API Routes do Next.js não escalam horizontalmente de forma tão controlada quanto um serviço dedicado.
- Lógica de backend misturada na mesma estrutura de pastas do frontend exige disciplina de organização.