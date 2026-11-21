import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const results = []

function log(page, status, detail = '') {
  results.push({ page, status, detail })
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌'
  console.log(`${icon} [${page}] ${detail}`)
}

async function login(page, username = 'admin', password = 'password') {
  await page.goto(`${BASE}/login`)
  await page.fill('input[name="username"], input[type="text"]', username)
  await page.fill('input[name="password"], input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/dashboard/, { timeout: 5000 })
}

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext()
const page = await ctx.newPage()

// Collect all console errors
const consoleErrors = []
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })

// ── LOGIN ──────────────────────────────────────────────────────────────────
try {
  await login(page)
  log('Login', 'PASS', 'admin login successful, redirected to /dashboard')
} catch (e) {
  log('Login', 'FAIL', e.message)
  await browser.close(); process.exit(1)
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
try {
  const stats = await page.locator('.MuiCard-root').count()
  const hasStudents = await page.locator('text=Total Students').isVisible()
  log('Dashboard', hasStudents ? 'PASS' : 'WARN', `${stats} cards, Total Students visible: ${hasStudents}`)
} catch (e) { log('Dashboard', 'FAIL', e.message) }

// ── USER MANAGEMENT ───────────────────────────────────────────────────────
try {
  await page.click('text=User Management')
  await page.waitForLoadState('networkidle')
  const rows = await page.locator('table tbody tr').count()
  const addBtn = await page.locator('button:has-text("Add")').isVisible()
  log('User Management', rows > 0 ? 'PASS' : 'WARN', `${rows} users, Add button: ${addBtn}`)
} catch (e) { log('User Management', 'FAIL', e.message) }

// ── CLASSES ───────────────────────────────────────────────────────────────
try {
  await page.click('text=Classes')
  await page.waitForLoadState('networkidle')
  const rows = await page.locator('table tbody tr').count()
  log('Classes', rows > 0 ? 'PASS' : 'WARN', `${rows} classes listed`)
} catch (e) { log('Classes', 'FAIL', e.message) }

// ── SECTIONS ──────────────────────────────────────────────────────────────
try {
  await page.click('text=Sections')
  await page.waitForLoadState('networkidle')
  const hasDropdown = await page.locator('label:has-text("Class")').isVisible()
  log('Sections', hasDropdown ? 'PASS' : 'WARN', `Class filter dropdown visible: ${hasDropdown}`)
} catch (e) { log('Sections', 'FAIL', e.message) }

// ── SUBJECTS ──────────────────────────────────────────────────────────────
try {
  await page.click('text=Subjects')
  await page.waitForLoadState('networkidle')
  const rows = await page.locator('table tbody tr').count()
  log('Subjects', rows > 0 ? 'PASS' : 'WARN', `${rows} subjects listed`)
} catch (e) { log('Subjects', 'FAIL', e.message) }

// ── ADMISSION ─────────────────────────────────────────────────────────────
try {
  await page.click('text=Admission')
  await page.waitForLoadState('networkidle')
  const stepper = await page.locator('.MuiStepper-root').isVisible()
  log('Admission', stepper ? 'PASS' : 'WARN', `Admission stepper visible: ${stepper}`)
} catch (e) { log('Admission', 'FAIL', e.message) }

// ── FEE PAYMENT ───────────────────────────────────────────────────────────
try {
  await page.click('text=Fee Payment')
  await page.waitForLoadState('networkidle')
  const hasForm = await page.locator('label:has-text("Student")').isVisible()
  log('Fee Payment', hasForm ? 'PASS' : 'WARN', `Student input visible: ${hasForm}`)
} catch (e) { log('Fee Payment', 'FAIL', e.message) }

// ── ATTENDANCE ────────────────────────────────────────────────────────────
try {
  await page.click('text=Attendance')
  await page.waitForLoadState('networkidle')
  const hasFilter = await page.locator('label:has-text("Class")').isVisible()
  log('Attendance', hasFilter ? 'PASS' : 'WARN', `Class filter visible: ${hasFilter}`)
} catch (e) { log('Attendance', 'FAIL', e.message) }

// ── PERFORMANCE ───────────────────────────────────────────────────────────
try {
  await page.click('text=Performance')
  await page.waitForLoadState('networkidle')
  const hasFilter = await page.locator('label:has-text("Class")').isVisible()
  log('Performance', hasFilter ? 'PASS' : 'WARN', `Class filter visible: ${hasFilter}`)
} catch (e) { log('Performance', 'FAIL', e.message) }

// ── SYLLABUS ──────────────────────────────────────────────────────────────
try {
  await page.click('text=Syllabus')
  await page.waitForLoadState('networkidle')
  const hasFilter = await page.locator('label:has-text("Class")').isVisible()
  log('Syllabus', hasFilter ? 'PASS' : 'WARN', `Class filter visible: ${hasFilter}`)
} catch (e) { log('Syllabus', 'FAIL', e.message) }

// ── CLASS SCHEDULE ────────────────────────────────────────────────────────
try {
  await page.click('text=Class Schedule')
  await page.waitForLoadState('networkidle')
  const hasLabel = await page.locator('text=Select a class and section').isVisible()
  const hasClassFilter = await page.locator('label:has-text("Class")').first().isVisible()
  log('Class Schedule', hasLabel && hasClassFilter ? 'PASS' : 'WARN', `SectionLabel: ${hasLabel}, Class filter: ${hasClassFilter}`)
} catch (e) { log('Class Schedule', 'FAIL', e.message) }

// ── REPORTS ───────────────────────────────────────────────────────────────
try {
  await page.click('text=Reports')
  await page.waitForLoadState('networkidle')
  const hasTabs = await page.locator('.MuiTabs-root').isVisible()
  const tabCount = await page.locator('.MuiTab-root').count()
  log('Reports', hasTabs ? 'PASS' : 'WARN', `Tabs visible: ${hasTabs}, count: ${tabCount}`)
} catch (e) { log('Reports', 'FAIL', e.message) }

// ── ANALYSIS ──────────────────────────────────────────────────────────────
try {
  await page.click('text=Analysis')
  await page.waitForLoadState('networkidle')
  const hasChart = await page.locator('.recharts-wrapper').count()
  const hasCards = await page.locator('.MuiCard-root').count()
  log('Analysis', hasCards > 0 ? 'PASS' : 'WARN', `${hasCards} cards, ${hasChart} charts`)
} catch (e) { log('Analysis', 'FAIL', e.message) }

// ── WRONG PASSWORD TEST ───────────────────────────────────────────────────
try {
  const ctx2 = await browser.newContext()
  const p2 = await ctx2.newPage()
  await p2.goto(`${BASE}/login`)
  await p2.fill('input[type="text"]', 'admin')
  await p2.fill('input[type="password"]', 'wrongpass')
  await p2.click('button[type="submit"]')
  await p2.waitForTimeout(1500)
  const hasError = await p2.locator('.MuiAlert-root').isVisible()
  const url = p2.url()
  log('Login Error Alert', hasError ? 'PASS' : 'FAIL', `Error alert shown: ${hasError}, still on: ${url.includes('login') ? '/login' : url}`)
  await ctx2.close()
} catch (e) { log('Login Error Alert', 'FAIL', e.message) }

// ── PRINCIPAL ROLE ────────────────────────────────────────────────────────
try {
  const ctx3 = await browser.newContext()
  const p3 = await ctx3.newPage()
  await p3.goto(`${BASE}/login`)
  await p3.fill('input[type="text"]', 'principal')
  await p3.fill('input[type="password"]', 'password')
  await p3.click('button[type="submit"]')
  await p3.waitForURL(/dashboard/, { timeout: 5000 })
  const links = await p3.locator('nav a, .MuiListItem-root').allTextContents()
  log('Principal Login', 'PASS', `Nav items: ${links.filter(l=>l.trim()).length}`)
  await ctx3.close()
} catch (e) { log('Principal Login', 'FAIL', e.message) }

// ── SUMMARY ───────────────────────────────────────────────────────────────
await browser.close()
const pass = results.filter(r=>r.status==='PASS').length
const warn = results.filter(r=>r.status==='WARN').length
const fail = results.filter(r=>r.status==='FAIL').length
console.log(`\n━━━ SUMMARY ━━━`)
console.log(`✅ PASS: ${pass}  ⚠️  WARN: ${warn}  ❌ FAIL: ${fail}  / ${results.length} total`)
