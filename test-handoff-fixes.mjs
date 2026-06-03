import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const questions = readFileSync('./questions.js', 'utf8');
for (const label of ['0. 전혀', '1. 조금', '2. 상당히', '3. 심하게']) {
  assert.match(questions, new RegExp(`l: "${label}"`));
}
assert.doesNotMatch(questions, /전혀 느끼지 않았다|조금 느꼈다|상당히 느꼈다|심하게 느꼈다/);

const signup = readFileSync('./signup-patient.html', 'utf8');
assert.match(signup, /const patientNumber = \$\("s_pnum"\)\.value\.trim\(\);/);
assert.match(signup, /if \(patientNumber\) userData\.patient_number = patientNumber;/);
assert.doesNotMatch(signup, /patient_number: \$\("s_pnum"\)\.value\.trim\(\)/);

const respondent = readFileSync('./respondent.html', 'utf8');
assert.doesNotMatch(respondent, /contact_email/);

const app = readFileSync('./app.js', 'utf8');
assert.match(app, /if \(patientNumber\) signUpMeta\.patient_number = patientNumber;/);
assert.doesNotMatch(app, /patient_number: el\("p_pnum"\)\.value\.trim\(\)/);
assert.doesNotMatch(app, /select\("[^"]*contact_email[^"]*"\)/);

const admin = readFileSync('./admin.html', 'utf8');
assert.doesNotMatch(admin, /d\.contact_email/);
assert.match(admin, /escapeHtml\(d\.email\)/);

const hardening = readFileSync('./supabase/hardening.sql', 'utf8');
assert.match(hardening, /DROP CONSTRAINT IF EXISTS/);
assert.match(hardening, /NULLIF\(meta->>'patient_number', ''\)/);
assert.match(hardening, /role = 'doctor'/);

console.log('handoff fix tests passed');
