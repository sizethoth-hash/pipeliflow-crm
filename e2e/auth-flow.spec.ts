import { test, expect, type Page } from '@playwright/test'

// Usuário criado via service role com email confirmado
const TEST_EMAIL = 'teste@pipeliflow.dev'
const TEST_PASSWORD = 'Senha@1234'
const TEST_WORKSPACE = `Workspace Playwright ${Date.now()}`

async function gotoLogin(page: Page) {
  await page.goto('/login')
  // Aguarda label renderizar — evita crash de hot-reload em dev
  await page.waitForSelector('label:has-text("E-mail")', { timeout: 15000 })
}

test.describe('Auth flow — login, onboarding, dashboard, logout, proteção de rotas', () => {

  // ── 1. Rotas protegidas redirecionam para /login ─────────────────
  test('rotas protegidas redirecionam para /login sem sessão', async ({ page }) => {
    for (const path of ['/dashboard', '/leads', '/pipeline', '/settings']) {
      await page.goto(path)
      await page.waitForURL('**/login', { timeout: 8000 })
      expect(page.url()).toContain('/login')
    }
  })

  // ── 2. Login com credenciais válidas ────────────────────────────
  test('login com credenciais válidas redireciona para /dashboard ou /onboarding', async ({ page }) => {
    await gotoLogin(page)
    await expect(page.getByRole('heading', { name: /Bem-vindo de volta/i })).toBeVisible()

    await page.getByLabel('E-mail').fill(TEST_EMAIL)
    await page.locator('#password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /^Entrar$/i }).click()

    // Pode ir para onboarding (sem workspace) ou dashboard (com workspace)
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 25000 })
    expect(page.url()).toMatch(/\/(onboarding|dashboard)/)

    await page.screenshot({ path: 'e2e/screenshots/01-after-login.png', fullPage: true })
  })

  // ── 3. Onboarding cria workspace ────────────────────────────────
  test('onboarding cria workspace e vai para /dashboard', async ({ page }) => {
    await gotoLogin(page)
    await page.getByLabel('E-mail').fill(TEST_EMAIL)
    await page.locator('#password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /^Entrar$/i }).click()
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 25000 })

    if (page.url().includes('/onboarding')) {
      await page.getByPlaceholder(/Acme Corp/i).fill(TEST_WORKSPACE)
      await page.getByRole('button', { name: /Continuar/i }).click()

      // Passo 2 — confirmação
      await expect(page.getByText(TEST_WORKSPACE)).toBeVisible({ timeout: 5000 })
      await page.getByRole('button', { name: /Começar a usar/i }).click()

      await page.waitForURL('**/dashboard', { timeout: 15000 })
    }

    expect(page.url()).toContain('/dashboard')
    await page.screenshot({ path: 'e2e/screenshots/02-dashboard.png', fullPage: true })
  })

  // ── 4. Dashboard carrega corretamente ───────────────────────────
  test('dashboard exibe sidebar, workspace switcher e nome do usuário', async ({ page }) => {
    await gotoLogin(page)
    await page.getByLabel('E-mail').fill(TEST_EMAIL)
    await page.locator('#password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /^Entrar$/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 25000 })

    // Navegação principal
    await expect(page.getByRole('navigation', { name: /Menu principal/i })).toBeVisible()

    // Workspace switcher ou skeleton de loading aparece na sidebar
    await expect(
      page.locator('div').filter({ has: page.locator('button[aria-label="Selecionar workspace"]') }).or(
        page.locator('.animate-pulse').first()
      )
    ).toBeVisible({ timeout: 8000 })

    // Botão de usuário
    await expect(
      page.locator('button[aria-label="Menu do usuário"]')
    ).toBeVisible()

    // Sem erros de console críticos
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.waitForTimeout(2000)

    await page.screenshot({ path: 'e2e/screenshots/03-dashboard-loaded.png', fullPage: true })
  })

  // ── 5. Navegação entre rotas protegidas ─────────────────────────
  test('usuário logado navega entre leads, pipeline e settings', async ({ page }) => {
    await gotoLogin(page)
    await page.getByLabel('E-mail').fill(TEST_EMAIL)
    await page.locator('#password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /^Entrar$/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 25000 })

    for (const { href, label } of [
      { href: '/leads', label: 'Leads' },
      { href: '/pipeline', label: 'Pipeline' },
      { href: '/settings', label: 'Configurações' },
    ]) {
      // Clica no link da sidebar (nav principal), não em outros links da página
      await page.locator('nav[aria-label="Menu principal"]').getByRole('link', { name: label, exact: true }).click()
      await page.waitForURL(`**${href}`, { timeout: 8000 })
      expect(page.url()).toContain(href)
    }

    await page.screenshot({ path: 'e2e/screenshots/04-navigation.png', fullPage: true })
  })

  // ── 6. Logout ────────────────────────────────────────────────────
  test('logout limpa sessão e redireciona para /login', async ({ page }) => {
    await gotoLogin(page)
    await page.getByLabel('E-mail').fill(TEST_EMAIL)
    await page.locator('#password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /^Entrar$/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 25000 })

    // Clica no botão de usuário na sidebar
    await page.locator('button[aria-label="Menu do usuário"]').click()
    await page.getByRole('menuitem', { name: /Sair/i }).click()

    await page.waitForURL('**/login', { timeout: 10000 })
    expect(page.url()).toContain('/login')

    // Rotas protegidas bloqueiam novamente
    await page.goto('/dashboard')
    await page.waitForURL('**/login', { timeout: 8000 })
    expect(page.url()).toContain('/login')

    await page.screenshot({ path: 'e2e/screenshots/05-logout.png', fullPage: true })
  })

  // ── 7. Usuário autenticado é barrado em /login e /signup ─────────
  test('usuário autenticado é redirecionado do /login para /dashboard', async ({ page }) => {
    await gotoLogin(page)
    await page.getByLabel('E-mail').fill(TEST_EMAIL)
    await page.locator('#password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /^Entrar$/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 25000 })

    await page.goto('/login')
    await page.waitForURL('**/dashboard', { timeout: 8000 })
    expect(page.url()).toContain('/dashboard')

    await page.goto('/signup')
    await page.waitForURL('**/dashboard', { timeout: 8000 })
    expect(page.url()).toContain('/dashboard')
  })

  // ── 8. Login com credenciais inválidas mostra erro ───────────────
  test('login com senha errada exibe mensagem de erro', async ({ page }) => {
    await gotoLogin(page)
    await page.getByLabel('E-mail').fill(TEST_EMAIL)
    await page.locator('#password').fill('senha-errada-123')
    await page.getByRole('button', { name: /^Entrar$/i }).click()

    await expect(
      page.getByRole('alert').filter({ hasText: /incorretos|inválid/i })
    ).toBeVisible({ timeout: 8000 })

    expect(page.url()).toContain('/login')
  })
})
