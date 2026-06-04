import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-100">
      <h1 className="text-6xl font-bold text-slate-700">404</h1>
      <p className="mt-4 text-lg text-slate-400">Página não encontrada</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  )
}
