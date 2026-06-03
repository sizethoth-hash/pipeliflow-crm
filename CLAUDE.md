# PipeFlow CRM

SaaS de gestão de clientes e vendas, multi-empresa, com pipeline Kanban visual, registro de atividades e monetização via Stripe.

PRD completo: [docs/PRD.md](docs/PRD.md)

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend/API | Next.js API Routes + Server Components |
| Banco + Auth | Supabase (PostgreSQL + RLS + Auth) |
| Estado cliente | Zustand |
| Estado servidor | TanStack Query v5 |
| Formulários | React Hook Form v7 + Zod |
| Drag-and-drop | @dnd-kit |
| Gráficos | Recharts |
| Pagamento | Stripe (Checkout + Webhooks + Customer Portal) |
| E-mail | Resend |
| Linting | Biome v2 |
| Testes | Vitest + Testing Library + Playwright (e2e) |
| Deploy | Vercel + Supabase |

---

## Project Structure

```
src/
  app/                  # Next.js App Router (pages + layouts)
    (auth)/             # Login, cadastro, onboarding
    (app)/              # App autenticado
      dashboard/
      leads/
      pipeline/
      settings/
    (marketing)/        # Landing page pública
  components/           # UI components reutilizáveis
  features/             # Módulos de feature (leads, deals, activities, workspace)
  hooks/                # Custom React hooks
  store/                # Zustand stores
  services/             # API service layer (Supabase calls, Stripe, Resend)
  types/                # Shared TypeScript types
  utils/                # Utility functions
  lib/                  # Instâncias singleton (supabase client, stripe)
docs/
  PRD.md
```

---

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm test         # Run unit tests
pnpm test:e2e     # Run Playwright e2e tests
pnpm lint         # Lint with Biome
pnpm typecheck    # Run tsc --noEmit
```

---

## Code Conventions

- TypeScript strict mode — no `any`, no implicit null access
- Components: named exports, PascalCase filenames
- Hooks: `use` prefix, camelCase filenames
- Server Components por padrão; `"use client"` apenas quando necessário
- Supabase RLS obrigatório em todas as tabelas — nunca bypassar via service role no cliente
- Após gerar TypeScript, sempre rodar `tsc --noEmit` antes de marcar como feito
- Coverage targets: 85% em components/hooks, 70% em utilities
- Todos os componentes interativos devem atender WCAG 2.2 AA

---

## Identidade Visual

- **Tom**: profissional, limpo, moderno — inspirado em HubSpot e Pipedrive
- **Sidebar**: fundo escuro (slate-900 / neutral-900)
- **Primária**: azul-violeta (`#6366f1` — indigo-500)
- **Acento positivo**: verde (`#22c55e`)
- **Acento negativo**: vermelho (`#ef4444`)
- **Tipografia**: Inter (sans-serif)
- **Cards**: fundo branco, border radius md, sombra leve (`shadow-sm`)
- **Layout**: sidebar fixa à esquerda + área de conteúdo com scroll

---

## Domínio e Regras de Negócio

### Workspaces
- Todo dado (lead, negócio, atividade) pertence a um workspace
- RLS no Supabase garante isolamento total entre workspaces
- Um usuário pode pertencer a múltiplos workspaces

### Papéis
| Papel | Permissões |
|-------|-----------|
| Admin | CRUD total + convites + planos |
| Membro | CRUD em leads e negócios do próprio workspace |

### Planos
| Plano | Colaboradores | Leads | Preço |
|-------|--------------|-------|-------|
| Free  | 2 | 50 | Grátis |
| Pro   | Ilimitado | Ilimitado | R$49/mês |

### Pipeline Kanban (etapas em ordem)
`Novo Lead` → `Contato Realizado` → `Proposta Enviada` → `Negociação` → `Fechado Ganho` → `Fechado Perdido`

---

## Agents

- **frontend-developer**: constrói componentes e features de UI
- **code-reviewer**: revisa qualidade e segurança (auto-acionado para gerações >200 linhas)
- **context-manager**: mantém contexto do projeto entre interações de agentes
