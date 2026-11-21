import { chromium } from 'playwright'
const BASE = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext()
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))

await page.goto(`${BASE}/login`)
await page.fill('input[type="text"]', 'student1')
await page.fill('input[type="password"]', 'password')
await page.click('button[type="submit"]')
await page.waitForURL(/dashboard/, { timeout: 6000 })

// Navigate to student portal
await page.goto(`${BASE}/student`)
await page.waitForTimeout(3000)

const url = page.url()
const heroName = await page.locator('h5').filter({ hasText: 'Rohan Rao' }).isVisible().catch(() => false)
const cards = await page.locator('.MuiCard-root').count()
const tabs = await page.locator('.MuiTab-root').count()
const profileSect = await page.locator('text=Personal Information').isVisible().catch(() => false)
const academicSect = await page.locator('text=Academic Details').isVisible().catch(() => false)
const classBadge = await page.locator('text=Class 1').count()

console.log(`URL: ${url}`)
console.log(`Hero: ${heroName}, Cards: ${cards}, Tabs: ${tabs}`)
console.log(`Profile sections — Personal: ${profileSect}, Academic: ${academicSect}`)
console.log(`Class 1 appears: ${classBadge} times`)

if (tabs >= 3) {
  // Test attendance tab
  await page.locator('.MuiTab-root').nth(1).click()
  await page.waitForTimeout(500)
  const totalDays = await page.locator('text=Total Days').isVisible().catch(() => false)
  const progBar = await page.locator('.MuiLinearProgress-root').count()
  console.log(`Attendance tab — Total Days card: ${totalDays}, Progress bars: ${progBar}`)

  // Performance tab
  await page.locator('.MuiTab-root').nth(2).click()
  await page.waitForTimeout(1000)
  const yearPicker = await page.locator('label:has-text("Academic Year")').isVisible().catch(() => false)
  const perfTitle = await page.locator('text=Academic Performance').isVisible().catch(() => false)
  console.log(`Performance tab — Year picker: ${yearPicker}, Title: ${perfTitle}`)
}

if (errors.length) console.log('JS errors:', errors)
else console.log('No JS errors ✓')
await browser.close()
