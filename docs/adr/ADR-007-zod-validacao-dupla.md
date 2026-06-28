# ADR-007 — Zod como camada de validação em frontend e backend

**Data:** 2026-06-27
**Status:** Aceito

## Contexto

O projeto precisa validar entradas tanto no cliente (formulários React) quanto no servidor (bodies de API). As alternativas eram: validação manual com `if/throw`, Yup, Joi, ou Zod. A escolha precisava funcionar tanto em ambiente de browser quanto em Node.js (API Routes).

## Decisão

Usar **Zod** como biblioteca única de validação em ambos os lados. No frontend, os schemas Zod são integrados ao React Hook Form via `@hookform/resolvers/zod`, provendo validação inline por campo. No backend, cada API Route que recebe body define um schema Zod e usa `safeParse` antes de qualquer acesso ao banco.

## Consequências

**Positivas:**
- Uma única biblioteca de validação para toda a codebase — sem aprender duas APIs.
- Os erros do `safeParse` têm formato estruturado (`{ path, message }[]`) que pode ser retornado diretamente ao cliente.
- Integração nativa com React Hook Form elimina boilerplate de controle de erro por campo.
- TypeScript infere os tipos do schema automaticamente (`z.infer<typeof schema>`).

**Negativas:**
- Schemas de frontend e backend são definidos separadamente — mudanças no contrato de API precisam ser aplicadas em dois lugares.
- Bundle size ligeiramente maior no cliente pelo import do Zod (mitigado pelo tree-shaking).