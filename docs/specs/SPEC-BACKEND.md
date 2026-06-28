# Specification — Backend (Potterdle)

Stack: Next.js 15 API Routes, Prisma ORM (PostgreSQL), NextAuth v4, bcrypt, Zod

---

## Funcionalidade 1 — Cadastro de Usuário

### Requisitos Funcionais

- Endpoint `POST /api/auth/register` que recebe `username`, `email`, `password` e `house`.
- Validar os dados de entrada com Zod antes de qualquer acesso ao banco.
- Verificar se o e-mail ou username já estão cadastrados.
- Fazer hash da senha com bcrypt antes de persistir.
- Retornar `201 Created` com os dados públicos do usuário criado (sem senha).

### Regras de Negócio

- E-mail e username devem ser únicos no banco de dados.
- A senha nunca deve ser armazenada em texto plano.
- `house` deve ser um dos valores: `GRYFFINDOR`, `HUFFLEPUFF`, `RAVENCLAW`, `SLYTHERIN`.
- O campo `score` do usuário começa em `0` na criação.

### Casos de Uso

| Ator | Ação | Resposta Esperada |
|---|---|---|
| Cliente | Envia dados válidos e únicos | `201` com dados do usuário |
| Cliente | Envia e-mail já cadastrado | `409 Conflict` com mensagem |
| Cliente | Envia `house` inválido | `422 Unprocessable Entity` |
| Cliente | Omite campo obrigatório | `400 Bad Request` com detalhe do campo |

### Requisitos Não Funcionais

- **Segurança:** Hash de senha com bcrypt, salt rounds ≥ 10.
- **Segurança:** Não retornar o campo `password` em nenhuma resposta.
- **Desempenho:** Validação Zod antes de qualquer query ao banco (fail fast).

### Fluxo Detalhado

1. Requisição `POST /api/auth/register` chega.
2. Zod valida o body; se inválido, retorna `400` com array de erros por campo.
3. Query no banco verifica duplicidade de `email` e `username`.
4. Se duplicado, retorna `409`.
5. bcrypt gera o hash da senha.
6. Prisma cria o registro com `score: 0`.
7. Resposta `201` com `{ id, username, email, house, score }`.

### Critérios de Aceitação

- [ ] Senha nunca aparece em nenhuma resposta da API.
- [ ] E-mail e username com capitalização diferente são tratados como únicos (armazenar em lowercase).
- [ ] Usuário criado tem `score = 0` e `createdAt` preenchido automaticamente.

### Casos de Borda

- E-mail com letras maiúsculas (`User@Mail.com`): normalizar para lowercase antes de salvar e checar duplicidade.
- Requisição com body vazio: Zod retorna erros para todos os campos obrigatórios.
- Tentativa de injeção SQL via campos de texto: o Prisma com queries parametrizadas previne; não usar `$queryRaw` nesta rota.

---

## Funcionalidade 2 — Autenticação (Login)

### Requisitos Funcionais

- Configurar NextAuth com `CredentialsProvider`.
- Callback `authorize` busca o usuário pelo e-mail no banco, compara a senha com bcrypt e retorna o objeto de sessão.
- Sessão expõe: `id`, `username`, `email`, `house`, `score`.
- Endpoint `GET /api/auth/session` (fornecido pelo NextAuth) retorna os dados da sessão ativa.

### Regras de Negócio

- Se o e-mail não existir no banco, retornar `null` (NextAuth trata como credencial inválida).
- Se a senha não corresponder ao hash, retornar `null`.
- Sessão JWT tem duração de 7 dias.
- Rotas da API que exigem autenticação devem verificar a sessão via `getServerSession`.

### Casos de Uso

| Ator | Ação | Resposta Esperada |
|---|---|---|
| Usuário | Credenciais corretas | Sessão criada, cookie de sessão definido |
| Usuário | Senha incorreta | `401` (NextAuth retorna erro genérico) |
| Usuário | E-mail não cadastrado | `401` (mesma mensagem, sem distinguir o motivo) |

### Requisitos Não Funcionais

- **Segurança:** `NEXTAUTH_SECRET` configurado via variável de ambiente; não pode ser hardcoded.
- **Segurança:** A resposta de erro para credenciais inválidas é sempre a mesma, independente do motivo.

### Fluxo Detalhado

1. NextAuth recebe `POST /api/auth/callback/credentials`.
2. `authorize` executa `prisma.user.findUnique({ where: { email } })`.
3. Se usuário não encontrado, retorna `null`.
4. `bcrypt.compare(password, user.password)` — se falso, retorna `null`.
5. Se verdadeiro, retorna `{ id, username, email, house, score }`.
6. NextAuth emite JWT e define cookie de sessão.

### Critérios de Aceitação

- [ ] Rotas protegidas retornam `401` se a sessão não estiver presente.
- [ ] O campo `password` nunca é incluído no token JWT nem na resposta de sessão.
- [ ] `NEXTAUTH_SECRET` é lido de variável de ambiente, nunca hardcoded.

### Casos de Borda

- Usuário com conta desativada (campo `active: false` futuro): o `authorize` deve checar esse campo e retornar `null`.
- E-mail enviado com caracteres de espaço: normalizar com `.trim()` antes de buscar no banco.

---

## Funcionalidade 3 — Desafio 1: Guess de Personagem pelos Atributos

### Requisitos Funcionais

- Endpoint `GET /api/game/challenge/1` retorna os dados de configuração do desafio atual (personagem secreto não é retornado, apenas o ID da sessão de jogo).
- Endpoint `POST /api/game/challenge/1/guess` recebe `{ characterId: string }` e retorna o feedback de atributos.
- O backend compara os atributos do personagem escolhido com o personagem secreto da sessão.
- Para cada atributo, retorna um status: `"correct"`, `"wrong"` ou `"partial"`.
- Registra a tentativa no banco.

### Regras de Negócio

- O personagem secreto é definido uma vez por sessão e não muda.
- Sem limite de tentativas.
- Um `characterId` já enviado nesta sessão deve retornar erro `409 Conflict`.
- A sessão avança para o Desafio 2 somente quando todos os atributos retornarem `"correct"` — esse avanço é registrado no banco.

**Lógica de comparação por atributo:**

| Atributo | Tipo | Lógica |
|---|---|---|
| `house` | string | `"correct"` se igual, `"wrong"` se diferente |
| `gender` | string | `"correct"` se igual, `"wrong"` se diferente |
| `species` | string | `"correct"` se igual, `"wrong"` se diferente |
| `bloodStatus` | string | `"correct"` se igual, `"wrong"` se diferente |
| `hairColor` | string | `"correct"` se igual, `"wrong"` se diferente |
| `eyeColor` | string | `"correct"` se igual, `"wrong"` se diferente |
| `patronus` | string | `"correct"` se igual, `"wrong"` se diferente |
| `birthYear` | number | `"correct"` se igual; `"partial"` com seta ↑/↓ indicando se o alvo é maior ou menor |

### Casos de Uso

| Ator | Ação | Resposta Esperada |
|---|---|---|
| Jogador | Envia `characterId` válido e diferente do secreto | `200` com objeto de atributos e seus status |
| Jogador | Envia o `characterId` do personagem secreto | `200` com todos os status `"correct"` + flag `{ won: true }` |
| Jogador | Envia `characterId` já tentado nesta sessão | `409 Conflict` |
| Jogador | Envia `characterId` inexistente | `404 Not Found` |

### Requisitos Não Funcionais

- **Segurança:** A rota exige sessão autenticada (`getServerSession`); retorna `401` se não autenticado.
- **Segurança:** O ID do personagem secreto nunca é retornado na resposta.

### Fluxo Detalhado

1. `POST /api/game/challenge/1/guess` com `{ characterId }`.
2. Verifica sessão; retorna `401` se ausente.
3. Zod valida `characterId` (string não vazia).
4. Busca a sessão de jogo ativa do usuário no banco.
5. Verifica se `characterId` já foi tentado; se sim, retorna `409`.
6. Busca os atributos do personagem escolhido e do personagem secreto no banco.
7. Compara atributo a atributo e monta o objeto de feedback.
8. Salva a tentativa no banco (`GameAttempt`).
9. Se todos `"correct"`, atualiza o estado da sessão para `CHALLENGE_1_COMPLETE`.
10. Retorna `{ attributes: {...}, won: boolean }`.

### Critérios de Aceitação

- [ ] A resposta nunca inclui o nome ou ID do personagem secreto.
- [ ] `birthYear` retorna `"partial"` com campo `"hint": "higher"` ou `"hint": "lower"` quando não é exato.
- [ ] A sessão só avança quando `won: true` e o backend confirma o avanço.
- [ ] Tentativas duplicadas retornam `409`.

### Casos de Borda

- Personagem secreto tem `birthYear` nulo: retornar `"wrong"` em vez de comparação numérica.
- `characterId` enviado como número em vez de string: Zod coerce ou rejeita com `400`.
- Usuário sem sessão de jogo ativa: criar uma nova sessão automaticamente ou retornar `404` com instrução de iniciar jogo.

---

## Funcionalidade 4 — Desafio 2: Guess de Personagem pela Imagem

### Requisitos Funcionais

- Endpoint `GET /api/game/challenge/2` retorna a URL da imagem do personagem secreto (mesma imagem, sem revelar a identidade) e o número de tentativas já usadas.
- Endpoint `POST /api/game/challenge/2/guess` recebe `{ characterId: string }` e processa a tentativa.
- Registra cada tentativa no banco.
- Ao atingir 8 tentativas sem acerto: fecha o desafio como `PARTIAL_LOSS`, avança a sessão para o Desafio 3 e aplica penalidade de `+8` no contador de tentativas da sessão.
- Ao acertar: fecha o desafio como `WIN` e avança a sessão para o Desafio 3.

### Regras de Negócio

- Máximo de 8 tentativas.
- `characterId` já tentado nesta fase retorna `409`.
- A imagem retornada no `GET` é sempre a mesma URL — o desfoque é responsabilidade exclusiva do frontend (via CSS).
- O backend retorna o `attemptsUsed` para que o frontend calcule o nível de desfoque.
- A identidade do personagem só é retornada quando o desafio termina (acerto ou 8 erros).

### Casos de Uso

| Ator | Ação | Resposta Esperada |
|---|---|---|
| Jogador | Envia guess correto | `200` com `{ won: true, character: { name, ... } }` |
| Jogador | Envia guess incorreto (tentativas < 8) | `200` com `{ won: false, attemptsUsed: N }` |
| Jogador | Envia guess incorreto na 8ª tentativa | `200` com `{ won: false, eliminated: true, character: { name, ... }, penalty: 8 }` |
| Jogador | Envia `characterId` já tentado | `409 Conflict` |
| Jogador | Acessa o desafio sem ter concluído o Desafio 1 | `403 Forbidden` |

### Requisitos Não Funcionais

- **Segurança:** A rota exige sessão autenticada.
- **Segurança:** A rota verifica que a sessão está no estado `CHALLENGE_1_COMPLETE` antes de permitir acesso.
- **Integridade:** O campo `attemptsUsed` deve ser derivado do banco (contagem de registros `GameAttempt`), não de valor enviado pelo cliente.

### Fluxo Detalhado

1. `POST /api/game/challenge/2/guess` com `{ characterId }`.
2. Verifica sessão; retorna `401` se ausente.
3. Verifica que o estado da sessão de jogo é `CHALLENGE_1_COMPLETE`; retorna `403` se não for.
4. Zod valida `characterId`.
5. Conta tentativas anteriores no banco para este desafio.
6. Se `attemptsUsed >= 8`, retorna `403` (desafio já encerrado).
7. Verifica se `characterId` já foi tentado; retorna `409` se sim.
8. Compara `characterId` com o personagem secreto.
9. Salva a tentativa no banco.
10. Se correto: atualiza sessão para `CHALLENGE_2_COMPLETE`, retorna `{ won: true, character }`.
11. Se incorreto e `attemptsUsed + 1 < 8`: retorna `{ won: false, attemptsUsed: N }`.
12. Se incorreto e `attemptsUsed + 1 == 8`: atualiza sessão para `CHALLENGE_2_COMPLETE` com flag `partialLoss`, adiciona `+8` ao `sessionAttempts`, retorna `{ won: false, eliminated: true, character, penalty: 8 }`.

### Critérios de Aceitação

- [ ] O backend recusa acesso ao Desafio 2 se o Desafio 1 não estiver completo.
- [ ] O `attemptsUsed` é sempre calculado pelo banco, nunca confiando no valor do cliente.
- [ ] A identidade do personagem secreto só é revelada quando o desafio termina.
- [ ] A penalidade de `+8` é aplicada ao `sessionAttempts` quando o jogador perde por esgotamento de tentativas.
- [ ] Tentativas duplicadas retornam `409`, não `400`.

### Casos de Borda

- Jogador acerta na exata 8ª tentativa: deve ser tratado como vitória (`won: true`), não como derrota parcial.
- Jogador envia requisições simultâneas (race condition): usar transação Prisma para garantir que a contagem de tentativas é atômica.
- Sessão de jogo não encontrada: retornar `404` com mensagem orientando o usuário a iniciar uma nova sessão.
