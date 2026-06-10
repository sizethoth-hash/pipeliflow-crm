import { expect, test } from '@playwright/test'

test.describe('Leads – verificação M4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leads')
    await page.waitForLoadState('networkidle')
  })

  // ── Listagem ────────────────────────────────────────────────────────────────
  test('exibe tabela com leads mockados', async ({ page }) => {
    // Deve ter pelo menos 10 linhas de dados (mock tem 15, página 10 por página)
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(10)

    // Colunas esperadas
    await expect(page.locator('th', { hasText: 'Nome' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Status' })).toBeVisible()
  })

  // ── Busca ───────────────────────────────────────────────────────────────────
  test('busca por nome filtra a tabela', async ({ page }) => {
    const input = page.getByPlaceholder('Buscar por nome, empresa ou e-mail…')
    await input.fill('Fernanda')
    await page.waitForTimeout(400) // aguarda debounce

    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('Fernanda')
  })

  test('busca por empresa filtra a tabela', async ({ page }) => {
    const input = page.getByPlaceholder('Buscar por nome, empresa ou e-mail…')
    await input.fill('Tech Solutions')
    await page.waitForTimeout(400)

    await expect(page.locator('tbody tr')).toHaveCount(1)
    await expect(page.locator('tbody tr').first()).toContainText('Fernanda')
  })

  test('busca sem resultado exibe estado vazio', async ({ page }) => {
    const input = page.getByPlaceholder('Buscar por nome, empresa ou e-mail…')
    await input.fill('xyzxyz_inexistente')
    await page.waitForTimeout(400)

    await expect(page.locator('tbody')).not.toBeVisible()
    await expect(page.getByText('Nenhum lead corresponde aos filtros')).toBeVisible()
  })

  test('botão Limpar reseta busca', async ({ page }) => {
    const input = page.getByPlaceholder('Buscar por nome, empresa ou e-mail…')
    await input.fill('Fernanda')
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: 'Limpar' }).click()
    await page.waitForTimeout(200)

    await expect(page.locator('tbody tr')).toHaveCount(10)
    await expect(input).toHaveValue('')
  })

  // ── Filtros ─────────────────────────────────────────────────────────────────
  test('filtro por status "Fechado Ganho" mostra apenas won', async ({ page }) => {
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Fechado Ganho' }).click()
    await page.waitForTimeout(200)

    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)

    // Todas as linhas visíveis devem ter o badge "Fechado Ganho"
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Fechado Ganho')
    }
  })

  test('filtro por status "Novo Lead" mostra apenas new', async ({ page }) => {
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Novo Lead' }).click()
    await page.waitForTimeout(200)

    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Novo Lead')
    }
  })

  test('filtro por responsável filtra corretamente', async ({ page }) => {
    // Segundo combobox = responsável
    const combos = page.getByRole('combobox')
    await combos.nth(1).click()
    await page.getByRole('option', { name: 'Ana Lima' }).click()
    await page.waitForTimeout(200)

    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Ana Lima')
    }
  })

  // ── Formulário criar ────────────────────────────────────────────────────────
  test('formulário valida campos obrigatórios', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Lead' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Submete vazio
    await page.getByRole('button', { name: 'Criar lead' }).click()

    await expect(page.getByText('Nome deve ter pelo menos 2 caracteres')).toBeVisible()
    await expect(page.getByText('E-mail inválido')).toBeVisible()
  })

  test('formulário valida e-mail inválido', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Lead' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.getByLabel('Nome').fill('João Teste')
    await dialog.getByLabel('E-mail').fill('nao-e-email')
    await dialog.getByRole('button', { name: 'Criar lead' }).click()

    await expect(dialog.getByText('E-mail inválido')).toBeVisible()
  })

  test('cria novo lead com sucesso', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Lead' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.getByLabel('Nome').fill('Carlos Novo')
    await dialog.getByLabel('E-mail').fill('carlos@teste.com.br')
    await dialog.getByLabel('Empresa').fill('Empresa Teste')
    await dialog.getByRole('button', { name: 'Criar lead' }).click()

    // Modal deve fechar
    await expect(dialog).not.toBeVisible()
    // Contador no header aumenta (de 15 para 16)
    await expect(page.getByText(/16 leads encontrados/)).toBeVisible()
    // Lead inserido no topo aparece na primeira linha
    await expect(page.locator('tbody tr').first()).toContainText('Carlos Novo')
  })

  // ── Editar ──────────────────────────────────────────────────────────────────
  test('abre modal de edição com dados preenchidos', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first()
    await firstRow.hover()
    await firstRow.getByRole('button', { name: /Editar/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Editar Lead' })).toBeVisible()

    // Campo nome deve estar preenchido
    const nameInput = dialog.getByLabel('Nome')
    const value = await nameInput.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  // ── Excluir ─────────────────────────────────────────────────────────────────
  test('confirm dialog aparece ao excluir e cancela sem remover', async ({ page }) => {
    const rows = page.locator('tbody tr')
    const initialCount = await rows.count()

    const firstRow = rows.first()
    await firstRow.hover()
    await firstRow.getByRole('button', { name: /Excluir/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Excluir lead')).toBeVisible()

    // Cancela
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(rows).toHaveCount(initialCount)
  })

  test('exclui lead ao confirmar', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first()
    const leadName = await firstRow.locator('td a span').first().textContent()

    await firstRow.hover()
    await firstRow.getByRole('button', { name: /Excluir/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Excluir' }).click()

    await expect(dialog).not.toBeVisible()
    // Contador diminui (de 15 para 14)
    await expect(page.getByText(/14 leads encontrados/)).toBeVisible()
    // Lead removido não aparece mais (em nenhuma página)
    await expect(page.locator('tbody')).not.toContainText(leadName ?? '')
  })

  // ── Paginação ────────────────────────────────────────────────────────────────
  test('paginação navega para segunda página', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: 'Próxima página' })
    await expect(nextBtn).toBeVisible()
    await nextBtn.click()

    await expect(page.getByText('Página 2 de')).toBeVisible()
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThanOrEqual(10)
  })

  // ── Página de detalhe ────────────────────────────────────────────────────────
  test('página de detalhe carrega ao clicar no nome', async ({ page }) => {
    await page.locator('tbody tr').first().locator('a').first().click()

    await expect(page).toHaveURL(/\/leads\/lead-\d+/)
    // Breadcrumb — link específico no main
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Leads', exact: true })
    ).toBeVisible()
    // Seções esperadas
    await expect(page.getByText('Histórico de Atividades')).toBeVisible()
    await expect(page.getByText('Negócios')).toBeVisible()
    // Campos de contato
    await expect(page.locator('a[href^="mailto:"]')).toBeVisible()
  })

  test('página de detalhe: lead com atividades exibe timeline', async ({ page }) => {
    // lead-1 (Fernanda Oliveira) tem 4 atividades mockadas
    await page.goto('/leads/lead-1')
    await page.waitForLoadState('networkidle')

    // Labels uppercase dos tipos de atividade (seletores exatos para evitar strict mode)
    await expect(page.getByText('Ligação', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Reunião', { exact: true })).toBeVisible()
    await expect(page.getByText('Nota', { exact: true })).toBeVisible()
    // Confirma que há 4 labels de tipo (uppercase, dentro dos ícones da timeline)
    const typeLabels = page.locator('span.uppercase.tracking-wide')
    await expect(typeLabels).toHaveCount(4)
  })

  test('página de detalhe: lead sem atividades exibe estado vazio', async ({ page }) => {
    // lead-5 (Juliana Ferreira) não tem atividades
    await page.goto('/leads/lead-5')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Nenhuma atividade registrada')).toBeVisible()
  })

  test('página de detalhe: botão voltar navega para /leads', async ({ page }) => {
    await page.goto('/leads/lead-1')
    await page.getByRole('link', { name: /Voltar para Leads/i }).click()

    await expect(page).toHaveURL('/leads')
  })

  test('ID inexistente redireciona para /leads', async ({ page }) => {
    await page.goto('/leads/lead-999')
    // redirect() leva de volta para a listagem
    await expect(page).toHaveURL('/leads')
  })
})
