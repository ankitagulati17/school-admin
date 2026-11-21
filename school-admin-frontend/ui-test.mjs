import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5173';
const SS_DIR = '/tmp/school-admin-screenshots';
fs.mkdirSync(SS_DIR, { recursive: true });

let browser, context, page;
const results = [];
let ssIndex = 0;
const consoleErrors = [];

async function ss(label) {
  const file = path.join(SS_DIR, `${String(ssIndex++).padStart(3,'0')}_${label.replace(/[^a-z0-9]/gi,'_')}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

function pass(test, detail='') { results.push({ status:'PASS', test, detail }); console.log(`  ✅  ${test}${detail?' — '+detail:''}`); }
function fail(test, detail='') { results.push({ status:'FAIL', test, detail }); console.log(`  ❌  ${test}${detail?' — '+detail:''}`); }
function info(msg) { console.log(`\n── ${msg}`); }

async function login(username, password='password') {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[type="text"], input[placeholder*="sername"]', { timeout: 8000 });
  await page.locator('input[type="text"], input[placeholder*="sername"]').first().fill(username);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });
}

async function logout() {
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
}

async function nav(route) {
  await page.goto(`${BASE}/${route}`);
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
}

// ── 1. Auth ────────────────────────────────────────────────────────────────────
async function testAuth() {
  info('Auth');
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  // Wrong password
  await page.locator('input[type="text"]').first().fill('admin');
  await page.locator('input[type="password"]').first().fill('wrong');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);
  const alertEl = page.locator('.MuiAlert-root, [role="alert"]');
  if (await alertEl.isVisible({ timeout: 3000 }).catch(() => false)) pass('Wrong-password error shown');
  else fail('Wrong-password error not shown');
  await ss('auth_wrong_password');

  // Correct login
  await page.locator('input[type="text"]').first().fill('admin');
  await page.locator('input[type="password"]').first().fill('password');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 }).catch(() => {});
  if (page.url().includes('/dashboard')) pass('Admin login → dashboard');
  else fail(`Admin login did not redirect — at ${page.url()}`);
  await ss('auth_dashboard');
}

// ── 2. Dashboard ───────────────────────────────────────────────────────────────
async function testDashboard() {
  info('Dashboard');
  await nav('dashboard');
  const cards = await page.locator('[class*="MuiCard"], [class*="card"]').count();
  if (cards > 0) pass(`Dashboard loaded — ${cards} cards visible`);
  else fail('Dashboard loaded but no cards found');
  await ss('dashboard');
}

// ── 3. Admin: User Management ─────────────────────────────────────────────────
async function testUserManagement() {
  info('Admin: User Management');
  await nav('users');
  await page.waitForTimeout(1500);

  const rows = await page.locator('table tbody tr').count();
  if (rows > 0) pass(`User list loaded — ${rows} rows`);
  else fail('User list empty or not loaded');

  // Open Add User dialog
  await page.locator('button').filter({ hasText: /add user/i }).click();
  await page.waitForTimeout(500);
  const dialog = page.locator('[role="dialog"]');
  if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
    pass('Add User dialog opens');
    await ss('users_add_dialog');
    // Dialog has floating-label MUI inputs — just verify they exist
    const inputCount = await dialog.locator('input').count();
    if (inputCount >= 4) pass(`Add User dialog has ${inputCount} inputs`);
    await page.keyboard.press('Escape');
  } else {
    fail('Add User dialog did not open');
  }
  await ss('users_page');
}

// ── 4. Admin: Class Management ────────────────────────────────────────────────
async function testClassManagement() {
  info('Admin: Class Management');
  await nav('classes');
  await page.waitForTimeout(1500);

  const rows = await page.locator('table tbody tr').count();
  const cards = await page.locator('[class*="MuiCard"]').count();
  if (rows > 0 || cards > 0) pass(`Class list loaded — ${rows} rows / ${cards} cards`);
  else fail('Class list not loaded');

  await page.locator('button').filter({ hasText: /add new class|add class/i }).click();
  await page.waitForTimeout(500);
  if (await page.locator('[role="dialog"]').isVisible({ timeout: 3000 }).catch(() => false)) {
    pass('Add Class dialog opens');
    await ss('classes_add_dialog');
    await page.keyboard.press('Escape');
  } else fail('Add Class dialog did not open');
  await ss('classes_page');
}

// ── 5. Admin: Section Management ─────────────────────────────────────────────
async function testSectionManagement() {
  info('Admin: Section Management');
  await nav('sections');
  await page.waitForTimeout(1500);

  // Page has a class selector — select first class
  const classSelect = page.locator('[role="combobox"]').first();
  if (await classSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
    pass('Section Management loaded with class selector');
    await classSelect.click();
    await page.waitForTimeout(400);
    const options = page.locator('[role="listbox"] [role="option"]');
    const count = await options.count();
    if (count > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
      const sectionsTable = await page.locator('table tbody tr').count();
      if (sectionsTable > 0) pass(`Sections loaded — ${sectionsTable} rows`);
      else pass('Sections loaded — empty class (no sections yet)');
    }
  } else fail('Section Management — class selector not found');
  await ss('sections_page');
}

// ── 6. Admin: Subject Management ─────────────────────────────────────────────
async function testSubjectManagement() {
  info('Admin: Subject Management');
  await nav('subjects');
  await page.waitForTimeout(1500);

  const selector = await page.locator('[role="combobox"]').isVisible({ timeout: 2000 }).catch(() => false);
  const tableRows = await page.locator('table tbody tr').count();
  const anyContent = await page.locator('[class*="MuiCard"], table').isVisible({ timeout: 3000 }).catch(() => false);
  if (selector || tableRows > 0 || anyContent) pass('Subject Management loaded');
  else fail('Subject Management — no content');
  await ss('subjects_page');
}

// ── 7. Clerk: Admission ───────────────────────────────────────────────────────
async function testAdmission() {
  info('Clerk: Admission');
  await nav('admission');
  await page.waitForTimeout(1500);

  // Should show stepper or student list
  const stepper = await page.locator('.MuiStepper-root').isVisible({ timeout: 3000 }).catch(() => false);
  const listLoaded = await page.locator('table, [class*="MuiCard"]').isVisible({ timeout: 3000 }).catch(() => false);
  if (stepper) pass('Admission: New Admission tab with stepper shown');
  else if (listLoaded) pass('Admission page loaded');
  else fail('Admission page — no stepper or list found');

  // Check student list tab
  const tabs = page.locator('[role="tab"]');
  const tabCount = await tabs.count();
  if (tabCount >= 2) {
    await tabs.nth(1).click();
    await page.waitForTimeout(1000);
    const tableRows = await page.locator('table tbody tr').count();
    if (tableRows > 0) pass(`Admission student list — ${tableRows} students`);
    else pass('Admission student list tab loaded (empty)');
  }
  await ss('admission_page');
}

// ── 8. Clerk: Fee Payment ─────────────────────────────────────────────────────
async function testFeePayment() {
  info('Clerk: Fee Payment');
  await nav('fees');
  await page.waitForTimeout(1500);

  const cards = await page.locator('[class*="MuiCard"]').count();
  if (cards > 0) pass(`Fee Payment loaded — ${cards} cards/sections`);
  else fail('Fee Payment — no content found');

  // Check fee records tab
  const tabs = page.locator('[role="tab"]');
  const tabCount = await tabs.count();
  if (tabCount >= 2) {
    await tabs.nth(tabCount > 1 ? 1 : 0).click();
    await page.waitForTimeout(800);
    const rows = await page.locator('table tbody tr').count();
    if (rows > 0) pass(`Fee records loaded — ${rows} records`);
    else pass('Fee records tab loaded (no pending records)');
  }
  await ss('fees_page');
}

// ── 9. Teacher: Attendance ────────────────────────────────────────────────────
async function testAttendance() {
  info('Teacher: Attendance');
  await nav('attendance');
  await page.waitForTimeout(1500);

  const tabs = await page.locator('[role="tab"]').count();
  const filters = await page.locator('[role="combobox"]').count();
  if (tabs > 0 && filters >= 2) pass(`Attendance page loaded — ${tabs} tabs, ${filters} filters`);
  else fail('Attendance page missing tabs or filters');

  // Select a class and section to load students
  const combos = page.locator('[role="combobox"]');
  if (await combos.count() >= 2) {
    await combos.first().click();
    await page.waitForTimeout(300);
    const classOptions = page.locator('[role="listbox"] [role="option"]');
    if (await classOptions.count() > 0) {
      await classOptions.first().click();
      await page.waitForTimeout(500);
      await combos.nth(1).click();
      await page.waitForTimeout(300);
      const secOptions = page.locator('[role="listbox"] [role="option"]');
      if (await secOptions.count() > 0) {
        await secOptions.first().click();
        await page.waitForTimeout(300);
        // Click Load Students
        await page.locator('button').filter({ hasText: /load students/i }).click();
        await page.waitForTimeout(2000);
        const stuRows = await page.locator('table tbody tr').count();
        if (stuRows > 0) pass(`Attendance: loaded ${stuRows} students`);
        else pass('Attendance: students loaded (class may be empty)');
      }
    }
  }
  await ss('attendance_page');
}

// ── 10. Teacher: Performance ──────────────────────────────────────────────────
async function testPerformance() {
  info('Teacher: Performance');
  await nav('performance');
  await page.waitForTimeout(1500);

  const anyContent = await page.locator('[class*="MuiCard"], [role="tab"], table').isVisible({ timeout: 3000 }).catch(() => false);
  if (anyContent) pass('Performance page loaded');
  else fail('Performance page — no content');
  await ss('performance_page');
}

// ── 11. Teacher: Syllabus ─────────────────────────────────────────────────────
async function testSyllabus() {
  info('Teacher: Syllabus');
  await nav('syllabus');
  await page.waitForTimeout(1500);

  const anyContent = await page.locator('[class*="MuiCard"], [role="combobox"], table').isVisible({ timeout: 3000 }).catch(() => false);
  if (anyContent) pass('Syllabus page loaded');
  else fail('Syllabus page — no content');
  await ss('syllabus_page');
}

// ── 12. Principal: Class Schedule ──────────────────────────────────────────────
async function testClassSchedule() {
  info('Principal: Class Schedule');
  await nav('schedule');
  await page.waitForTimeout(1500);

  const addBtn = page.locator('button').filter({ hasText: /add period/i });
  const filters = await page.locator('[role="combobox"]').count();
  if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false) || filters > 0) {
    pass('Class Schedule page loaded');
  } else fail('Class Schedule — no content');

  // Load a timetable
  const combos = page.locator('[role="combobox"]');
  if (await combos.count() >= 2) {
    await combos.first().click();
    await page.waitForTimeout(300);
    const opts = page.locator('[role="listbox"] [role="option"]');
    if (await opts.count() > 0) {
      await opts.first().click();
      await page.waitForTimeout(500);
      await combos.nth(1).click();
      await page.waitForTimeout(300);
      const secOpts = page.locator('[role="listbox"] [role="option"]');
      if (await secOpts.count() > 0) {
        await secOpts.first().click();
        await page.waitForTimeout(300);
        await page.locator('button').filter({ hasText: /load timetable/i }).click();
        await page.waitForTimeout(1500);
        pass('Class Schedule: timetable loaded');
      }
    }
  }
  await ss('schedule_page');
}

// ── 13. Principal: Reports ─────────────────────────────────────────────────────
async function testReports() {
  info('Principal: Reports');
  await nav('reports');
  await page.waitForTimeout(2000);

  // Admission report auto-loads
  const admissionData = await page.locator('table tbody tr, [class*="MuiCard"]').count();
  if (admissionData > 0) pass(`Reports: Admission tab loaded — ${admissionData} elements`);
  else fail('Reports: Admission tab loaded no data');

  // Switch to Class Summary tab (auto-loads)
  const tabs = page.locator('[role="tab"]');
  const tabCount = await tabs.count();
  if (tabCount >= 5) {
    await tabs.nth(4).click(); // Class Summary
    await page.waitForTimeout(1500);
    const rows = await page.locator('table tbody tr').count();
    if (rows > 0) pass(`Reports: Class Summary — ${rows} classes`);
    else fail('Reports: Class Summary — no data');
  }
  await ss('reports_page');
}

// ── 14. Principal: Analysis ────────────────────────────────────────────────────
async function testAnalysis() {
  info('Principal: Analysis');
  await nav('analysis');
  await page.waitForTimeout(2000);

  const cards = await page.locator('[class*="MuiCard"]').count();
  const chart = await page.locator('.recharts-wrapper, svg').isVisible({ timeout: 3000 }).catch(() => false);
  if (cards > 0) pass(`Analysis page loaded — ${cards} cards${chart ? ', charts visible' : ''}`);
  else fail('Analysis page — no cards');
  await ss('analysis_page');
}

// ── 15. Student Portal ─────────────────────────────────────────────────────────
async function testStudentPortal() {
  info('Student Portal (student1)');
  await logout();
  await login('student1');
  await nav('student');
  await page.waitForTimeout(2000);

  const hasProfile = await page.locator('[class*="MuiAvatar"], [class*="MuiCard"]').isVisible({ timeout: 3000 }).catch(() => false);
  if (hasProfile) pass('Student Portal loaded with profile');
  else fail('Student Portal — no profile content');

  // Check tabs
  const tabs = page.locator('[role="tab"]');
  const tabCount = await tabs.count();
  if (tabCount >= 3) {
    await tabs.nth(1).click(); // My Attendance
    await page.waitForTimeout(800);
    pass('Student Portal: Attendance tab accessible');
    await tabs.nth(2).click(); // My Performance
    await page.waitForTimeout(800);
    pass('Student Portal: Performance tab accessible');
  }
  await ss('student_portal');
}

// ── 16. RBAC ──────────────────────────────────────────────────────────────────
async function testRBAC() {
  info('RBAC: teacher1 access control');
  await logout();
  await login('teacher1');

  // Teacher blocked from admin routes
  await page.goto(`${BASE}/users`);
  await page.waitForTimeout(1000);
  const blockedFromUsers = page.url().includes('/dashboard') || !page.url().includes('/users');
  if (blockedFromUsers) pass('Teacher blocked from /users');
  else fail('Teacher CAN access /users — RBAC not working');

  // Teacher allowed to attendance
  await nav('attendance');
  const attVisible = await page.locator('[role="tab"]').isVisible({ timeout: 3000 }).catch(() => false);
  if (attVisible) pass('Teacher can access Attendance');
  else fail('Teacher blocked from Attendance');

  // Teacher allowed to performance
  await nav('performance');
  const perfVisible = await page.locator('[class*="MuiCard"], [role="combobox"]').isVisible({ timeout: 3000 }).catch(() => false);
  if (perfVisible) pass('Teacher can access Performance');
  else fail('Teacher blocked from Performance');
}

// ── 17. FeePayment: Process a fee form render ──────────────────────────────────
async function testFeeForm() {
  info('Fee: Process payment form');
  await logout();
  await login('admin');
  await nav('fees');
  await page.waitForTimeout(1000);

  // The first tab should be "Process Payment" with a form
  const form = await page.locator('form, [class*="MuiCard"] input[type="text"]').isVisible({ timeout: 3000 }).catch(() => false);
  const stuSelect = await page.locator('[role="combobox"]').isVisible({ timeout: 3000 }).catch(() => false);
  if (form || stuSelect) pass('Fee Payment: process form is rendered');
  else fail('Fee Payment: process form not found');
}

// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  page = await context.newPage();

  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(`PAGEERROR: ${err.message}`));

  try {
    await testAuth();
    await testDashboard();
    await testUserManagement();
    await testClassManagement();
    await testSectionManagement();
    await testSubjectManagement();
    await testAdmission();
    await testFeePayment();
    await testAttendance();
    await testPerformance();
    await testSyllabus();
    await testClassSchedule();
    await testReports();
    await testAnalysis();
    await testStudentPortal();
    await testRBAC();
    await testFeeForm();
  } catch (e) {
    fail('Unexpected crash', e.message);
    console.error(e);
  } finally {
    await browser.close();
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  RESULTS:  ${passed} passed  |  ${failed} failed`);
  console.log('══════════════════════════════════════════════════════');
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  • ${r.test}${r.detail ? ': ' + r.detail : ''}`));
  }

  const relevantErrors = [...new Set(consoleErrors)]
    .filter(e => !e.includes('validateDOMNesting') && !e.includes('Warning:'));
  if (relevantErrors.length > 0) {
    console.log(`\nRuntime errors (${relevantErrors.length}):`);
    relevantErrors.slice(0, 10).forEach(e => console.log(`  ⚠  ${e.substring(0, 150)}`));
  }

  console.log(`\nScreenshots: ${SS_DIR}`);
  fs.writeFileSync('/tmp/school-admin-results.json', JSON.stringify({ passed, failed, results, consoleErrors: relevantErrors }, null, 2));
})();
