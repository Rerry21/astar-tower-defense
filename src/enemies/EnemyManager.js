import { Enemy } from "./Enemy.js";
import { drawPath } from "../pathfinding/PathRenderer.js";

export class EnemyManager {
    constructor(grid, astar) {
        this.grid = grid;
        this.astar = astar;
        this.enemies = [];
        this.showPaths = true;
    }

    spawn() {
        const { spawn, goal } = this.grid;
        const path = this.astar.findPath(spawn.col, spawn.row, goal.col, goal.row);
        if (!path) return null;

        const enemy = new Enemy(this.grid.cellCenterX(spawn.col), this.grid.cellCenterY(spawn.row));
        enemy.setPath(path);
        this.enemies.push(enemy);
        return enemy;
    }

    update(dt) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt, this.grid);
            if (enemy.reachedGoal) this.enemies.splice(i, 1);
        }
    }

    render(ctx) {
        if (this.showPaths) {
            for (const enemy of this.enemies) {
                drawPath(ctx, this.grid, enemy.path, enemy.pathIndex, enemy.x, enemy.y);
            }
        }
        for (const enemy of this.enemies) enemy.render(ctx);
    }
}