# ADR-005 — Efeito de desfoque do Desafio 2 via CSS puro

**Data:** 2026-06-27
**Status:** Aceito

## Contexto

No Desafio 2 (adivinhar personagem pela imagem), a imagem começa desfocada e fica progressivamente mais nítida a cada tentativa incorreta. Era necessário decidir onde o desfoque seria aplicado: processamento de imagem no servidor (gerar variantes pré-desfocadas) ou CSS no cliente.

## Decisão

O desfoque é aplicado **exclusivamente via CSS** (`filter: blur(Npx)`) no frontend. O backend retorna sempre a mesma URL de imagem original. O frontend controla o nível de blur com base no número de tentativas retornado pela API (`attemptsUsed`), com 8 níveis definidos de `blur(40px)` a `blur(0px)`. A transição é animada com `transition: filter 0.5s ease`.

```
Tentativa 0: blur(40px)
Tentativa 1: blur(35px)
Tentativa 2: blur(30px)
Tentativa 3: blur(24px)
Tentativa 4: blur(18px)
Tentativa 5: blur(12px)
Tentativa 6: blur(7px)
Tentativa 7: blur(3px)
Tentativa 8: blur(0px) — personagem revelado
```

## Consequências

**Positivas:**
- Zero processamento de imagem no servidor: sem dependências de sharp/canvas/imagemagick.
- A mesma URL é cacheada pelo browser — sem downloads extras entre tentativas.
- Transição suave é trivial com CSS, sem JavaScript adicional.
- Sem custo de armazenamento para variantes de imagem.

**Negativas:**
- Um jogador pode inspecionar o DOM ou o Network para obter a URL da imagem original sem desfoque e ver o personagem antes de adivinhar.
- A experiência de blur depende do suporte a `filter` no browser (suporte universal em browsers modernos, não é um risco real).