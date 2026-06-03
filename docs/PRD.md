# PRD — PipeFlow CRM

## 1. Problema Identificado

Pequenas e médias empresas, freelancers e times de vendas perdem oportunidades de negócio por falta de organização no processo comercial. Leads são gerenciados em planilhas, anotações soltas ou ferramentas genéricas que não oferecem visão clara do funil de vendas.

Não há registro centralizado de interações com clientes, e quando a equipe cresce, os dados ficam espalhados sem controle de acesso por empresa/time.

Soluções como HubSpot e Pipedrive existem, mas são caras ou complexas demais para quem está começando.

---

## 2. Solução Proposta

Construir o **PipeFlow CRM** — uma plataforma SaaS de gestão de clientes e vendas, multi-empresa, com:

- Pipeline visual Kanban com drag-and-drop
- Gestão completa de leads e negócios
- Registro de interações e histórico de atividades
- Sistema multiempresa com controle de acesso por workspace
- Dashboard com métricas de vendas e gráfico de funil
- Monetização via planos de assinatura (Stripe)
- Landing page de apresentação do produto

---

## 3. Requisitos Funcionais

### Autenticação
- Login e cadastro via Supabase Auth
- Onboarding inicial: criação de workspace após primeiro login

### Gestão de Leads e Contatos
- Cadastro completo: nome, e-mail, telefone, empresa, cargo, status
- Listagem com busca e filtros (por status, responsável, data)
- Página de detalhe com perfil completo e timeline de atividades

### Pipeline Kanban de Vendas
Colunas por etapa:
- **Novo Lead** → **Contato Realizado** → **Proposta Enviada** → **Negociação** → **Fechado Ganho** → **Fechado Perdido**

Cards de negócios contêm:
- Título
- Valor estimado (R$)
- Lead vinculado
- Responsável
- Prazo

Drag-and-drop entre etapas com persistência no banco via @dnd-kit.

### Registro de Atividades
Tipos: Ligação | E-mail | Reunião | Nota

Campos: Autor | Descrição | Data

Timeline cronológica vinculada ao lead.

### Dashboard de Métricas
- Cards: Total de leads, Negócios abertos, Valor total do pipeline, Taxa de conversão
- Gráfico de funil de vendas (Recharts)
- Negócios do usuário logado com prazo próximo

### Multi-empresa e Colaboração
- Criar workspaces (cada empresa/time = 1 workspace)
- Convite de colaboradores por e-mail (Resend)
- Papéis: **Admin** (acesso total) | **Membro** (leads e negócios)
- Alternar entre workspaces via dropdown na sidebar
- Isolamento de dados via Row Level Security (RLS) no Supabase

### Monetização (Stripe)
| Plano | Limite | Preço |
|-------|--------|-------|
| Free  | 2 colaboradores, 50 leads | Grátis |
| Pro   | Ilimitado | R$49/mês |

- Checkout integrado via Stripe Checkout
- Webhook para ativar/desativar plano automaticamente
- Customer Portal do Stripe para gerenciamento de assinatura

### Landing Page
Seções: Hero | Funcionalidades | Planos e Preços | CTA

---

## 4. Personas

### Dono do Negócio / Empreendedor (Admin)
Pequeno empresário que precisa organizar seu processo de vendas. Cria o workspace, convida o time, gerencia planos e possui acesso completo.

### Vendedor / Colaborador (Membro)
Profissional de vendas que usa o CRM no dia a dia. Cadastra leads, move negócios no pipeline e registra atividades. Pode participar de múltiplos workspaces.

### Freelancer / Consultor (Admin Solo)
Profissional independente que atende vários clientes. Usa workspaces separados por cliente/projeto. Começa no Free e faz upgrade conforme cresce.

---

## 5. Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Backend/API | Next.js API Routes + Server Components |
| Banco + Auth | Supabase (PostgreSQL + RLS + Auth) |
| Pagamento | Stripe (Checkout + Webhooks + Customer Portal) |
| E-mail | Resend |
| Drag-and-drop | @dnd-kit |
| Gráficos | Recharts |
| Deploy | Vercel + Supabase |

---

## 6. Referências de Design

| Produto | Insight |
|---------|---------|
| **HubSpot CRM** | Ecossistema completo, mas complexo — simplificar focando só em vendas |
| **Pipedrive** | UX intuitiva e pipeline Kanban referência — modelo freemium acessível |

**Identidade visual:** Interface limpa, sidebar escura, cores primárias em azul/violeta, cards com sombra leve, tipografia Inter.

---

## 7. Milestones

| # | Entregável |
|---|-----------|
| M1 | Setup do projeto, autenticação e onboarding |
| M2 | Gestão de leads e contatos (CRUD + listagem) |
| M3 | Pipeline Kanban com drag-and-drop |
| M4 | Registro de atividades e timeline do lead |
| M5 | Dashboard de métricas |
| M6 | Multi-empresa, workspaces e convites |
| M7 | Monetização com Stripe |
| M8 | Landing page pública |
