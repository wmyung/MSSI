import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const index = readFileSync('./index.html', 'utf8');
assert.match(index, /login\.html\?role=patient/);

const login = readFileSync('./login.html', 'utf8');
assert.match(login, /urlRole.*new URLSearchParams\(location\.search\)\.get\("role"\)/s);
assert.match(login, /if \(b\.dataset\.role !== urlRole\) b\.style\.display = "none";/);
assert.match(login, /patient: "respondent\.html"/);
assert.match(login, /doctor: "doctor\.html"/);
assert.match(login, /admin: "admin\.html"/);

console.log('entrypoint tests passed');
