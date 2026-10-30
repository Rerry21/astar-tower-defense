import { Tower } from "./Tower.js";
import { CellType } from "../core/Grid.js";

export class TowerManager {
    constructor(grid, pathManager) {
        this.grid = grid;
        this.pathManager = pathManager;
        this.towers = new Map();
        this.routeCache = { col: -1, row: -1, version: -1, ok: false };
    }

    key(col, row) {
        return row * this.grid.cols + col;
    }

    check(col, row, enemies) {
        const grid = this.grid;
        if (!grid.inBounds(col, row)) return "Outside the map";
        if (grid.getType(col, row) !== CellType.WALKABLE) return "Cell is occupied";
        for (let i = 0; i < enemies.length; i++) {
            if (grid.worldToCol(enemies[i].x) === col && grid.worldToRow(enemies[i].y) === row) {
                return "Enemy in the way";
            }
        }
        if (!this.routeStillExists(col, row)) return "Would block the route";
        return null;
    }

    routeStillExists(col, row) {
        const cache = this.routeCache;
        if (cache.col !== col || cache.row !== row || cache.version !== this.grid.version) {
            cache.col = col;
            cache.row = row;
            cache.version = this.grid.version;
            cache.ok = this.pathManager.routeExistsWithTower(col, row);
        }
        return cache.ok;
    }

    place(col, row, enemies) {
        if (this.check(col, row, enemies) !== null) return false;
        this.towers.set(this.key(col, row), new Tower(col, row, this.grid));
        this.grid.setType(col, row, CellType.TOWER);
        return true;
    }

    remove(col, row) {
        if (!this.grid.inBounds(col, row)) return false;
        const key = this.key(col, row);
        if (!this.towers.has(key)) return false;
        this.towers.delete(key);
        this.grid.setType(col, row, CellType.WALKABLE);
        return true;
    }

    render(ctx) {
        for (const tower of this.towers.values()) tower.render(ctx, this.grid.cellSize);
    }

    renderPreview(ctx, col, row, reason) {
        const grid = this.grid;
        if (!grid.inBounds(col, row)) return;
        const s = grid.cellSize;
        const ok = reason === null;

        ctx.fillStyle = ok ? "rgba(74, 222, 128, 0.45)" : "rgba(239, 68, 68, 0.45)";
        ctx.fillRect(col * s, row * s, s, s);
        ctx.strokeStyle = ok ? "#4ade80" : "#ef4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(col * s + 1, row * s + 1, s - 2, s - 2);

        if (!ok) {
            const maxX = grid.cols * s;
            const x = Math.min(Math.max(col * s + s / 2, 80), maxX - 80);
            const y = row > 1 ? row * s - 10 : (row + 1) * s + 12;
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#000000";
            ctx.strokeText(reason, x, y);
            ctx.fillStyle = "#fca5a5";
            ctx.fillText(reason, x, y);
        }
    }
}