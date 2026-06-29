# ADR-004 — Comparação de atributos do Desafio 1 no frontend

**Data:** 2026-06-27
**Status:** Aceito

## Contexto

No Desafio 1 (adivinhar personagem pelos atributos), o sistema precisa comparar os atributos do personagem escolhido pelo jogador com os do personagem secreto. A comparação poderia acontecer no backend (sem expor o segredo) ou no frontend (mais rápido, sem round-trip por tentativa).

## Decisão

A comparação acontece **no frontend**. Ao criar um jogo (`POST /api/game`), o backend retorna os IDs dos personagens secretos (`game_1_character_id`, `game_2_character_id`). O cliente usa esses IDs para buscar os atributos diretamente de `characters.json` (bundled estático) e realiza a comparação localmente.

## Consequências

**Positivas:**
- Feedback instantâneo para o jogador: sem latência de rede por tentativa.
- Reduz carga no servidor: nenhuma API call adicional durante as tentativas do Desafio 1.
- `characters.json` é um bundle estático — não há custo de banco por leitura de personagem.

**Negativas:**
- O ID do personagem secreto fica exposto no `localStorage` e na resposta da API de criação do jogo. Um jogador técnico pode descobrir o segredo sem jogar.
- A lógica de comparação precisa ser mantida no frontend em vez de centralizada no backend.

**Mitigação do risco:**
Para um jogo casual de fãs, a exposição do ID é aceitável. O objetivo é a experiência lúdica, não a competição antitrapaça rigorosa.