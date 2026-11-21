import { chromium } from 'playwright'
const BASE = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })

// ── SUBJECTS (admin) ────────────────────────────────────────────
{
  const ctx = await browser.newContext()
  const p = await ctx.newPage()
  await p.goto(`${BASE}/login`)
  await p.fill('input[type="text"]', 'admin')
  await p.fill('input[type="password"]', 'password')
  await p.click('button[type="submit"]')
  await p.waitForURL(/dashboard/, { timeout: 6000 })
  await p.goto(`${BASE}/subjects`)
  await p.waitForTimeout(2500)
  const rows = await p.locator('table tbody tr').count()
  const bodyText = await p.locator('main, [class*="MuiBox"]').first().textContent()
  const networkErr = await p.locator('[class*="Alert"]').isVisible()
  console.log(`Subjects: ${rows} rows, alert=${networkErr}, text preview: "${bodyText.trim().slice(0,100)}"`)

  // check api directly
  const token = await p.evaluate(() => localStorage.getItem('token'))
  const res = await p.evaluate(async (token) => {
    const r = await fetch('/api/admin/subjects', { headers: { Authorization: `Bearer ${token}` }})
    return { status: r.status, body: await r.text() }
  }, token)
  console.log(`  /api/admin/subjects: ${res.status} → ${res.body.slice(0,100)}`)
  await ctx.close()
}

// ── PERFORMANCE ──────────────────────────────────────────────────
{
  const ctx = await browser.newContext()
  const p = await ctx.newPage()
  await p.goto(`${BASE}/login`)
  await p.fill('input[type="text"]', 'admin')
  await p.fill('input[type="password"]', 'password')
  await p.click('button[type="submit"]')
  await p.waitForURL(/dashboard/, { timeout: 6000 })
  await p.goto(`${BASE}/performance`)
  await p.waitForTimeout(2000)
  const html = await p.locator('body').textContent()
  const inputs = await p.locator('input').count()
  const selects = await p.locator('.MuiSelect-root').count()
  console.log(`Performance: inputs=${inputs}, selects=${selects}`)
  console.log(`  page contains "Class": ${html.includes('Class')}, "Student": ${html.includes('Student')}`)
  const labels = await p.locator('label').allTextContents()
  console.log(`  Labels: ${labels.join(' | ')}`)
  await ctx.close()
}

// ── FEE PAYMENT ───────────────────────────────────────────────────
{
  const ctx = await browser.newContext()
  const p = await ctx.newPage()
  await p.goto(`${BASE}/login`)
  await p.fill('input[type="text"]', 'admin')
  await p.fill('input[type="password"]', 'password')
  await p.click('button[type="submit"]')
  await p.waitForURL(/dashboard/, { timeout: 6000 })
  await p.goto(`${BASE}/fee-payment`)
  await p.waitForTimeout(2000)
  const inputs = await p.locator('input').count()
  const selects = await p.locator('.MuiSelect-root').count()
  const cards = await p.locator('.MuiCard-root').count()
  const text = await p.locator('body').textContent()
  console.log(`Fee Payment: inputs=${inputs}, selects=${selects}, cards=${cards}`)
  console.log(`  contains "Student": ${text.includes('Student')}, "Amount": ${text.includes('Amount')}`)
  const labels = await p.locator('label').allTextContents()
  console.log(`  Labels: ${labels.join(' | ')}`)
  await ctx.close()
}

await browser.close()
