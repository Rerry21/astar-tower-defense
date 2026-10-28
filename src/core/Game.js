import { Grid } from "./Grid.js";
import { level1 } from "./maps.js";
import { AStar } from "../pathfinding/AStar.js";
import { EnemyManager } from "../enemies/EnemyManager.js";

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
        this.enemies = new EnemyManager(this.grid, this.astar);

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

    update(dt) {
        this.fpsFrames++;
        this.fpsTimer += dt;
        if (this.fpsTimer >= 0.5) {
            this.fps = Math.round(this.fpsFrames / this.fpsTimer);
            this.fpsFrames = 0;
            this.fpsTimer = 0;
        }

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
        this.enemies.render(ctx);

        const stats = this.astar.lastStats;
        ctx.fillStyle = "#e5e5ea";
        ctx.font = "14px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`FPS: ${this.fps}`, 10, 10);
        ctx.fillText(
            `A*: path ${stats.pathLength} | expanded ${stats.nodesExpanded} | ${stats.timeMs.toFixed(2)}ms`,
            10,
            30
        );
    }
}