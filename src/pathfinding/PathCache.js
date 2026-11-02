export class PathCache {
    constructor(grid, astar) {
        this.grid = grid;
        this.astar = astar;
        this.paths = new Map();
        this.version = grid.version;
        this.hits = 0;
        this.misses = 0;
    }

    get(col, row) {
        if (this.version !== this.grid.version) {
            this.paths.clear();
            this.version = this.grid.version;
        }

        const key = row * this.grid.cols + col;
        const cached = this.paths.get(key);
        if (cached !== undefined) {
            this.hits++;
            return cached;
        }

        this.misses++;
        const path = this.astar.findPath(col, row, this.grid.goal.col, this.grid.goal.row);
        this.paths.set(key, path);
        return path;
    }
}