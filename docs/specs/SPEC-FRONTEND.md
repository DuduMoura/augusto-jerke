# Specification — Frontend (Potterdle)

Stack: Next.js 15, React 19, TailwindCSS, Framer Motion, Radix UI, React Hook Form, Zod, TanStack Query, NextAuth

---

## Funcionalidade 1 — Cadastro de Usuário

### Requisitos Funcionais

- Exibir formulário com os campos: nome de usuário, e-mail, senha e confirmação de senha.
- Exibir selector de casa de Hogwarts (Gryffindor, Hufflepuff, Ravenclaw, Slytherin) com ícone/cor representativa de cada casa.
- Submeter o formulário via `POST /api/auth/register`.
- Após cadastro bem-sucedido, redirecionar automaticamente para o dashboard.
- Exibir mensagens de erro inline por campo quando a validação falhar.

### Regras de Negócio

- Nome de usuário: 3–20 caracteres, apenas letras, números e underscores.
- E-mail: formato válido (RFC 5322 simplificado).
- Senha: mínimo de 8 caracteres.
- Confirmação de senha deve ser idêntica à senha.
- A seleção de uma casa é obrigatória para concluir o cadastro.

### Casos de Uso

| Ator | Ação | Resultado Esperado |
|---|---|---|
| Visitante | Preenche todos os campos corretamente e envia | Conta criada, redirecionado ao dashboard |
| Visitante | Envia formulário com e-mail já cadastrado | Mensagem de erro: "Este e-mail já está em uso" |
| Visitante | Deixa campo obrigatório vazio | Campo destacado com mensagem de erro |

### Requisitos Não Funcionais

- **Desempenho:** Validação local (Zod + React Hook Form) deve ocorrer antes do envio à API, sem delay perceptível.
- **Segurança:** Não exibir mensagens que revelem se um e-mail específico existe no banco.
- **Usabilidade:** Botão de submit deve ser desabilitado enquanto a requisição estiver em andamento (loading state).

### Fluxo Detalhado

1. Usuário acessa `/register`.
2. Preenche os campos do formulário.
3. Ao sair de um campo (blur), a validação Zod é executada e erros são exibidos inline.
4. Ao submeter, o botão exibe spinner e é desabilitado.
5. Se a API retorna `201`, NextAuth inicia a sessão e redireciona para `/dashboard`.
6. Se a API retorna `409` (e-mail duplicado), exibe mensagem de erro no campo de e-mail.
7. Se a API retorna `500`, exibe toast genérico de erro.

### Critérios de Aceitação

- [ ] Todos os campos possuem validação inline sem necessidade de submeter o formulário.
- [ ] O selector de casa exibe as quatro opções com cores/ícones distintos.
- [ ] O botão de submit torna-se um spinner durante o loading.
- [ ] Após sucesso, o usuário é redirecionado para o dashboard sem refresh manual.
- [ ] Erros da API são exibidos de forma clara e contextualizada.

### Casos de Borda

- Usuário clica em submit sem preencher nenhum campo: todos os campos devem ser marcados como inválidos de uma vez.
- Usuário cola e-mail com espaços em branco nas extremidades: o campo deve fazer trim antes de validar.
- Usuário tenta submeter duas vezes rapidamente (double-click): apenas uma requisição deve ser enviada.

---

## Funcionalidade 2 — Login de Usuário

### Requisitos Funcionais

- Exibir formulário com os campos: e-mail e senha.
- Autenticar via NextAuth (`signIn("credentials", ...)`).
- Após login bem-sucedido, redirecionar para `/dashboard`.
- Exibir link para a página de cadastro.

### Regras de Negócio

- E-mail e senha são obrigatórios.
- Não revelar ao usuário qual dos dois campos está incorreto (mensagem genérica).

### Casos de Uso

| Ator | Ação | Resultado Esperado |
|---|---|---|
| Usuário cadastrado | Preenche credenciais corretas | Autenticado e redirecionado ao dashboard |
| Usuário cadastrado | Informa senha incorreta | Mensagem genérica: "Credenciais inválidas" |
| Visitante | Acessa rota protegida sem login | Redirecionado para `/login` |

### Requisitos Não Funcionais

- **Segurança:** Mensagem de erro única ("Credenciais inválidas") para e-mail ou senha incorretos — sem distinguir qual está errado.
- **Usabilidade:** Suporte ao atributo `autocomplete` nos campos para facilitar o uso de gerenciadores de senha.

### Fluxo Detalhado

1. Usuário acessa `/login`.
2. Preenche e-mail e senha.
3. Ao submeter, `signIn` é chamado com `redirect: false`.
4. Se retornar `ok: true`, redireciona para `/dashboard`.
5. Se retornar `ok: false`, exibe mensagem de erro genérica abaixo do formulário.

### Critérios de Aceitação

- [ ] Mensagem de erro é genérica (não diferencia e-mail de senha incorreta).
- [ ] Rotas protegidas redirecionam para `/login` quando o usuário não está autenticado.
- [ ] Formulário tem `autocomplete="email"` e `autocomplete="current-password"` nos campos corretos.

### Casos de Borda

- Usuário já autenticado acessa `/login`: deve ser redirecionado para `/dashboard`.
- Senha com caracteres especiais (ex: `P@ss#123!`): deve ser enviada corretamente sem encoding incorreto.

---

## Funcionalidade 3 — Desafio 1: Adivinhar Personagem pelos Atributos

### Requisitos Funcionais

- Exibir uma barra de busca com autocomplete para selecionar um personagem da lista.
- Após cada tentativa, exibir uma linha na tabela de feedback com os atributos do personagem escolhido.
- Colorir cada célula da tabela de acordo com o match com o personagem secreto:
  - Verde: atributo idêntico ao personagem secreto.
  - Vermelho: atributo diferente.
  - Amarelo (quando aplicável): valor numérico próximo ou pertencimento parcial a grupo.
- Bloquear o input após o usuário acertar todos os atributos.
- Exibir modal/mensagem de vitória ao concluir o desafio.
- Botão "Próximo Desafio" habilitado somente após a conclusão.

### Regras de Negócio

- Sem limite de tentativas.
- O personagem selecionado é removido do autocomplete após ser tentado (não pode repetir).
- Atributos comparados: Casa, Gênero, Espécie, Cor do cabelo, Cor dos olhos, Sangue, Patrono, Ano de nascimento.

### Casos de Uso

| Ator | Ação | Resultado Esperado |
|---|---|---|
| Jogador | Seleciona personagem correto na 1ª tentativa | Todas as células ficam verdes; modal de vitória exibido |
| Jogador | Seleciona personagem incorreto | Nova linha de feedback adicionada na tabela |
| Jogador | Tenta digitar nome parcial no autocomplete | Lista filtra em tempo real, sem sensibilidade a maiúsculas |

### Requisitos Não Funcionais

- **Desempenho:** Filtragem do autocomplete deve ser local (sem chamadas à API a cada keystroke).
- **Usabilidade:** Tabela de feedback tem animação de entrada (Framer Motion) a cada nova linha adicionada.
- **Acessibilidade:** Células coloridas devem ter atributo `aria-label` descrevendo o resultado (não depender apenas de cor).

### Fluxo Detalhado

1. Usuário acessa o Desafio 1.
2. Digita nome de personagem no campo de busca.
3. Dropdown exibe sugestões filtradas.
4. Usuário seleciona um personagem.
5. Frontend chama `POST /api/game/challenge/1/guess` com o personagem escolhido.
6. API retorna objeto com os atributos e seus status de match.
7. Nova linha é adicionada à tabela com animação.
8. Se todos os atributos forem `correct`, o input é bloqueado e o modal de vitória é exibido.

### Critérios de Aceitação

- [ ] A tabela exibe cabeçalho com os nomes dos atributos.
- [ ] Cada célula tem cor correta (verde/amarelo/vermelho) de acordo com o feedback da API.
- [ ] O autocomplete não exibe personagens já tentados.
- [ ] Modal de vitória só aparece quando todos os atributos retornam `correct`.
- [ ] O botão "Próximo Desafio" fica visível apenas após a vitória.

### Casos de Borda

- Usuário tenta submeter sem selecionar um personagem na lista: campo não aceita texto livre, apenas seleção.
- A lista de personagens está vazia (erro de carregamento): exibir mensagem de fallback.
- Usuário atualiza a página no meio do desafio: o estado das tentativas anteriores deve ser restaurado (persistência em `sessionStorage` ou via API).

---

## Funcionalidade 4 — Desafio 2: Adivinhar Personagem pela Imagem

### Requisitos Funcionais

- Exibir a imagem do personagem secreto com filtro de desfoque inicial alto.
- A cada tentativa incorreta, reduzir progressivamente o desfoque da imagem.
- Exibir contador de tentativas restantes (máximo 8).
- Exibir campo de busca com autocomplete (mesma mecânica do Desafio 1).
- Ao esgotar 8 tentativas sem acertar: encerrar o desafio como derrota parcial e habilitar o avanço.
- Ao acertar: exibir modal de vitória e habilitar o avanço.

### Regras de Negócio

- Máximo de 8 tentativas.
- O nível de desfoque diminui a cada erro: `blur(40px)` → `blur(35px)` → ... → `blur(5px)` (ou equivalente em 8 etapas).
- Ao esgotar tentativas sem acerto, a sessão registra penalidade de +8 tentativas no total.
- O personagem correto é revelado após o encerramento (vitória ou derrota).

### Casos de Uso

| Ator | Ação | Resultado Esperado |
|---|---|---|
| Jogador | Acerta o personagem na 3ª tentativa | Imagem fica nítida, modal de vitória exibido |
| Jogador | Erra 8 vezes consecutivas | Desafio encerrado, personagem revelado, avanço habilitado com penalidade |
| Jogador | Tenta reutilizar personagem já tentado | Autocomplete não exibe personagens já usados |

### Requisitos Não Funcionais

- **Desempenho:** A imagem deve ser carregada de forma otimizada (Next.js `<Image>` com lazy loading). O desfoque deve ser aplicado via CSS (`filter: blur()`), não via processamento de imagem.
- **Usabilidade:** O desfoque deve ter transição suave (`transition: filter 0.5s ease`).

### Fluxo Detalhado

1. Usuário acessa o Desafio 2 (após concluir o Desafio 1).
2. Imagem é exibida com desfoque máximo.
3. Usuário seleciona um personagem no autocomplete e confirma.
4. Frontend chama `POST /api/game/challenge/2/guess`.
5. Se incorreto: desfoque reduz um nível, contador de tentativas atualizado.
6. Se correto: desfoque removido, modal de vitória exibido.
7. Se tentativas chegam a 8 sem acerto: personagem correto revelado, modal de derrota parcial exibido, botão de avanço habilitado.

### Critérios de Aceitação

- [ ] A imagem exibe 8 níveis distintos de desfoque.
- [ ] O contador de tentativas é atualizado após cada guess.
- [ ] A transição de desfoque é animada suavemente.
- [ ] Após 8 erros, o desafio encerra automaticamente sem necessidade de ação do usuário.
- [ ] O personagem correto é sempre revelado ao fim do desafio (vitória ou derrota).

### Casos de Borda

- Imagem não carrega (erro de rede): exibir placeholder com ícone de imagem quebrada.
- Usuário acerta na 8ª tentativa (última): deve ser tratado como vitória, não como derrota parcial.
- Usuário volta para o Desafio 1 via botão do browser: a navegação para trás deve ser bloqueada ou o estado protegido.
