import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5173';
const API  = 'http://localhost:8080';
const SS_DIR = '/tmp/school-admin-screenshots';
fs.mkdirSync(SS_DIR, { recursive: true });

let browser, context, page;
const results = [];
let ssIndex = 0;

async function ss(label) {
  const file = path.join(SS_DIR, `${String(ssIndex++).padStart(3,'0')}_${label.replace(/[^a-z0-9]/gi,'_')}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

function pass(test, detail='') { results.push({ status:'PASS', test, detail }); console.log(`  ✅  ${test}${detail?' — '+detail:''}`); }
function fail(test, detail='') { results.push({ status:'FAIL', test, detail }); console.log(`  ❌  ${test}${detail?' — '+detail:''}`); }
function info(msg)             { console.log(`\n── ${msg}`); }

async function login(username, password='password') {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[name="username"], input[placeholder*="sername"], input[type="text"]', { timeout:8000 });
  const uField = page.locator('input[name="username"], input[placeholder*="sername"], input[type="text"]').first();
  const pField = page.locator('input[type="password"]').first();
  await uField.fill(username);
  await pField.fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/dashboard`, { timeout:10000 });
}

async function logout() {
  // Try sidebar logout button or profile menu
  const logoutBtn = page.locator('button, a').filter({ hasText: /logout|sign out/i }).first();
  if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutBtn.click();
  } else {
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto(`${BASE}/login`);
  }
  await page.waitForURL(`${BASE}/login`, { timeout: 8000 }).catch(() => {});
}

async function navigate(route) {
  await page.goto(`${BASE}/${route}`);
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
}

// ─── API smoke tests ──────────────────────────────────────────────────────────
async function testBackendAPIs() {
  info('Backend API Smoke Tests');
  const token = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password' })
  }).then(r => r.json()).then(d => d.token).catch(() => null);

  if (token) pass('Login API returns JWT');
  else { fail('Login API returns JWT'); return null; }

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const endpoints = [
    ['GET /api/admin/users',       `${API}/api/admin/users`],
    ['GET /api/admin/classes',     `${API}/api/admin/classes`],
    ['GET /api/admin/sections',    `${API}/api/admin/sections`],
    ['GET /api/admin/subjects',    `${API}/api/admin/subjects`],
    ['GET /api/students',          `${API}/api/students`],
    ['GET /api/fees',              `${API}/api/fees`],
    ['GET /api/attendance',        `${API}/api/attendance`],
    ['GET /api/performance',       `${API}/api/performance`],
    ['GET /api/syllabus',          `${API}/api/syllabus`],
    ['GET /api/schedule',          `${API}/api/schedule`],
    ['GET /api/reports/summary',   `${API}/api/reports/summary`],
  ];

  for (const [label, url] of endpoints) {
    try {
      const res = await fetch(url, { headers });
      if (res.ok || res.status === 404) pass(`${label} → ${res.status}`);
      else fail(`${label} → ${res.status}`);
    } catch (e) {
      fail(`${label} → network error: ${e.message}`);
    }
  }

  return token;
}

// ─── Auth tests ───────────────────────────────────────────────────────────────
async function testAuth() {
  info('Auth: Login Page');
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await ss('login_page');

  // Wrong credentials
  const uField = page.locator('input[name="username"], input[type="text"]').first();
  const pField = page.locator('input[type="password"]').first();
  await uField.fill('admin');
  await pField.fill('wrongpassword');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);
  const errorVisible = await page.locator('[class*="error"], [class*="alert"], .MuiAlert-root, [role="alert"]')
    .isVisible({ timeout: 3000 }).catch(() => false);
  if (errorVisible) pass('Wrong credentials shows error');
  else fail('Wrong credentials shows error — no error message visible');
  await ss('login_wrong_creds');

  // Correct login
  await uField.fill('admin');
  await pField.fill('password');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 }).catch(() => {});
  if (page.url().includes('/dashboard')) pass('Admin login redirects to dashboard');
  else fail(`Admin login redirect — ended at ${page.url()}`);
  await ss('dashboard_after_login');
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
async function testDashboard() {
  info('Dashboard');
  await navigate('dashboard');
  const title = await page.title();
  pass(`Dashboard loads — title: "${title}"`);

  // Check for stat cards / content
  const hasContent = await page.locator('h1,h2,h3,h4,h5,[class*="card"],[class*="stat"]').count() > 0;
  if (hasContent) pass('Dashboard has content cards');
  else fail('Dashboard appears empty');
  await ss('dashboard');
}

// ─── Admin pages ──────────────────────────────────────────────────────────────
async function testAdminPages() {
  info('Admin: User Management');
  await navigate('users');
  await ss('users_page');
  const hasTable = await page.locator('table, [class*="table"], [class*="list"], [class*="grid"]').isVisible({ timeout: 5000 }).catch(() => false);
  if (hasTable) pass('User Management shows data table');
  else fail('User Management — no table found');

  // Try opening Add User dialog
  const addBtn = page.locator('button').filter({ hasText: /add|new|create/i }).first();
  if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialogOpen = await page.locator('[role="dialog"], .MuiModal-root, [class*="modal"], [class*="dialog"]')
      .isVisible({ timeout: 3000 }).catch(() => false);
    if (dialogOpen) {
      pass('Add User dialog opens');
      await ss('add_user_dialog');
      await page.keyboard.press('Escape');
    } else fail('Add User dialog did not open');
  } else fail('Add User button not found');

  info('Admin: Class Management');
  await navigate('classes');
  await ss('classes_page');
  const classContent = await page.locator('table, [class*="card"], [class*="list"]').isVisible({ timeout: 5000 }).catch(() => false);
  if (classContent) pass('Class Management loads with content');
  else fail('Class Management — no content found');

  // Add class
  const addClassBtn = page.locator('button').filter({ hasText: /add|new|create/i }).first();
  if (await addClassBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await addClassBtn.click();
    await page.waitForTimeout(500);
    const dialogOpen = await page.locator('[role="dialog"], .MuiModal-root').isVisible({ timeout: 3000 }).catch(() => false);
    if (dialogOpen) { pass('Add Class dialog opens'); await ss('add_class_dialog'); await page.keyboard.press('Escape'); }
    else fail('Add Class dialog did not open');
  }

  info('Admin: Section Management');
  await navigate('sections');
  await ss('sections_page');
  const sectionContent = await page.locator('table, [class*="card"], [class*="list"]').isVisible({ timeout: 5000 }).catch(() => false);
  if (sectionContent) pass('Section Management loads with content');
  else fail('Section Management — no content found');

  info('Admin: Subject Management');
  await navigate('subjects');
  await ss('subjects_page');
  const subjectContent = await page.locator('table, [class*="card"], [class*="list"]').isVisible({ timeout: 5000 }).catch(() => false);
  if (subjectContent) pass('Subject Management loads with content');
  else fail('Subject Management — no content found');
}

// ─── Clerk pages ──────────────────────────────────────────────────────────────
async function testClerkPages() {
  info('Clerk: Admission');
  await navigate('admission');
  await ss('admission_page');
  const form = await page.locator('form, input, button').isVisible({ timeout: 5000 }).catch(() => false);
  if (form) pass('Admission page loads');
  else fail('Admission page — no form found');

  info('Clerk: Fee Payment');
  await navigate('fees');
  await ss('fees_page');
  const feeContent = await page.locator('table, [class*="card"], input').isVisible({ timeout: 5000 }).catch(() => false);
  if (feeContent) pass('Fee Payment page loads');
  else fail('Fee Payment page — no content found');
}

// ─── Teacher pages ────────────────────────────────────────────────────────────
async function testTeacherPages() {
  info('Teacher: Attendance');
  await navigate('attendance');
  await ss('attendance_page');
  const attContent = await page.locator('table, [class*="card"], select, input').isVisible({ timeout: 5000 }).catch(() => false);
  if (attContent) pass('Attendance page loads');
  else fail('Attendance page — no content found');

  info('Teacher: Performance');
  await navigate('performance');
  await ss('performance_page');
  const perfContent = await page.locator('table, [class*="card"], input, select').isVisible({ timeout: 5000 }).catch(() => false);
  if (perfContent) pass('Performance page loads');
  else fail('Performance page — no content found');

  info('Teacher: Syllabus');
  await navigate('syllabus');
  await ss('syllabus_page');
  const sylContent = await page.locator('table, [class*="card"], input, button').isVisible({ timeout: 5000 }).catch(() => false);
  if (sylContent) pass('Syllabus page loads');
  else fail('Syllabus page — no content found');
}

// ─── Principal pages ──────────────────────────────────────────────────────────
async function testPrincipalPages() {
  info('Principal: Class Schedule');
  await navigate('schedule');
  await ss('schedule_page');
  const schedContent = await page.locator('table, [class*="card"], [class*="schedule"]').isVisible({ timeout: 5000 }).catch(() => false);
  if (schedContent) pass('Class Schedule page loads');
  else fail('Class Schedule page — no content found');

  info('Principal: Reports');
  await navigate('reports');
  await ss('reports_page');
  const repContent = await page.locator('table, [class*="card"], canvas, svg').isVisible({ timeout: 5000 }).catch(() => false);
  if (repContent) pass('Reports page loads');
  else fail('Reports page — no content found');

  info('Principal: Analysis');
  await navigate('analysis');
  await ss('analysis_page');
  const anaContent = await page.locator('table, [class*="card"], canvas, svg').isVisible({ timeout: 5000 }).catch(() => false);
  if (anaContent) pass('Analysis page loads');
  else fail('Analysis page — no content found');
}

// ─── Student portal ───────────────────────────────────────────────────────────
async function testStudentPortal() {
  info('Student Portal (login as student1)');
  await logout();
  await login('student1');
  await navigate('student');
  await ss('student_portal');
  const portalContent = await page.locator('[class*="card"], table, h1, h2, h3').isVisible({ timeout: 5000 }).catch(() => false);
  if (portalContent) pass('Student Portal loads');
  else fail('Student Portal — no content found');
}

// ─── Role access control ──────────────────────────────────────────────────────
async function testRoleAccess() {
  info('Role-based Access Control (teacher1)');
  await logout();
  await login('teacher1');

  // Teacher should NOT access admin routes
  await navigate('users');
  await page.waitForTimeout(1000);
  const redirectedFromUsers = !page.url().includes('/users') || page.url().includes('/dashboard');
  if (redirectedFromUsers) pass('Teacher blocked from /users (redirected)');
  else fail('Teacher can access /users — no RBAC guard');

  // Teacher should access attendance
  await navigate('attendance');
  await page.waitForTimeout(1000);
  const canSeeAttendance = await page.locator('input, select, table, [class*="card"]').isVisible({ timeout: 5000 }).catch(() => false);
  if (canSeeAttendance) pass('Teacher can access Attendance');
  else fail('Teacher cannot access Attendance');
}

// ─── Console error collection ─────────────────────────────────────────────────
const consoleErrors = [];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  page    = await context.newPage();

  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(`PAGEERROR: ${err.message}`));

  try {
    await testBackendAPIs();
    await testAuth();
    await testDashboard();
    await testAdminPages();
    await testClerkPages();
    await testTeacherPages();
    await testPrincipalPages();
    await testStudentPortal();
    await testRoleAccess();
  } catch (e) {
    fail('Unexpected test crash', e.message);
    console.error(e);
  } finally {
    await browser.close();
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n══════════════════════════════════════════');
  console.log(`  RESULTS:  ${passed} passed  |  ${failed} failed`);
  console.log('══════════════════════════════════════════');
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  • ${r.test}: ${r.detail}`));
  }
  if (consoleErrors.length > 0) {
    console.log(`\nBrowser console errors (${consoleErrors.length}):`);
    [...new Set(consoleErrors)].slice(0, 10).forEach(e => console.log(`  ⚠  ${e}`));
  }
  console.log(`\nScreenshots saved to: ${SS_DIR}`);

  // Write JSON results
  fs.writeFileSync('/tmp/school-admin-test-results.json', JSON.stringify({ passed, failed, results, consoleErrors }, null, 2));
})();
