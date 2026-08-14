# TIC TOC TOE & XOX OXO XOX (Version 3.0.0)

A retro black & white combinatorial game engine, state-space analyzer, and graph visualizer featuring classic **TIC TOC TOE (TTT)** and generalized **XOX OXO XOX (OXO)** with line-clearing mechanics.

---

## 🎮 Game Variants & Rules

### 1. TIC TOC TOE (TTT)
* Standard 3×3 grid.
* Player 1 places **X**, Player 2 places **O**.
* **Win condition**: Form 3 matching symbols in a row, column, or diagonal (`XXX` or `OOO`).

### 2. XOX OXO XOX (OXO / Generalized Variant)
* Either player can place **either 'X' or 'O'** into any empty cell on their turn.
* **Win condition**: Form the sequence **`O-X-O`** in any straight line (row, column, or diagonal).

### 3. Line Clearing Rule (Looping Game States)
* At any turn, when a row, column, or diagonal is completely full, a player can choose to **remove** all 3 marks from that line instead of placing a symbol.
* Line clearing enables cycles and perpetual games, giving rise to rich directed state graphs and Strongly Connected Components (SCCs).

---

## ✨ Key Features

- **Multiple Play Modes**:
  - `2-Player`: Local pass-and-play.
  - `Play X vs TTT / XOX`: Challenge the minimax/heuristic engine.
  - `Play O vs TTT / XOX`: Go second against the engine.
  - `TTT vs TTT` / `XOX vs XOX`: Autonomous AI vs. AI simulation.
- **Media Player & Speed Controls** (for autonomous simulation):
  - `||` / `>`: Stop/Pause and Play/Resume.
  - `>|`: Single-step forward execution.
  - `v` / `^`: Speed adjustment with live millisecond delay readout (`30ms` up to `1500ms`).
- **Sequential Move History & Stack Navigation**:
  - `< Undo` and `Redo >` step-by-step state traversal.
  - Explore alternative moves from any previous board position.
- **Debug & State-Space Graph Engine**:
  - D3-based interactive Strongly Connected Components (SCC) graph visualization.
  - D8 symmetry orbit canonicalization and topological quotient views.
  - MiniMax evaluation, optimal line selection, and full JSON game log export.
- **Minimalist Aesthetic**: High-contrast, clean black & white monospace interface with dark/light mode toggle.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* `npm` or `bun`

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/your-repo.git

# Navigate to project directory
cd your-repo

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Production Build
```bash
npm run build
```

---

## 🛠️ Tech Stack
- **Framework**: React 19, TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Visuals & Graphs**: D3.js (SCC Force-Directed Graph Layout), Lucide Icons
- **Motion**: `motion`

---

## 📄 License
MIT License. Created with Google AI Studio.
