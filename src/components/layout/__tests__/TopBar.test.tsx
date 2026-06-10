import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TopBar } from '../TopBar'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}))

describe('TopBar', () => {
  const onMenuClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o título da página "Dashboard"', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/dashboard')

    render(<TopBar onMenuClick={onMenuClick} />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renderiza o título "Leads" para a rota /leads', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/leads')

    render(<TopBar onMenuClick={onMenuClick} />)
    expect(screen.getByRole('heading', { name: 'Leads' })).toBeInTheDocument()
  })

  it('renderiza o título "Pipeline" para a rota /pipeline', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/pipeline')

    render(<TopBar onMenuClick={onMenuClick} />)
    expect(screen.getByRole('heading', { name: 'Pipeline' })).toBeInTheDocument()
  })

  it('renderiza o título "Configurações" para a rota /settings', async () => {
    const { usePathname } = await import('next/navigation')
    vi.mocked(usePathname).mockReturnValue('/settings')

    render(<TopBar onMenuClick={onMenuClick} />)
    expect(screen.getByRole('heading', { name: 'Configurações' })).toBeInTheDocument()
  })

  it('renderiza o botão de menu hamburguer', () => {
    render(<TopBar onMenuClick={onMenuClick} />)
    expect(screen.getByRole('button', { name: /abrir menu/i })).toBeInTheDocument()
  })

  it('chama onMenuClick ao clicar no hamburguer', () => {
    render(<TopBar onMenuClick={onMenuClick} />)

    const menuButton = screen.getByRole('button', { name: /abrir menu/i })
    fireEvent.click(menuButton)

    expect(onMenuClick).toHaveBeenCalledTimes(1)
  })

  it('renderiza slot de actions quando fornecido', () => {
    render(<TopBar onMenuClick={onMenuClick} actions={<button type="button">Novo Lead</button>} />)
    expect(screen.getByRole('button', { name: 'Novo Lead' })).toBeInTheDocument()
  })

  it('não renderiza slot de actions quando não fornecido', () => {
    render(<TopBar onMenuClick={onMenuClick} />)
    expect(screen.queryByText('Novo Lead')).not.toBeInTheDocument()
  })
})
