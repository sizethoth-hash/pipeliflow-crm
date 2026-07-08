import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/store/useAuthStore'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { renderWithProviders } from '@/test/renderWithProviders'
import { Sidebar } from '../Sidebar'

const mockWorkspace = {
  id: 'ws-1',
  name: 'Meu Workspace',
  plan: 'free' as const,
}

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useWorkspaceStore.setState({
      workspaces: [mockWorkspace],
      activeWorkspace: mockWorkspace,
    })
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'sizenando@pipeflow.dev',
        user_metadata: { full_name: 'Sizenando Miguel' },
      } as never,
    })
  })

  it('renderiza o logo PipeFlow', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByText('PipeFlow')).toBeInTheDocument()
  })

  it('renderiza todos os itens de navegação', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getByText('Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('marca o item ativo com aria-current="page"', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/dashboard')

    renderWithProviders(<Sidebar />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute('aria-current', 'page')
  })

  it('não marca item inativo com aria-current', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/dashboard')

    renderWithProviders(<Sidebar />)

    const leadsLink = screen.getByRole('link', { name: /leads/i })
    expect(leadsLink).not.toHaveAttribute('aria-current')
  })

  it('renderiza o workspace ativo "Meu Workspace"', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByText('Meu Workspace')).toBeInTheDocument()
  })

  it('renderiza o nome do usuário atual', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByText('Sizenando Miguel')).toBeInTheDocument()
  })

  it('chama onClose ao clicar no botão fechar', () => {
    const onClose = vi.fn()
    renderWithProviders(<Sidebar onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: /fechar menu/i })
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao clicar em um item de navegação', () => {
    const onClose = vi.fn()
    renderWithProviders(<Sidebar onClose={onClose} />)

    const leadsLink = screen.getByRole('link', { name: /leads/i })
    fireEvent.click(leadsLink)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('tem link de logo apontando para /dashboard', () => {
    renderWithProviders(<Sidebar />)
    const logoLink = screen.getByRole('link', { name: /pipeflow/i })
    expect(logoLink).toHaveAttribute('href', '/dashboard')
  })
})
