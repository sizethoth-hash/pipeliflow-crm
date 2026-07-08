const features = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="5" width="5" height="16" rx="1.5" fill="currentColor" opacity="0.3" />
        <rect x="9.5" y="2" width="5" height="19" rx="1.5" fill="currentColor" opacity="0.6" />
        <rect x="17" y="9" width="5" height="12" rx="1.5" fill="currentColor" />
      </svg>
    ),
    title: 'Pipeline Kanban visual',
    description:
      'Arraste e solte negócios entre as etapas do funil. Veja o valor total por coluna e o progresso de cada oportunidade em tempo real.',
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M2 21v-1a7 7 0 0 1 14 0v1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
        <path
          d="M22 21v-1a5 5 0 0 0-4-4.9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: 'Gestão de leads',
    description:
      'Cadastre, filtre e acompanhe cada lead com histórico completo de interações, dados de contato e negócios vinculados.',
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Timeline de atividades',
    description:
      'Registre ligações, e-mails, reuniões e notas. Toda a história de relacionamento com o cliente em uma linha do tempo clara.',
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 3v18h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 16l4-4 4 4 4-8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: 'Dashboard de métricas',
    description:
      'KPIs de vendas, gráfico de funil, negócios com prazo próximo e leads recentes — tudo na tela inicial para decisões rápidas.',
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: 'Multi-workspace e equipes',
    description:
      'Convide membros, defina papéis (Admin ou Membro) e trabalhe em múltiplos workspaces com dados completamente isolados.',
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M7 11V7a5 5 0 0 1 10 0v4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
    title: 'Segurança por RLS',
    description:
      'Isolamento total entre workspaces com Row Level Security no banco de dados. Seus dados nunca se misturam com os de outros times.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
            <span className="text-xs font-medium text-indigo-300">Funcionalidades</span>
          </div>
          <h2
            id="features-heading"
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            Tudo que seu time de vendas precisa
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Do primeiro contato ao fechamento — sem planilhas, sem caos.
          </p>
        </div>

        {/* Grid de cards */}
        <ul
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Lista de funcionalidades do PipeFlow"
        >
          {features.map((feature) => (
            <li
              key={feature.title}
              className="group rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-indigo-500/40 hover:bg-slate-900"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 transition-colors group-hover:bg-indigo-500/20">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
