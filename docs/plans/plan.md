# Plano de Implementação — Potterdle

## Contexto
Construção completa do Potterdle (quiz estilo Wordle temático de Harry Potter) seguindo PRD.md, SPEC-BACKEND.md, SPEC-FRONTEND.md e AGENT.md. Branch: `implementation`.

---

## Etapas Concluídas ✅

### Branch e Projeto
- [x] Criação da branch `implementation`
- [x] Bootstrap do projeto Next.js 15 (App Router, TypeScript strict, Tailwind v4, Turbopack)

### Dependências Instaladas
- [x] `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `@types/pg`
- [x] `next-auth`, `bcrypt`, `@types/bcrypt`
- [x] `zod`, `react-hook-form`, `@hookform/resolvers`
- [x] `@tanstack/react-query`, `framer-motion`, `next-themes`, `lucide-react`, `dotenv`
- [x] shadcn/ui inicializado com: button, input, label, card, dialog, tabs, badge, sonner, select

### Fase 1 — Infraestrutura Base
- [x] `prisma/schema.prisma` — modelos: User, Challenge, Game, History
- [x] `.env` — DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- [x] `src/lib/prisma.ts` — singleton com PG adapter (Prisma 7)
- [x] `src/lib/auth.ts` — NextAuth v4, CredentialsProvider, bcrypt, JWT 7 dias
- [x] `src/types/next-auth.d.ts` — extensão de tipos da sessão
- [x] `src/middleware.ts` — proteção de rotas /dashboard, /game/*, /ranking, /history
- [x] `src/components/providers.tsx` — SessionProvider + QueryClientProvider + ThemeProvider
- [x] `src/app/layout.tsx` — root layout com providers e metadados

### Fase 2 — Autenticação
- [x] `src/app/api/auth/[...nextauth]/route.ts` — handler do NextAuth
- [x] `src/app/api/auth/register/route.ts` — POST registro com validação Zod, bcrypt, select sem password
- [x] `src/app/(auth)/login/page.tsx` — formulário de login com React Hook Form + Zod
- [x] `src/app/(auth)/register/page.tsx` — formulário de cadastro com seletor de casa

### Fase 3 — Dados Estáticos
- [x] `src/types/character.ts` — tipo Character
- [x] `src/types/spell.ts` — tipo Spell
- [x] `src/app/data/characters.json` — 30 personagens HP com todos os atributos
- [x] `src/app/data/spells.json` — 25 feitiços com descrições em português
- [x] `src/app/data/harryPotterFunFacts.ts` — 25 curiosidades do universo HP

---

### Fase 4 — Core do Jogo ✅

#### API Routes
- [x] `POST /api/game` — criar sessão (sortear personagens e feitiço aleatórios, salvar no DB)
- [x] `GET /api/game` — buscar jogo ativo do usuário
- [x] `DELETE /api/game/[id]` — deletar jogo

- [x] `GET /api/game/challenge/1` — retornar config do desafio 1
- [x] `POST /api/game/challenge/1/guess` — submeter palpite de personagem (comparar atributos, retornar feedback, `409` em re-palpite)
- [x] `GET /api/game/challenge/2` — retornar imageUrl e attemptsUsed
- [x] `POST /api/game/challenge/2/guess` — submeter palpite (max 8 tentativas, PARTIAL_LOSS, `409` em re-palpite)
- [x] `GET /api/game/challenge/3` — retornar descrição do feitiço + 4 opções
- [x] `POST /api/game/challenge/3/guess` — submeter palpite de feitiço (sem limite de tentativas)

#### GameContext e Hooks
- [x] `src/hooks/useLocalStorage.ts` — hook genérico de persistência em localStorage
- [x] `src/contexts/GameContext.tsx` — estado global do jogo com persistência localStorage

#### Páginas
- [x] `src/app/game/layout.tsx` — layout com GameContext, bloqueio sequencial de desafios
- [x] `src/app/game/characterAttributes/page.tsx` — Desafio 1: autocomplete, tabela de feedback colorida, animações Framer Motion, modal de vitória
- [x] `src/app/game/characterImage/page.tsx` — Desafio 2: imagem com blur progressivo (8 níveis), contador de tentativas, modal de derrota parcial
- [x] `src/app/game/spells/page.tsx` — Desafio 3: múltipla escolha, modal de conclusão de sessão

---

### Fase 5 — Desafios entre Jogadores ✅

#### API Routes
- [x] `POST /api/challenge` — criar desafio
- [x] `GET /api/challenge` — listar desafios (recebidos/enviados/concluídos)
- [x] `PUT /api/challenge/decline` — recusar desafio (challenger +5, challenged -3, min 0, History para ambos)
- [x] `PUT /api/challenge/finish` — concluir desafio (winner: +20 ou +10, loser: -10, min 0, History para ambos)
- [x] `PUT /api/challenge/surrender` — desistir (challenger +20, desistente -10, History para ambos)

#### Componentes UI
- [x] `src/components/challenge/ChallengeTabs.tsx` — abas: Recebidos / Enviados / Concluídos
- [ ] `src/components/challenge/ReceivedChallengeList.tsx` — botões Aceitar/Recusar
- [ ] `src/components/challenge/CompletedChallengesList.tsx` — resultados e pontos
- [x] `src/components/challenge/SelectUsers.tsx` — seletor de usuário para enviar desafio

---

### Fase 6 — Ranking e Histórico ✅

#### API Routes
- [x] `GET /api/user/ranking` — todos os usuários ordenados por points DESC
- [x] `GET /api/history` — histórico de pontos do usuário autenticado (DESC por data)

#### Páginas e Componentes
- [x] `src/app/ranking/page.tsx` — tabela de ranking com destaque na posição própria
- [x] `src/components/HistoryList.tsx` — lista de movimentações de pontos

---

### Fase 7 — Dashboard

#### API Routes
- [x] `GET /api/user/me` — dados do usuário autenticado (sem password)
- [x] `GET /api/user` — todos os usuários exceto o autenticado (para seletor de desafio)
- [x] `PUT /api/user` — editar username

#### Página e Componentes
- [x] `src/app/dashboard/page.tsx` — página principal com todos os componentes
- [ ] `src/components/UserProfile.tsx` — exibe username, casa e pontos atuais
- [x] `src/components/EditProfileDialog.tsx` — dialog Radix para editar username
- [x] `src/components/FunFacts.tsx` — curiosidade aleatória do universo HP
- [x] `src/components/AutoLogout.tsx` — detecção de inatividade → signOut()
- [x] `src/components/ModeToggle.tsx` — alternância dark/light via next-themes
- [x] `src/components/HistoryList.tsx` — histórico de pontos

---

## Etapas Pendentes 🔲

### Componentes Faltando
- [ ] `src/components/challenge/ReceivedChallengeList.tsx` — botões Aceitar/Recusar
- [ ] `src/components/challenge/CompletedChallengesList.tsx` — resultados e pontos
- [ ] `src/components/UserProfile.tsx` — exibe username, casa e pontos atuais

### Configurações Finais
- [ ] Adicionar fonte `harry.ttf` em `src/app/fonts/` e aplicar ao título Potterdle
- [ ] Executar `npx prisma migrate dev --name init` (requer PostgreSQL rodando)
- [ ] Testar build sem erros: `npm run build`
- [ ] Validar checklist completo do AGENT.md

---

## Regras Críticas (nunca violar)
1. Nunca retornar campo `password` em nenhuma resposta — sempre usar `select` no Prisma
2. Toda rota protegida deve verificar sessão via `getServerSession()` → 401 sem sessão
3. Pontos nunca negativos: `Math.max(0, pontos - penalidade)`
4. Sem `$queryRaw` no Prisma
5. Validação Zod em todo POST/PUT que aceitar body
6. Singleton Prisma apenas em `src/lib/prisma.ts`
7. `NEXTAUTH_SECRET` apenas de variável de ambiente
8. Erro de login sempre genérico: "Credenciais inválidas"
9. Sem `any` no TypeScript (exceto edge cases de integração de terceiros)
10. Comparação de atributos do Desafio 1 feita no frontend com `characters.json`
