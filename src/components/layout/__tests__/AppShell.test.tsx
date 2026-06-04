import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AppShell } from '../AppShell'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = ''
  })

  it('renderiza o conteúdo filho', () => {
    render(
      <AppShell>
        <div>Conteúdo da página</div>
      </AppShell>
    )
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument()
  })

  it('renderiza a sidebar com o logo PipeFlow', () => {
    render(
      <AppShell>
        <div>Página</div>
      </AppShell>
    )
    expect(screen.getByText('PipeFlow')).toBeInTheDocument()
  })

  it('renderiza o botão de menu hamburguer na TopBar', () => {
    render(
      <AppShell>
        <div>Página</div>
      </AppShell>
    )
    expect(screen.getByRole('button', { name: /abrir menu/i })).toBeInTheDocument()
  })

  it('abre a sidebar ao clicar no hamburguer', () => {
    render(
      <AppShell>
        <div>Página</div>
      </AppShell>
    )

    const menuButton = screen.getByRole('button', { name: /abrir menu/i })
    fireEvent.click(menuButton)

    // Botão fechar deve aparecer
    expect(screen.getByRole('button', { name: /fechar menu/i })).toBeInTheDocument()
  })

  it('fecha a sidebar ao clicar no botão fechar', () => {
    render(
      <AppShell>
        <div>Página</div>
      </AppShell>
    )

    // Abre
    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }))
    // Fecha
    fireEvent.click(screen.getByRole('button', { name: /fechar menu/i }))

    expect(document.body.style.overflow).toBe('')
  })

  it('fecha a sidebar ao pressionar ESC', async () => {
    render(
      <AppShell>
        <div>Página</div>
      </AppShell>
    )

    // Abre
    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }))
    expect(document.body.style.overflow).toBe('hidden')

    // ESC fecha
    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('')
    })
  })

  it('bloqueia o scroll do body quando sidebar está aberta', () => {
    render(
      <AppShell>
        <div>Página</div>
      </AppShell>
    )

    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }))
    expect(document.body.style.overflow).toBe('hidden')
  })
})
