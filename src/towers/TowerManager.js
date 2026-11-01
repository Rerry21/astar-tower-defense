import { Tower } from "./Tower.js";
import { TOWER_TYPES, DEFAULT_TOWER } from "./TowerTypes.js";
import { CellType } from "../core/Grid.js";

export class TowerManager {
    constructor(grid, pathManager, projectiles) {
        this.grid = grid;
        this.pathManager = pathManager;
        this.projectiles = projectiles;
        this.towers = new Map();
        this.selectedType = DEFAULT_TOWER;
        this.routeCache = { col: -1, row: -1, version: -1, ok: false };
    }

    key(col, row) {
        return row * this.grid.cols + col;
    }

    towerAt(col, row) {
        if (!this.grid.inBounds(col, row)) return null;
        return this.towers.get(this.key(col, row)) || null;
    }

    check(col, row, enemies, money, typeName = this.selectedType) {
        const grid = this.grid;
        if (!grid.inBounds(col, row)) return "Outside the map";
        if (grid.getType(col, row) !== CellType.WALKABLE) return "Cell is occupied";
        for (let i = 0; i < enemies.length; i++) {
            if (grid.worldToCol(enemies[i].x) === col && grid.worldToRow(enemies[i].y) === row) {
                return "Enemy in the way";
            }
        }
        if (money < TOWER_TYPES[typeName].cost) return "Not enough money";
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

    place(col, row, enemies, money, typeName = this.selectedType) {
        if (this.check(col, row, enemies, money, typeName) !== null) return null;
        const tower = new Tower(col, row, this.grid, TOWER_TYPES[typeName], typeName);
        this.towers.set(this.key(col, row), tower);
        this.grid.setType(col, row, CellType.TOWER);
        return tower;
    }

    remove(col, row) {
        const tower = this.towerAt(col, row);
        if (!tower) return null;
        this.towers.delete(this.key(col, row));
        this.grid.setType(col, row, CellType.WALKABLE);
        return Math.floor(tower.invested * tower.sellRatio);
    }

    update(dt, enemies) {
        for (const tower of this.towers.values()) tower.update(dt, enemies, this.projectiles);
    }

    render(ctx) {
        for (const tower of this.towers.values()) tower.render(ctx);
    }

    drawRange(ctx, x, y, radius) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    renderPreview(ctx, col, row, reason) {
        const grid = this.grid;
        if (!grid.inBounds(col, row)) return;
        const s = grid.cellSize;
        const ok = reason === null;

        this.drawRange(ctx, grid.cellCenterX(col), grid.cellCenterY(row), TOWER_TYPES[this.selectedType].range * s);

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