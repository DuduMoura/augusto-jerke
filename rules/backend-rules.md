# Regras de Backend — Potterdle

## Rotas de API
- Toda rota que recebe um body deve validá-lo com Zod e retornar erros estruturados: `{ field: string, message: string }[]`
- A verificação de autenticação deve ser a primeira operação em toda rota protegida
- Retornar `401` para sessão ausente, `403` para permissão insuficiente, `404` para recurso não encontrado, `409` para conflitos
- Normalizar o e-mail para minúsculas antes de salvar ou consultar

## Banco de Dados
- Usar exclusivamente o singleton do Prisma de `src/lib/prisma.ts`
- Nunca usar `$queryRaw` — usar o query builder tipado do Prisma
- Usar transações do Prisma para operações que atualizam múltiplos registros atomicamente (ex: atualizar pontos e criar entrada no History)
- Nunca expor o campo `password` em nenhum `select` — sempre excluí-lo explicitamente

## Autenticação
- `NEXTAUTH_SECRET` deve vir exclusivamente de variáveis de ambiente
- Duração da sessão JWT: 7 dias
- A mensagem de erro de login é sempre genérica: "Credenciais inválidas" — nunca distinguir e-mail de senha incorreta

## Regras de Negócio
- Pontuação mínima é sempre 0: `Math.max(0, pontosAtuais - penalidade)`
- Toda mudança de pontos deve gerar uma entrada em `History` com descrição legível em português
- A progressão entre desafios é verificada no servidor — nunca confiar no estado de desafio informado pelo cliente
- O `attemptsUsed` no Desafio 2 deve ser derivado do banco de dados, nunca do valor enviado pelo cliente