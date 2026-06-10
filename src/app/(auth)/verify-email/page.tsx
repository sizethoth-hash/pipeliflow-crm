import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
          <Mail className="h-7 w-7 text-indigo-600" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Verifique seu e-mail</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Enviamos um link de confirmação para o seu endereço de e-mail.
          <br />
          Clique no link para ativar sua conta e continuar.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Não recebeu o e-mail? Verifique sua caixa de spam ou aguarde alguns minutos.
      </div>

      <p className="text-sm text-slate-500">
        Já confirmou?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
