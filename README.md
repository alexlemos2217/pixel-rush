<div align="center">

<img src="favicon.svg" width="72" alt="Pixel Rush" />

# ⚡ PIXEL RUSH

### NEON RUNNER

**CORRÉ. SALTÁ. ROMPÉ TU RÉCORD.**

Un endless runner de estética neón, desarrollado desde cero con tecnologías web.  
Superá obstáculos, recolectá monedas y competí contra tu propia mejor marca.

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=101010" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Canvas_2D-151D32?style=for-the-badge&logo=html5&logoColor=white" alt="Canvas 2D" />
</p>

[**🎮 JUGAR ONLINE**](https://mariogame-alex.netlify.app/) · [**💻 VER REPOSITORIO**](https://github.com/alexlemos2217/Mario-minigame)

<br />

<img src="docs/preview.webp" alt="Vista del juego Pixel Rush Neon Runner en funcionamiento" width="100%" />

<sub>Captura de la versión renovada · El enlace de Netlify mostrará esta versión una vez realizado el nuevo deploy.</sub>

</div>

---

## 🚀 Sobre el proyecto

**Pixel Rush — Neon Runner** es la evolución de mi primer minijuego web, originalmente inspirado en un ejercicio de *Mario-minigame*. Lo transformé en una experiencia arcade con una identidad visual propia, nuevas mecánicas y una interfaz adaptable a diferentes pantallas.

El objetivo es simple: **llegar lo más lejos posible** mientras la velocidad aumenta. Pero dominar el doble salto, anticipar obstáculos y aprovechar los potenciadores requiere práctica.

Este proyecto forma parte de mi portfolio de desarrollo y explora conceptos de **lógica de videojuegos, animación, física, eventos, experiencia de usuario y persistencia en el navegador**.

## ✨ Características principales

| 🎯 Jugabilidad | 🌆 Experiencia visual | 🏆 Progreso |
|---|---|---|
| Salto y doble salto | Ciudad futurista y efecto parallax | Puntuación en tiempo real |
| Deslizamiento bajo obstáculos | Distritos con distintas atmósferas | Récord personal |
| Monedas y escudos | Partículas y animaciones | Ranking local de mejores partidas |
| Obstáculos y velocidad progresiva | Sonido sintetizado en el navegador | Tres niveles de dificultad |

Además, incluye **pausa y reanudación**, tutorial integrado, reinicio de partida, controles táctiles y pausa automática al cambiar de pestaña.

## 🕹️ Elegí cómo jugar

| Modo | Experiencia | Vidas iniciales |
|---|---|:---:|
| ☁️ **ZEN** | Ritmo más tranquilo, ideal para practicar | 4 |
| ✦ **ARCADE** | Experiencia equilibrada y progresiva | 3 |
| ⚡ **TURBO** | Más velocidad y mayor desafío | 2 |

## 🎮 Controles

| Acción | Computadora | Celular / tablet |
|---|---|---|
| **Saltar / doble salto** | `Espacio`, `↑` o `W` | Botón **SALTAR** o toque en el juego |
| **Deslizarse** | `↓` o `S` | Mantener **DESLIZAR** |
| **Pausar / continuar** | `P` o `Esc` | Botón de pausa |
| **Activar / silenciar sonido** | `M` | Botón de sonido |
| **Iniciar / reintentar** | `Enter` o botón de inicio | Botón en pantalla |

> **Tip:** recolectá monedas para sumar puntos extra. Un escudo puede absorber un impacto y ayudarte a continuar.

## 🧰 Stack tecnológico

- **HTML5:** estructura semántica del sitio e interfaz del juego.
- **CSS3:** diseño responsive, estética neón, componentes y animaciones.
- **JavaScript (Vanilla):** estado del juego, controles, física, colisiones y puntuación.
- **Canvas 2D:** renderizado del personaje, escenarios y efectos.
- **Web Audio API:** generación de efectos de sonido sin archivos de audio externos.
- **localStorage:** conservación del récord y las mejores partidas en el navegador.

**Sin frameworks, sin librerías externas y sin backend.**

## 💻 Ejecutarlo localmente

1. Cloná el repositorio:

   ```bash
   git clone https://github.com/alexlemos2217/Mario-minigame.git
   ```

2. Entrá a la carpeta del proyecto:

   ```bash
   cd Mario-minigame
   ```

3. Abrí **`index.html`** en un navegador moderno.

No necesitás instalar dependencias ni ejecutar un servidor para jugar.

## ☁️ Deploy en Netlify

El juego es un **sitio estático**, por lo que puede publicarse directamente desde GitHub:

1. Conectá este repositorio con un proyecto en Netlify.
2. Seleccioná la rama `main`.
3. Dejá vacío el comando de compilación (*Build command*).
4. Configurá el directorio de publicación (*Publish directory*) como `.` (raíz del repositorio).
5. Publicá el sitio. Los siguientes cambios en `main` se desplegarán automáticamente.

**Demo:** [mariogame-alex.netlify.app](https://mariogame-alex.netlify.app/)

## 📁 Estructura del proyecto

```text
Mario-minigame/
├── index.html         # Interfaz y elementos del juego
├── styles.css         # Estilos y diseño responsive
├── index.js           # Motor, controles, física y renderizado
├── favicon.svg        # Identidad del juego
├── docs/
│   └── preview.webp   # Captura para este README
└── README.md          # Documentación del proyecto
```

> Las carpetas `img/` y `audio/` de la primera versión ya no son necesarias para Pixel Rush. Podés conservarlas como referencia histórica o quitarlas en otro commit.

## 🧠 Aspectos técnicos destacados

- Bucle de actualización con `requestAnimationFrame` y movimiento basado en `deltaTime`.
- Detección de colisiones mediante cajas rectangulares (**AABB**).
- Generación dinámica de obstáculos, monedas, escudos y partículas.
- Ajuste del dibujo del Canvas al espacio disponible en distintas pantallas.
- Guardado local de puntuaciones, sin requerir cuentas ni conexión a un servidor.

## 🛣️ Posibles mejoras futuras

- [ ] Desafíos diarios y logros desbloqueables.
- [ ] Nuevos potenciadores, obstáculos y animaciones.
- [ ] Personalización del personaje y sus colores.
- [ ] Ranking online opcional con backend.

Estas funcionalidades son ideas para futuras versiones y **no están implementadas actualmente**.

---

<div align="center">

**Desarrollado por [Alexander Lemos](https://github.com/alexlemos2217)**  
Un proyecto personal de aprendizaje y desarrollo web.

<sub>El minijuego inicial se realizó como práctica a partir de material de Manual do Dev. Esta evolución usa una identidad visual y recursos propios, sin personajes ni gráficos de Nintendo.</sub>

</div>
