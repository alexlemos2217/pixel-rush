/*
 * PIXEL RUSH — Neon Runner
 * Juego original para navegador, sin librerías ni archivos externos.
 * Autor: Alexander Lemos — https://github.com/alexlemos2217
 */
(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const Core = window.PixelRushCore;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.getElementById('overlay-title').textContent = 'CANVAS NO DISPONIBLE';
    document.getElementById('overlay-description').textContent = 'Probá con una versión actualizada de tu navegador.';
    document.getElementById('primary-action').disabled = true;
    return;
  }

  const $ = id => document.getElementById(id);
  const WIDTH_LIMIT = 1200;
  const HEIGHT = 560;
  const FLOOR = 452;
  const GRAVITY = 2250;
  const JUMP_POWER = -800;
  const LEVEL_LENGTH = 4400;
  const MODES = {
    chill: { name: 'ZEN', speed: 315, maxSpeed: 490, acceleration: 1.8, hearts: 4, gap: 1.75, coinBonus: 50 },
    normal: { name: 'ARCADE', speed: 388, maxSpeed: 690, acceleration: 2.85, hearts: 3, gap: 1.45, coinBonus: 50 },
    hard: { name: 'TURBO', speed: 475, maxSpeed: 825, acceleration: 4.2, hearts: 2, gap: 1.22, coinBonus: 75 }
  };
  const DISTRICTS = [
    { name: 'DISTRITO AURORA', top: '#101c3c', bottom: '#512b66', skyline: '#202852', mid: '#26335e', accent: '#ffad9e', sun: '#f77fba' },
    { name: 'DISTRITO SYNTH', top: '#0d1e39', bottom: '#19515b', skyline: '#0d344d', mid: '#1a5465', accent: '#79f5ea', sun: '#7ce9eb' },
    { name: 'DISTRITO NEÓN', top: '#1e1745', bottom: '#63355f', skyline: '#392151', mid: '#543259', accent: '#e6a5ff', sun: '#bf87fe' },
    { name: 'DISTRITO SOLAR', top: '#291d40', bottom: '#85504c', skyline: '#503359', mid: '#6e4261', accent: '#ffe18e', sun: '#ffc17c' }
  ];

  const ui = {
    overlay: $('overlay'), title: $('overlay-title'), description: $('overlay-description'),
    chip: $('overlay-chip'), primary: $('primary-action'), primaryText: $('primary-text'),
    secondary: $('secondary-action'), hint: $('overlay-hint'), status: $('game-status'),
    score: $('score'), coins: $('coins'), combo: $('combo'), lives: $('lives'), speed: $('speed'),
    best: $('best-score'), ranking: $('rank-list'), district: $('district-name'),
    districtLabel: $('district-label'), progress: $('progress-fill'),
    percent: $('progress-percent'), sound: $('sound-button'), soundIcon: $('sound-icon'),
    pause: $('pause-button'), pauseIcon: $('pause-icon'), message: $('toolbar-label'),
    tertiary: $('tertiary-action'), detail: $('overlay-detail'), volume: $('volume-control'),
    effects: $('effects-control'), statRuns: $('stat-runs'), statDistance: $('stat-distance'),
    statCoins: $('stat-coins'), statCombo: $('stat-combo')
  };

  const storageKey = 'alexlemos_pixel_rush_v2';
  const legacyStorageKey = 'alexlemos_pixel_rush_v1';
  const defaultSave = () => ({
    version: 2, best: 0, scores: [], muted: false, volume: .65, reducedFx: false,
    stats: { runs: 0, distance: 0, coins: 0, playTime: 0, bestCombo: 1 }, achievements: []
  });
  function loadSave() {
    try {
      const raw = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey) || '{}';
      const value = JSON.parse(raw);
      const base = defaultSave();
      return {
        ...base, ...value, version: 2,
        best: Math.max(0, Number(value.best) || 0),
        scores: Array.isArray(value.scores) ? value.scores.filter(s => Number.isFinite(s.score)).slice(0, 10) : [],
        volume: Math.max(0, Math.min(1, Number(value.volume ?? .65))),
        stats: { ...base.stats, ...(value.stats || {}) },
        achievements: Array.isArray(value.achievements) ? value.achievements.filter(a => typeof a === 'string') : []
      };
    } catch (_) { return defaultSave(); }
  }
  const saved = loadSave();
  function saveProgress() {
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch (_) { /* Navegación privada: la sesión sigue funcionando. */ }
  }

  let viewWidth = WIDTH_LIMIT;
  let mode = 'normal';
  let phase = 'ready';
  let lastFrame = 0;
  let elapsed = 0;
  let distance = 0;
  let coinsCount = 0;
  let bonusPoints = 0;
  let hearts = MODES.normal.hearts;
  let spawnTimer = 1.35;
  let coinTimer = .9;
  let shieldTimer = 12;
  let invulnerable = 0;
  let shield = 0;
  let shake = 0;
  let score = 0;
  let combo = 0;
  let comboTimer = 0;
  let bestRunCombo = 1;
  let coyoteTimer = 0;
  let jumpBuffer = 0;
  let accumulator = 0;
  let runNewRecord = false;
  let obstacles = [];
  let pickups = [];
  let particles = [];
  let floatTexts = [];
  let frameTime = 0;
  let soundContext = null;
  let slideHeld = false;
  let jumpHeld = false;
  let lastHudKey = '';
  const systemReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduceMotionActive = () => systemReduceMotion || saved.reducedFx;

  const player = { x: 165, y: FLOOR - 75, w: 56, h: 75, vy: 0, jumps: 0, slide: 0, grounded: true };
  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = Core.clamp;
  const pad = (v, len) => String(v).padStart(len, '0');
  const districtIndex = () => Math.floor(distance / LEVEL_LENGTH);
  const currentSpeed = () => Math.min(MODES[mode].maxSpeed, MODES[mode].speed + elapsed * MODES[mode].acceleration);

  function resize() {
    const box = $('canvas-wrap').getBoundingClientRect();
    viewWidth = Math.round(clamp(HEIGHT * (box.width / Math.max(box.height, 1)), 625, WIDTH_LIMIT));
    canvas.width = viewWidth;
    canvas.height = HEIGHT;
    player.x = Math.round(clamp(viewWidth * .146, 115, 172));
    ctx.imageSmoothingEnabled = true;
    draw();
  }

  // Web Audio: efectos cortos sintetizados. No requiere mp3 de terceros.
  function tone(freq, endFreq, duration, type = 'sine', volume = .065, delay = 0) {
    if (saved.muted) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      if (!soundContext) soundContext = new Audio();
      if (soundContext.state === 'suspended') soundContext.resume().catch(() => {});
      const t = soundContext.currentTime + delay;
      const oscillator = soundContext.createOscillator();
      const gain = soundContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(Math.max(40, freq), t);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t + duration);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001, volume * saved.volume), t + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
      oscillator.connect(gain).connect(soundContext.destination);
      oscillator.start(t);
      oscillator.stop(t + duration + .015);
    } catch (_) { /* Audio desactivado por el navegador. */ }
  }
  function playSound(name) {
    if (name === 'jump') tone(400, 710, .17, 'square', .018);
    if (name === 'double') { tone(510, 960, .15, 'triangle', .055); tone(760, 1100, .12, 'triangle', .04, .075); }
    if (name === 'coin') { tone(710, 1010, .12, 'sine', .07); tone(1060, 1360, .16, 'sine', .04, .075); }
    if (name === 'shield') { tone(350, 900, .33, 'triangle', .05); tone(560, 1250, .36, 'sine', .045, .11); }
    if (name === 'hit') { tone(190, 65, .32, 'sawtooth', .045); }
    if (name === 'end') { [330, 250, 180].forEach((f, i) => tone(f, f * .76, .3, 'triangle', .045, i * .19)); }
    if (name === 'start') { [440, 660, 880].forEach((f, i) => tone(f, f * 1.05, .11, 'sine', .042, i * .09)); }
    if (name === 'combo') { tone(860, 1280, .12, 'triangle', .045); }
    if (name === 'record') { [660, 880, 1100, 1320].forEach((f, i) => tone(f, f * 1.04, .16, 'sine', .045, i * .08)); }
    if (name === 'achievement') { tone(520, 1040, .25, 'triangle', .05); tone(780, 1560, .3, 'sine', .035, .12); }
  }

  function resetGame() {
    elapsed = 0; distance = 0; coinsCount = 0; bonusPoints = 0; score = 0;
    combo = 0; comboTimer = 0; bestRunCombo = 1; coyoteTimer = 0; jumpBuffer = 0; accumulator = 0; runNewRecord = false;
    hearts = MODES[mode].hearts; spawnTimer = 1.35; coinTimer = 1.5; shieldTimer = 13;
    obstacles = []; pickups = []; particles = []; floatTexts = [];
    invulnerable = 0; shield = 0; shake = 0; slideHeld = false;
    Object.assign(player, { y: FLOOR - 75, h: 75, vy: 0, jumps: 0, slide: 0, grounded: true });
    lastHudKey = '';
    syncHud(true);
  }

  function setOverlay(type) {
    phase = type;
    if (type === 'playing') {
      ui.overlay.classList.add('is-hidden');
      ui.status.textContent = 'EN PARTIDA';
      ui.pauseIcon.textContent = 'Ⅱ';
    } else {
      ui.overlay.classList.remove('is-hidden');
      const overlays = {
        ready: ['✦  BIENVENIDO A NEON CITY', '¿LISTO PARA<br><em>LA CARRERA?</em>', 'Encadená monedas y esquives para subir el combo.<br>La ciudad acelera mientras jugás.', 'INICIAR PARTIDA', 'CÓMO JUGAR', 'PROGRESO', 'ENTER O ESPACIO PARA EMPEZAR'],
        paused: ['Ⅱ  PARTIDA EN PAUSA', 'HACEMOS<br><em>UN RESPIRO.</em>', 'La simulación está detenida.<br>Tu progreso está a salvo.', 'CONTINUAR', 'REINICIAR', 'MENÚ PRINCIPAL', 'P O ESC PARA CONTINUAR'],
        over: [runNewRecord ? '★  NUEVO RÉCORD' : '✦  FIN DE LA PARTIDA', runNewRecord ? 'NUEVA MARCA,<br><em>NUEVO OBJETIVO.</em>' : 'OTRA VUELTA,<br><em>OTRO RÉCORD.</em>', `<strong>${score.toLocaleString('es-UY')}</strong> puntos · ${Math.floor(distance / 10)} m · ${coinsCount} monedas<br>Mejor combo: <strong>×${bestRunCombo}</strong>`, 'VOLVER A JUGAR', 'MENÚ PRINCIPAL', 'PROGRESO', 'ENTER PARA REINTENTAR'],
        help: ['◈  CONTROLES', 'CADA SALTO<br><em>CUENTA.</em>', 'ESPACIO o ↑: salto y doble salto.<br>↓ o S: deslizarte. P o ESC: pausa.<br>Monedas y esquives mantienen el combo.', 'ENTENDIDO', '', '', 'TECLADO, TÁCTIL O MOUSE'],
        progress: ['◎  PROGRESO LOCAL', 'TU HISTORIA<br><em>EN NEON CITY.</em>', '', 'VOLVER', '', '', 'GUARDADO EN ESTE NAVEGADOR']
      };
      const config = overlays[type];
      ui.chip.textContent = config[0];
      ui.title.innerHTML = config[1];
      ui.description.innerHTML = config[2];
      ui.primaryText.textContent = config[3];
      ui.secondary.firstChild.textContent = config[4] + ' ';
      ui.secondary.hidden = !config[4];
      ui.tertiary.firstChild.textContent = config[5] + ' ';
      ui.tertiary.hidden = !config[5];
      ui.hint.textContent = config[6];
      ui.detail.hidden = type !== 'progress';
      if (type === 'progress') renderProgressDetail();
      ui.status.textContent = { ready: 'LISTO PARA JUGAR', paused: 'EN PAUSA', over: 'PARTIDA TERMINADA', help: 'INSTRUCCIONES', progress: 'PROGRESO LOCAL' }[type];
      ui.pauseIcon.textContent = type === 'paused' ? '▶' : 'Ⅱ';
    }
    document.querySelectorAll('[data-mode]').forEach(b => { b.disabled = type === 'playing' || type === 'paused'; });
    ui.pause.disabled = type === 'ready' || type === 'over' || type === 'help' || type === 'progress';
    ui.message.textContent = { ready: 'UNA PARTIDA MÁS. SIEMPRE.', playing: 'SEGUÍ CORRIENDO.', paused: 'TOMÁ TU TIEMPO.', over: '¿VAMOS POR LA REVANCHA?', help: 'APRENDÉ LOS MOVIMIENTOS.', progress: 'TU CAMINO QUEDA GUARDADO.' }[type];
  }

  function startGame() { resetGame(); setOverlay('playing'); lastFrame = performance.now(); playSound('start'); canvas.focus({ preventScroll: true }); }
  function resumeGame() { setOverlay('playing'); lastFrame = performance.now(); canvas.focus({ preventScroll: true }); }
  function pauseGame() { if (phase === 'playing') { setOverlay('paused'); slideHeld = false; } else if (phase === 'paused') resumeGame(); }
  const ACHIEVEMENTS = [
    { id: 'first-run', icon: '▶', title: 'Primer impulso', text: 'Completá tu primera partida.', check: () => saved.stats.runs >= 1 },
    { id: 'coin-hunter', icon: '✦', title: 'Cazador de luz', text: 'Recolectá 50 monedas en total.', check: () => saved.stats.coins >= 50 },
    { id: 'combo-5', icon: '×5', title: 'En la zona', text: 'Alcanzá un combo de ×5.', check: () => saved.stats.bestCombo >= 5 },
    { id: 'distance-5k', icon: '→', title: 'Sin mirar atrás', text: 'Recorré 5.000 metros acumulados.', check: () => saved.stats.distance >= 5000 },
    { id: 'score-5k', icon: '★', title: 'Señal intensa', text: 'Superá 5.000 puntos en una partida.', check: () => saved.best >= 5000 }
  ];
  function unlockAchievements() {
    ACHIEVEMENTS.forEach(item => {
      if (!saved.achievements.includes(item.id) && item.check()) {
        saved.achievements.push(item.id);
        floating(viewWidth / 2, 105, 'LOGRO: ' + item.title.toUpperCase(), '#d0ff65');
        playSound('achievement');
      }
    });
  }
  function renderProgressDetail() {
    const unlocked = new Set(saved.achievements);
    ui.detail.innerHTML = `<div class="progress-summary"><span><b>${saved.stats.runs}</b> partidas</span><span><b>${Math.floor(saved.stats.distance)}</b> m</span><span><b>${saved.stats.coins}</b> monedas</span></div><div class="achievement-list">${ACHIEVEMENTS.map(a => `<div class="achievement ${unlocked.has(a.id) ? 'is-unlocked' : ''}"><strong>${a.icon} ${a.title}</strong><small>${a.text}</small></div>`).join('')}</div>`;
  }
  function syncCareer() {
    ui.statRuns.textContent = saved.stats.runs;
    ui.statDistance.textContent = Math.floor(saved.stats.distance);
    ui.statCoins.textContent = saved.stats.coins;
    ui.statCombo.textContent = '×' + saved.stats.bestCombo;
  }
  function endGame() {
    if (phase !== 'playing') return;
    playSound('end');
    runNewRecord = score > saved.best;
    if (runNewRecord) { saved.best = score; setTimeout(() => playSound('record'), 420); }
    saved.stats.runs++;
    saved.stats.distance += Math.floor(distance / 10);
    saved.stats.coins += coinsCount;
    saved.stats.playTime += Math.floor(elapsed);
    saved.stats.bestCombo = Math.max(saved.stats.bestCombo, bestRunCombo);
    saved.scores.push({ score, mode: MODES[mode].name, distance: Math.floor(distance / 10), combo: bestRunCombo });
    saved.scores.sort((a, b) => b.score - a.score);
    saved.scores = saved.scores.slice(0, 10);
    unlockAchievements();
    saveProgress();
    renderRanking();
    syncCareer();
    syncHud(true);
    setOverlay('over');
  }

  function executeJump() {
    const canFirstJump = player.grounded || coyoteTimer > 0;
    if (!canFirstJump && player.jumps >= 2) return false;
    if (canFirstJump) player.jumps = 0;
    if (player.grounded && player.slide > 0) { player.slide = 0; player.h = 75; player.y = FLOOR - 75; }
    player.vy = player.jumps === 0 ? JUMP_POWER : -720;
    player.grounded = false;
    coyoteTimer = 0;
    player.jumps++;
    burst(player.x + 28, player.y + player.h, '#a9fbff', 8, 160);
    playSound(player.jumps === 1 ? 'jump' : 'double');
    return true;
  }
  function jump() {
    if (phase === 'ready' || phase === 'over') return startGame();
    if (phase !== 'playing') return;
    if (!executeJump()) jumpBuffer = .12;
  }
  function slide() {
    if (phase === 'playing' && player.grounded) { player.slide = .65; playSound('jump'); }
  }

  const rectsOverlap = Core.rectsOverlap;
  function playerHitbox() { return { x: player.x + 11, y: player.y + 7, w: player.w - 18, h: player.h - 12 }; }
  function playerCollectBox() { return { x: player.x - 3, y: player.y - 7, w: player.w + 6, h: player.h + 14 }; }

  function spawnObstacle() {
    const kinds = ['crate', 'spikes'];
    if (elapsed > 6) kinds.push('drone');
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const dimensions = {
      crate: { w: 57, h: 62, y: FLOOR - 62 },
      spikes: { w: 73, h: 43, y: FLOOR - 43 },
      drone: { w: 78, h: 57, y: FLOOR - 121 }
    }[kind];
    obstacles.push({ kind, ...dimensions, x: viewWidth + 70, wobble: rand(0, Math.PI * 2), passed: false });
    if (Math.random() < .77) {
      const count = Math.floor(rand(2, 5));
      for (let i = 0; i < count; i++) {
        pickups.push({ kind: 'coin', x: viewWidth + 160 + i * 49, y: FLOOR - (kind === 'drone' ? 209 : 148) - Math.sin(i / count * Math.PI) * 23, r: 15, phase: rand(0, 6.3) });
      }
    }
  }
  function spawnCoins() {
    const count = Math.floor(rand(3, 6));
    for (let i = 0; i < count; i++) {
      pickups.push({ kind: 'coin', x: viewWidth + 65 + i * 52, y: FLOOR - 119 - Math.sin((i / Math.max(1, count - 1)) * Math.PI) * 48, r: 15, phase: rand(0, 6.3) });
    }
  }
  function burst(x, y, color, count, energy = 170) {
    if (reduceMotionActive()) return;
    for (let i = 0; i < count; i++) {
      const angle = rand(-Math.PI, Math.PI);
      const velocity = rand(energy * .25, energy);
      particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, size: rand(2, 6), life: rand(.2, .65), age: 0, color });
    }
  }
  function floating(x, y, text, color) { floatTexts.push({ x, y, text, color, age: 0 }); }

  function syncHud(force = false) {
    const currentDistrict = districtIndex();
    const progress = distance % LEVEL_LENGTH / LEVEL_LENGTH;
    const multiplier = Core.comboMultiplier(combo);
    const key = [score, coinsCount, combo, hearts, Math.round(currentSpeed() / MODES[mode].speed * 10), currentDistrict, Math.floor(progress * 100), shield > 0 ? 1 : 0].join(':');
    if (!force && key === lastHudKey) return;
    lastHudKey = key;
    ui.score.textContent = pad(score, 6);
    ui.coins.textContent = pad(coinsCount, 2);
    ui.combo.textContent = '×' + multiplier;
    ui.combo.classList.toggle('is-hot', multiplier >= 3);
    ui.lives.textContent = '♥ '.repeat(hearts).trim() + (shield > 0 ? ' ⛨' : '');
    ui.lives.setAttribute('aria-label', hearts + ' vidas' + (shield > 0 ? ' y escudo' : ''));
    ui.speed.textContent = (currentSpeed() / MODES[mode].speed).toFixed(1) + 'x';
    ui.best.textContent = pad(Math.max(score, saved.best), 6);
    ui.district.textContent = DISTRICTS[currentDistrict % DISTRICTS.length].name;
    ui.districtLabel.textContent = 'DISTRITO ' + pad(currentDistrict + 1, 2);
    ui.progress.style.width = Math.floor(progress * 100) + '%';
    ui.percent.textContent = Math.floor(progress * 100) + '%';
  }

  function update(dt) {
    elapsed += dt;
    const velocity = currentSpeed();
    const prevDistrict = districtIndex();
    distance += velocity * dt;
    if (prevDistrict !== districtIndex()) {
      floating(viewWidth / 2, 130, 'NUEVO DISTRITO', '#d0ff65');
      playSound('shield');
    }
    score = Math.floor(distance / 8) + bonusPoints;
    invulnerable = Math.max(0, invulnerable - dt);
    shield = Math.max(0, shield - dt);
    shake = Math.max(0, shake - dt);
    coyoteTimer = player.grounded ? .1 : Math.max(0, coyoteTimer - dt);
    jumpBuffer = Math.max(0, jumpBuffer - dt);
    comboTimer = Math.max(0, comboTimer - dt);
    if (comboTimer === 0 && combo > 0) combo = 0;
    player.slide = Math.max(0, player.slide - dt);
    const oldHeight = player.h;
    player.h = player.grounded && (player.slide > 0 || slideHeld) ? 44 : 75;
    if (player.grounded) player.y = FLOOR - player.h;
    else player.y -= player.h - oldHeight;
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    if (player.y >= FLOOR - player.h) {
      if (!player.grounded && player.vy > 0) burst(player.x + 26, FLOOR - 3, '#82d6ff', 5, 70);
      player.y = FLOOR - player.h;
      player.vy = 0;
      player.jumps = 0;
      player.grounded = true;
      if (jumpBuffer > 0) { jumpBuffer = 0; executeJump(); }
    }

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnObstacle();
      const speedFactor = (velocity - MODES[mode].speed) / (MODES[mode].maxSpeed - MODES[mode].speed || 1);
      const phaseIndex = Math.min(3, Math.floor(elapsed / 28));
      const restBeat = Math.floor(elapsed) % 24 > 20 ? .48 : 0;
      spawnTimer = Core.difficultyGap({ baseGap: MODES[mode].gap, speedFactor, phase: phaseIndex, restBeat: restBeat > 0 }) + rand(.03, .28);
    }
    coinTimer -= dt;
    if (coinTimer <= 0) { spawnCoins(); coinTimer = rand(3.2, 5.4); }
    shieldTimer -= dt;
    if (shieldTimer <= 0) {
      pickups.push({ kind: 'shield', x: viewWidth + 100, y: FLOOR - 158, r: 20, phase: 0 });
      shieldTimer = rand(15, 22);
    }

    const hitbox = playerHitbox();
    obstacles.forEach(o => {
      o.x -= velocity * dt;
      o.wobble += dt * 3;
      if (!o.passed && o.x + o.w < player.x) {
        o.passed = true;
        if (!o.hit) {
          combo++;
          comboTimer = 2.6;
          const multiplier = Core.comboMultiplier(combo);
          bestRunCombo = Math.max(bestRunCombo, multiplier);
          bonusPoints += 20 * multiplier;
          if (multiplier > 1) floating(player.x + 55, player.y - 18, `ESQUIVE ×${multiplier}`, '#a9fbff');
          if (combo === 6 || combo === 12) playSound('combo');
        }
      }
      if (invulnerable <= 0 && rectsOverlap(hitbox, { x: o.x, y: o.y, w: o.w, h: o.h }, 5)) {
        o.hit = true;
        if (shield > 0) {
          shield = 0;
          invulnerable = .75;
          floating(player.x + 22, player.y - 17, 'ESCUDO', '#80e8ff');
          burst(player.x + player.w / 2, player.y + player.h / 2, '#83f3ff', 16, 230);
          playSound('shield');
        } else {
          hearts--;
          combo = 0;
          comboTimer = 0;
          invulnerable = 1.25;
          shake = .25;
          burst(player.x + 30, player.y + 35, '#ff7199', 19, 240);
          playSound('hit');
          if (hearts <= 0) endGame();
        }
      }
    });
    obstacles = obstacles.filter(o => o.x > -100);

    pickups.forEach(item => {
      item.x -= velocity * dt;
      item.phase += dt * 6;
      if (!item.collected && rectsOverlap(playerCollectBox(), { x: item.x - item.r, y: item.y - item.r, w: item.r * 2, h: item.r * 2 })) {
        item.collected = true;
        burst(item.x, item.y, item.kind === 'coin' ? '#ffd575' : '#81ecff', 10, 150);
        if (item.kind === 'coin') {
          coinsCount++;
          combo++;
          comboTimer = 2.6;
          const multiplier = Core.comboMultiplier(combo);
          bestRunCombo = Math.max(bestRunCombo, multiplier);
          const award = Core.coinAward(MODES[mode].coinBonus, combo);
          bonusPoints += award;
          floating(item.x, item.y - 15, `+${award}${multiplier > 1 ? ` ×${multiplier}` : ''}`, '#ffdf8c');
          if (combo === 6 || combo === 12) playSound('combo');
          playSound('coin');
        } else {
          shield = 8;
          floating(item.x, item.y - 20, '¡ESCUDO!', '#91eaff');
          playSound('shield');
        }
      }
    });
    pickups = pickups.filter(item => item.x > -60 && !item.collected);
    particles.forEach(p => { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 240 * dt; });
    particles = particles.filter(p => p.age < p.life);
    floatTexts.forEach(p => { p.age += dt; p.y -= 26 * dt; });
    floatTexts = floatTexts.filter(p => p.age < .95);
    syncHud();
  }

  function roundedRect(x, y, w, h, r, fill, stroke, lineWidth = 1) {
    if (w <= 0 || h <= 0) return;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }
  function polygon(points, fill) {
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for (let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  }
  function seeded(index) {
    let v = (index * 43758.5453) % 997.37;
    return v - Math.floor(v);
  }
  function buildings(row, palette, parallax, baseline, opacity = 1) {
    const offset = (distance * parallax) % 105;
    ctx.globalAlpha = opacity;
    for (let i = -2; i < Math.ceil(viewWidth / 75) + 3; i++) {
      const id = i + Math.floor(distance * parallax / 105);
      const s = seeded(id + row * 111 + 765);
      const h = 85 + s * (row ? 162 : 105);
      const w = 52 + seeded(id + row * 122 + 17) * 47;
      const x = i * 105 - offset;
      const y = baseline - h;
      ctx.fillStyle = row ? palette.mid : palette.skyline;
      ctx.fillRect(x, y, w, h + 110);
      ctx.fillStyle = row ? '#64bdd033' : '#8faacb24';
      for (let j = 0; j < Math.floor(w / 18); j++) {
        for (let k = 0; k < Math.floor(h / 27); k++) {
          if (seeded(id * 41 + j * 6 + k * 71) > .51) ctx.fillRect(x + 12 + j * 15, y + 13 + k * 24, 5, 7);
        }
      }
      if (seeded(id + 167) > .78) { ctx.fillStyle = palette.accent + 'a0'; ctx.fillRect(x + w / 2, y - 18, 2, 18); }
    }
    ctx.globalAlpha = 1;
  }

  function sky() {
    const palette = DISTRICTS[districtIndex() % DISTRICTS.length];
    const grad = ctx.createLinearGradient(0,0,0,FLOOR);
    grad.addColorStop(0,palette.top); grad.addColorStop(1,palette.bottom);
    ctx.fillStyle = grad; ctx.fillRect(0,0,viewWidth,FLOOR);
    // Estrellas en capas, deterministas para evitar parpadeo.
    for (let i = 0; i < 59; i++) {
      const x = (seeded(i * 17 + 13) * (WIDTH_LIMIT + 150) - (distance * .017 % (WIDTH_LIMIT + 150)) + WIDTH_LIMIT + 150) % (WIDTH_LIMIT + 150);
      const y = 20 + seeded(i * 41 + 19) * 256;
      if (x > viewWidth) continue;
      const r = seeded(i * 13 + 107) > .82 ? 2 : 1;
      ctx.globalAlpha = .25 + seeded(i * 3 + 99) * .49;
      ctx.fillStyle = '#d9edff'; ctx.fillRect(x,y,r,r);
    }
    ctx.globalAlpha = 1;
    // Luna/sól con halo.
    const orbX = viewWidth * .76;
    const orbY = 167;
    const halo = ctx.createRadialGradient(orbX,orbY,30,orbX,orbY,160);
    halo.addColorStop(0,palette.sun + '52'); halo.addColorStop(1,palette.sun + '00');
    ctx.fillStyle = halo;ctx.fillRect(orbX - 160,orbY - 160,320,320);
    ctx.fillStyle = palette.sun;
    ctx.beginPath();ctx.arc(orbX,orbY,62,0,Math.PI*2);ctx.fill();
    ctx.fillStyle = palette.bottom;
    for (let j=0;j<5;j++) ctx.fillRect(orbX-62,orbY+10+j*13,124,3+j*2);
    // Nubes y capas de ciudad.
    for (let i=0;i<6;i++){
      const x = ((i*271 - distance*.035)%(viewWidth+500)+(viewWidth+500))%(viewWidth+500)-160;
      const y = 90+(i%3)*54;
      ctx.fillStyle='#c3d0ee14';roundedRect(x,y,120,15,10,'#c3d0ee13');roundedRect(x+28,y-12,70,22,12,'#c3d0ee12');
    }
    buildings(0,palette,.09,FLOOR-72,.87);
    buildings(1,palette,.2,FLOOR-4,.98);
    // Señales de neón y luces a ras del suelo.
    ctx.fillStyle = palette.accent + '20';ctx.fillRect(0,FLOOR-20,viewWidth,20);
    ctx.font='bold 12px ui-monospace,monospace';ctx.fillStyle='#c9e3ff77';
    ctx.fillText('N E O N  C I T Y  //  0' + (districtIndex()+1),28,39);
    ctx.textAlign='right';ctx.fillStyle=palette.accent+'b8';ctx.fillText('KEEP MOVING   →',viewWidth-28,39);ctx.textAlign='left';
    // Piso técnico con cuadrícula y sensación de movimiento.
    ctx.fillStyle='#10182c';ctx.fillRect(0,FLOOR,viewWidth,HEIGHT-FLOOR);
    ctx.fillStyle=palette.accent;ctx.fillRect(0,FLOOR,viewWidth,4);
    const pavement = (distance * .85) % 75;
    ctx.fillStyle='#273451';
    for(let x=-75-pavement;x<viewWidth+80;x+=75){ctx.fillRect(x,FLOOR+30,2,8);ctx.fillRect(x+15,FLOOR+65,36,3)}
    ctx.fillStyle='#ffffff10';ctx.fillRect(0,FLOOR+52,viewWidth,1);
    ctx.fillStyle='#080d1f';ctx.fillRect(0,HEIGHT-14,viewWidth,14);
  }

  function drawCoin(item) {
    const wobble = Math.sin(item.phase);
    const radius = item.r;
    const scale = .68 + Math.abs(wobble) * .32;
    ctx.save();ctx.translate(item.x,item.y);ctx.scale(scale,1);
    ctx.shadowBlur=20;ctx.shadowColor='#ffc963';
    ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fillStyle='#ffc958';ctx.fill();
    ctx.shadowBlur=0;ctx.strokeStyle='#fff0ae';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#ae7225';ctx.font='bold 20px ui-monospace,monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',0,0);ctx.restore();
  }
  function drawShield(item) {
    ctx.save();ctx.translate(item.x,item.y);ctx.rotate(Math.sin(item.phase)*.13);
    ctx.shadowBlur=24;ctx.shadowColor='#6eeeff';
    polygon([[0,-20],[18,-11],[15,11],[0,23],[-15,11],[-18,-11]],'#6ee8f6');
    ctx.shadowBlur=0;polygon([[0,-15],[13,-8],[11,8],[0,17],[-11,8],[-13,-8]],'#194d7c');
    ctx.fillStyle='#dcffff';ctx.font='bold 23px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText('✦',0,8);ctx.restore();
  }
  function drawCrate(o) {
    ctx.save();ctx.translate(o.x,o.y);
    ctx.shadowColor='#ff8f77';ctx.shadowBlur=12;
    roundedRect(0,0,o.w,o.h,7,'#db735f','#ffb47a',3);
    ctx.shadowBlur=0;roundedRect(7,7,o.w-14,o.h-14,4,'#9e4760','#ffe09b',2);
    ctx.strokeStyle='#f9ab78';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(13,12);ctx.lineTo(o.w-13,o.h-12);ctx.moveTo(o.w-13,12);ctx.lineTo(13,o.h-12);ctx.stroke();
    ctx.fillStyle='#fff1b5';ctx.fillRect(7,7,7,7);ctx.fillRect(o.w-14,o.h-14,7,7);ctx.restore();
  }
  function drawSpikes(o) {
    ctx.save();ctx.translate(o.x,o.y);
    const gap=o.w/3;
    ctx.shadowColor='#f27aaa';ctx.shadowBlur=16;
    for(let i=0;i<3;i++) polygon([[gap*i+2,o.h],[gap*(i+.5),0],[gap*(i+1)-2,o.h]],'#fb7da6');
    ctx.shadowBlur=0;ctx.fillStyle='#ffd2d9';for(let i=0;i<3;i++)polygon([[gap*i+12,o.h-11],[gap*(i+.5),9],[gap*(i+.5)+2,o.h-11]],'#ffd2d9');
    roundedRect(0,o.h-8,o.w,10,3,'#893563');ctx.restore();
  }
  function drawDrone(o) {
    ctx.save();ctx.translate(o.x,o.y+Math.sin(o.wobble)*4);
    ctx.shadowColor='#59d6ff';ctx.shadowBlur=14;
    roundedRect(0,10,o.w,o.h-20,12,'#326190','#8ee5ff',3);ctx.shadowBlur=0;
    roundedRect(14,21,o.w-28,17,5,'#0e203f');
    ctx.fillStyle='#ff8caa';ctx.fillRect(o.w-28,25,15,9);
    ctx.fillStyle='#96f7ff';ctx.fillRect(9,4,14,7);ctx.fillRect(o.w-23,4,14,7);
    ctx.fillStyle='#c9e8ff';ctx.fillRect(13,0,4,10);ctx.fillRect(o.w-17,0,4,10);
    ctx.fillStyle='#ffad92';ctx.fillRect(6,o.h-8,15,9);ctx.fillRect(o.w-21,o.h-8,15,9);ctx.restore();
  }
  function drawRunner() {
    if (invulnerable > 0 && Math.floor(elapsed * 13) % 2 === 0) return;
    const p = player;
    const isSliding = p.h < 75;
    const walk = p.grounded ? Math.sin(elapsed * 19) * 8 : 0;
    ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));
    if (shield > 0) {
      ctx.strokeStyle='#81edff';ctx.lineWidth=4;ctx.shadowBlur=19;ctx.shadowColor='#5feeff';
      ctx.beginPath();ctx.ellipse(p.w/2,p.h/2,p.w*.76,p.h*.7,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
    }
    // Sombra terrestre.
    ctx.fillStyle='#11162760';ctx.beginPath();ctx.ellipse(30,FLOOR-p.y+4,33,8,0,0,Math.PI*2);ctx.fill();
    if (isSliding) {
      roundedRect(1,14,58,27,7,'#243b79','#74d8f5',3);
      roundedRect(32,5,28,26,7,'#ffd092','#522f57',2);
      roundedRect(46,11,16,10,2,'#79ebff');
      roundedRect(6,34,48,12,4,'#e88c6e');
      polygon([[-11,18],[7,15],[15,26],[-11,27]],'#ff9c9a');
    } else {
      // Bufanda animada, brazos, piernas, chaqueta y cabeza (personaje original).
      polygon([[12,27],[-16,22+walk*.5],[1,36],[17,34]],'#ff8899');
      const legShift = p.grounded ? walk : 5;
      roundedRect(13,53,12,17+Math.max(0,legShift),3,'#163c6c');
      roundedRect(35,53,11,17+Math.max(0,-legShift),3,'#163c6c');
      roundedRect(10,68+Math.max(0,legShift),20,8,2,'#f3a55a');
      roundedRect(31,68+Math.max(0,-legShift),21,8,2,'#f3a55a');
      roundedRect(6,31,14,25,4,'#ffb37f');
      roundedRect(44,30,11,23,4,'#ffb37f');
      roundedRect(12,29,37,31,7,'#2b78a8','#8ce1ff',2);
      roundedRect(21,38,18,8,2,'#174a81');
      roundedRect(14,4,35,30,9,'#ffc38e','#5b4c69',2);
      roundedRect(12,5,40,15,7,'#384c95');
      roundedRect(23,2,23,8,2,'#658be0');
      roundedRect(36,19,18,11,3,'#12294e','#86f4ff',2);
      ctx.fillStyle='#c1faff';ctx.fillRect(45,22,7,4);
      ctx.fillStyle='#ffc76b';ctx.fillRect(10,26,7,6);
    }
    ctx.restore();
  }

  function draw() {
    ctx.save();
    if (shake > 0 && !reduceMotionActive()) ctx.translate(rand(-6,6)*shake/.25,rand(-4,4)*shake/.25);
    sky();
    pickups.forEach(item => item.kind === 'coin' ? drawCoin(item) : drawShield(item));
    obstacles.forEach(o => { if(o.kind==='crate')drawCrate(o);else if(o.kind==='spikes')drawSpikes(o);else drawDrone(o); });
    drawRunner();
    particles.forEach(p => {ctx.globalAlpha=1-p.age/p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);});ctx.globalAlpha=1;
    floatTexts.forEach(p => { ctx.globalAlpha=1-p.age/.95;ctx.font='900 21px ui-monospace,monospace';ctx.textAlign='center';ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;ctx.fillText(p.text,p.x,p.y);ctx.shadowBlur=0; });ctx.globalAlpha=1;ctx.textAlign='left';
    if (phase === 'playing' && shield > 0) {
      roundedRect(18,HEIGHT-54,120,29,6,'#09263e9e','#64eaff77',1);
      ctx.font='bold 12px ui-monospace,monospace';ctx.fillStyle='#b5f6ff';ctx.fillText('ESCUDO ' + Math.ceil(shield) + 's',30,HEIGHT-35);
    }
    if (phase === 'playing' && invulnerable > 0 && shield === 0) {
      ctx.fillStyle='#ff577d';ctx.globalAlpha=.07 + Math.sin(elapsed*25)*.025;ctx.fillRect(0,0,viewWidth,HEIGHT);ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  function frame(now) {
    if (!lastFrame) lastFrame = now;
    const dt = clamp((now - lastFrame) / 1000, 0, .05);
    lastFrame = now;
    frameTime += dt;
    if (phase === 'playing') {
      accumulator = Math.min(accumulator + dt, .1);
      const fixedStep = 1 / 120;
      while (accumulator >= fixedStep) { update(fixedStep); accumulator -= fixedStep; }
    } else accumulator = 0;
    draw();
    requestAnimationFrame(frame);
  }

  function renderRanking() {
    ui.ranking.replaceChildren();
    if (!saved.scores.length) {
      const empty = document.createElement('div');empty.className='rank-empty';empty.textContent='Jugá tu primera partida para aparecer acá.';ui.ranking.append(empty);return;
    }
    saved.scores.slice(0,3).forEach((item,i) => {
      const row=document.createElement('div');row.className='rank-row';
      const meta=document.createElement('span');
      const index=document.createElement('span');index.className='rank-index';index.textContent='#'+pad(i+1,2);
      const modeLabel=document.createElement('span');modeLabel.className='rank-mode';modeLabel.textContent=String(item.mode).slice(0,15);
      const points=document.createElement('span');points.className='rank-points';points.textContent=pad(item.score,6);
      if (item.combo) modeLabel.textContent += ' · ×' + item.combo;
      meta.append(index,modeLabel);row.append(meta,points);ui.ranking.append(row);
    });
  }
  function setMode(next) {
    if (!(next in MODES) || phase === 'playing' || phase === 'paused') return;
    mode=next;
    document.querySelectorAll('[data-mode]').forEach(b => {
      const selected=b.dataset.mode===mode;b.classList.toggle('is-selected',selected);b.setAttribute('aria-pressed',String(selected));
    });
    resetGame();
    if(phase==='over')setOverlay('ready');
  }

  ui.primary.addEventListener('click', () => {
    if (phase === 'ready' || phase === 'over') startGame();
    else if (phase === 'paused') resumeGame();
    else if (phase === 'help' || phase === 'progress') setOverlay('ready');
  });
  ui.secondary.addEventListener('click', () => {
    if (phase === 'ready') setOverlay('help');
    else if (phase === 'over') setOverlay('ready');
    else if (phase === 'paused') startGame();
  });
  ui.tertiary.addEventListener('click', () => {
    if (phase === 'ready' || phase === 'over') setOverlay('progress');
    else if (phase === 'paused') { resetGame(); setOverlay('ready'); }
  });
  $('jump-button').addEventListener('click', jump);
  $('slide-button').addEventListener('pointerdown', ev => { ev.preventDefault();slideHeld=true;slide(); });
  const endSlide = () => { slideHeld=false; };
  $('slide-button').addEventListener('pointerup',endSlide);
  $('slide-button').addEventListener('pointercancel',endSlide);
  $('slide-button').addEventListener('pointerleave',endSlide);
  ui.pause.addEventListener('click',pauseGame);
  $('reset-button').addEventListener('click',startGame);
  ui.sound.addEventListener('click',() => {
    saved.muted=!saved.muted;
    if (!saved.muted && saved.volume === 0) { saved.volume = .65; ui.volume.value = 65; }
    saveProgress();syncSound();
    if(!saved.muted)tone(680,900,.12);
  });
  function syncSound(){ui.soundIcon.textContent=saved.muted?'♩̸':'♫';ui.sound.setAttribute('aria-pressed',String(saved.muted));ui.sound.setAttribute('aria-label', saved.muted?'Activar sonidos':'Silenciar sonidos');}
  ui.volume.value = Math.round(saved.volume * 100);
  ui.effects.checked = saved.reducedFx;
  ui.volume.addEventListener('input', () => { saved.volume = Number(ui.volume.value) / 100; saved.muted = saved.volume === 0; saveProgress(); syncSound(); });
  ui.effects.addEventListener('change', () => { saved.reducedFx = ui.effects.checked; saveProgress(); });
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click',() => setMode(b.dataset.mode)));
  canvas.addEventListener('pointerdown',ev => { ev.preventDefault();if (phase==='playing')jump(); });
  document.addEventListener('keydown', ev => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (ev.code === 'Space' || ev.code === 'ArrowUp' || ev.code === 'KeyW') {
      if (tag === 'BUTTON' && ev.code === 'Space') return; // Accesibilidad: botón activo usa su propia acción.
      ev.preventDefault();
      if (!ev.repeat) { jumpHeld = true; jump(); }
    } else if (ev.code === 'ArrowDown' || ev.code === 'KeyS') {
      ev.preventDefault();slideHeld=true;if(!ev.repeat)slide();
    } else if (ev.code === 'KeyP' || ev.code === 'Escape') {
      if (phase==='playing'||phase==='paused'){ev.preventDefault();pauseGame();}
    } else if (ev.code === 'Enter') {
      if (tag === 'BUTTON' || tag === 'A') return;
      if (phase==='ready'||phase==='over')startGame();
      else if (phase==='paused')resumeGame();
      else if (phase==='help')setOverlay('ready');
    } else if(ev.code==='KeyM'){
      saved.muted=!saved.muted;
      if (!saved.muted && saved.volume === 0) { saved.volume = .65; ui.volume.value = 65; }
      saveProgress();syncSound();
    }
  });
  document.addEventListener('keyup',ev => {
    if(ev.code==='ArrowDown'||ev.code==='KeyS')slideHeld=false;
    if(ev.code==='Space'||ev.code==='ArrowUp'||ev.code==='KeyW') { jumpHeld=false; if(player.vy < -250) player.vy *= .58; }
  });
  document.addEventListener('visibilitychange',() => {if(document.hidden&&phase==='playing')setOverlay('paused');});
  window.addEventListener('blur',() => {if(phase==='playing')setOverlay('paused');});
  window.addEventListener('resize',resize);

  renderRanking();syncSound();syncCareer();resetGame();setOverlay('ready');resize();requestAnimationFrame(frame);
})();
