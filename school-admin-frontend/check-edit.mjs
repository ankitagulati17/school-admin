import { chromium } from 'playwright'
const BASE = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext()
const page = await ctx.newPage()

await page.goto(`${BASE}/login`)
await page.fill('input[type="text"]', 'admin')
await page.fill('input[type="password"]', 'password')
await page.click('button[type="submit"]')
await page.waitForURL(/dashboard/, { timeout: 6000 })

await page.goto(`${BASE}/users`)
await page.waitForTimeout(2000)

// Check edit and delete buttons exist
const editBtns = await page.locator('button[title="Edit user"]').count()
const deleteBtns = await page.locator('button[title="Delete user"]').count()
const toggleBtns = await page.locator('button[title*="user"]').count()
console.log(`Edit buttons: ${editBtns}, Delete buttons: ${deleteBtns}, All action buttons: ${toggleBtns}`)

// Click edit on first user
await page.locator('button[title="Edit user"]').first().click()
await page.waitForTimeout(500)
const dialogOpen = await page.locator('.MuiDialog-root').isVisible()
const dialogTitle = await page.locator('.MuiDialogTitle-root').textContent()
console.log(`Edit dialog opens: ${dialogOpen}, title: "${dialogTitle.trim()}"`)

// Check form fields populated
const fullNameVal = await page.locator('input[type="text"]').first().inputValue()
console.log(`Full Name pre-filled: "${fullNameVal}"`)

await browser.close()
