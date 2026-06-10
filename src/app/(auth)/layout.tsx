import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-white"
              aria-hidden="true"
            >
              <path d="M3 3h7v7H3z" />
              <path d="M14 3h7v7h-7z" />
              <path d="M14 14h7v7h-7z" />
              <path d="M3 14h7v7H3z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">PipeFlow</span>
        </div>

        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-slate-300 text-lg leading-relaxed">
              "Organizamos todo nosso processo comercial no PipeFlow. Aumentamos nossa taxa de
              conversão em 40% nos primeiros três meses."
            </p>
            <footer className="text-slate-500 text-sm">— Mariana Costa, CEO da Vendas360</footer>
          </blockquote>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            {[
              { label: 'Empresas ativas', value: '2.400+' },
              { label: 'Leads gerenciados', value: '180k+' },
              { label: 'Taxa de satisfação', value: '98%' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white font-bold text-xl">{value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">
          © {new Date().getFullYear()} PipeFlow. Todos os direitos reservados.
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
