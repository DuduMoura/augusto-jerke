# ADR-002 — NextAuth v4 com CredentialsProvider e sessão JWT

**Data:** 2026-06-27
**Status:** Aceito

## Contexto

O sistema requer autenticação com e-mail e senha próprios (sem OAuth de terceiros). Era necessário escolher entre implementar auth manualmente, usar uma solução gerenciada (Auth0, Clerk) ou uma biblioteca integrada ao Next.js.

## Decisão

Usar **NextAuth v4** com **CredentialsProvider** para autenticar via e-mail e senha verificada com bcrypt. A sessão é mantida via **JWT** (não sessão de banco de dados), com duração de 7 dias. O token carrega `id`, `username`, `email`, `house` e `points`.

## Consequências

**Positivas:**
- Integração nativa com Next.js: middleware de proteção de rotas funciona com `getServerSession` sem configuração extra.
- Sessão stateless (JWT): sem tabela de sessões no banco, sem round-trip extra por requisição.
- Abstrações de cookie, CSRF e rotação de token já resolvidas pela biblioteca.

**Negativas:**
- `points` no token JWT fica desatualizado entre logins; rotas que precisam de pontuação em tempo real buscam direto no banco via `GET /api/user/me`.
- NextAuth v4 é considerado legado (v5/Auth.js é o sucessor), mas v5 ainda era instável no momento da decisão.
- CredentialsProvider não oferece funcionalidades de "esqueci minha senha" nem verificação de e-mail out-of-the-box.
