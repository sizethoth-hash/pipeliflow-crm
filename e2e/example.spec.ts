import { expect, test } from '@playwright/test'

test('homepage redirects to dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/dashboard')
})
