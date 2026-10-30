'use strict';

const assert = require('node:assert/strict');
const core = require('../game-core.js');

assert.equal(core.comboMultiplier(0), 1);
assert.equal(core.comboMultiplier(3), 2);
assert.equal(core.comboMultiplier(99), 5);
assert.equal(core.coinAward(50, 6), 150);
assert.equal(core.difficultyGap({ baseGap: 1.45, speedFactor: 1, phase: 3 }).toFixed(3), '1.245');
assert.ok(core.difficultyGap({ baseGap: 1.45, speedFactor: 1, phase: 3, restBeat: true }) > 1.7);
assert.equal(core.rectsOverlap({ x: 0, y: 0, w: 20, h: 20 }, { x: 15, y: 5, w: 20, h: 20 }), true);
assert.equal(core.rectsOverlap({ x: 0, y: 0, w: 20, h: 20 }, { x: 25, y: 5, w: 20, h: 20 }), false);

console.log('Pixel Rush core tests passed.');
