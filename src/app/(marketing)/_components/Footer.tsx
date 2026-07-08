import Link from 'next/link'

const links = [
  { label: 'Termos de Uso', href: '/terms' },
  { label: 'Privacidade', href: '/privacy' },
  { label: 'Contato', href: 'mailto:contato@pipeflow.com.br' },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-800/60 px-6 py-10" role="contentinfo">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="PipeFlow CRM — Voltar ao início"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500">
            <svg
              width="15"
              height="15"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="1" y="5" width="4" height="10" rx="1" fill="white" />
              <rect x="7" y="2" width="4" height="13" rx="1" fill="white" opacity="0.85" />
              <rect x="13" y="8" width="4" height="7" rx="1" fill="white" opacity="0.65" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">PipeFlow</span>
        </Link>

        {/* Links institucionais */}
        <nav aria-label="Links institucionais do rodapé">
          <ul className="flex flex-wrap items-center justify-center gap-6">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950"
                  aria-label={link.label}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Copyright */}
        <p className="text-sm text-slate-600">
          © {new Date().getFullYear()} PipeFlow. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
