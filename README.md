# J.A.R.V.I.S

> **Just A Rather Very Intelligent System — Mark LXXXV Tactical OS**  
> An executive, Tony Stark-level artificial intelligence assistant with a holographic HUD, real-time audio reactivity, voice synthesis & recognition, 3D CAD schematic workshop, global satellite defense radar, and the House Party Protocol.

---

## ⚡ Overview

J.A.R.V.I.S. Mark-LXXXV OS is a cybernetic HUD web application engineered with pure vanilla HTML5, CSS3, and modern modular ES6 JavaScript. It delivers a cinematic Tony Stark laboratory experience directly in the browser with zero external dependencies.

---

## 🚀 Core Features

### 1. ⚛️ Holographic Arc Reactor Core (`arc-reactor.js`)
- **Canvas Visualizer:** Multi-layered counter-rotating concentric mechanical rings with laser tick marks.
- **10 Induction Coils:** Accurate to the classic Stark Arc Reactor design with wire wraps and glowing copper blocks.
- **Audio-Reactive States:** Seamless transitions between `IDLE`, `LISTENING`, `PROCESSING`, `SPEAKING`, and `ALERT`.
- **Interactive Repulsor Pulse:** Click the Arc Reactor to trigger a repulsor shockwave, capacitor discharge, and audio blast.

### 2. 🎙️ Multi-Persona Speech & Intelligence Engine (`speech-engine.js`, `ai-brain.js`)
- **Three Iconic Personas:**
  - **J.A.R.V.I.S.:** Refined British butler cadence, addressing the user as *"Sir"*, dry wit, supreme analytical capability.
  - **F.R.I.D.A.Y.:** Crisp tactical female combat voice, addressing Tony as *"Boss"*.
  - **E.D.I.T.H.:** Direct orbital command and defense network authority.
- **Hands-Free & Push-To-Talk Voice Recognition:** Continuous or push-to-talk via spacebar / mic button with real-time HUD subtitle transcriptions.
- **Built-in Intent Recognition & Solver:**
  - Real-time weather telemetry via free Open-Meteo API.
  - Mathematical calculations and physics unit conversions.
  - Stark task and R&D directive tracker.
  - Authentic lore and witty banter.
  - Optional Google Gemini API link for live unrestricted LLM intelligence.

### 3. 🛡️ Hall of Armor // House Party Protocol (`armor-vault.js`)
- Interactive database of 8 iconic Iron Man suits:
  - **Mark I:** The Prototype Escape Chassis (1500 PSI Flamethrowers).
  - **Mark III:** Hot-Rod Red Titanium-Gold Alloy (Mach 2.8).
  - **Mark V:** The Briefcase Emergency Deployment Suit.
  - **Mark VII:** The Avengers Pod-Deploy Combat Armor (Mach 3.5).
  - **Mark XLII:** Autonomous Prehensile Propulsion System.
  - **Mark XLIV:** Veronica / Hulkbuster Heavy Containment Frame.
  - **Mark L:** Bleeding Edge Nanotech Synthesis (Mach 8.0).
  - **Mark LXXXV:** Endgame Apex Vibranium-Weave Nanotech (Mach 10+).
- **Instant Gantry Deployment:** Equips any suit to the active HUD, updating repulsor power, speed, integrity, and wireframe telemetry.

### 4. 📐 3D Holographic CAD Workshop (`cad-viewer.js`)
- Pure 3D matrix math projection on HTML5 Canvas.
- 4 interactive schematics: **Arc Reactor Mark II**, **Repulsor Gauntlet**, **Mark LXXXV Helmet**, and **Tesseract Hypercube**.
- Full 360° orbital drag rotation, scroll-to-zoom, and an **Explode Assembly** slider to inspect internal mechanics.

### 5. 🛰️ E.D.I.T.H. Orbital Satellite Radar (`satellite-grid.js`)
- Real-time rotating radar beam with phosphor decay.
- Tracks 5 Stark Defense Satellites in low Earth orbit.
- Interactive crosshair coordinate lock and simulated **Kinetic Orbital Strike** with laser trajectory and explosion sound FX.

### 6. 🔊 Procedural Web Audio Synthesizer (`audio-sfx.js`)
- 100% offline, zero-asset Web Audio API sound generator:
  - Activation harmonic chime
  - Repulsor charge & blast
  - Target lock chirps
  - Protocol deployment whoosh
  - Emergency sirens & warbles
  - Toggleable 55Hz ambient Arc Reactor hum

---

## 🎮 Tactical Keyboard Controls

| Hotkey | Action | Subsystem |
| :---: | :--- | :--- |
| `Space` | **Push-To-Talk Voice Command** | Speech Recognition Engine |
| `1` | **House Party Protocol** | Hall of Armor Vault |
| `2` | **3D CAD Workshop** | Holographic Schematics |
| `3` | **E.D.I.T.H. Grid** | Orbital Radar & Strikes |
| `4` | **Subsystem Diagnostics** | 7-Point Telemetry Scan |
| `5` | **Clean Slate Protocol** | Thermal Purge Countdown |
| `L` | **Emergency Lockdown** | Red Alert Containment |
| `M` | **Mute Audio Toggle** | Web Audio Master Gain |
| `Esc` | **Close All Modals** | Window Manager |

---

## 🛠️ Quick Start

Clone the repository and launch a local web server:

```bash
# Clone repository
git clone https://github.com/LogicitismRaider/J.A.R.V.I.S.git
cd J.A.R.V.I.S

# Start a local static server
python -m http.server 8088
# Or using Node.js:
# npx serve .
```

Open your browser to:
👉 **`http://localhost:8088/`**

*(Google Chrome or Microsoft Edge recommended for native Web Speech API recognition).*

---

## 🏛️ Project Structure

```text
├── index.html              # Main Stark HUD interface
├── README.md               # Documentation & system guide
├── css/
│   └── stark-hud.css       # Holographic design system & cybernetics
├── js/
│   ├── audio-sfx.js        # Web Audio procedural sound synthesizer
│   ├── arc-reactor.js      # Dynamic 2D/3D Arc Reactor canvas
│   ├── cad-viewer.js       # 3D CAD wireframe model projector
│   ├── speech-engine.js    # Speech synthesis and recognition
│   ├── armor-vault.js      # Hall of Armor suit database & gantry
│   ├── satellite-grid.js   # E.D.I.T.H. orbital satellite radar
│   ├── ai-brain.js         # NLP intent parser, weather & Gemini link
│   └── app.js              # Master application controller
└── assets/
    └── stark_arc_reactor.jpg # 8K Stark Arc Reactor blueprint
```

---

*Engineered by Stark Industries. All rights reserved.*
