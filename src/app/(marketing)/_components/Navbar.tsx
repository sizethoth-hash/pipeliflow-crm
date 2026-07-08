import Link from 'next/link'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Navegação principal"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="PipeFlow CRM — Página inicial"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
            <svg
              width="18"
              height="18"
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
          <span className="text-lg font-bold tracking-tight text-white">PipeFlow</span>
        </Link>

        {/* Links de âncora — ocultos em mobile */}
        <ul className="hidden items-center gap-8 md:flex">
          <li>
            <a
              href="#features"
              className="text-sm text-slate-400 transition-colors hover:text-white"
              aria-label="Ir para seção de funcionalidades"
            >
              Funcionalidades
            </a>
          </li>
          <li>
            <a
              href="#pricing"
              className="text-sm text-slate-400 transition-colors hover:text-white"
              aria-label="Ir para seção de preços"
            >
              Preços
            </a>
          </li>
        </ul>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:block"
            aria-label="Fazer login na sua conta"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-md bg-indigo-500 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-label="Criar conta grátis no PipeFlow"
          >
            Começar grátis
          </Link>
        </div>
      </nav>
    </header>
  )
}
