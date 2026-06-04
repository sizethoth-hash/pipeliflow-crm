import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Sidebar } from '../Sidebar'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o logo PipeFlow', () => {
    render(<Sidebar />)
    expect(screen.getByText('PipeFlow')).toBeInTheDocument()
  })

  it('renderiza todos os itens de navegação', () => {
    render(<Sidebar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getByText('Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('marca o item ativo com aria-current="page"', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/dashboard')

    render(<Sidebar />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute('aria-current', 'page')
  })

  it('não marca item inativo com aria-current', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/dashboard')

    render(<Sidebar />)

    const leadsLink = screen.getByRole('link', { name: /leads/i })
    expect(leadsLink).not.toHaveAttribute('aria-current')
  })

  it('renderiza o workspace ativo "Acme Corp"', () => {
    render(<Sidebar />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renderiza o nome do usuário atual', () => {
    render(<Sidebar />)
    expect(screen.getByText('Carlos Silva')).toBeInTheDocument()
  })

  it('chama onClose ao clicar no botão fechar', () => {
    const onClose = vi.fn()
    render(<Sidebar onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: /fechar menu/i })
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao clicar em um item de navegação', () => {
    const onClose = vi.fn()
    render(<Sidebar onClose={onClose} />)

    const leadsLink = screen.getByRole('link', { name: /leads/i })
    fireEvent.click(leadsLink)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('tem link de logo apontando para /dashboard', () => {
    render(<Sidebar />)
    const logoLink = screen.getByRole('link', { name: /pipeflow/i })
    expect(logoLink).toHaveAttribute('href', '/dashboard')
  })
})
