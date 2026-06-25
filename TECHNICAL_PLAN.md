# TECHNICAL PLAN — Potterdle

---

## 1. Arquitetura

O Potterdle é uma aplicação fullstack construída inteiramente dentro do Next.js, utilizando o mesmo projeto tanto para o frontend quanto para os endpoints de backend. Não há servidor separado.

```
Browser (React 19)
       │
       ▼
Next.js 15 (App Router)
 ├── Pages & Components  ← Frontend (RSC + Client Components)
 └── API Routes          ← Backend (route handlers)
              │
              ▼
        Prisma ORM
              │
              ▼
        PostgreSQL
              
Serviços externos:
 ├── Google OAuth (NextAuth)
 └── ImageKit CDN (fotos dos personagens)
```

### Camadas internas

| Camada | Responsabilidade |
|---|---|
| Pages (`app/`) | Renderização de telas e navegação |
| Components (`components/`) | Componentes reutilizáveis de UI |
| API Routes (`app/api/`) | Endpoints REST, validação de sessão, acesso ao banco |
| Actions (`app/actions/`) | Funções e hooks de chamada de API no cliente |
| Contexts (`contexts/`) | Estado global de jogo em memória (React Context) |
| Hooks (`hooks/`) | Abstrações de comportamento reutilizável |
| Lib (`lib/`) | Configuração de autenticação, cliente Prisma e utilitários |

---

## 2. Tecnologias

### Frontend

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 15.2.4 | Framework fullstack (App Router) |
| React | 19 | Interface de usuário |
| TypeScript | 5 | Tipagem estática |
| Tailwind CSS | 4 | Estilização utilitária |
| shadcn/ui + Radix UI | — | Componentes headless acessíveis |
| Framer Motion | 12 | Animações de interface |
| Lucide React | 0.487 | Ícones |
| next-themes | 0.4.6 | Modo claro/escuro |

### Backend / Estado

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js API Routes | 15.2.4 | Endpoints REST |
| Prisma | 6.5.0 | ORM e acesso ao banco |
| bcrypt | 5.1.1 | Hash de senhas |
| NextAuth | 4.24.11 | Autenticação (JWT + OAuth) |
| TanStack React Query | 5 | Cache e sincronização de estado servidor |
| Zod | 3.24.2 | Validação de schema nos formulários |
| React Hook Form | 7.55 | Gerenciamento de formulários |

### Banco de dados e infraestrutura

| Tecnologia | Uso |
|---|---|
| PostgreSQL | Banco de dados relacional |
| Vercel | Hospedagem e deploy |
| ImageKit CDN | Armazenamento e entrega das fotos dos personagens |
| Google OAuth | Autenticação social |

---

## 3. Banco de Dados

### Modelo de entidades

#### User
```
User {
  id        String   @id @default(uuid())
  username  String
  email     String   @unique
  password  String              -- vazio em contas Google
  house     String              -- Gryffindor | Ravenclaw | Hufflepuff | Slytherin
  points    Int      @default(0)
}
```

#### Game
```
Game {
  id                  String    @id @default(uuid())
  game_1_character_id String              -- ID do personagem (Desafio 1)
  game_2_character_id String              -- ID do personagem (Desafio 2)
  game_3_spell_id     String              -- ID do feitiço (Desafio 3)
  attempts            Int                 -- total de tentativas da sessão
  userId              String?             -- FK para User (nullable)
  created_date        DateTime?
}
```

#### Challenge
```
Challenge {
  id                  String   @id @default(uuid())
  challenger_user_id  String              -- FK para User (desafiante)
  challenged_user_id  String              -- FK para User (desafiado)
  game_id             String              -- FK para Game (sessão do desafiante)
  is_finished         Boolean  @default(false)
  winner_user_id      String?             -- FK para User (nullable até o fim)
}
```

#### History
```
History {
  id          String @id @default(uuid())
  user_id     String              -- FK para User
  description String              -- texto descritivo do evento
  points      Int                 -- positivo (ganho) ou negativo (perda)
}
```

### Diagrama de relacionamentos

```
User ──< Game          (um usuário tem muitos jogos)
User ──< Challenge     (como challenger_user)
User ──< Challenge     (como challenged_user)
User ──< History       (um usuário tem muitos registros de histórico)
Game ──< Challenge     (um jogo pode ser usado em um desafio)
```

### Restrições e índices

- `User.email`: índice único — impede cadastros duplicados.
- `Challenge.game_id`: chave estrangeira com `ON DELETE RESTRICT` — um jogo vinculado a um desafio não pode ser deletado.
- `Challenge.challenger_user_id` e `challenged_user_id`: chaves estrangeiras com `ON DELETE RESTRICT`.
- Pontuação do usuário nunca vai abaixo de 0 — garantido por lógica de negócio no servidor: `Math.max(pontos + delta, 0)`.

### Dados estáticos (JSON)

Os dados do universo Harry Potter não ficam no banco. São arquivos JSON em memória:

- `src/app/data/characters.json` — lista de personagens com atributos completos e URL da imagem (ImageKit).
- `src/app/data/spells.json` — lista de feitiços com nome e descrição.

---

## 4. APIs

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/[...nextauth]` | Handler NextAuth — login por credenciais ou Google |

---

### Usuários

#### `GET /api/user`
Lista todos os usuários exceto o logado (usado para selecionar adversário no desafio).

**Requer:** sessão autenticada.

**Resposta 200:**
```json
{
  "success": true,
  "users": [
    { "id": "uuid", "username": "string", "points": 0 }
  ]
}
```

---

#### `POST /api/user`
Cria novo usuário.

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "house": "Gryffindor | Ravenclaw | Hufflepuff | Slytherin"
}
```

**Resposta 201:** `{ "success": true, "user": { ... } }`  
**Resposta 500:** `{ "success": false, "message": "This email is already using" }` (e-mail duplicado)

---

#### `PUT /api/user`
Atualiza nome de usuário e casa do usuário logado.

**Requer:** sessão autenticada.

**Body:**
```json
{ "name": "string", "house": "string" }
```

**Resposta 200:** `{ "success": true, "user": { ... } }`

---

#### `GET /api/user/me`
Retorna os dados completos do usuário logado.

**Requer:** sessão autenticada.

**Resposta 200:** `{ "user": { id, username, email, house, points } }`

---

#### `GET /api/user/ranking`
Retorna todos os usuários ordenados por pontuação decrescente.

**Requer:** sessão autenticada.

**Resposta 200:**
```json
{
  "success": true,
  "users": [
    { "id": "uuid", "username": "string", "points": 100 }
  ]
}
```

---

### Jogos

#### `GET /api/game`
Retorna todos os jogos do usuário logado.

**Requer:** sessão autenticada.

**Resposta 200:** array de objetos `Game`.

---

#### `POST /api/game`
Salva o resultado de uma sessão livre concluída.

**Requer:** sessão autenticada.

**Body:**
```json
{
  "game_1_character_id": "uuid",
  "game_2_character_id": "uuid",
  "game_3_spell_id": "uuid",
  "attempts": 12
}
```

**Resposta 200:** objeto `Game` criado.

---

#### `DELETE /api/game/[id]`
Deleta um jogo pelo ID.

**Parâmetro:** `id` — UUID do jogo.

**Resposta 200:** `{ "message": "Game deletado" }`

---

### Desafios

#### `GET /api/challenge`
Retorna os desafios do usuário logado (como desafiante ou desafiado).

**Requer:** sessão autenticada. Inclui dados do jogo e dos dois usuários.

**Resposta 200:** array de objetos `Challenge` com `game`, `challenger_user`, `challenged_user`.

---

#### `POST /api/challenge`
Cria um novo desafio vinculado a um jogo já existente.

**Requer:** sessão autenticada.

**Body:**
```json
{
  "challenged_user_id": "uuid",
  "game_id": "uuid"
}
```

**Resposta 200:** objeto `Challenge` criado.

---

#### `DELETE /api/challenge/[id]`
Deleta um desafio pelo ID.

**Parâmetro:** `id` — UUID do desafio.

**Resposta 200:** `{ "message": "Challenge deletado" }`

---

#### `PUT /api/challenge/decline`
Registra recusa do desafio pelo desafiado.

**Efeito:** desafio marcado como finalizado; desafiante +5 pts; desafiado −3 pts (mínimo 0); entradas criadas no histórico de ambos.

**Body:**
```json
{
  "id": "uuid do desafio",
  "challenger_user_id": "uuid",
  "challenged_user_id": "uuid",
  "challenger_user": { "username": "string" },
  "challenged_user": { "username": "string" }
}
```

---

#### `PUT /api/challenge/surrender`
Registra desistência do desafiado durante o jogo.

**Efeito:** desafio marcado como finalizado; desafiante +20 pts; desafiado −10 pts (mínimo 0); entradas criadas no histórico de ambos.

**Body:** mesmo formato do `decline`.

---

#### `PUT /api/challenge/finish`
Conclui um desafio após o desafiado jogar a sessão completa.

**Lógica de resultado:**
- `data.attempts` (tentativas do desafiado) `<=` `data.gameChallenge.game.attempts` (tentativas do desafiante) → desafiado vence (+20 pts); desafiante perde (−10 pts).
- Caso contrário → desafiante vence (+10 pts); desafiado perde (−10 pts).
- Pontuação negativa é zerada com `Math.max(..., 0)`.

**Body:**
```json
{
  "game_1_character_id": "uuid",
  "game_2_character_id": "uuid",
  "game_3_spell_id": "uuid",
  "attempts": 8,
  "gameChallenge": {
    "id": "uuid do desafio",
    "challenger_user_id": "uuid",
    "challenged_user_id": "uuid",
    "game": { "attempts": 10 }
  }
}
```

---

### Histórico

#### `GET /api/history`
Retorna todas as movimentações de pontos do usuário logado.

**Requer:** sessão autenticada.

**Resposta 200:** `{ "success": true, "history": [ { id, user_id, description, points } ] }`

---

## 5. Estrutura do Projeto

```
potterdle/
├── prisma/
│   ├── schema.prisma          -- definição do modelo de dados
│   └── migrations/            -- histórico de migrations do banco
│
├── public/
│   ├── fonts/harry.ttf        -- fonte temática Harry Potter
│   └── harryUser.png          -- imagem padrão de usuário
│
└── src/
    ├── app/
    │   ├── layout.tsx          -- layout raiz (providers globais)
    │   ├── page.tsx            -- página inicial (redirect para /login)
    │   ├── login/page.tsx      -- tela de login
    │   ├── register/page.tsx   -- tela de cadastro
    │   │
    │   ├── (private)/          -- grupo de rotas protegidas (requer sessão)
    │   │   ├── layout.tsx      -- layout privado (GameProvider + ReactQuery)
    │   │   ├── dashboard/      -- tela principal pós-login
    │   │   ├── ranking/        -- ranking global
    │   │   └── game/
    │   │       ├── layout.tsx
    │   │       ├── characterAttributes/  -- Desafio 1
    │   │       ├── characterImage/       -- Desafio 2
    │   │       └── spells/               -- Desafio 3
    │   │
    │   ├── api/                -- endpoints REST
    │   │   ├── auth/[...nextauth]/
    │   │   ├── user/
    │   │   │   ├── route.ts    -- GET lista / POST criar / PUT atualizar
    │   │   │   ├── me/         -- GET usuário logado
    │   │   │   └── ranking/    -- GET ranking
    │   │   ├── game/
    │   │   │   ├── route.ts    -- GET lista / POST criar
    │   │   │   └── [id]/       -- DELETE por id
    │   │   ├── challenge/
    │   │   │   ├── route.ts    -- GET lista / POST criar
    │   │   │   ├── [id]/       -- DELETE por id
    │   │   │   ├── decline/    -- PUT recusar
    │   │   │   ├── finish/     -- PUT finalizar com resultado
    │   │   │   └── surrender/  -- PUT desistir
    │   │   └── history/        -- GET histórico
    │   │
    │   ├── actions/            -- hooks de chamada de API (cliente)
    │   │   ├── user-actions.tsx
    │   │   ├── game-actions.tsx
    │   │   ├── challenge-actions.tsx
    │   │   └── history-actions.tsx
    │   │
    │   └── data/               -- dados estáticos do universo HP
    │       ├── characters.json
    │       ├── spells.json
    │       └── harryPotterFunFacts.tsx
    │
    ├── components/
    │   ├── common/             -- componentes compartilhados
    │   ├── forms/              -- LoginForm, RegisterForm
    │   ├── providers/          -- AuthProvider, ThemeProvider, QueryClientProvider
    │   └── ui/                 -- componentes base shadcn/ui (Button, Input, Dialog...)
    │
    ├── contexts/
    │   └── GameContext.tsx     -- estado global da sessão de jogo
    │
    ├── hooks/
    │   └── useLocalStorage.tsx -- hook para persistência no localStorage
    │
    └── lib/
        ├── auth.ts             -- configuração NextAuth (providers, JWT, callbacks)
        ├── prisma.ts           -- instância singleton do PrismaClient
        └── utils.ts            -- utilitários (cn para classnames)
```

---

## 6. Segurança

### Autenticação

- Estratégia de sessão: **JWT** (gerenciado pelo NextAuth).
- O token JWT é armazenado em cookie HTTP e renovado a cada requisição.
- Cada requisição a uma rota privada valida a sessão com `getServerSession(authOptions)` no servidor antes de executar qualquer lógica.

### Senhas

- Senhas são armazenadas com hash **bcrypt**, fator de custo 10.
- A comparação durante o login usa `bcrypt.compare` — a senha original nunca é recuperada.
- Usuários que se cadastram via Google têm `password: ""` no banco, impossibilitando login por credenciais nessa conta.

### Controle de acesso

- Rotas da área privada (`/dashboard`, `/game/*`, `/ranking`) são protegidas por layout com `GameProvider`, que depende de sessão ativa.
- Sem sessão, o middleware do NextAuth redireciona para `/login`.
- Operações que alteram pontuação (`decline`, `surrender`, `finish`) validam sessão no servidor — o cliente não pode forçar uma movimentação de pontos diretamente.
- A pontuação nunca é enviada no payload do cliente; toda movimentação é calculada e aplicada exclusivamente no servidor.

### Dados externos

- Fotos dos personagens são carregadas via ImageKit CDN (`ik.imagekit.io`). O domínio está na allowlist do Next.js Image.
- Fotos de perfil do Google (`lh3.googleusercontent.com`) também estão na allowlist.

---

## 7. Infraestrutura

### Hospedagem

- **Plataforma:** Vercel.
- **URL de produção:** `https://potterdle.vercel.app`
- O deploy é realizado automaticamente a cada push para a branch `master` no GitHub.

### Banco de dados

- **Banco:** PostgreSQL.
- A connection string é fornecida via variável de ambiente `DATABASE_URL`.
- Migrations são executadas com `prisma migrate deploy` durante o processo de build/deploy.

### Variáveis de ambiente necessárias

| Variável | Finalidade |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `NEXTAUTH_URL` | URL base da aplicação para callbacks do NextAuth |
| `NEXTAUTH_SECRET` | Chave secreta para assinatura dos tokens JWT |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth do Google |
| `GOOGLE_CLIENT_SECRET` | Secret do cliente OAuth do Google |
| `NEXT_PUBLIC_BASE_URL` | URL base pública usada nas chamadas de API do cliente |

### Build e deploy

```bash
# Desenvolvimento local
npm run dev         # Next.js com Turbopack

# Build de produção
npm run build       # Compila e otimiza o projeto
npm run start       # Inicia o servidor de produção

# Banco de dados
npx prisma migrate dev    # Aplica migrations em desenvolvimento
npx prisma migrate deploy # Aplica migrations em produção
npx prisma generate       # Gera o Prisma Client atualizado
```

### Gestão de estado client-side

| Mecanismo | O que persiste |
|---|---|
| **localStorage** | Progresso dos três desafios dentro de uma sessão (personagem sorteado, palpites feitos, tentativas, se o jogo foi concluído) |
| **React Context (GameContext)** | Estado em memória da sessão ativa: total de tentativas acumuladas, resultados dos desafios, dados do desafio de outro jogador |
| **TanStack React Query** | Cache das respostas de API; revalidação automática a cada 10 s para desafios e histórico |
