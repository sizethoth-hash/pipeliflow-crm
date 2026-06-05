import Link from 'next/link'

const freePlan = {
  name: 'Grátis',
  price: 'R$ 0',
  period: 'para sempre',
  description: 'Ideal para freelancers e pequenos times que estão começando.',
  cta: 'Criar conta grátis',
  ctaHref: '/signup',
  featured: false,
  features: [
    { text: 'Até 2 membros no workspace', included: true },
    { text: 'Até 50 leads ativos', included: true },
    { text: 'Pipeline Kanban completo', included: true },
    { text: 'Timeline de atividades', included: true },
    { text: 'Dashboard de métricas', included: true },
    { text: 'Membros ilimitados', included: false },
    { text: 'Leads ilimitados', included: false },
    { text: 'Suporte prioritário', included: false },
  ],
}

const proPlan = {
  name: 'Pro',
  price: 'R$ 49',
  period: 'por mês',
  description: 'Para times de vendas que precisam de escala sem limites.',
  cta: 'Começar com Pro',
  ctaHref: '/signup?plan=pro',
  featured: true,
  features: [
    { text: 'Membros ilimitados', included: true },
    { text: 'Leads ilimitados', included: true },
    { text: 'Pipeline Kanban completo', included: true },
    { text: 'Timeline de atividades', included: true },
    { text: 'Dashboard de métricas', included: true },
    { text: 'Convites por e-mail', included: true },
    { text: 'Múltiplos workspaces', included: true },
    { text: 'Suporte prioritário', included: true },
  ],
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 8l3.5 3.5L13 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PlanCard({ plan }: { plan: typeof freePlan }) {
  return (
    <article
      className={[
        'relative flex flex-col rounded-2xl border p-8 transition-all',
        plan.featured
          ? 'border-indigo-500 bg-indigo-500/5 shadow-xl shadow-indigo-500/10'
          : 'border-slate-800 bg-slate-900/60',
      ].join(' ')}
      aria-label={`Plano ${plan.name}`}
    >
      {plan.featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-indigo-500 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
            Mais popular
          </span>
        </div>
      )}

      {/* Cabeçalho do plano */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
        <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-4xl font-extrabold text-white">{plan.price}</span>
          <span className="mb-1 text-sm text-slate-500">/{plan.period}</span>
        </div>
      </div>

      {/* Lista de features */}
      <ul className="mb-8 flex-1 space-y-3" role="list" aria-label={`Recursos do plano ${plan.name}`}>
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-3">
            {feature.included ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                <CheckIcon />
              </span>
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-600">
                <XIcon />
              </span>
            )}
            <span
              className={[
                'text-sm',
                feature.included ? 'text-slate-300' : 'text-slate-600',
              ].join(' ')}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.ctaHref}
        className={[
          'inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          plan.featured
            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 hover:shadow-indigo-500/40'
            : 'border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white',
        ].join(' ')}
        aria-label={`${plan.cta} — plano ${plan.name}`}
      >
        {plan.cta}
      </Link>
    </article>
  )
}

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="px-6 py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-4xl">
        {/* Cabeçalho */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
            <span className="text-xs font-medium text-indigo-300">Preços</span>
          </div>
          <h2
            id="pricing-heading"
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            Simples e sem surpresas
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Comece grátis e escale quando precisar. Sem contrato, cancele quando quiser.
          </p>
        </div>

        {/* Cards de planos */}
        <div className="grid gap-8 sm:grid-cols-2">
          <PlanCard plan={freePlan} />
          <PlanCard plan={proPlan} />
        </div>

        {/* Nota de rodapé */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Todos os planos incluem SSL, backups diários e suporte por e-mail.{' '}
          <a
            href="mailto:contato@pipeflow.com.br"
            className="text-indigo-400 hover:text-indigo-300 hover:underline"
            aria-label="Entrar em contato para dúvidas sobre planos"
          >
            Dúvidas? Fale com a gente.
          </a>
        </p>
      </div>
    </section>
  )
}
