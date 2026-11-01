import { Grid } from "./Grid.js";
import { GameState } from "./GameState.js";
import { Input } from "./Input.js";
import { level1 } from "./maps.js";
import { AStar } from "../pathfinding/AStar.js";
import { PathManager } from "../pathfinding/PathManager.js";
import { EnemyManager } from "../enemies/EnemyManager.js";
import { TowerManager } from "../towers/TowerManager.js";
import { ProjectileManager } from "../towers/ProjectileManager.js";
import { TOWER_TYPES } from "../towers/TowerTypes.js";
import { WaveManager } from "../waves/WaveManager.js";
import { HUD } from "../ui/HUD.js";

const CELL_SIZE = 32;
const START_MONEY = 250;
const START_LIVES = 20;
const WAVE_BONUS = 25;
const SPEEDS = [1, 2, 3];

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

        this.input = new Input(canvas);
        this.hud = new HUD();
        this.showDebug = true;

        window.addEventListener("keydown", (e) => this.onKey(e));

        this.reset();
    }

    reset() {
        this.grid = new Grid(level1, CELL_SIZE);
        this.state = new GameState(START_MONEY, START_LIVES);
        this.astar = new AStar(this.grid);
        this.pathManager = new PathManager(this.grid);
        this.projectiles = new ProjectileManager();
        this.enemies = new EnemyManager(this.grid, this.astar, {
            onKill: (enemy) => this.state.earn(enemy.reward),
            onLeak: (enemy) => this.state.loseLives(enemy.damage),
        });
        this.towers = new TowerManager(this.grid, this.pathManager, this.projectiles);
        this.waves = new WaveManager();
        this.selectedTower = null;
        this.paused = false;
        this.speed = 1;
        this.input.clicks.length = 0;
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

    onKey(e) {
        const key = e.key.toLowerCase();
        const towerKeys = Object.keys(TOWER_TYPES);
        if (e.code === "Space") {
            e.preventDefault();
            this.runAction("wave");
        } else if (key === "p") this.runAction("pause");
        else if (key === "f") this.runAction("speed");
        else if (key === "u") this.runAction("upgrade");
        else if (key === "escape") this.selectedTower = null;
        else if (key === "d") this.showDebug = !this.showDebug;
        else if (key === "v") this.enemies.showPaths = !this.enemies.showPaths;
        else if (key === "r" && this.state.status === "gameover") this.runAction("restart");
        else if (key >= "1" && key <= String(towerKeys.length)) this.runAction(`tower:${towerKeys[Number(key) - 1]}`);
    }

    runAction(action) {
        if (action === "restart") {
            this.reset();
            return;
        }
        if (this.state.status !== "playing") return;
        if (action === "wave") this.waves.start();
        else if (action === "pause") this.paused = !this.paused;
        else if (action === "speed") this.speed = SPEEDS[(SPEEDS.indexOf(this.speed) + 1) % SPEEDS.length];
        else if (action === "upgrade") this.upgradeSelected();
        else if (action === "sell") this.sellSelected();
        else if (action.startsWith("tower:")) this.towers.selectedType = action.slice(6);
    }

    upgradeSelected() {
        const tower = this.selectedTower;
        if (!tower) return;
        const next = tower.nextUpgrade();
        if (!next || this.state.money < next.cost) return;
        this.state.spend(next.cost);
        tower.upgrade();
    }

    sellSelected() {
        const tower = this.selectedTower;
        if (!tower) return;
        this.sellAt(tower.col, tower.row);
    }

    sellAt(col, row) {
        const tower = this.towers.towerAt(col, row);
        if (!tower) return;
        if (tower === this.selectedTower) this.selectedTower = null;
        const refund = this.towers.remove(col, row);
        if (refund !== null) {
            this.state.earn(refund);
            this.enemies.onGridChanged(true);
        }
    }

    handleInput() {
        let click;
        while ((click = this.input.nextClick())) {
            if (click.button === 0) {
                const action = this.hud.hitTest(click.x, click.y, this);
                if (action) {
                    this.runAction(action);
                    continue;
                }
            }
            if (this.state.status !== "playing") continue;

            const col = this.grid.worldToCol(click.x);
            const row = this.grid.worldToRow(click.y);
            if (click.button === 0) {
                const existing = this.towers.towerAt(col, row);
                if (existing) {
                    this.selectedTower = existing;
                } else if (this.grid.inBounds(col, row)) {
                    this.selectedTower = null;
                    const tower = this.towers.place(col, row, this.enemies.enemies, this.state.money);
                    if (tower) {
                        this.state.spend(tower.cost);
                        this.enemies.onGridChanged(false);
                    }
                }
            } else if (click.button === 2) {
                if (this.hud.overPanel(click.x, click.y, this)) continue;
                this.sellAt(col, row);
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

        if (this.paused) return;
        for (let i = 0; i < this.speed; i++) {
            if (this.state.status !== "playing") break;
            this.step(dt);
        }
    }

    step(dt) {
        if (this.waves.update(dt, this.enemies)) this.state.earn(WAVE_BONUS);
        this.enemies.update(dt);
        this.towers.update(dt, this.enemies.enemies);
        this.projectiles.update(dt, this.enemies.enemies);
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        this.grid.render(ctx);
        this.towers.render(ctx);

        const selected = this.selectedTower;
        if (selected && this.state.status === "playing") {
            this.towers.drawRange(ctx, selected.x, selected.y, selected.rangePx);
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 2;
            ctx.strokeRect(selected.col * CELL_SIZE + 1, selected.row * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }

        this.enemies.render(ctx);
        this.projectiles.render(ctx);

        const hovering = this.input.inside && this.state.status === "playing" && !this.hud.overPanel(this.input.x, this.input.y, this);
        if (hovering) {
            const col = this.grid.worldToCol(this.input.x);
            const row = this.grid.worldToRow(this.input.y);
            if (this.grid.inBounds(col, row)) {
                const tower = this.towers.towerAt(col, row);
                if (tower) {
                    if (tower !== selected) this.towers.drawRange(ctx, tower.x, tower.y, tower.rangePx);
                } else {
                    this.towers.renderPreview(ctx, col, row, this.towers.check(col, row, this.enemies.enemies, this.state.money));
                }
            }
        }

        if (this.showDebug) this.renderDebug(ctx);
        this.hud.render(ctx, this);
    }

    renderDebug(ctx) {
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
        ctx.fillText(`Repaths: last change ${this.enemies.lastRepaths} | total ${this.enemies.totalRepaths}`, 10, 64);
    }
}