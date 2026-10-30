/* Pure Pixel Rush rules shared by the browser game and automated tests. */
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PixelRushCore = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  'use strict';

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const comboMultiplier = combo => clamp(1 + Math.floor(Math.max(0, combo) / 3), 1, 5);
  const coinAward = (base, combo) => Math.max(0, Math.round(base)) * comboMultiplier(combo);
  const difficultyGap = ({ baseGap, speedFactor, phase, restBeat = false }) =>
    Math.max(.9, baseGap - clamp(speedFactor, 0, 1) * .13 - clamp(phase, 0, 3) * .025) + (restBeat ? .48 : 0);
  const rectsOverlap = (a, b, margin = 0) =>
    a.x + margin < b.x + b.w && a.x + a.w - margin > b.x && a.y + margin < b.y + b.h && a.y + a.h - margin > b.y;

  return Object.freeze({ clamp, comboMultiplier, coinAward, difficultyGap, rectsOverlap });
});
