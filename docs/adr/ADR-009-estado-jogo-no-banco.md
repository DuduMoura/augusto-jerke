# ADR-009 — Progressão de desafios rastreada no modelo Game (flags booleanas)

**Data:** 2026-06-27
**Status:** Aceito

## Contexto

O jogo possui 3 desafios sequenciais. O backend precisa saber em qual desafio o jogador está para bloquear acesso antecipado ao Desafio 2 ou 3. As alternativas eram: criar um modelo separado `GameSession` com enum de estado, ou adicionar flags diretamente no modelo `Game`.

## Decisão

O estado de progressão é armazenado diretamente no modelo `Game` com os campos booleanos `challenge_1_done` e `challenge_2_done`. O campo `challenge_2_penalty` (inteiro) registra a penalidade caso o jogador esgote as tentativas do Desafio 2. Não existe modelo de sessão separado.

```prisma
model Game {
  challenge_1_done    Boolean @default(false)
  challenge_2_done    Boolean @default(false)
  challenge_2_penalty Int     @default(0)
  attempts            Int     @default(0)
  ...
}
```

## Consequências

**Positivas:**
- Schema mais simples: sem tabela extra de sessão ou enum de estado.
- Queries diretas: verificar se o Desafio 2 está liberado é um único campo booleano.
- Penalidade do Desafio 2 fica junto com o jogo, sem join adicional.

**Negativas:**
- Difícil de estender para N desafios dinâmicos: cada novo desafio exigiria nova migration para adicionar colunas.
- O rastreamento de tentativas individuais (quais personagens foram tentados em cada desafio) é feito via `guessedCharacters` no `localStorage` do cliente, não no banco — o banco só conhece o total de tentativas, não o histórico detalhado por tentativa.