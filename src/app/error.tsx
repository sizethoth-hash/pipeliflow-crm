'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-100">
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Tentar novamente
      </button>
    </div>
  )
}
