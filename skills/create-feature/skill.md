# Skill: create-feature

Cria uma funcionalidade completa (rota de API + página + componentes) seguindo as convenções do projeto.

## Passos

1. Ler `docs/specs/SPEC-BACKEND.md` e `docs/specs/SPEC-FRONTEND.md` para os requisitos da funcionalidade
2. Criar as rotas de API usando a skill `create-api`
3. Criar a página em `src/app/<rota>/page.tsx`
4. Criar os componentes necessários em `src/components/`
5. Usar React Hook Form + Zod para formulários
6. Usar TanStack Query para estado de servidor (busca e mutação)
7. Usar Framer Motion para animações de listas e linhas
8. Usar componentes do shadcn-ui — nunca construir primitivos do zero
9. Verificar que o TypeScript compila sem erros antes de considerar a funcionalidade concluída

## Checklist

- [ ] Rota de API valida o body com Zod
- [ ] Rota de API verifica sessão nos endpoints protegidos
- [ ] Página redireciona usuários não autenticados para `/login`
- [ ] Formulário exibe erros de validação inline por campo
- [ ] Estados de loading são tratados (spinner no botão de envio)
- [ ] Respostas de erro da API são exibidas ao usuário
- [ ] Nenhum tipo `any` introduzido
- [ ] Campo `password` não exposto em nenhum lugar