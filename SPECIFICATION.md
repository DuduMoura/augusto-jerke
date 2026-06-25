# SPECIFICATION — Potterdle

---

## 1. Requisitos Funcionais

### RF-01 — Cadastro de usuário

- O sistema deve permitir o cadastro com os campos: nome de usuário, e-mail, senha e casa de Hogwarts.
- O e-mail deve ser único no sistema; cadastros com e-mail já existente devem ser rejeitados.
- A senha deve ter no mínimo 6 caracteres.
- O nome de usuário deve ter entre 2 e 50 caracteres.
- A casa deve ser uma das quatro opções válidas: Gryffindor, Ravenclaw, Hufflepuff ou Slytherin.
- A pontuação inicial do usuário é 0.
- Após o cadastro bem-sucedido, o usuário é redirecionado para a tela de login.

**Regra de negócio:** e-mails duplicados devem ser bloqueados antes da criação do registro.

---

### RF-02 — Login

- O sistema deve aceitar autenticação por e-mail e senha.
- O sistema deve aceitar autenticação via conta Google.
- Após login bem-sucedido, o usuário é redirecionado para o dashboard.
- Credenciais inválidas devem exibir uma mensagem de erro sem redirecionar.

**Regra de negócio:** todas as rotas da área logada requerem sessão autenticada ativa; sem sessão, o usuário é redirecionado para o login.

---

### RF-03 — Edição de perfil

- O usuário pode alterar seu nome de usuário e sua casa de Hogwarts.
- E-mail e senha não podem ser alterados pelo perfil.
- A alteração deve ser refletida imediatamente no dashboard.

---

### RF-04 — Desafio 1: Adivinhar o personagem pelos atributos

- O sistema sorteia aleatoriamente um personagem secreto no início da sessão.
- O jogador seleciona um personagem da lista e confirma o palpite.
- O sistema exibe feedback por atributo: quais coincidem e quais divergem do personagem secreto.
- Os 10 atributos comparados são: espécie, gênero, casa, ascendência, ano de nascimento, é bruxo, cor do cabelo, é funcionário de Hogwarts, é estudante de Hogwarts, está vivo.
- O desafio é concluído quando todos os 10 atributos do palpite coincidirem com o personagem secreto.
- Não há limite de tentativas.

**Regra de negócio:** o mesmo personagem aleatório é mantido durante toda a sessão, inclusive em sessões de desafio entre jogadores (ambos jogam com o mesmo personagem).

---

### RF-05 — Desafio 2: Adivinhar o personagem pela imagem

- O sistema exibe a foto do personagem secreto com desfoque inicial de 16px.
- A cada tentativa errada, o desfoque diminui 2px, tornando a imagem progressivamente mais nítida.
- O jogador seleciona um personagem da lista como palpite.
- Se o palpite for correto, o desafio é concluído imediatamente e a imagem aparece sem desfoque.
- Se o desfoque atingir 0px sem acerto (8 tentativas esgotadas), o desafio é encerrado como derrota parcial, o jogador avança mesmo assim, e 10 tentativas de penalidade são somadas ao total da sessão.
- Tentativas duplicadas (mesmo personagem já chutado) não são adicionadas à lista de palpites.

**Regra de negócio:** o jogador não pode acessar o Desafio 2 sem ter concluído o Desafio 1.

---

### RF-06 — Desafio 3: Adivinhar o feitiço pela descrição

- O sistema exibe a descrição de um feitiço sorteado aleatoriamente.
- O jogador seleciona o nome do feitiço entre as opções disponíveis.
- Se o palpite for correto, a sessão é concluída e o resultado é salvo.
- Se errar, o sistema exibe "Incorrect! Try again." e o jogador continua tentando.
- Não há limite de tentativas.

**Regra de negócio:** o jogador não pode acessar o Desafio 3 sem ter concluído o Desafio 2.

---

### RF-07 — Sessão livre (jogo sem desafio)

- Ao completar os três desafios, o sistema registra a partida com os IDs dos personagens, o ID do feitiço e o total de tentativas.
- Sessões livres não geram pontos no ranking.

---

### RF-08 — Envio de desafio entre jogadores

- O jogador (desafiante) finaliza uma sessão livre e, a partir dela, pode enviar um desafio para outro jogador cadastrado.
- O desafio vincula o jogo já concluído pelo desafiante ao jogador desafiado.
- O desafiado recebe o desafio pendente no dashboard.

---

### RF-09 — Resposta ao desafio (aceitar, recusar ou desistir)

O desafiado pode tomar três ações:

| Ação | Efeito nos pontos |
|---|---|
| **Aceitar e jogar** | Resultado determinado por comparação de tentativas (ver RF-10) |
| **Recusar** | Desafiante +5 pts / Desafiado −3 pts |
| **Desistir após aceitar** | Desafiante +20 pts / Desafiado −10 pts |

**Regra de negócio:** ao recusar ou desistir, o desafio é marcado como finalizado e o desafiante é automaticamente declarado vencedor.

---

### RF-10 — Conclusão de um desafio (resultado)

- O resultado é determinado pelo total de tentativas usadas pelos dois jogadores nos três desafios somados.
- Quem usar **menos** tentativas vence.

| Resultado | Vencedor | Pontos do vencedor | Pontos do perdedor |
|---|---|---|---|
| Desafiado usa ≤ tentativas do desafiante | Desafiado | +20 | −10 |
| Desafiado usa > tentativas do desafiante | Desafiante | +10 | −10 |

**Regra de negócio:** a pontuação de qualquer jogador nunca fica abaixo de 0.

---

### RF-11 — Ranking global

- Exibe todos os jogadores ordenados por pontuação total, do maior para o menor.
- O jogador logado é destacado visualmente na lista.
- Requer autenticação para ser acessado.

---

### RF-12 — Histórico de pontuação

- Exibe todas as movimentações de pontos do jogador logado.
- Cada entrada contém: descrição do evento e quantidade de pontos (positivo ou negativo).
- Atualiza automaticamente a cada 10 segundos.

---

### RF-13 — Dashboard

- Exibe perfil do jogador: nome de usuário, casa e pontuação atual.
- Exibe abas de desafios: recebidos (pendentes), enviados (pendentes) e concluídos.
- Exibe uma curiosidade aleatória do universo Harry Potter.
- Desafios pendentes atualizam automaticamente a cada 10 segundos.

---

## 2. Requisitos Não Funcionais

### Desempenho

- RNF-01: A lista de desafios e o histórico devem ser atualizados em no máximo 10 segundos após uma alteração no servidor.
- RNF-02: As telas de jogo devem responder ao palpite do usuário sem recarregar a página.
- RNF-03: O ranking deve ser carregado em ordem decrescente de pontuação diretamente do banco, sem ordenação no cliente.

### Segurança

- RNF-04: As senhas dos usuários devem ser armazenadas com hash bcrypt (fator de custo 10).
- RNF-05: Nenhuma rota da área privada pode ser acessada sem sessão autenticada ativa.
- RNF-06: Operações que modificam pontuação ou status de desafio devem validar a sessão no servidor antes de executar qualquer alteração.
- RNF-07: A pontuação do usuário não pode ser manipulada diretamente pelo cliente; toda movimentação ocorre exclusivamente no servidor.

### Disponibilidade

- RNF-08: O estado de progresso dos três desafios de uma sessão deve ser persistido localmente no dispositivo do jogador, de modo que uma recarga de página não reinicie o jogo.

### Usabilidade

- RNF-09: Mensagens de erro de validação devem ser exibidas ao lado do campo correspondente, sem uso de alertas do navegador.
- RNF-10: O sistema deve suportar modo claro e escuro, respeitando a preferência do usuário.
- RNF-11: A interface deve ser responsiva e utilizável em dispositivos desktop.
- RNF-12: Botões de ação devem exibir estado de carregamento enquanto uma requisição está em andamento, evitando submissões duplicadas.

---

## 3. Fluxos Detalhados

### Fluxo 1 — Cadastro

```
1. Usuário acessa /register
2. Preenche: username, email, senha, casa
3. Sistema valida os campos:
   - username: entre 2 e 50 caracteres → erro se fora do intervalo
   - email: formato válido → erro se inválido
   - senha: mínimo 6 caracteres → erro se menor
   - casa: deve ser uma das quatro opções → erro se não selecionada
4. Sistema verifica se o e-mail já existe:
   - Se existir → exibe "This email is already using"
   - Se não existir → cria o usuário com senha hasheada e pontuação 0
5. Redirecionamento para /login
```

### Fluxo 2 — Login

```
1. Usuário acessa /login
2. Preenche e-mail e senha (ou clica em "Sign in with Google")
3. Sistema valida formato do e-mail e tamanho mínimo da senha
4. Sistema autentica as credenciais:
   - Credenciais inválidas → exibe "Error" sem redirecionar
   - Credenciais válidas → cria sessão e redireciona para /dashboard
5. Google OAuth: redireciona para /dashboard após autenticação bem-sucedida
```

### Fluxo 3 — Sessão de jogo livre

```
1. Jogador acessa /game/characterAttributes
   - Se sessão do Desafio 1 já concluída (localStorage), redireciona para /game/characterImage
2. Desafio 1 — Atributos:
   a. Personagem aleatório sorteado e salvo no localStorage
   b. Jogador seleciona personagem e confirma
   c. Sistema compara atributos e exibe feedback
   d. Loop até acertar todos os 10 atributos
   e. Ao acertar → diálogo de parabéns → botão para avançar
3. Desafio 2 — Imagem:
   a. Personagem aleatório sorteado (diferente do 1)
   b. Imagem exibida com blur 16px
   c. Jogador seleciona personagem e confirma
   d. Se errou: blur reduz 2px, tentativa registrada
   e. Se acertou: blur vai a 0px, diálogo de parabéns
   f. Se blur chegou a 0px sem acerto: derrota parcial, +10 tentativas de penalidade, avança
4. Desafio 3 — Feitiço:
   a. Feitiço aleatório sorteado
   b. Jogador lê a descrição, seleciona nome e confirma
   c. Se errou: exibe "Incorrect! Try again."
   d. Se acertou: diálogo de parabéns → botão "Finish Game"
   e. Ao finalizar: jogo salvo no servidor → redirecionamento para /dashboard
```

### Fluxo 4 — Desafio entre jogadores

```
1. Desafiante conclui sessão livre → pode enviar desafio no dashboard
2. Desafiado vê o desafio pendente na aba "Recebidos"
3. Desafiado pode:
   a. Recusar → desafiante +5 pts, desafiado -3 pts, desafio encerrado
   b. Aceitar → segue para o jogo com os mesmos personagens e feitiço do desafiante
4. Desafiado joga os três desafios (mesmos IDs, sorteio fixo)
5. A qualquer momento durante o jogo o desafiado pode desistir:
   → desafiante +20 pts, desafiado -10 pts, desafio encerrado
6. Ao concluir o Desafio 3 → sistema compara tentativas totais
7. Resultado:
   - Tentativas do desafiado ≤ tentativas do desafiante → desafiado +20 pts, desafiante -10 pts
   - Tentativas do desafiado > tentativas do desafiante → desafiante +10 pts, desafiado -10 pts
8. Ambos recebem entrada no histórico descrevendo o resultado
9. Desafio marcado como finalizado
```

### Fluxo 5 — Tratamento de erros

| Situação | Comportamento esperado |
|---|---|
| Formulário submetido com campo inválido | Mensagem de erro exibida ao lado do campo; envio bloqueado |
| E-mail já cadastrado no registro | Alerta com "This email is already using" |
| Credenciais de login inválidas | Alerta com "Error"; usuário permanece na tela de login |
| Acesso a rota privada sem sessão | Redirecionamento para /login |
| Acesso ao Desafio 2 sem concluir o Desafio 1 | Redirecionamento automático para /game/characterAttributes |
| Acesso ao Desafio 3 sem concluir o Desafio 2 | Redirecionamento automático para /game/characterImage |
| Erro de rede em requisição ao servidor | Estado de erro exibido no componente correspondente |

---

## 4. Critérios de Aceitação

### CA-01 — Cadastro
- [ ] Usuário com dados válidos é criado e redirecionado para /login
- [ ] E-mail duplicado é bloqueado com mensagem de erro
- [ ] Campos com formato inválido exibem erro inline antes do envio
- [ ] Senha nunca é armazenada em texto puro

### CA-02 — Login
- [ ] Credenciais válidas criam sessão e redirecionam para /dashboard
- [ ] Credenciais inválidas exibem erro sem redirecionar
- [ ] Login com Google redireciona para /dashboard após autenticação
- [ ] Rota privada sem sessão redireciona para /login

### CA-03 — Desafio 1 (Atributos)
- [ ] Personagem secreto é sorteado e mantido entre tentativas
- [ ] Feedback é exibido para cada um dos 10 atributos após cada palpite
- [ ] Desafio é concluído somente quando todos os atributos coincidem
- [ ] Histórico de palpites é exibido e acumulado corretamente

### CA-04 — Desafio 2 (Imagem)
- [ ] Imagem começa com blur 16px e reduz 2px por tentativa errada
- [ ] Acerto antes do limite conclui o desafio normalmente
- [ ] Ao atingir 8 tentativas sem acerto: derrota parcial, 10 tentativas de penalidade adicionadas, jogo avança
- [ ] Personagens já chutados aparecem na lista de palpites anteriores
- [ ] Palpite duplicado não é adicionado novamente à lista

### CA-05 — Desafio 3 (Feitiço)
- [ ] Descrição do feitiço é exibida corretamente
- [ ] Palpite errado exibe mensagem de erro e aguarda nova tentativa
- [ ] Palpite correto conclui a sessão e salva o resultado no servidor
- [ ] Tentativas dos três desafios são somadas corretamente no registro

### CA-06 — Desafios entre jogadores
- [ ] Desafiado vê o desafio pendente no dashboard
- [ ] Recusar gera movimentação de pontos correta para ambos
- [ ] Aceitar inicia a sessão com os mesmos personagens e feitiço do desafiante
- [ ] Desistir gera movimentação de pontos correta para ambos
- [ ] Resultado por comparação de tentativas aplica pontos corretos
- [ ] Pontuação nunca fica abaixo de 0
- [ ] Histórico de ambos os jogadores registra o resultado

### CA-07 — Ranking
- [ ] Lista exibe todos os jogadores ordenados por pontuação decrescente
- [ ] Jogador logado aparece destacado visualmente
- [ ] Requer sessão autenticada; sem sessão, redireciona para /login

### CA-08 — Histórico
- [ ] Cada movimentação de pontos aparece com descrição e valor
- [ ] Lista atualiza automaticamente a cada 10 segundos
- [ ] Eventos de vitória, derrota, recusa e desistência são registrados

---

## 5. Casos de Borda

### Cadastro e Login

| Caso | Comportamento esperado |
|---|---|
| Username com 1 caractere | Bloqueado: mínimo 2 caracteres |
| Username com 51 caracteres | Bloqueado: máximo 50 caracteres |
| Senha com 5 caracteres | Bloqueado: mínimo 6 caracteres |
| E-mail sem "@" | Bloqueado: formato inválido |
| Casa não selecionada | Bloqueado: campo obrigatório |
| E-mail já cadastrado | Bloqueado com mensagem específica |
| Login com senha correta mas e-mail inexistente | Exibe erro genérico de autenticação |

### Jogo

| Caso | Comportamento esperado |
|---|---|
| Jogador acessa /game/characterImage sem concluir /game/characterAttributes | Redirecionado para /game/characterAttributes |
| Jogador acessa /game/spells sem concluir /game/characterImage | Redirecionado para /game/characterImage |
| Jogador recarrega a página durante o Desafio 2 | Estado (blur atual, tentativas, palpites anteriores) é restaurado do localStorage |
| Jogador chuta o mesmo personagem duas vezes no Desafio 2 | Segundo palpite não é adicionado à lista de palpites |
| Blur do Desafio 2 chega a 0px exatamente no momento do acerto | Acerto prevalece; desafio concluído com sucesso |

### Pontuação

| Caso | Comportamento esperado |
|---|---|
| Jogador com 2 pontos perde desafio (−10 pts) | Pontuação vai a 0, não a −8 |
| Jogador com 0 pontos recusa desafio (−3 pts) | Pontuação permanece em 0 |
| Desafiante e desafiado usam exatamente o mesmo número de tentativas | Desafiado é declarado vencedor (+20 pts); desafiante perde (−10 pts) |

### Desafios

| Caso | Comportamento esperado |
|---|---|
| Desafiado tenta acessar o jogo sem ter aceito o desafio | Não inicia a sessão de desafio |
| Desafiante ainda não finalizou a sessão mas tenta enviar desafio | Desafio só pode ser enviado após a sessão do desafiante estar concluída |
| Desafio recusado/desistido tem seu status definido como finalizado | Não aparece mais como pendente para nenhum dos dois jogadores |
