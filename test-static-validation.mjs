import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const signup = readFileSync('./signup-patient.html', 'utf8');
assert.match(signup, /<input type="month" id="s_dob"[^>]*min="1900-01"[^>]*required/);
assert.match(signup, /dobInput\.max = currentMonth/);
assert.match(signup, /function validateBirthMonth\(value\)/);
assert.match(signup, /if \(!value\) throw "생년월을 선택하세요\."/);
assert.match(signup, /if \(year < 1900 \|\| year > now\.getFullYear\(\)\)/);
assert.match(signup, /if \(value > currentMonth\) throw "미래 생년월은 선택할 수 없습니다\."/);
assert.match(signup, /const dob = validateBirthMonth\(\$\("s_dob"\)\.value\);/);

const workflow = readFileSync('./.github/workflows/deploy-pages.yml', 'utf8');
assert.match(workflow, /name: Inject runtime config/);
assert.match(workflow, /VITE_SUPABASE_ANON_KEY: \$\{\{ secrets\.SUPABASE_ANON_KEY \}\}/);
assert.match(workflow, /ADMIN_EMAIL: \$\{\{ secrets\.ADMIN_EMAIL \}\}/);

console.log('static validation tests passed');
