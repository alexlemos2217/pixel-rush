<div align="center">

<img src="favicon.svg" width="80" alt="Pixel Rush — Neon Runner" />

# ⚡ PIXEL RUSH

### NEON RUNNER · ARCADE EDITION

**CORRÉ. SALTÁ. ROMPÉ TU RÉCORD.**

Un *endless runner* arcade con estética futurista, desarrollado con tecnologías web nativas.  
Esquivá obstáculos, recolectá monedas, usá potenciadores y superá tu mejor marca.

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=101010" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Canvas%202D-151D32?style=for-the-badge&logo=html5&logoColor=white" alt="Canvas 2D" />
</p>

### [🎮 JUGAR ONLINE](https://pixel-rush-alex.netlify.app/) · [💻 VER CÓDIGO](https://github.com/alexlemos2217/pixel-rush)

<img src="docs/preview.webp" alt="Captura de Pixel Rush durante una partida" width="100%" />

<sub>Vista del juego · Disponible para computadora, tablet y celular.</sub>

</div>

---

## 🚀 Sobre el proyecto

**Pixel Rush — Neon Runner** es un videojuego web de tipo *endless runner* que nació como una práctica de desarrollo frontend y fue evolucionando hasta convertirse en una experiencia arcade con identidad visual propia.

El desafío es avanzar por una ciudad de neón mientras aumenta la velocidad. Para sobrevivir, tenés que **calcular los saltos, deslizarte bajo los obstáculos, conseguir monedas y aprovechar los escudos**.

Este proyecto es parte de mi portfolio y pone en práctica conceptos de **lógica de videojuegos, animación, física básica, detección de colisiones, manejo de eventos, diseño responsive y persistencia local**.

## ✨ Características

| 🎮 Jugabilidad | 🌃 Diseño y experiencia | 🏆 Progreso |
|---|---|---|
| Salto y doble salto | Escenarios futuristas con parallax | Puntaje en tiempo real |
| Deslizamiento | Distritos con distintas atmósferas | Récord personal |
| Monedas y escudos | Animaciones y partículas | Top 3 de partidas locales |
| Obstáculos y velocidad progresiva | Efectos de sonido generados con Web Audio | Tres modos de dificultad |

Además, incluye **tutorial integrado, pausa y reanudación, reinicio de partida, controles para pantallas táctiles y pausa automática cuando cambiás de pestaña**.

## 🕹️ Modos de juego

| Modo | Estilo | Vidas iniciales |
|:---|:---|:---:|
| ☁️ **ZEN** | Más tranquilo, para practicar | 4 |
| ✦ **ARCADE** | Equilibrado y progresivo | 3 |
| ⚡ **TURBO** | Más rápido y exigente | 2 |

## ⌨️ Controles

| Acción | Computadora | Celular / tablet |
|---|---|---|
| Saltar / doble salto | `Espacio`, `↑` o `W` | **SALTAR** o tocar el juego |
| Deslizarse | `↓` o `S` | Mantener **DESLIZAR** |
| Pausar / reanudar | `P` o `Esc` | Botón de pausa |
| Activar / silenciar audio | `M` | Botón de sonido |
| Iniciar / reintentar | `Enter` o botón principal | Botón en pantalla |

> 💡 **Consejo:** juntá monedas para sumar puntos adicionales y buscá escudos para protegerte de un impacto.

## 🧰 Tecnologías

- **HTML5:** estructura de la interfaz y elementos accesibles.
- **CSS3:** diseño adaptable, componentes, transiciones y estética neón.
- **JavaScript (Vanilla):** lógica del juego, entradas de teclado/táctiles, puntuación y estados.
- **Canvas 2D:** representación del personaje, fondos, obstáculos y efectos.
- **Web Audio API:** efectos de sonido sintetizados en el navegador.
- **localStorage:** récords y ranking local sin cuentas ni servidor.

**Sin frameworks, dependencias externas, backend ni proceso de compilación.**

## 💻 Ejecutarlo localmente

Cloná el repositorio:

```bash
git clone https://github.com/alexlemos2217/pixel-rush.git
cd pixel-rush
```

Abrí **`index.html`** en un navegador moderno. No hace falta instalar paquetes ni levantar un servidor.

## ☁️ Publicación en Netlify

El proyecto se publica como **sitio estático conectado con GitHub**.

- **Repositorio:** [`alexlemos2217/pixel-rush`](https://github.com/alexlemos2217/pixel-rush)
- **Rama de publicación:** `main`
- **Build command:** ninguno
- **Publish directory:** `.` (raíz del repositorio)
- **Sitio:** [pixel-rush-alex.netlify.app](https://pixel-rush-alex.netlify.app/)

Los cambios confirmados en la rama de publicación pueden desplegarse automáticamente mediante la integración de Netlify con GitHub.

## 📁 Estructura

```text
pixel-rush/
├── index.html        # Interfaz y estructura del juego
├── styles.css        # Diseño y estilos responsive
├── index.js          # Jugabilidad, animación, físicas y controles
├── favicon.svg       # Identidad visual
├── docs/
│   └── preview.webp  # Captura utilizada en este README
└── README.md         # Documentación
```

> Si todavía aparecen las carpetas `img/` y `audio/` de una versión anterior, no son necesarias para el juego actual y pueden retirarse después de confirmar que ningún archivo las utiliza.

## 🧠 Aspectos técnicos destacados

- **Game loop** con `requestAnimationFrame` y actualización basada en tiempo transcurrido (*delta time*).
- **Colisiones AABB** mediante cajas rectangulares.
- **Generación dinámica** de obstáculos, monedas, escudos y partículas.
- **Ajuste responsive del Canvas** para distintos tamaños de pantalla.
- **Progresión de dificultad** con velocidad creciente.
- **Persistencia local** de mejores puntuaciones y preferencia de sonido.

## 🛠️ Próximas ideas

- [ ] Nuevos escenarios, obstáculos y potenciadores.
- [ ] Logros y desafíos especiales.
- [ ] Personalización del personaje.
- [ ] Ranking online opcional con backend.

*Estas funciones son propuestas para futuras versiones y todavía no están implementadas.*

---

<div align="center">

**Desarrollado por [Alexander Lemos](https://github.com/alexlemos2217)**  
Proyecto personal de desarrollo web y videojuegos.

<sub>La práctica original se inspiró en material educativo de Manual do Dev. Esta versión presenta una identidad visual y una implementación propias.</sub>

<br />

**[⚡ JUGAR PIXEL RUSH](https://pixel-rush-alex.netlify.app/)**

</div>
