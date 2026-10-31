import { Enemy } from "./Enemy.js";
import { ENEMY_TYPES } from "./EnemyTypes.js";
import { drawPath } from "../pathfinding/PathRenderer.js";

export class EnemyManager {
    constructor(grid, astar, callbacks) {
        this.grid = grid;
        this.astar = astar;
        this.onKill = callbacks.onKill;
        this.onLeak = callbacks.onLeak;
        this.enemies = [];
        this.showPaths = true;
        this.lastRepaths = 0;
        this.totalRepaths = 0;
    }

    spawn(typeName, healthMult = 1, speedMult = 1, rewardMult = 1) {
        const { spawn, goal } = this.grid;
        const path = this.astar.findPath(spawn.col, spawn.row, goal.col, goal.row);
        if (!path) return null;

        const enemy = new Enemy(
            this.grid.cellCenterX(spawn.col),
            this.grid.cellCenterY(spawn.row),
            ENEMY_TYPES[typeName],
            healthMult,
            speedMult,
            rewardMult
        );
        enemy.setPath(path);
        this.enemies.push(enemy);
        return enemy;
    }

    repath(enemy) {
        const grid = this.grid;
        const waypoint = enemy.path ? enemy.path[enemy.pathIndex] : null;

        let col;
        let row;
        if (waypoint && grid.isWalkable(waypoint.col, waypoint.row)) {
            col = waypoint.col;
            row = waypoint.row;
        } else {
            col = grid.worldToCol(enemy.x);
            row = grid.worldToRow(enemy.y);
        }

        const path = this.astar.findPath(col, row, grid.goal.col, grid.goal.row);
        if (!path) return false;
        enemy.setPath(path);
        return true;
    }

    onGridChanged(repathAll) {
        let count = 0;
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (repathAll || enemy.isPathBlocked(this.grid)) {
                if (this.repath(enemy)) count++;
            }
        }
        this.lastRepaths = count;
        this.totalRepaths += count;
    }

    update(dt) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.dead) enemy.update(dt, this.grid);

            if (enemy.dead) {
                this.enemies.splice(i, 1);
                this.onKill(enemy);
            } else if (enemy.reachedGoal) {
                this.enemies.splice(i, 1);
                this.onLeak(enemy);
            }
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