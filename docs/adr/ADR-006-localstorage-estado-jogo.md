# ADR-006 — Persistência do estado de jogo no localStorage

**Data:** 2026-06-27
**Status:** Aceito

## Contexto

O jogo possui três desafios sequenciais. O progresso do jogador (tentativas, desafio atual, IDs dos personagens secretos) precisa sobreviver a um refresh de página ou fechamento acidental do browser. As alternativas eram: buscar o estado do banco a cada carregamento, usar `sessionStorage`, ou usar `localStorage`.

## Decisão

O `GameContext` persiste todo o estado de jogo no **localStorage** via hook `useLocalStorage` sob a chave `"potterdle-game"`. O estado inclui `gameId`, `characterId1`, `characterId2`, `spellId3`, contadores de tentativas por desafio, `currentChallenge` e `isFinished`. Ao concluir os 3 desafios, o total de tentativas é sincronizado com o banco via `PATCH /api/game`.

## Consequências

**Positivas:**
- Refresh de página não perde o progresso — experiência de jogo contínua.
- Sem round-trip ao banco para restaurar estado: hidratação instantânea.
- Implementação simples: um único hook genérico `useLocalStorage`.

**Negativas:**
- O estado (incluindo os IDs dos personagens secretos) fica acessível a qualquer script rodando na mesma origem — risco de trapaça via console.
- Se o jogador limpar o localStorage no meio de um jogo, o estado é perdido e ele precisa reiniciar.
- Estado não sincroniza entre abas ou dispositivos diferentes — jogar em dois dispositivos ao mesmo tempo resulta em inconsistência.