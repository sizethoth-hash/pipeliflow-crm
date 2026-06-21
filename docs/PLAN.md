# PLAN — PipeFlow CRM
> Plano de execução completo. Interface primeiro, backend depois.
> PRD: [PRD.md](PRD.md) | Briefing: [../CLAUDE.md](../CLAUDE.md)

---

## Visão Geral

```
FASE 1 — INTERFACE (M0 → M7)   UI com dados mock, sem Supabase
FASE 2 — BACKEND   (M8 → M11)  Integração Supabase + RLS
FASE 3 — PRODUTO   (M12 → M14) Stripe, Resend, Deploy
```

---

## FASE 1 — Interface

### M0 · Setup do Projeto
**Branch:** `main`
**Objetivo:** Repositório configurado, stack instalada, CI passando, estrutura de pastas criada.

#### Entregas
- [x] Inicializar repositório Git + `.gitignore`
- [x] Criar projeto Next.js 14 com App Router + TypeScript strict
- [x] Instalar e configurar Tailwind CSS v4
- [x] Instalar e configurar shadcn/ui (tema indigo, radius md)
- [x] Instalar Biome v2 + script `pnpm lint`
- [x] Configurar `tsconfig.json` com path aliases (`@/`)
- [x] Criar estrutura de pastas: `app/`, `components/`, `features/`, `hooks/`, `store/`, `services/`, `types/`, `utils/`, `lib/`
- [x] Configurar Vitest + Testing Library
- [x] Configurar Playwright para e2e
- [x] Arquivo `.env.example` com todas as variáveis necessárias
- [x] `pnpm typecheck` e `pnpm lint` sem erros

**Commit final:** `chore: project setup — Next.js 14, Tailwind v4, shadcn/ui, Biome, Vitest, Playwright`

---

### M1 · Design System & Layout Shell
**Branch:** `feat/design-system`
**Objetivo:** Sistema de design base e shell do app autenticado com navegação funcional (dados mock).

#### Entregas
- [x] Tokens de design: cores (indigo-500, slate-900, verde, vermelho), fonte Inter
- [x] Componentes base: `Button`, `Input`, `Badge`, `Card`, `Avatar`, `Spinner`
- [x] Componentes de feedback: `Toast`, `Dialog`, `Tooltip`, `DropdownMenu`
- [x] Layout autenticado: `AppLayout` com sidebar fixa + área de conteúdo
- [x] `Sidebar` com: logo, nav links (Dashboard, Leads, Pipeline, Settings), workspace switcher dropdown, avatar do usuário
- [x] `TopBar` com título da página e slot de ações
- [x] Rotas de placeholder: `/dashboard`, `/leads`, `/pipeline`, `/settings`
- [x] Responsividade: sidebar colapsável em mobile
- [ ] Storybook ou página `/dev/components` com catálogo visual (opcional)
- [x] Testes unitários dos componentes base (≥ 85% coverage)

**Commit final:** `feat: design system and authenticated app shell`

---

### M2 · Landing Page
**Branch:** `feat/landing-page`
**Objetivo:** Página pública de apresentação do PipeFlow CRM, publicável de forma independente.

#### Entregas
- [x] Layout de marketing: `(marketing)/layout.tsx` sem sidebar
- [x] Seção **Hero**: headline, subheadline, CTA "Começar grátis", mockup/screenshot
- [x] Seção **Funcionalidades**: 6 cards com ícone, título e descrição
- [x] Seção **Pipeline Preview**: imagem/ilustração do Kanban
- [x] Seção **Planos e Preços**: tabela Free vs Pro com features e CTAs
- [x] Seção **CTA final**: chamada para cadastro
- [x] `Navbar` pública: logo + links de âncora + botões Login/Cadastro
- [x] `Footer`: links institucionais
- [x] Totalmente responsiva (mobile-first)
- [x] Acessibilidade: todos os links e botões com `aria-label`
- [x] `AnimatedStats`: contagem easeOutExpo disparada por IntersectionObserver

**Commit final:** `feat: marketing landing page — hero, features, pricing, CTA`

---

### M3 · Autenticação & Onboarding (UI)
**Branch:** `feat/auth-onboarding-ui` → mergeado em `main` (PR #2)
**Objetivo:** Fluxo completo de login, cadastro e onboarding com estado local mock (sem Supabase).

#### Entregas
- [x] Página `/login`: form com e-mail + senha, link para cadastro, OAuth placeholder
- [x] Página `/signup`: form com nome, e-mail, senha, confirmação de senha
- [x] Validação com React Hook Form + Zod em ambos os forms
- [x] Página `/onboarding`: wizard de 2 passos — (1) nome do workspace, (2) confirmação com resumo do plano
- [x] `AuthLayout`: layout split-screen (branding escuro + formulário branco)
- [x] Hook `useAuth`: `signIn()`, `signUp()`, `signInWithGoogle()`, `createWorkspaceAndContinue()` com fake delay
- [x] Mock de autenticação: simula login bem-sucedido e redireciona para `/dashboard`
- [ ] Zustand store `useAuthStore`: `user`, `workspace`, `isLoading`, `login()`, `logout()` _(adiado para M8)_
- [ ] Rota protegida: middleware mock que redireciona `/dashboard` → `/login` se não autenticado _(adiado para M8)_
- [ ] Página `/forgot-password`: form de recuperação (UI apenas) _(não implementado)_
- [ ] Testes unitários dos forms e store _(não implementado)_

**Commit final:** `feat: auth and onboarding UI with mock state`

---

### M4 · Gestão de Leads & Contatos (UI)
**Branch:** `feat/leads-ui`
**Objetivo:** CRUD completo de leads com listagem, busca, filtros e página de detalhe — dados mock via fixtures.

#### Entregas
- [x] Tipos TypeScript: `Lead`, `LeadStatus`, `Activity`, `ActivityType`, `LeadFilters`
- [x] Fixtures mock: `src/mocks/leads.ts` com 15 leads brasileiros + 10 atividades
- [x] Zustand store `useLeadsStore`: `leads[]`, `activities[]`, `filters`, CRUD actions
- [x] Página `/leads`: tabela com colunas (nome, empresa, status, responsável, criado em)
- [x] Barra de busca com debounce + filtros por status e responsável
- [x] Paginação da tabela (client-side no mock)
- [x] Botão "Novo Lead" → `LeadFormModal`: form completo com React Hook Form + Zod
  - Campos: nome, e-mail, telefone, empresa, cargo, valor potencial, anotações, status, responsável
- [x] Ação de editar lead via modal reutilizando `LeadFormModal`
- [x] Ação de excluir lead com `ConfirmDialog`
- [x] Página `/leads/[id]`: perfil completo do lead
  - Header com nome, empresa, cargo, status badge
  - Campos de contato (e-mail, telefone)
  - Seção de negócios vinculados (placeholder)
  - Seção de timeline de atividades (visual com mock)
- [x] Suite e2e: 20 testes cobrindo busca, filtros, CRUD, detalhe e timeline

**Commit final:** `feat: leads management UI — list, filters, CRUD, detail page`

---

### M5 · Pipeline Kanban (UI)
**Branch:** `feat/pipeline-ui` → mergeado em `main` (PR #1)
**Objetivo:** Board Kanban visual com drag-and-drop entre colunas — dados mock persistidos no Zustand.

#### Entregas
- [x] Tipos TypeScript: `Deal`, `DealStage`, `PipelineColumn`, `PIPELINE_COLUMNS`
- [x] Fixtures mock: `src/mocks/deals.ts` com 12 negócios distribuídos nas 6 etapas
- [x] Zustand store `useDealsStore`: `deals[]`, `moveDeal()`, `addDeal()`, `updateDeal()`, `deleteDeal()`, seletores
- [x] Página `/pipeline`: board com 6 colunas fixas (Server Component + `PipelineBoard` Client Component)
  - `Novo Lead` | `Contato Realizado` | `Proposta Enviada` | `Negociação` | `Fechado Ganho` | `Fechado Perdido`
- [x] Cada coluna exibe: nome da etapa, contador de cards, total em R$ compacto
- [x] `DealCard`: título, valor (R$), avatar do responsável, badge de prazo colorido, lead vinculado
- [x] Drag-and-drop via `@dnd-kit` entre colunas com `DragOverlay` e highlight de coluna de destino
- [x] Estado de drag atualiza coluna no Zustand (sem persistência nessa etapa)
- [x] Botão "Novo Negócio" no header + botão "+" em cada coluna → `DealFormModal`
  - Campos: título, valor, lead vinculado (do store, não mock), responsável, prazo, etapa
- [x] Ação de editar negócio via drawer lateral (`DealDetailDrawer`)
- [x] Ação de excluir negócio com `ConfirmDialog`
- [x] Testes unitários do store: 13 testes passando (`useDealsStore.test.ts`)
- [x] Visual Pipedrive-inspired dark theme com acento colorido por coluna
- [x] Scroll horizontal com barra visível (`globals.css` scrollbar customizada)
- [x] Fix: `AppShell` com `overflow-hidden` no `main` para scroll horizontal funcionar no board
- [x] Fix: `DealFormModal` usa `useLeadsStore` em vez de `mockLeads` para exibir leads criados pelo usuário

**Commit final:** `feat: pipeline kanban UI with dnd-kit drag-and-drop`

---

### M6 · Detalhe do Lead & Registro de Atividades (UI)
**Branch:** `feat/activities-ui`
**Objetivo:** Página de detalhe do lead completa com timeline de atividades e formulário de novo registro.

#### Entregas
- [x] Tipos TypeScript: `Activity`, `ActivityType`
- [x] Fixtures mock: atividades vinculadas aos leads do mock
- [ ] Zustand store `useActivitiesStore`: `activities[]`, `addActivity()`, `deleteActivity()` _(atividades ficaram no `useLeadsStore`)_
- [x] Completar página `/leads/[id]` com timeline real
- [x] `ActivityTimeline`: lista cronológica reversa de atividades
  - Ícone por tipo (Ligação ☎ | E-mail ✉ | Reunião 📅 | Nota 📝)
  - Autor, descrição, data formatada
- [ ] `AddActivityForm`: form inline na página de detalhe _(não implementado)_
  - Campos: tipo, descrição, data (default: hoje)
  - Validação Zod, submit adiciona ao store
- [ ] Ação de excluir atividade _(não implementado)_
- [ ] Negócios vinculados ao lead: cards resumidos com link para `/pipeline` _(placeholder sem link)_
- [x] Breadcrumb de navegação: Dashboard > Leads > [Nome do Lead]
- [ ] Testes unitários do store e dos componentes de timeline _(não implementado)_

**Commit final:** `feat: lead detail page with activity timeline`

---

### M7 · Dashboard de Métricas (UI)
**Branch:** `feat/dashboard-ui`
**Objetivo:** Dashboard completo com KPI cards, gráfico de funil e lista de negócios com prazo próximo — dados derivados dos mocks.

#### Entregas
- [x] Tipos TypeScript: `DashboardMetrics`, `FunnelData`
- [x] Hook `useDashboardMetrics()`: agrega dados dos stores de leads e deals
  - Total de leads
  - Negócios abertos (excluindo Fechado Ganho/Perdido)
  - Valor total do pipeline (soma dos negócios abertos)
  - Taxa de conversão (Fechado Ganho / total de negócios)
- [x] Página `/dashboard`: grid responsivo de 4 `MetricCard`
- [x] `MetricCard`: ícone, label, valor principal, variação percentual (mock)
- [x] `SalesFunnelChart`: gráfico de barras horizontais com Recharts mostrando contagem por etapa
- [x] `UpcomingDeals`: lista dos 5 negócios com prazo mais próximo
  - Nome do negócio, valor, responsável, dias restantes (badge colorido)
- [x] `RecentLeads`: lista dos 5 leads mais recentes com link para detalhe
- [x] Saudação personalizada com nome do usuário mockado
- [x] Testes unitários do hook de métricas

**Commit final:** `feat: dashboard with KPI cards, funnel chart, and upcoming deals`

---

## FASE 2 — Backend

### M8 · Supabase: Schema, Auth & RLS
**Branch:** `feat/supabase-auth`
**Objetivo:** Banco de dados configurado, autenticação real funcionando, RLS ativo em todas as tabelas.

#### Entregas
- [x] Criar projeto no Supabase
- [x] Migrations SQL:
  - `workspaces` (id, name, plan, owner_id, created_at) + trigger `set_updated_at`
  - `workspace_members` (workspace_id, user_id, role) + helpers `is_workspace_member()` / `is_workspace_admin()`
  - `leads` (id, workspace_id, name, email, phone, company, job_title, status, owner_id, created_at)
  - `deals` (id, workspace_id, lead_id, title, value, stage, owner_id, due_date, created_at)
  - `activities` (id, workspace_id, lead_id, type, description, author_id, created_at)
  - `subscriptions` (workspace_id, stripe_customer_id, plan, status) + trigger auto-cria Free no onboarding
- [x] RLS policies para cada tabela: leitura/escrita apenas para membros do workspace; `subscriptions` bloqueado para roles normais (apenas service_role via webhook)
- [x] `src/types/supabase.ts`: tipos TypeScript sincronizados com schema (Row, Insert, Update, Enums, Database)
- [x] Substituir mock auth por Supabase Auth (email+password)
- [x] `lib/supabase/client.ts`: browser client lazy singleton (`getBrowserClient()`)
- [x] `lib/supabase/server.ts`: server client async com `cookies()` do `@supabase/ssr` (`getServerClient()`)
- [x] Variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — `.env.local` protegido no `.gitignore`
- [x] Atualizar `useAuthStore` para usar sessão real do Supabase
- [x] Middleware Next.js real: proteger rotas `(app)/` com `@supabase/ssr`
- [x] Fluxo de onboarding gravando workspace no banco via RPC atômica `create_workspace_with_admin`
- [x] Testes de integração: login, logout, criação de workspace (8/8 Playwright passando)
- [x] Migration 007: `SET search_path = public` em todas as funções `SECURITY DEFINER`
- [x] SMTP configurado via Resend (`smtp.resend.com:465`) — `mailer_autoconfirm=true` em dev (reativar no M14)
- [x] `suppressHydrationWarning` no `<body>` para extensões de browser

**Commit final:** `feat: supabase schema, RLS policies, and real authentication`

---

### M9 · Leads & Pipeline: Integração Backend
**Branch:** `feat/leads-data` → mergeado em `main` (PR #11)
**Objetivo:** Substituir todos os dados mock de leads e negócios por chamadas reais ao Supabase.

#### Entregas
- [x] `services/leads.ts`: `getLeads()`, `getLead()`, `createLead()`, `updateLead()`, `deleteLead()`
- [x] `services/deals.ts`: `getDeals()`, `getDeal()`, `createDeal()`, `updateDeal()`, `deleteDeal()`, `moveDeal()`
- [x] Substituir Zustand stores por TanStack Query (queries + mutations)
  - `useLeads()`, `useLead()`, `useCreateLead()`, `useUpdateLead()`, `useDeleteLead()`
  - `useDeals()`, `useCreateDeal()`, `useUpdateDeal()`, `useDeleteDeal()`, `useMoveDeal()`
- [x] Drag-and-drop no Kanban persiste `stage` no banco via `useMoveDeal()`
- [x] Optimistic updates em `useMoveDeal()`
- [x] Estados de loading e erro nos formulários e listas
- [x] Filtros de busca executados no servidor (Supabase `.ilike()`, `.eq()`)
- [x] Paginação server-side com offset
- [x] `workspace_id` e `owner_id` resolvidos server-side via `getSessionContext()` — elimina race condition
- [x] `QueryProvider` + TanStack Query v5 configurado no layout autenticado
- [x] `services/metrics.ts`: `getDashboardData()` com métricas agregadas reais
- [x] Hook `useDashboardData()` substituindo dados mock no dashboard
- [x] Cor do valor no `DealCard` segue `accentColor` da coluna com transição suave
- [x] Botão de acesso direto às atividades na lista de leads
- [x] Campo `scheduled_at` (datetime picker) no formulário de atividades — migration 008
- [x] API route `DELETE /api/e2e-cleanup` para limpeza de dados de teste (bloqueada em prod)
- [x] `afterEach` nos testes Playwright com cleanup automático
- [x] 4/4 testes e2e passando (`e2e/verify-m9.spec.ts`)

**Commit final:** `feat: M9 — leads, deals e dashboard com dados reais do Supabase`

---

### M10 · Atividades & Dashboard: Integração Backend
**Branch:** `feat/activities-backend` ✅
**Objetivo:** Timeline de atividades e métricas do dashboard vindas do banco de dados real.

#### Entregas
- [x] `services/activities.ts`: `getActivities()`, `createActivity()`, `deleteActivity()` _(implementado em `services/leads.ts`)_
- [x] TanStack Query hooks: `useActivities()`, `useCreateActivity()`, `useDeleteActivity()`
- [x] Invalidação automática da query de atividades após mutação
- [x] `services/metrics.ts`: queries agregadas para métricas do dashboard
- [x] Hook `useDashboardData()` com TanStack Query e dados reais
- [x] `SalesFunnelChart` com dados reais por etapa
- [x] `UpcomingDeals` com deals reais filtrados por `due_date`
- [ ] Testes de integração: criação de atividade e métricas _(não implementado — adiado para M13)_

**Commit final:** `feat: activities and dashboard metrics connected to Supabase`

---

### M11 · Multi-workspace & Colaboração
**Branch:** `feat/collaboration` ✅
**Objetivo:** Usuário pode criar múltiplos workspaces, convidar membros por e-mail e alternar entre eles.

#### Entregas
- [x] `services/workspaces.ts`: `getWorkspaces()`, `createWorkspace()`, `updateWorkspaceName()`, `deleteWorkspace()`, `getWorkspaceMembers()`, `updateMemberRole()`, `removeMember()`, `getWorkspaceInvites()`, `revokeInvite()`, `acceptInvite()`
- [x] Workspace switcher na sidebar: lista workspaces do usuário, troca contexto global
- [x] Dialog "Novo workspace" na sidebar integrado a `createWorkspace()`
- [x] Página `/settings/workspace`: nome do workspace, plano atual, danger zone (excluir)
- [x] Página `/settings/members`: lista de membros com papel, botão convidar, botão remover, convites pendentes
- [x] `InviteMemberModal`: form com e-mail + papel (Admin/Membro)
- [x] Integração Resend: envio de e-mail de convite com link de aceitação (`onboarding@resend.dev` em dev)
- [x] Rota `/invite/[token]`: aceitar convite → login se não autenticado → botão explícito → entrar no workspace
- [x] Guards de autorização: apenas Admin pode convidar/remover membros
- [x] Limite do plano Free: bloquear convite ao atingir 2 membros (mostrar upsell)
- [x] Migration 009: tabela `workspace_invites` + RLS + `accept_workspace_invite` RPC
- [x] Migration 010: tabela `profiles` com trigger em `auth.users` (elimina auth.admin)
- [x] Migration 011: validação de email no RPC + partial unique index em `workspace_invites`
- [x] Review de segurança: email ownership enforced, re-invite após remoção, erros sanitizados
- [ ] Testes e2e: convite, aceitação, troca de workspace _(adiado para M13)_

**Commit final:** `feat: M11 — workspace collaboration, member invites & settings (#12)`

---

## FASE 3 — Produto

### M12 · Monetização com Stripe
**Branch:** `feat/billing-nextjs` → mergeado em `main` (PR #14) ✅
**Objetivo:** Planos Free e Pro funcionando com checkout, webhook e portal do cliente.

#### Entregas
- [x] `lib/stripe.ts`: instância singleton do Stripe SDK (v17, apiVersion acacia)
- [x] Migration 012: `ALTER TYPE subscription_status ADD VALUE 'payment_failed'`
- [x] `src/types/supabase.ts`: `payment_failed` adicionado a `SubscriptionStatus`
- [x] Página `/settings/billing`: plano atual, comparação Free vs Pro, botão upgrade/gerenciar
- [x] `src/lib/limits.ts`: `canAddLead()`, `canAddMember()`, `FREE_LIMITS`
- [x] Route Handler `POST /api/stripe/checkout`: cria Checkout Session para o plano Pro
- [x] Route Handler `POST /api/stripe/portal`: cria Customer Portal Session
- [x] Route Handler `POST /api/webhooks/stripe`:
  - `checkout.session.completed` → ativa plano Pro no workspace
  - `customer.subscription.deleted` → reverte para Free
  - `invoice.payment_failed` → marca status como `payment_failed`
- [x] Guards de limite do plano Free:
  - Bloquear criação de lead ao atingir 50 → `UpsellDialog`
  - Bloquear convite ao atingir 2 membros → já existia em M11
- [x] `UpsellDialog`: modal de upsell com link para `/settings/billing`
- [x] `services/billing.ts`: `getSubscription()`, `createCheckoutSession()`, `createPortalSession()`
- [x] `hooks/useSubscription.ts`: TanStack Query para subscription
- [x] Variáveis de ambiente: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`
- [x] Checkout testado com Stripe CLI (`stripe listen --forward-to`)
- [ ] Testes unitários das guards de limite _(adiado para M13)_

**Commit final:** `feat(billing): M12 — Stripe webhook, checkout, portal, plan limits`

---

### M13 · Qualidade, Testes & Acessibilidade
**Branch:** `feat/quality`
**Objetivo:** Coverage targets atingidas, WCAG 2.2 AA verificado, sem erros de lint ou typecheck.

#### Entregas
- [ ] Coverage ≥ 85% em `components/` e `hooks/`
- [ ] Coverage ≥ 70% em `utils/` e `services/`
- [ ] Testes e2e Playwright: fluxos críticos
  - [ ] Cadastro + onboarding
  - [ ] Criar lead → mover no pipeline
  - [ ] Adicionar atividade
  - [ ] Convidar membro
  - [ ] Upgrade para Pro
- [ ] Auditoria de acessibilidade: `axe-core` em todos os formulários e modais
- [ ] `pnpm lint` sem warnings
- [ ] `pnpm typecheck` sem erros
- [ ] Performance: Lighthouse score ≥ 90 em `/dashboard`
- [ ] Revisar todos os `aria-label`, `role` e navegação por teclado
- [ ] Corrigir erros encontrados

**Commit final:** `test: full coverage, e2e flows, and WCAG 2.2 AA audit`

---

### M14 · Deploy & Produção ✅
**Branch:** `feat/deploy` → mergeado em `main` ✅
**Objetivo:** Aplicação em produção com CI/CD, variáveis configuradas e domínio ativo.

#### Entregas
- [x] Criar projeto no Vercel conectado ao repositório GitHub
- [x] Configurar todas as variáveis de ambiente no Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`
  - `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`
- [ ] Supabase: habilitar Auth email confirmations em produção (próxima aula)
- [ ] Stripe: ativar chaves live (`sk_live_...`) em produção (próxima aula)
- [x] Rodar migrations em produção via Supabase CLI (todas 13 já aplicadas)
- [x] `pnpm build` sem erros no CI
- [x] Fix: `outputFileTracingRoot` removido do `next.config.mjs` (causava caminho duplicado no Vercel)
- [x] `vercel.json` adicionado com framework, buildCommand e installCommand
- [x] Stripe webhook de sandbox configurado para produção (3 eventos, signing secret atualizado no Vercel)
- [x] Supabase Auth: Site URL + Redirect URLs configuradas (localhost, *.vercel.app, produção)
- [x] Smoke test pós-deploy: Landing → Login → Dashboard → Pipeline → Leads → Settings → Billing ✅
- [ ] Configurar domínio customizado `crm.scintilla.net.br` (aguarda confirmação da Construsite)
- [ ] Atualizar `README.md` com instruções de setup local

**URL de produção:** `https://pipeliflow-crm.vercel.app`

**Commit final:** `chore: production deploy — Vercel, Supabase, Stripe configured`

---

## Resumo dos Milestones

| # | Milestone | Branch | Fase |
|---|-----------|--------|------|
| M0 | Setup do Projeto | `main` | Interface |
| M1 | Design System & Layout Shell | `feat/design-system` | Interface |
| M2 | Landing Page | `feat/landing-page` | Interface |
| M3 | Autenticação & Onboarding (UI) | `feat/auth-ui` | Interface |
| M4 | Gestão de Leads & Contatos (UI) | `feat/leads-ui` | Interface |
| M5 | Pipeline Kanban (UI) | `feat/pipeline-ui` | Interface |
| M6 | Detalhe do Lead & Atividades (UI) | `feat/activities-ui` | Interface |
| M7 | Dashboard de Métricas (UI) | `feat/dashboard-ui` | Interface |
| M8 | Supabase: Schema, Auth & RLS | `feat/supabase-auth` | Backend |
| M9 | Leads & Pipeline: Backend | `feat/leads-data` ✅ | Backend |
| M10 | Atividades & Dashboard: Backend | `feat/activities-backend` ✅ | Backend |
| M11 | Multi-workspace & Colaboração | `feat/collaboration` ✅ | Backend |
| M12 | Monetização com Stripe | `feat/billing-nextjs` ✅ | Produto |
| M13 | Qualidade, Testes & Acessibilidade | `feat/quality` | Produto |
| M14 | Deploy & Produção | `feat/deploy` ✅ | Produto |
