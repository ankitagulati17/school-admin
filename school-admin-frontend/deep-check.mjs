import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext()
const page = await ctx.newPage()

async function login() {
  await page.goto(`${BASE}/login`)
  await page.fill('input[type="text"]', 'admin')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await page.waitForURL(/dashboard/, { timeout: 6000 })
  await page.waitForTimeout(1500) // let API calls settle
}

await login()

// DASHBOARD - wait longer for API
await page.goto(`${BASE}/dashboard`)
await page.waitForTimeout(2000)
const cards = await page.locator('.MuiCard-root').count()
const students = await page.locator('text=Total Students').isVisible()
const feeCollected = await page.locator('text=Fee Collected').isVisible()
console.log(`Dashboard: ${cards} cards, "Total Students": ${students}, "Fee Collected": ${feeCollected}`)

// CLASSES
await page.goto(`${BASE}/classes`)
await page.waitForTimeout(2000)
const classRows = await page.locator('table tbody tr').count()
const classText = await page.locator('table tbody').textContent().catch(() => '(no table)')
console.log(`Classes: ${classRows} rows — "${classText.trim().slice(0,80)}"`)

// SUBJECTS
await page.goto(`${BASE}/subjects`)
await page.waitForTimeout(2000)
const subjectRows = await page.locator('table tbody tr').count()
console.log(`Subjects: ${subjectRows} rows`)

// ADMISSION - check both tabs
await page.goto(`${BASE}/admission`)
await page.waitForTimeout(2000)
const stepperVisible = await page.locator('.MuiStepper-root').isVisible()
const tab1 = await page.locator('text=New Admission').isVisible()
const tab2 = await page.locator('text=Student List').isVisible()
console.log(`Admission: stepper=${stepperVisible}, tab1=${tab1}, tab2=${tab2}`)
// click student list tab
await page.click('text=Student List')
await page.waitForTimeout(1500)
const studentRows = await page.locator('table tbody tr').count()
console.log(`Admission student list: ${studentRows} rows`)

// PERFORMANCE 
await page.goto(`${BASE}/performance`)
await page.waitForTimeout(2000)
const perfFilter = await page.locator('label:has-text("Class")').isVisible()
const perfContent = await page.locator('body').textContent()
console.log(`Performance: class filter=${perfFilter}, page has "Class": ${perfContent.includes('Class')}`)

// ANALYSIS - wait longer for charts
await page.goto(`${BASE}/analysis`)
await page.waitForTimeout(3000)
const analysisCards = await page.locator('.MuiCard-root').count()
const charts = await page.locator('.recharts-wrapper').count()
const analysisText = await page.locator('h5, h6').allTextContents()
console.log(`Analysis: ${analysisCards} cards, ${charts} charts, headings: ${analysisText.join(' | ')}`)

// CLASS SCHEDULE - check the fix
await page.goto(`${BASE}/schedule`)
await page.waitForTimeout(1500)
const schedLabel = await page.locator('text=Select a class and section to view the timetable').first().isVisible()
const classFilter = await page.locator('label:has-text("Class")').first().isVisible()
const sectionFilter = await page.locator('label:has-text("Section")').isVisible()
console.log(`Class Schedule: SectionLabel=${schedLabel}, Class=${classFilter}, Section=${sectionFilter}`)

// FEE PAYMENT - test a payment
await page.goto(`${BASE}/fee-payment`)
await page.waitForTimeout(2000)
const feeInputs = await page.locator('input').count()
const feeSelectCount = await page.locator('.MuiSelect-root').count()
console.log(`Fee Payment: ${feeInputs} inputs, ${feeSelectCount} selects`)

await browser.close()
