<div align="center">

<img src="favicon.svg" width="76" alt="Pixel Rush logo" />

# PIXEL RUSH

### ULTIMATE REMASTER · NEON RUNNER

**Run. Jump. Build the combo. Break your record.**

An original, dependency-free arcade runner built with Canvas 2D, Web Audio and modern browser APIs.

[Play the current public build](https://pixel-rush-alex.netlify.app/) · [Alexander Lemos on GitHub](https://github.com/alexlemos2217)

</div>

## The game

Pixel Rush is a fast browser arcade game set across the districts of Neon City. The objective is simple: survive for as long as possible, read each hazard, collect energy coins and keep a skill combo alive.

The remaster keeps the immediate controls of the original while adding a fairer fixed-step simulation, progression, accessibility settings and a more expressive scoring system. There are no accounts, paid services or remote gameplay dependencies.

## Features

- Responsive endless-runner gameplay for keyboard, mouse and touch.
- Jump, double jump, variable jump release and ground slide.
- Fixed 120 Hz simulation with frame-rate-independent rendering.
- Forgiving hitboxes, jump buffering and coyote-time support.
- Crates, spikes and moving drones with progressive spawn pacing.
- Four rotating visual districts with procedural parallax scenery.
- Score from distance, coins, clean obstacle passes and combos up to ×5.
- Three difficulty modes: Zen, Arcade and Turbo.
- Shields, particles, camera impact and synthesized sound feedback.
- Pause, instant retry, main-menu return and automatic focus-loss pause.
- Local best scores, career statistics and five real achievements.
- Persistent volume, mute and reduced-effects preferences.
- No framework, game engine, backend or third-party runtime asset.

## Controls

| Action | Keyboard | Touch / pointer |
| --- | --- | --- |
| Start / retry | `Enter` or `Space` | Main action button |
| Jump / double jump | `Space`, `↑` or `W` | Tap the game or **Jump** |
| Short jump | Release the jump key early | — |
| Slide | Hold `↓` or `S` | Hold **Slide** |
| Pause / resume | `P` or `Esc` | Pause button |
| Mute / unmute | `M` | Audio button |

The game pauses automatically when the tab loses focus, so background time cannot cause an unfair hit.

## Scoring and progression

Distance continuously adds score. Coins and clean obstacle passes extend the combo window; every three actions increase the multiplier, up to ×5. Taking an unshielded hit breaks the combo.

The browser stores the best score, top runs, career totals, achievements and accessibility preferences. Versioned save data automatically imports the previous Pixel Rush local record when available. Invalid or unavailable storage never prevents a session from running.

## Architecture

```text
pixel-rush/
├── index.html              # Game shell, HUD, menus and accessibility markup
├── styles.css              # Responsive art direction and UI states
├── index.js                # State machine, simulation, renderer, input and audio
├── game-core.js            # Pure scoring, collision and difficulty rules
├── tests/
│   └── game-core.test.js   # Dependency-free rule tests
├── favicon.svg             # Original project mark
├── img/                    # Legacy assets retained for project history
├── audio/                  # Legacy audio retained for project history
└── README.md
```

The active game draws its character, scenery, hazards and effects directly in Canvas. Audio feedback is synthesized through Web Audio after user interaction. The legacy media folders are not required by the current runtime and remain untouched for historical reference.

## Run locally

No installation or build step is required. Start the included dependency-free static server:

```bash
npm start
```

Then open `http://localhost:8080`. Opening `index.html` directly also works in modern browsers, although an HTTP server provides a more production-like environment.

## Validation

```bash
npm test
npm run check
```

Browser QA should cover starting, jumping, sliding, collecting, taking damage, pausing, retrying, returning to the menu, changing settings and reloading persisted progress.

## Deployment

### Netlify

- Build command: leave empty.
- Publish directory: repository root (`.`).
- No environment variables are required.

### GitHub Pages

Publish the repository root from the default branch, or use a static Pages workflow. All runtime URLs are relative, so no base-path configuration is required.

Deployment is intentionally not automated by this repository.

## Asset and technology credits

The active visual assets are original Canvas/CSS shapes and the active sound effects are generated at runtime with Web Audio. No commercial music, remote fonts or unlicensed third-party game assets are used by the current build.

The files under `img/` and `audio/` belong to earlier project iterations and are not loaded by the remaster.

## Author

Designed and developed by [Alexander Lemos](https://github.com/alexlemos2217).

Pixel Rush began as a browser game exercise and evolved into an original portfolio arcade experience through a complete visual and engineering rewrite.
