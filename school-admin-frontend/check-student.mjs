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
await page.waitForTimeout(2000)

// Hero banner
const heroName = await page.locator('h5:has-text("Rohan Rao")').isVisible()
const admBadge = await page.locator('text=ADM26001').first().isVisible()
const statCards = await page.locator('.MuiCard-root').count()
const tabs = await page.locator('.MuiTab-root').count()
console.log(`✅ Hero name: ${heroName}, Adm badge: ${admBadge}, Stat cards: ${statCards}, Tabs: ${tabs}`)

// Profile tab
const profileHeader = await page.locator('text=Personal Information').isVisible()
const academicHeader = await page.locator('text=Academic Details').isVisible()
const addressHeader = await page.locator('text=Address').isVisible()
const familyHeader = await page.locator('text=Parent / Guardian').isVisible()
console.log(`✅ Profile sections — Personal: ${profileHeader}, Academic: ${academicHeader}, Address: ${addressHeader}, Family: ${familyHeader}`)

// Attendance tab
await page.click('.MuiTab-root:has-text("Attendance")')
await page.waitForTimeout(500)
const totalDays = await page.locator('text=Total Days').isVisible()
const present = await page.locator('text=Present').isVisible()
const progressBar = await page.locator('.MuiLinearProgress-root').count()
console.log(`✅ Attendance — Total Days: ${totalDays}, Present: ${present}, Progress bars: ${progressBar}`)

// Performance tab
await page.click('.MuiTab-root:has-text("Performance")')
await page.waitForTimeout(1000)
const yearPicker = await page.locator('label:has-text("Academic Year")').isVisible()
const perfTitle = await page.locator('text=Academic Performance').isVisible()
console.log(`✅ Performance — Year picker: ${yearPicker}, Title: ${perfTitle}`)

if (errors.length > 0) console.log('❌ JS Errors:', errors)
else console.log('✅ No JS errors')

await browser.close()
