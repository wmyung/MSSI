import assert from 'node:assert/strict';
import { calculateScores } from './scoring.js';

function tempsAnswers(ranges) {
  const answers = {};
  for (const [start, end, count] of ranges) {
    for (let i = start; i <= end; i++) answers[`t${i}`] = i < start + count ? 1 : 0;
  }
  return answers;
}

const scores = calculateScores(tempsAnswers([
  [1, 12, 11],
  [13, 20, 5],
  [21, 28, 5],
  [29, 36, 7],
  [37, 39, 3],
]));

assert.deepEqual(scores.TEMPS, { cyc: 11, dep: 5, irr: 5, hyp: 7, anx: 3 });
console.log('scoring tests passed');
