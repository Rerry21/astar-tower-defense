# A* Tower Defense

A grid-based tower defense game built with vanilla JavaScript and HTML5 Canvas. Enemies don't follow a pre-made route: each one calculates its own path from the spawn to the base using a hand-written **A\*** implementation. The long-term goal is for enemies to recalculate their routes whenever the player places or removes a tower.

The project is both a playable game and a demonstration of graphs, heuristics, pathfinding and dynamic graph changes.

![Screenshot](docs/screenshot.png)

## Status

Work in progress, built one feature at a time.

- [x] Project setup
- [x] Game loop with delta-time updates
- [x] Grid and map system (walkable, blocked, tower, spawn, goal)
- [x] A* pathfinding
- [x] Enemies following an A* path smoothly
- [x] Path visualization and A* stats overlay
- [ ] Tower placement with valid/invalid preview
- [ ] Dynamic path recalculation when the map changes
- [ ] Rejecting placements that would block the route
- [ ] Enemy health and death
- [ ] Tower targeting and shooting (Closest, Weakest, First, Last)
- [ ] Economy, waves and base lives
- [ ] Multiple enemy and tower types, upgrades
- [ ] A* debug visualization (open/closed nodes)
- [ ] Balancing and optimization

## Running the project

No installs, frameworks or build step. ES modules require a local web server, so opening `index.html` directly from the file system will not work.

**Option 1: VS Code Live Server**
Install the Live Server extension, then right-click `index.html` and choose *Open with Live Server*.

**Option 2: Python**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Project structure

```
tower-defense/
├── index.html
├── style.css
└── src/
    ├── main.js              Entry point
    ├── core/
    │   ├── Game.js          Game loop, update and render
    │   ├── Grid.js          Cell storage and coordinate conversion
    │   └── maps.js          Map layouts as text
    ├── pathfinding/
    │   ├── AStar.js         The A* algorithm
    │   ├── Node.js          Per-cell search data
    │   ├── MinHeap.js       Priority queue for the open set
    │   └── PathRenderer.js  Draws a path for debugging
    ├── enemies/
    │   ├── Enemy.js         Single enemy and path following
    │   └── EnemyManager.js  Spawning, updating, removing enemies
    ├── towers/              Planned
    ├── waves/               Planned
    └── ui/                  Planned
```

## Maps

Maps are written as text in `src/core/maps.js`:

| Character | Meaning |
|-----------|---------|
| `.`       | Walkable cell |
| `#`       | Blocked cell |
| `A`       | Enemy spawn |
| `B`       | Base (goal) |

The grid is stored in a flat `Uint8Array`, one cell type per cell. Every row must have the same length and the map must contain exactly one `A` and one `B`, otherwise loading throws a descriptive error.

## How the pathfinding works

The map is treated as a graph where each walkable cell is a node connected to its four neighbours.

- **Movement:** up, down, left, right, each with a cost of 1.
- **Heuristic:** Manhattan distance, `|dx| + |dy|`. It never overestimates the true cost (admissible) and is consistent for 4-directional movement, so a node never has to be reopened once it is closed.
- **Costs:** `g` is the cost from the start, `h` is the heuristic estimate to the goal, and `f = g + h`.
- **Open set:** a binary min-heap ordered by `f`, with ties broken by lower `h`.
- **Closed set:** a `closed` flag on each node.
- **Parents:** each node stores the node it was reached from. The final path is rebuilt by walking the parents back from the goal and reversing the result.
- **Fast resets:** nodes are preallocated once. Each search increments a `searchId`, and a node is lazily reset the first time a search touches it. This avoids clearing the whole grid or allocating new nodes on every search.

The on-screen overlay shows the path length, the number of nodes expanded and the search time for the most recent search.

## Design rules

- Every system lives in its own module: pathfinding, enemies, towers, waves and UI are separate.
- A* is never run every frame. It runs only when needed, such as on spawn or when the grid changes.
- No external libraries.
- The built-in navigation of any engine is not used: all enemy navigation comes from this A* implementation.

## License

Add a license of your choice (for example MIT).