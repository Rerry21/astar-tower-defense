# A* Tower Defense

A grid-based tower defense game built with vanilla JavaScript and HTML5 Canvas. Enemies don't follow a pre-made route: each one gets its path from a hand-written **A\*** implementation, and when the player places or sells a tower the affected enemies calculate a new route around it.

The project is a playable game and a demonstration of graphs, heuristics, pathfinding, dynamic graph changes and algorithmic optimization. A built-in visualizer replays the search so you can watch the algorithm work.

![Screenshot](docs/screenshot.png)

## Features

- Hand-written A* with a binary-heap open set, 4-directional movement and a Manhattan heuristic
- Dynamic repathing when the map changes
- Placement rule: a tower that would completely block the route is rejected (red preview)
- Three tower types (Gun, Bomb with splash damage, Sniper), each with two upgrade levels
- Four targeting modes per tower: Closest, Weakest, First, Last
- Four enemy types (Basic, Fast, Tank, Boss) and scripted plus generated waves
- Economy, lives, game over and restart
- Three difficulty levels
- A* visualizer showing open nodes, closed nodes, the current node and the final path
- Debug overlay with search statistics and frame timings

## Running the project

No installs, frameworks or build step. ES modules need a local web server, so opening `index.html` directly from the file system will not work.

**VS Code Live Server:** install the extension, right-click `index.html` and choose *Open with Live Server*.

**Python:**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Controls

| Input | Action |
|-------|--------|
| Left click on an empty cell | Place the selected tower |
| Left click on a tower | Select it (shows range and stats panel) |
| Right click on a tower | Sell it (70% of everything invested) |
| `1` `2` `3` | Choose Gun, Bomb or Sniper |
| `Space` | Start the next wave |
| `P` | Pause |
| `F` | Cycle game speed (x1, x2, x3) |
| `U` | Upgrade the selected tower |
| `T` | Cycle the selected tower's targeting mode |
| `Esc` | Deselect |
| `M` | Change difficulty (only before wave 1 or after game over) |
| `R` | Restart after game over |
| `D` | Toggle the debug text |
| `V` | Toggle enemy path lines |

**A\* visualizer**

| Key | Action |
|-----|--------|
| `A` | Turn the visualizer on or off |
| `S` | Pause or resume the replay (restarts it when finished) |
| `Right arrow` | Step forward one node |
| `[` `]` | Slower or faster replay |

## Project structure

```
tower-defense/
├── index.html
├── style.css
└── src/
    ├── main.js
    ├── core/
    │   ├── Game.js              Game loop and system wiring
    │   ├── GameState.js         Money, lives, status
    │   ├── Grid.js              Cell storage, coordinates, cached drawing
    │   ├── Input.js             Mouse tracking and click queue
    │   ├── difficulty.js        Difficulty settings
    │   └── maps.js              Map layouts as text
    ├── pathfinding/
    │   ├── AStar.js             The A* algorithm
    │   ├── Node.js              Per-cell search data
    │   ├── MinHeap.js           Priority queue for the open set
    │   ├── PathManager.js       Placement check: would this tower block the route?
    │   ├── PathCache.js         Reuses paths until the grid changes
    │   ├── AStarVisualizer.js   Step-by-step search replay
    │   └── PathRenderer.js      Draws an enemy's path
    ├── enemies/
    │   ├── Enemy.js
    │   ├── EnemyManager.js      Spawning, repathing, removal
    │   └── EnemyTypes.js        Enemy stats as data
    ├── towers/
    │   ├── Tower.js
    │   ├── TowerManager.js      Placement rules and tower storage
    │   ├── TowerTypes.js        Tower stats and upgrades as data
    │   ├── Targeting.js         Targeting modes
    │   ├── Projectile.js
    │   └── ProjectileManager.js
    ├── waves/
    │   ├── WaveManager.js       Spawn queue and wave phases
    │   └── waveConfig.js        Wave composition and scaling
    └── ui/
        ├── HUD.js               Bottom bar, tower panel, tooltips, game over
        └── FloatingText.js      Rising +$ and -lives text
```

## Maps

Maps are text in `src/core/maps.js`:

| Character | Meaning |
|-----------|---------|
| `.` | Walkable |
| `#` | Blocked |
| `A` | Enemy spawn |
| `B` | Base (goal) |

The grid is a flat `Uint8Array` with one cell type per cell. Loading throws a descriptive error if a row has the wrong length or the map has no `A` or `B`.

## How the pathfinding works

The map is a graph where each walkable cell is a node connected to its four neighbours.

- **Movement:** up, down, left, right, each with a cost of 1.
- **Heuristic:** Manhattan distance, `|dx| + |dy|`. It never overestimates the true cost (admissible) and is consistent for 4-directional movement, so a node never has to be reopened once it is closed.
- **Costs:** `g` is the cost from the start, `h` is the estimate to the goal, `f = g + h`.
- **Open set:** a binary min-heap ordered by `f`, ties broken by lower `h`.
- **Closed set:** a `closed` flag on each node.
- **Path reconstruction:** follow parent links back from the goal, then reverse.
- **Fast resets:** nodes are preallocated once. Each search increments a `searchId`, and a node is reset lazily the first time a search touches it.

### Dynamic pathfinding

A* never runs every frame. It runs only when something changes:

- **Tower placed:** each enemy scans the remaining cells of its path. Only enemies whose route is now blocked search again, starting from the waypoint they are heading to, so movement stays smooth.
- **Tower sold:** every enemy searches again, because a shorter route may have opened up.
- **Before a tower is placed:** the cell is temporarily marked as blocked and A* runs from spawn to goal. If no route exists, the placement is rejected. The result is cached per hovered cell and grid version, so moving the mouse does not repeat the search.
- **Path cache:** paths are cached by start cell and discarded whenever the grid version changes, so a wave of enemies shares one search instead of running one each.

### Visualizer

The search can record its events (a node opened, a node closed) into a compact integer trace. Normal searches skip this with a single null check. The visualizer runs its own `AStar` instance, so it never touches the enemy statistics, and replays the trace at an adjustable speed. It re-runs automatically when the map changes.

## Performance notes

- The static map is drawn to an offscreen canvas and redrawn only when the grid changes.
- Towers search for targets only when their cooldown is ready, and only enemies within range are scored.
- Projectiles and floating text are removed by swapping with the last element rather than shifting arrays.
- HUD text that does not change every frame is built once.
- The debug overlay (`D`) shows per-frame update and render time, path cache hits and A* runs.

## Tuning

| To change | Edit |
|-----------|------|
| Enemy stats | `src/enemies/EnemyTypes.js` |
| Tower stats and upgrades | `src/towers/TowerTypes.js` |
| Wave composition and scaling | `src/waves/waveConfig.js` |
| Money, lives, health and reward multipliers | `src/core/difficulty.js` |
| The map | `src/core/maps.js` |

## Ideas for future work

- Multiple maps and a map selector
- Special boss behaviour and more enemy types
- Multiple spawn points or bases
- Diagonal movement (would need octile distance as the heuristic)
- Saving a best wave record