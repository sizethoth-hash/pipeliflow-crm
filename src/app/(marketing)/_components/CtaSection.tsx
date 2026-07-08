import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="px-6 py-24" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-violet-600/10 px-8 py-16 text-center shadow-2xl shadow-indigo-500/10">
          {/* Decoração de fundo */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 right-1/4 h-48 w-64 rounded-full bg-violet-600/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <h2
              id="cta-heading"
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            >
              Pronto para fechar mais negócios?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
              Junte-se a mais de 1200 times que já usam o PipeFlow para organizar vendas, acompanhar
              leads e bater metas com mais consistência.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center rounded-lg bg-indigo-500 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Criar conta gratuita agora no PipeFlow"
              >
                Criar conta grátis
              </Link>
              <Link
                href="/login"
                className="text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Fazer login em conta existente"
              >
                Já tenho uma conta →
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-600">
              Sem cartão de crédito. Plano grátis para sempre.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
