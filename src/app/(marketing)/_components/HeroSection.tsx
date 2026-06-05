import Link from 'next/link'
import { AnimatedStats } from './AnimatedStats'

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20"
      aria-label="Apresentação principal do PipeFlow CRM"
    >
      {/* Gradiente de fundo */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute top-40 left-1/4 h-[300px] w-[400px] rounded-full bg-violet-600/8 blur-3xl" />
      </div>

      {/* Badge de novidade */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
        <span className="text-xs font-medium text-indigo-300">
          Novo: Pipeline Kanban com drag & drop
        </span>
      </div>

      {/* Headline */}
      <h1 className="mx-auto max-w-4xl text-center text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
        Feche mais vendas.{' '}
        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Sem complicação.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-slate-400 sm:text-xl">
        PipeFlow é o CRM para times de vendas que querem visibilidade total do pipeline,
        histórico de contatos e métricas em tempo real — tudo em um só lugar.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/signup"
          className="inline-flex h-12 items-center rounded-lg bg-indigo-500 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Criar conta gratuita no PipeFlow"
        >
          Começar grátis
        </Link>
        <a
          href="#features"
          className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-700 px-8 text-base font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Ver funcionalidades do PipeFlow"
        >
          Ver funcionalidades
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3L13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
      </div>

      {/* Stats animados */}
      <AnimatedStats />

      {/* Mockup do pipeline */}
      <div className="relative mt-10 w-full max-w-5xl md:mt-20" aria-label="Pré-visualização do pipeline Kanban">
        {/* Brilho atrás do mockup */}
        <div
          className="absolute -inset-4 rounded-2xl bg-indigo-600/5 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50">
          {/* Barra de título falsa */}
          <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/70" aria-hidden="true" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" aria-hidden="true" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" aria-hidden="true" />
            <div className="ml-4 h-5 w-48 rounded-md bg-slate-800" aria-hidden="true" />
          </div>

          {/* Kanban simulado */}
          <div className="flex gap-3 overflow-x-auto p-4">
            {[
              { stage: 'Novo Lead', color: 'bg-slate-500', count: 4, value: 'R$ 28k', mobileHidden: false },
              { stage: 'Contato Realizado', color: 'bg-blue-500', count: 6, value: 'R$ 64k', mobileHidden: false },
              { stage: 'Proposta Enviada', color: 'bg-indigo-500', count: 3, value: 'R$ 95k', mobileHidden: true },
              { stage: 'Negociação', color: 'bg-violet-500', count: 2, value: 'R$ 120k', mobileHidden: true },
              { stage: 'Fechado Ganho', color: 'bg-green-500', count: 5, value: 'R$ 210k', mobileHidden: true },
            ].map((col) => (
              <div
                key={col.stage}
                className={`min-w-[120px] flex-1 ${col.mobileHidden ? 'hidden sm:block' : ''}`}
                aria-label={`Coluna ${col.stage}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${col.color}`} aria-hidden="true" />
                    <span className="text-xs font-medium text-slate-400">{col.stage}</span>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
                    {col.count}
                  </span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: Math.min(col.count, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-700/50 bg-slate-800/60 p-3"
                      aria-hidden="true"
                    >
                      <div className="mb-2 h-2.5 w-3/4 rounded bg-slate-700" />
                      <div className="h-2 w-1/2 rounded bg-slate-700/60" />
                      <div className="mt-3 flex items-center justify-between">
                        <div className="h-5 w-5 rounded-full bg-indigo-500/40" />
                        <div className="h-2 w-12 rounded bg-slate-700/60" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-center text-xs font-semibold text-slate-500">{col.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
