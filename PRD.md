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
  1. **Adivinhar o personagem pelos atributos** — o jogador escolhe um personagem e recebe feedback visual sobre quais atributos coincidem com o personagem secreto
  2. **Adivinhar o personagem pela imagem** — o jogador identifica um personagem a partir de sua foto
  3. **Adivinhar o feitiço pela descrição** — o jogador escolhe um feitiço com base na descrição apresentada
- Avançar para o próximo desafio somente após concluir o anterior
- Acumular pontos ao concluir a sessão de jogos

### Desafios entre Jogadores
- Enviar um desafio para outro jogador cadastrado
- Receber notificação de desafios recebidos
- Aceitar ou recusar um desafio recebido
- Disputar a mesma sessão de jogos que o adversário
- Visualizar o resultado do desafio ao final

### Ranking e Histórico
- Visualizar o ranking global de jogadores por pontuação
- Visualizar o próprio histórico de partidas e pontos acumulados
- Identificar a própria posição no ranking

### Dashboard
- Visualizar o perfil com pontuação atual e casa de Hogwarts
- Acessar desafios enviados, recebidos e finalizados
- Visualizar curiosidades aleatórias do universo Harry Potter

---

## 4. Fluxos

### Fluxo 1 — Jogar uma sessão livre

1. Jogador realiza login
2. Jogador acessa a área de jogo
3. Jogador joga o Desafio 1: seleciona um personagem e recebe feedback sobre os atributos
4. Ao acertar todos os atributos, avança para o Desafio 2
5. Jogador identifica o personagem pela imagem
6. Ao acertar, avança para o Desafio 3
7. Jogador lê a descrição de um feitiço e seleciona o nome correto
8. Ao acertar, conclui a sessão e recebe os pontos
9. Jogador é redirecionado para o dashboard

### Fluxo 2 — Desafiar outro jogador

1. Jogador acessa o dashboard
2. Jogador seleciona a opção de enviar desafio e escolhe o adversário
3. O adversário recebe o desafio e pode aceitar ou recusar
4. Se aceito, ambos jogam a mesma sessão de desafios
5. Ao finalizar, o sistema apura o resultado e exibe o vencedor

### Fluxo 3 — Acompanhar o ranking

1. Jogador acessa a seção de ranking
2. Visualiza a lista de jogadores ordenada por pontuação
3. Identifica a própria posição na lista
