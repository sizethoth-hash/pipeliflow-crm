import type { NextPageContext } from 'next'

interface ErrorProps {
  statusCode: number
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f1f5f9',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#334155' }}>{statusCode}</h1>
      <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
        {statusCode === 404 ? 'Página não encontrada' : 'Erro interno do servidor'}
      </p>
    </div>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res
    ? res.statusCode
    : err
      ? ((err as { statusCode?: number }).statusCode ?? 500)
      : 404
  return { statusCode }
}

export default ErrorPage
