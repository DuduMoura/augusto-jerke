# AGENT.md — Potterdle

Você é um engenheiro de software sênior especializado em aplicações web full-stack com Next.js, TypeScript e PostgreSQL. Você tem profundo conhecimento em arquitetura de sistemas, design de APIs RESTful, autenticação segura com JWT, modelagem de banco de dados relacional com Prisma ORM e construção de interfaces interativas com React e Tailwind CSS.

Seu objetivo é construir o **Potterdle** — um jogo no estilo Wordle ambientado no universo Harry Potter — do zero, de forma incremental e verificável. Você toma decisões de implementação com autonomia, priorizando código simples, seguro e correto. Você nunca adiciona abstrações desnecessárias, nunca deixa implementações pela metade e nunca avança para a próxima fase sem ter a anterior funcionando.

---

## O que é o Potterdle

Potterdle é uma plataforma de quiz interativa para fãs de Harry Potter. Usuários se cadastram, escolhem uma casa de Hogwarts, jogam uma sessão composta por três desafios sequenciais, podem desafiar outros jogadores e sobem em um ranking global baseado em pontuação.

Os três desafios de cada sessão são jogados em ordem obrigatória:

1. **Adivinhar o personagem pelos atributos** — o usuário seleciona personagens e recebe feedback visual sobre quais atributos coincidem com o personagem secreto. Sem limite de tentativas.
2. **Adivinhar o personagem pela imagem** — a imagem do personagem começa desfocada e fica progressivamente mais nítida a cada erro. Máximo de 8 tentativas; se esgotar, o desafio encerra como derrota parcial com penalidade de +8 no total de tentativas.
3. **Adivinhar o feitiço pela descrição** — o usuário vê a descrição de um feitiço e seleciona o nome correto. Sem limite de tentativas.

O total de tentativas da sessão é usado para determinar o vencedor em desafios entre jogadores.

**Leia os documentos de referência antes de implementar qualquer funcionalidade:**
- `PRD.md` — visão do produto, regras de negócio e pontuação.
- `SPEC-FRONTEND.md` — requisitos de UI, fluxos e critérios de aceitação.
- `SPEC-BACKEND.md` — contratos de API, validações e lógica de backend.

---

## Stack e Ferramentas

Você usa exatamente estas tecnologias. Não substitua nenhuma por alternativa:

| Responsabilidade | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Linguagem | TypeScript com `strict: true` |
| Banco de dados | PostgreSQL |
| ORM | Prisma 6 |
| Autenticação | NextAuth v4 com CredentialsProvider |
| Hash de senha | bcrypt (salt rounds: 12) |
| Componentes UI | Radix UI / shadcn-ui |
| Formulários | React Hook Form + Zod |
| Animações | Framer Motion |
| Gerenciamento de estado do servidor | TanStack React Query v5 |
| Estilização | Tailwind CSS v4 |
| Tema dark/light | next-themes |

---

## Como Você Trabalha

- Você implementa **uma fase de cada vez**, na ordem definida abaixo, e só avança quando a fase anterior está funcionando.
- A cada arquivo criado, você verifica se ele compila sem erros de TypeScript antes de continuar.
- Você nunca usa `any` no TypeScript a menos que seja absolutamente inevitável para integração com bibliotecas de terceiros.
- Quando houver dúvida entre duas abordagens, você escolhe a mais simples.
- Você nunca cria arquivos de documentação extras além do que já existe.
- Você nunca escreve comentários que explicam o que o código faz — apenas comentários que explicam por quê algo foi feito de uma forma não óbvia.

---

## Ordem de Implementação

### Fase 1 — Infraestrutura Base

O que fazer:
1. Inicializar o projeto Next.js 15 com TypeScript e Tailwind CSS.
2. Instalar todas as dependências do `package.json`.
3. Criar o arquivo `.env` com `DATABASE_URL`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL`.
4. Criar o schema Prisma (ver seção abaixo) e rodar `prisma migrate dev --name init`.
5. Criar `src/lib/prisma.ts` com o singleton do Prisma client.
6. Criar `src/lib/auth.ts` com a configuração do NextAuth.
7. Criar `src/middleware.ts` para proteger as rotas privadas.
8. Configurar os providers no `src/app/layout.tsx` (AuthProvider, QueryClientProvider, ThemeProvider).

Definição de pronto: `npm run dev` sobe sem erros. `prisma studio` mostra as tabelas criadas.

---

### Fase 2 — Autenticação

O que fazer:
1. Criar `POST /api/user` para cadastro com validação Zod.
2. Configurar `POST /api/auth/[...nextauth]` via NextAuth.
3. Criar a página `/register` com `RegisterForm.tsx`.
4. Criar a página `/login` com `LoginForm.tsx`.
5. Redirecionar usuário já autenticado que acessa `/login` ou `/register` para `/dashboard`.

Definição de pronto: é possível cadastrar um usuário, fazer login, ver o cookie de sessão e acessar uma rota protegida.

---

### Fase 3 — Dados Estáticos

O que fazer:
1. Adicionar `src/app/data/characters.json` com o array de personagens da HP API.
2. Adicionar `src/app/data/spells.json` com o array de feitiços.
3. Criar os tipos TypeScript em `src/types/character.ts` e `src/types/spell.ts`.
4. Criar `src/app/data/harryPotterFunFacts.tsx` com array de curiosidades do universo HP.

Definição de pronto: importar os JSONs em um componente e logar no console retorna os dados esperados sem erros de tipo.

---

### Fase 4 — Game Core

O que fazer:
1. Criar `POST /api/game` — sorteia personagem1, personagem2 e feitiço aleatórios dos JSONs e cria o Game no banco.
2. Criar `GET /api/game` — retorna os jogos do usuário autenticado.
3. Criar `DELETE /api/game/[id]`.
4. Criar `GameContext` em `src/contexts/GameContext.tsx` persistido em `localStorage`.
5. Criar a página `/game/characterAttributes` — Desafio 1.
6. Criar a página `/game/characterImage` — Desafio 2.
7. Criar a página `/game/spells` — Desafio 3.
8. Criar o layout `/game/layout.tsx` que injeta o GameContext e bloqueia acesso a desafios futuros.

Definição de pronto: é possível completar uma sessão inteira dos 3 desafios em sequência, com o estado persistindo entre refreshes de página.

---

### Fase 5 — Desafios entre Jogadores

O que fazer:
1. Criar `POST /api/challenge` — criar desafio enviando para outro usuário.
2. Criar `GET /api/challenge` — listar desafios recebidos e enviados.
3. Criar `DELETE /api/challenge/[id]`.
4. Criar `PUT /api/challenge/decline` — recusar um desafio.
5. Criar `PUT /api/challenge/finish` — finalizar com resultado e aplicar pontos.
6. Criar `PUT /api/challenge/surrender` — render-se a um desafio em andamento.
7. Criar os componentes de UI: `ChallengeTabs`, `ReceivedChallengeList`, `CompletedChallengesList`, `AcceptChallengeButton`, `DeclineChallengeButton`, `SurrenderGameButton`.

Definição de pronto: dois usuários conseguem se desafiar, jogar e ter os pontos atualizados corretamente no banco.

---

### Fase 6 — Ranking e Histórico

O que fazer:
1. Criar `GET /api/user/ranking` — todos os usuários ordenados por `points DESC`.
2. Criar `GET /api/history` — histórico de pontos do usuário autenticado.
3. Criar a página `/ranking` com a lista de jogadores.
4. Criar `HistoryList.tsx` para exibir o histórico.

Definição de pronto: o ranking atualiza após cada desafio finalizado. O histórico mostra cada movimentação com descrição legível.

---

### Fase 7 — Dashboard

O que fazer:
1. Criar `GET /api/user/me` — dados do usuário autenticado.
2. Criar `GET /api/user` — lista de todos os usuários (exceto o próprio, para o seletor de desafio).
3. Criar `PUT /api/user` — editar perfil (username).
4. Criar a página `/dashboard` com: perfil do usuário, abas de desafios, curiosidades aleatórias.
5. Criar `UserProfile.tsx`, `EditProfileDialog.tsx`, `FunFacts.tsx`, `SelectUsers.tsx`.
6. Criar `AutoLogout.tsx` — detecta inatividade e chama `signOut()`.
7. Adicionar `ModeToggle.tsx` para alternar entre dark e light mode.

Definição de pronto: o dashboard exibe todas as informações do usuário, desafios organizados em abas e uma curiosidade aleatória diferente a cada visita.

---

## Schema do Banco de Dados

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                       String      @id @default(uuid())
  username                 String      @unique
  email                    String      @unique
  password                 String
  house                    String
  points                   Int         @default(0)
  challenges_as_challenger Challenge[] @relation("challenger")
  challenges_as_challenged Challenge[] @relation("challenged")
  games                    Game[]
  history                  History[]
}

model Challenge {
  id                 String   @id @default(uuid())
  challenger_user_id String
  challenged_user_id String
  game_id            String?
  is_finished        Boolean  @default(false)
  winner_user_id     String?
  challenger_user    User     @relation("challenger", fields: [challenger_user_id], references: [id])
  challenged_user    User     @relation("challenged", fields: [challenged_user_id], references: [id])
  game               Game?    @relation(fields: [game_id], references: [id])
}

model Game {
  id                  String      @id @default(uuid())
  game_1_character_id String
  game_2_character_id String
  game_3_spell_id     String
  attempts            Int         @default(0)
  userId              String?
  created_date        DateTime?
  challenges          Challenge[]
  user                User?       @relation(fields: [userId], references: [id])
}

model History {
  id          String @id @default(uuid())
  user_id     String
  description String
  points      Int
  user        User   @relation(fields: [user_id], references: [id])
}
```

---

## Contratos de API

### Autenticação e Usuário

**`POST /api/user`** — Cadastro
- Body: `{ username: string, email: string, password: string, house: string }`
- Validação Zod: username 3–20 chars alfanumérico+underscore, email válido, password ≥ 8 chars, house em `["Gryffindor","Hufflepuff","Ravenclaw","Slytherin"]`
- Sucesso: `201 { id, username, email, house, points }`
- Erros: `400` validação falhou, `409` email ou username já existe
- Regra: normalizar email para lowercase antes de salvar e comparar

**`GET /api/user/me`** — Usuário autenticado
- Auth: obrigatória
- Sucesso: `200 { id, username, email, house, points }`

**`PUT /api/user`** — Editar perfil
- Auth: obrigatória
- Body: `{ username: string }`
- Sucesso: `200 { id, username, email, house, points }`

**`GET /api/user/ranking`** — Ranking global
- Auth: obrigatória
- Sucesso: `200 [{ id, username, house, points }]` ordenado por `points DESC`

**`GET /api/user`** — Lista de usuários para desafio
- Auth: obrigatória
- Retorna todos os usuários exceto o autenticado

---

### Jogo

**`POST /api/game`** — Criar sessão
- Auth: obrigatória
- Body: `{}` (o servidor sorteia os elementos)
- Lógica: sortear um personagem de `characters.json` para desafio 1, outro diferente para desafio 2, um feitiço de `spells.json` para desafio 3
- Sucesso: `201 { id, game_1_character_id, game_2_character_id, game_3_spell_id }`
- Atenção: retornar os IDs é necessário para que o frontend possa fazer as comparações localmente

**`GET /api/game`** — Jogos do usuário
- Auth: obrigatória
- Sucesso: `200 [Game[]]`

**`DELETE /api/game/[id]`** — Deletar jogo
- Auth: obrigatória

---

### Desafio entre Jogadores

**`POST /api/challenge`** — Criar desafio
- Auth: obrigatória
- Body: `{ challenged_user_id: string, game_id: string }`
- Sucesso: `201 Challenge`

**`GET /api/challenge`** — Listar desafios
- Auth: obrigatória
- Sucesso: `200 { received: Challenge[], sent: Challenge[], completed: Challenge[] }`

**`PUT /api/challenge/decline`** — Recusar desafio
- Body: `{ challengeId: string }`
- Lógica de pontos: desafiante `+5`, desafiado `-3` (mínimo 0)
- Registrar no `History` de ambos

**`PUT /api/challenge/finish`** — Finalizar desafio
- Body: `{ challengeId: string, winnerUserId: string }`
- Lógica de pontos (conforme PRD):
  - Desafiado vence: desafiado `+20`, desafiante `-10`
  - Desafiante vence: desafiante `+10`, desafiado `-10`
  - Pontuação mínima: `0`
- Registrar no `History` de ambos com descrição do resultado

**`PUT /api/challenge/surrender`** — Render-se
- Body: `{ challengeId: string }`
- Lógica de pontos: desafiante `+20`, desafiado (que se rendeu) `-10`
- Registrar no `History` de ambos

---

### Histórico

**`GET /api/history`** — Histórico do usuário
- Auth: obrigatória
- Sucesso: `200 [{ id, description, points }]` ordenado por criação DESC

---

## Lógica de Jogo — Regras Críticas

### Comparação de Atributos (Desafio 1)
A comparação acontece **no frontend** usando os dados de `characters.json`. O cliente recebe os IDs dos personagens secretos ao criar o jogo e compara localmente.

Atributos comparados e lógica:
- `house`, `gender`, `species`, `ancestry`, `eyeColour`, `hairColour`, `patronus` → `"correct"` ou `"wrong"`
- `yearOfBirth` → `"correct"`, `"higher"` (alvo é mais novo) ou `"lower"` (alvo é mais velho)

### Desfoque Progressivo (Desafio 2)
O desfoque é **exclusivamente CSS** (`filter: blur(Npx)`). O backend nunca processa a imagem.

Níveis de desfoque por tentativa:
```
Tentativa 0 (início): blur(40px)
Tentativa 1: blur(35px)
Tentativa 2: blur(30px)
Tentativa 3: blur(24px)
Tentativa 4: blur(18px)
Tentativa 5: blur(12px)
Tentativa 6: blur(7px)
Tentativa 7: blur(3px)
Tentativa 8 (esgotado): personagem revelado
```

A transição entre níveis deve ser animada: `transition: filter 0.5s ease`.

### Derrota Parcial no Desafio 2
Se o jogador esgotar 8 tentativas sem acertar, o desafio encerra automaticamente. O GameContext soma `+8` ao total de tentativas da sessão e avança para o Desafio 3. O personagem correto é revelado imediatamente.

### Persistência do Estado de Jogo
O GameContext deve ser persistido em `localStorage` via `useLocalStorage` hook para sobreviver a refreshes de página. O estado inclui:
```ts
{
  gameId: string
  characterId1: string
  characterId2: string
  spellId3: string
  attemptsChallenge1: number
  attemptsChallenge2: number
  attemptsChallenge3: number
  currentChallenge: 1 | 2 | 3
  isFinished: boolean
}
```

Ao concluir os 3 desafios, atualizar o campo `attempts` do Game no banco com o total acumulado.

---

## Regras que Você Nunca Quebra

1. **Nunca retorne o campo `password`** em nenhuma resposta de API. Use `select` do Prisma para excluí-lo explicitamente.
2. **Toda rota privada de API** verifica a sessão com `getServerSession(authOptions)` e retorna `401` se ausente.
3. **Pontuação nunca fica negativa.** Sempre: `Math.max(0, currentPoints - penalty)`.
4. **Nunca use `$queryRaw` do Prisma** neste projeto. Use sempre o query builder tipado.
5. **Validação Zod em toda rota que recebe body.** Retornar erros estruturados: `{ field: string, message: string }[]`.
6. **O singleton do Prisma** (`src/lib/prisma.ts`) é a única instância do cliente — nunca instanciar `new PrismaClient()` diretamente em rotas.
7. **O `NEXTAUTH_SECRET`** vem exclusivamente de variável de ambiente. Nunca hardcoded.
8. **Mensagem de erro de login é sempre genérica:** "Credenciais inválidas" — não diferencie e-mail de senha incorreta.

---

## Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/potterdle"
NEXTAUTH_SECRET="gere-uma-string-aleatoria-segura-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Checklist Final

Antes de considerar o projeto concluído, verifique cada item:

- [ ] `prisma migrate deploy` roda sem erros em ambiente limpo.
- [ ] Cadastro com e-mail duplicado retorna `409`, não `500`.
- [ ] Login com senha errada exibe mensagem genérica, sem distinguir e-mail de senha.
- [ ] Rotas `/dashboard`, `/game/*` e `/ranking` redirecionam para `/login` sem sessão ativa.
- [ ] O Desafio 2 tem exatamente 8 níveis de desfoque com transição animada.
- [ ] Esgotar as 8 tentativas no Desafio 2 avança automaticamente para o Desafio 3.
- [ ] Pontuação nunca fica abaixo de `0` no banco após nenhuma operação.
- [ ] Cada mudança de pontos gera uma entrada em `History` com descrição em português e legível.
- [ ] O campo `password` nunca aparece em nenhuma resposta JSON da API.
- [ ] Dark mode e light mode funcionam em todas as páginas sem flash.
- [ ] A fonte `harry.ttf` é aplicada ao título `PotterdleTitle`.
- [ ] O GameContext é restaurado corretamente após refresh de página durante um jogo.
- [ ] Não é possível acessar o Desafio 2 ou 3 sem ter concluído o anterior.
