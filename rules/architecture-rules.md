# Regras de Arquitetura — Potterdle

## Stack
- Framework: Next.js 15 (App Router, Turbopack)
- Linguagem: TypeScript com `strict: true`
- Banco de dados: PostgreSQL via Prisma 6
- Autenticação: NextAuth v4 com CredentialsProvider
- UI: Radix UI / shadcn-ui + Tailwind CSS v4

## Estrutura de Pastas
- Todas as rotas de API ficam em `src/app/api/`
- Todas as páginas ficam em `src/app/`
- Componentes compartilhados ficam em `src/components/`
- Tipos de domínio ficam em `src/types/`
- Funções utilitárias ficam em `src/lib/`
- Dados estáticos (JSON) ficam em `src/app/data/`

## Regras
- Nunca instanciar `new PrismaClient()` fora de `src/lib/prisma.ts`
- Nunca usar `$queryRaw` — sempre usar o query builder tipado do Prisma
- Nunca usar `any` no TypeScript, exceto para integração com bibliotecas de terceiros onde é inevitável
- Toda rota de API privada deve verificar a sessão via `getServerSession(authOptions)` e retornar `401` se ausente
- Nunca retornar o campo `password` em nenhuma resposta de API — sempre usar `select` do Prisma para excluí-lo
- Validar todos os bodies de requisição com Zod antes de qualquer acesso ao banco
- Pontuação nunca pode ficar negativa: sempre usar `Math.max(0, pontosAtuais - penalidade)`