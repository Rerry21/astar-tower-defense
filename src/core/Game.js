import { Grid } from "./Grid.js";
import { Input } from "./Input.js";
import { level1 } from "./maps.js";
import { AStar } from "../pathfinding/AStar.js";
import { PathManager } from "../pathfinding/PathManager.js";
import { EnemyManager } from "../enemies/EnemyManager.js";
import { TowerManager } from "../towers/TowerManager.js";

const CELL_SIZE = 32;

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;

        this.lastTime = 0;
        this.running = false;

        this.fps = 0;
        this.fpsFrames = 0;
        this.fpsTimer = 0;

        this.grid = new Grid(level1, CELL_SIZE);
        this.astar = new AStar(this.grid);
        this.pathManager = new PathManager(this.grid);
        this.enemies = new EnemyManager(this.grid, this.astar);
        this.towers = new TowerManager(this.grid, this.pathManager);
        this.input = new Input(canvas);

        this.spawnTimer = 0;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(timestamp) {
        if (!this.running) return;

        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    handleInput() {
        let click;
        while ((click = this.input.nextClick())) {
            const col = this.grid.worldToCol(click.x);
            const row = this.grid.worldToRow(click.y);
            if (click.button === 0) {
                if (this.towers.place(col, row, this.enemies.enemies)) this.enemies.onGridChanged(false);
            } else if (click.button === 2) {
                if (this.towers.remove(col, row)) this.enemies.onGridChanged(true);
            }
        }
    }

    update(dt) {
        this.fpsFrames++;
        this.fpsTimer += dt;
        if (this.fpsTimer >= 0.5) {
            this.fps = Math.round(this.fpsFrames / this.fpsTimer);
            this.fpsFrames = 0;
            this.fpsTimer = 0;
        }

        this.handleInput();

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.enemies.spawn();
            this.spawnTimer = 2;
        }

        this.enemies.update(dt);
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        this.grid.render(ctx);
        this.towers.render(ctx);
        this.enemies.render(ctx);

        if (this.input.inside) {
            const col = this.grid.worldToCol(this.input.x);
            const row = this.grid.worldToRow(this.input.y);
            if (this.grid.inBounds(col, row)) {
                this.towers.renderPreview(ctx, col, row, this.towers.check(col, row, this.enemies.enemies));
            }
        }

        this.renderHud(ctx);
    }

    renderHud(ctx) {
        const enemyStats = this.astar.lastStats;
        const checkStats = this.pathManager.checker.lastStats;

        ctx.fillStyle = "#e5e5ea";
        ctx.font = "14px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`FPS: ${this.fps}`, 10, 10);
        ctx.fillText(
            `Enemy A*: path ${enemyStats.pathLength} | expanded ${enemyStats.nodesExpanded} | ${enemyStats.timeMs.toFixed(2)}ms`,
            10,
            28
        );
        ctx.fillText(
            `Placement check: expanded ${checkStats.nodesExpanded} | ${checkStats.timeMs.toFixed(2)}ms`,
            10,
            46
        );
        ctx.fillText(
            `Repaths: last change ${this.enemies.lastRepaths} | total ${this.enemies.totalRepaths}`,
            10,
            64
        );

        ctx.textBaseline = "bottom";
        ctx.fillText("Left click: place tower | Right click: remove tower", 10, this.height - 10);
    }
}