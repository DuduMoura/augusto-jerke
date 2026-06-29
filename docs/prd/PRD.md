# PRD — Potterdle

---

## 1. Problema

Fãs do universo Harry Potter não possuem uma forma interativa e desafiadora de testar e medir o seu nível de conhecimento sobre a franquia. Os quizzes existentes costumam ser estáticos, sem progressão, sem competição com outros jogadores e sem variação de desafios ao longo do tempo.

A ausência de uma plataforma lúdica e social voltada especificamente para o universo de Harry Potter faz com que os fãs percam o interesse rapidamente, pois não há motivação para retornar nem forma de comparar seu desempenho com outros jogadores.

---

## 2. Público-Alvo

Fãs da saga Harry Potter — principalmente jovens adultos entre 15 e 30 anos — que acompanham a franquia (livros, filmes ou ambos) e desejam testar seus conhecimentos de forma divertida e competitiva com amigos ou com a comunidade.

---

## 3. Funcionalidades

### Acesso e Perfil
- Criar uma conta com nome de usuário, e-mail e senha
- Selecionar a casa de Hogwarts ao se cadastrar
- Realizar login e logout
- Editar informações do perfil

### Jogo Diário
- Jogar uma sessão composta por três desafios sequenciais:
  1. **Adivinhar o personagem pelos atributos** — o jogador escolhe um personagem e recebe feedback visual sobre quais atributos coincidem com o personagem secreto. O desafio é concluído quando todos os atributos estiverem corretos. Não há limite de tentativas.
  2. **Adivinhar o personagem pela imagem** — o jogador identifica um personagem a partir de uma foto inicialmente desfocada. A cada tentativa incorreta, a imagem fica progressivamente mais nítida. O jogador tem até 8 tentativas; se não acertar dentro desse limite, o desafio é encerrado automaticamente e o jogador avança mesmo assim, porém com uma penalidade no total de tentativas da sessão.
  3. **Adivinhar o feitiço pela descrição** — o jogador vê a descrição de um feitiço e seleciona o nome correto entre as opções. Não há limite de tentativas.
- Avançar para o próximo desafio somente após concluir o anterior — os desafios são bloqueados até que o anterior seja finalizado
- O total de tentativas usados nos três desafios é registrado ao fim da sessão

### Desafios entre Jogadores
- Enviar um desafio para outro jogador cadastrado
- Receber notificação de desafios recebidos
- Aceitar ou recusar um desafio recebido
- Disputar a mesma sessão de jogos que o adversário
- Visualizar o resultado do desafio ao final

### Ranking e Histórico
- Visualizar o ranking global de jogadores ordenado por pontuação total acumulada
- Visualizar o próprio histórico com a descrição de cada movimentação de pontos (ganhos e perdas)
- Identificar a própria posição no ranking

### Dashboard
- Visualizar o perfil com pontuação atual e casa de Hogwarts
- Acessar desafios enviados, recebidos e finalizados
- Visualizar curiosidades aleatórias do universo Harry Potter

---

## 5. Regras de Pontuação e Progressão

### Progressão dos desafios
- Os três desafios de uma sessão devem ser jogados em ordem: Atributos → Imagem → Feitiço.
- Não é possível pular ou acessar um desafio sem ter concluído o anterior.
- No Desafio 2 (imagem), se o jogador esgotar as 8 tentativas sem acertar, o desafio é encerrado como derrota parcial e o jogador segue para o Desafio 3. Essa situação penaliza o total de tentativas da sessão.

### Pontuação nos desafios livres
- Sessões livres não geram pontos no ranking. O objetivo é praticar e registrar o histórico de partidas.

### Pontuação nos desafios entre jogadores
O vencedor de um desafio é determinado pelo menor número total de tentativas usadas na sessão inteira (somando os três desafios).

| Resultado | Pontos |
|---|---|
| Jogador desafiado vence (usou menos tentativas que o desafiante) | +20 pontos |
| Jogador desafiante vence (desafiado usou mais tentativas) | +10 pontos |
| Perdedor (qualquer dos dois) | −10 pontos |

- A pontuação nunca fica negativa: o mínimo é 0 pontos.
- Cada movimentação de pontos fica registrada no histórico do jogador com uma descrição do resultado.

### Ranking
- O ranking global ordena todos os jogadores pela pontuação total acumulada em desafios.
- Quanto mais desafios vencidos e com menos tentativas, maior a posição no ranking.

---

## 6. Fluxos

### Fluxo 1 — Jogar uma sessão livre

1. Jogador realiza login
2. Jogador acessa a área de jogo
3. Jogador joga o Desafio 1: seleciona um personagem e recebe feedback sobre os atributos; repete até acertar todos
4. Ao acertar todos os atributos, avança para o Desafio 2
5. Jogador tenta identificar o personagem pela imagem desfocada; a imagem fica mais nítida a cada tentativa errada
6. Ao acertar, ou ao esgotar as 8 tentativas, avança para o Desafio 3
7. Jogador lê a descrição de um feitiço e seleciona o nome correto; repete até acertar
8. Ao acertar o feitiço, conclui a sessão; o total de tentativas é registrado
9. Jogador é redirecionado para o dashboard

### Fluxo 2 — Desafiar outro jogador

1. Jogador (desafiante) acessa o dashboard e envia um desafio para outro jogador
2. O adversário (desafiado) recebe o desafio e pode aceitar ou recusar
3. Se aceito, o desafiante joga a sessão primeiro; seu total de tentativas fica registrado
4. O desafiado joga a mesma sessão (mesmos personagens e feitiço)
5. Ao finalizar, o sistema compara o total de tentativas dos dois; quem usou menos tentativas vence
6. Vencedor recebe pontos e perdedor perde pontos; ambos visualizam o resultado no histórico

### Fluxo 3 — Acompanhar o ranking

1. Jogador acessa a seção de ranking
2. Visualiza a lista de jogadores ordenada por pontuação
3. Identifica a própria posição na lista
