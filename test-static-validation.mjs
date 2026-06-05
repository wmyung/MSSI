import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const signup = readFileSync('./signup-patient.html', 'utf8');
assert.match(signup, /<input type="month" id="s_dob"[^>]*min="1900-01"[^>]*required/);
assert.match(signup, /dobInput\.max = currentMonth/);
assert.match(signup, /function validateBirthMonth\(value\)/);
assert.match(signup, /if \(!value\) throw "생년월을 선택하세요\."/);
assert.match(signup, /if \(year < 1900 \|\| year > now\.getFullYear\(\)\)/);
assert.match(signup, /if \(value > currentMonth\) throw "미래 생년월은 선택할 수 없습니다\."/);
assert.match(signup, /const dob = validateBirthMonth\(\$\("s_dob"\)\.value\);/);

const cfg = readFileSync('./config.js', 'utf8');
assert.match(cfg, /export const SUPABASE_URL = ENV\.VITE_SUPABASE_URL \|\| "https:\/\//);
assert.match(cfg, /export const SUPABASE_ANON_KEY = ENV\.VITE_SUPABASE_ANON_KEY \|\| "[^"]{20,}"/);
assert.doesNotMatch(cfg, /YOUR_|REPLACE_ME/);
assert.match(cfg, /export const GOOGLE_SHEETS_WEBHOOK_URL = ENV\.GOOGLE_SHEETS_WEBHOOK_URL \|\| "https:\/\/script\.google\.com\/macros\/s\//);

const respondent = readFileSync('./respondent.html', 'utf8');
assert.match(respondent, /GOOGLE_SHEETS_WEBHOOK_URL/);
assert.match(respondent, /Content-Type": "text\/plain;charset=utf-8"/);
assert.match(respondent, /mode: "no-cors"/);
assert.doesNotMatch(respondent, /<script>[\s\S]*<\/script>[\s\S]*el\("btnPrintResult"\)/);

const doctor = readFileSync('./doctor.html', 'utf8');
assert.match(doctor, /id="userBadge"/);
assert.match(doctor, /login\.html\?role=doctor/);

const admin = readFileSync('./admin.html', 'utf8');
assert.match(admin, /id="userBadge"/);

const workflowExists = existsSync('./.github/workflows/deploy-pages.yml');
if (workflowExists) {
  const workflow = readFileSync('./.github/workflows/deploy-pages.yml', 'utf8');
  assert.match(workflow, /name: Inject runtime config/);
  assert.doesNotMatch(workflow, /VITE_SUPABASE_ANON_KEY|SUPABASE_ANON_KEY: \$\{\{ secrets\.SUPABASE_ANON_KEY \}\}/);
  assert.match(workflow, /ADMIN_EMAIL: \$\{\{ secrets\.ADMIN_EMAIL \}\}/);
}

console.log('static validation tests passed');
