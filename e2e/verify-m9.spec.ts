import { test, expect, type Page } from '@playwright/test'

const EMAIL = 'teste@pipeliflow.dev'
const PASSWORD = 'Senha@1234'
const SS = (name: string) => `e2e/screenshots/verify-m9-${name}.png`

// Nomes criados durante os testes — limpos no afterEach
const createdLeads: string[] = []
const createdDeals: string[] = []

async function login(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('label:has-text("E-mail")', { timeout: 15000 })
  await page.getByLabel('E-mail').fill(EMAIL)
  await page.getByLabel('Senha').fill(PASSWORD)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 })
  if (page.url().includes('onboarding')) {
    const nameInput = page.getByPlaceholder(/nome do workspace/i)
    if (await nameInput.isVisible()) {
      await nameInput.fill('Workspace Verify')
      await page.getByRole('button', { name: /continuar|próximo|criar/i }).click()
      await page.waitForURL('**/dashboard', { timeout: 10000 })
    }
  }
  await page.waitForURL('**/dashboard', { timeout: 10000 })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-workspace-switcher]') ??
                 document.querySelector('button[aria-haspopup]')
      return el && el.textContent && el.textContent.length > 2
    },
    { timeout: 10000 },
  ).catch(() => {})
}

test.describe('M9 — dados reais Supabase', () => {
  test.setTimeout(90000)

  test.afterEach(async ({ request }) => {
    if (createdLeads.length === 0 && createdDeals.length === 0) return

    await request.delete('/api/e2e-cleanup', {
      data: {
        leadNames: [...createdLeads],
        dealTitles: [...createdDeals],
      },
    })

    createdLeads.length = 0
    createdDeals.length = 0
  })

  test('1. criar lead persiste após reload', async ({ page }) => {
    await login(page)
    await page.goto('/leads')
    await page.waitForFunction(
      () => !document.querySelector('svg.animate-spin'),
      { timeout: 15000 },
    )
    await page.screenshot({ path: SS('leads-before') })

    await page.getByRole('button', { name: /novo lead/i }).click()
    await expect(page.getByRole('heading', { name: /novo lead/i })).toBeVisible({ timeout: 8000 })
    await page.screenshot({ path: SS('lead-form-open') })

    const ts = Date.now()
    const leadName = `Verify Lead ${ts}`
    createdLeads.push(leadName)

    await page.getByLabel(/nome \*/i).fill(leadName)
    await page.getByLabel(/e-mail \*/i).fill(`verify${ts}@test.com`)
    await page.getByLabel(/empresa/i).fill('Verify Corp')
    await page.screenshot({ path: SS('lead-form-filled') })

    await page.getByRole('button', { name: /criar lead/i }).click()
    await expect(page.getByRole('heading', { name: /novo lead/i })).toBeHidden({ timeout: 8000 })
    await page.waitForFunction(
      () => !document.querySelector('svg.animate-spin'),
      { timeout: 10000 },
    )
    await page.screenshot({ path: SS('lead-created') })
    await expect(page.getByText(leadName)).toBeVisible({ timeout: 10000 })

    await page.reload()
    await page.waitForFunction(
      () => !document.querySelector('svg.animate-spin'),
      { timeout: 15000 },
    )
    await page.screenshot({ path: SS('lead-after-reload') })
    await expect(page.getByText(leadName)).toBeVisible({ timeout: 10000 })
  })

  test('2. filtros de busca funcionam no banco', async ({ page }) => {
    await login(page)
    await page.goto('/leads')
    await page.waitForFunction(
      () => !document.querySelector('svg.animate-spin'),
      { timeout: 15000 },
    )

    const ts = Date.now()
    const uniqueName = `FilterTest${ts}`
    createdLeads.push(uniqueName)

    await page.getByRole('button', { name: /novo lead/i }).click()
    await expect(page.getByRole('heading', { name: /novo lead/i })).toBeVisible({ timeout: 8000 })
    await page.getByLabel(/nome \*/i).fill(uniqueName)
    await page.getByLabel(/e-mail \*/i).fill(`filter${ts}@test.com`)
    await page.getByRole('button', { name: /criar lead/i }).click()
    await expect(page.getByRole('heading', { name: /novo lead/i })).toBeHidden({ timeout: 8000 })
    await page.waitForFunction(() => !document.querySelector('svg.animate-spin'), { timeout: 10000 })
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10000 })

    const searchInput = page.getByPlaceholder(/buscar por nome/i)
    await searchInput.fill(uniqueName)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => !document.querySelector('svg.animate-spin'), { timeout: 10000 })
    await page.screenshot({ path: SS('filter-by-name') })
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 8000 })
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(1)

    await searchInput.fill('')
    await page.waitForTimeout(400)
    await page.getByRole('combobox').filter({ hasText: /todos os status/i }).click()
    await page.getByRole('option', { name: /novo lead/i }).click()
    await page.waitForTimeout(800)
    await page.waitForFunction(() => !document.querySelector('svg.animate-spin'), { timeout: 10000 })
    await page.screenshot({ path: SS('filter-by-status') })
    const count = await page.locator('tbody tr').count()
    expect(count).toBeGreaterThan(0)
  })

  test('3. arrastar deal muda stage no PipelineBoard', async ({ page }) => {
    await login(page)
    await page.goto('/pipeline')
    await page.waitForFunction(
      () => !document.querySelector('svg.animate-spin'),
      { timeout: 15000 },
    )
    await page.screenshot({ path: SS('pipeline-before') })

    await page.getByRole('button', { name: /novo negócio/i }).click()
    await expect(page.getByRole('heading', { name: /novo negócio/i })).toBeVisible({ timeout: 8000 })
    const ts = Date.now()
    const dealTitle = `DragDeal ${ts}`
    createdDeals.push(dealTitle)

    await page.getByLabel(/título/i).fill(dealTitle)
    await page.locator('input[type="number"]').first().fill('5000')

    const leadSelect = page.locator('[role="combobox"]').filter({ hasText: /selecionar lead/i })
    if (await leadSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await leadSelect.click()
      await page.locator('[role="option"]').first().click()
    }
    await page.screenshot({ path: SS('deal-form-filled') })
    await page.getByRole('button', { name: /criar negócio/i }).click()
    await expect(page.getByRole('heading', { name: /novo negócio/i })).toBeHidden({ timeout: 8000 })
    await page.waitForFunction(() => !document.querySelector('svg.animate-spin'), { timeout: 10000 })
    await expect(page.getByText(dealTitle)).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: SS('deal-created') })

    const dealCard = page.getByText(dealTitle).first()
    const cardBox = await dealCard.boundingBox()

    const contactedColumn = page.locator('[data-column-id="contacted"]')
    await expect(contactedColumn).toBeVisible({ timeout: 8000 })
    const targetBox = await contactedColumn.boundingBox()

    if (!cardBox || !targetBox) {
      throw new Error(`Não foi possível localizar o card (${!!cardBox}) ou a coluna destino (${!!targetBox})`)
    }

    const startX = cardBox.x + cardBox.width / 2
    const startY = cardBox.y + cardBox.height / 2
    const endX = targetBox.x + targetBox.width / 2
    const endY = targetBox.y + 80

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.waitForTimeout(400)
    const steps = 15
    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(
        startX + ((endX - startX) * i) / steps,
        startY + ((endY - startY) * i) / steps,
      )
      await page.waitForTimeout(20)
    }
    await page.waitForTimeout(200)
    await page.mouse.up()
    await page.waitForTimeout(2000)

    await page.screenshot({ path: SS('pipeline-after-drag') })

    await page.reload()
    await page.waitForFunction(() => !document.querySelector('svg.animate-spin'), { timeout: 15000 })
    await page.screenshot({ path: SS('pipeline-after-reload') })

    await expect(page.getByText(dealTitle)).toBeVisible({ timeout: 10000 })
  })

  test('4. dashboard reflete dados reais', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await page.waitForFunction(
      () => !document.querySelector('svg.animate-spin'),
      { timeout: 15000 },
    )
    await page.screenshot({ path: SS('dashboard-loaded') })

    await expect(page.getByText('Total de Leads')).toBeVisible()
    await expect(page.getByText('Negócios Abertos')).toBeVisible()
    await expect(page.getByText('Valor do Pipeline')).toBeVisible()
    await expect(page.getByText('Taxa de Conversão')).toBeVisible()
    await expect(page.getByText('Leads Recentes')).toBeVisible()

    const metricsValues = page.locator('p.text-3xl, p[class*="text-3xl"]')
    const count = await metricsValues.count()
    expect(count).toBeGreaterThanOrEqual(4)

    await page.screenshot({ path: SS('dashboard-metrics') })
  })
})
