import { AStar } from "./AStar.js";

const SPEEDS = [15, 60, 180, 600];

export class AStarVisualizer {
    constructor(grid) {
        this.grid = grid;
        this.astar = new AStar(grid);
        this.active = false;
        this.paused = false;
        this.speedIndex = 1;
        this.version = -1;
        this.trace = [];
        this.path = null;
        this.state = new Uint8Array(grid.cols * grid.rows);
        this.step = 0;
        this.progress = 0;
        this.current = -1;
        this.openCount = 0;
        this.closedCount = 0;
    }

    get done() {
        return this.step >= this.trace.length;
    }

    toggle() {
        this.active = !this.active;
        if (this.active) {
            this.paused = false;
            this.compute();
        }
    }

    togglePause() {
        if (!this.active) return;
        if (this.done) {
            this.restart();
            this.paused = false;
            return;
        }
        this.paused = !this.paused;
    }

    faster() {
        if (this.active) this.speedIndex = Math.min(SPEEDS.length - 1, this.speedIndex + 1);
    }

    slower() {
        if (this.active) this.speedIndex = Math.max(0, this.speedIndex - 1);
    }

    stepOnce() {
        if (!this.active || this.done) return;
        this.paused = true;
        this.advance();
        this.progress = this.step;
    }

    compute() {
        const grid = this.grid;
        this.astar.trace = [];
        this.path = this.astar.findPath(grid.spawn.col, grid.spawn.row, grid.goal.col, grid.goal.row);
        this.trace = this.astar.trace;
        this.astar.trace = null;
        this.version = grid.version;
        this.restart();
    }

    restart() {
        this.state.fill(0);
        this.step = 0;
        this.progress = 0;
        this.current = -1;
        this.openCount = 0;
        this.closedCount = 0;
    }

    advance() {
        const code = this.trace[this.step++];
        const index = code >> 1;
        if (code & 1) {
            this.state[index] = 2;
            this.current = index;
            this.openCount--;
            this.closedCount++;
        } else {
            if (this.state[index] === 0) this.openCount++;
            this.state[index] = 1;
        }
    }

    update(dt) {
        if (!this.active) return;
        if (this.grid.version !== this.version) this.compute();
        if (this.paused || this.done) return;

        this.progress += SPEEDS[this.speedIndex] * dt;
        const target = Math.floor(this.progress);
        while (this.step < this.trace.length && this.step < target) this.advance();
    }

    render(ctx) {
        if (!this.active) return;

        const grid = this.grid;
        const s = grid.cellSize;
        const cols = grid.cols;
        const state = this.state;

        for (let i = 0; i < state.length; i++) {
            if (state[i] === 0) continue;
            ctx.fillStyle = state[i] === 1 ? "rgba(74, 222, 128, 0.5)" : "rgba(59, 130, 246, 0.5)";
            ctx.fillRect((i % cols) * s, ((i / cols) | 0) * s, s, s);
        }

        if (this.current >= 0 && !this.done) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;
            ctx.strokeRect((this.current % cols) * s + 1, ((this.current / cols) | 0) * s + 1, s - 2, s - 2);
        }

        if (this.done && this.path) {
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i = 0; i < this.path.length; i++) {
                const x = grid.cellCenterX(this.path[i].col);
                const y = grid.cellCenterY(this.path[i].row);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    renderPanel(ctx) {
        if (!this.active) return;

        const grid = this.grid;
        const w = 280;
        const h = 178;
        const x = 10;
        const y = grid.rows * grid.cellSize - h - 10;

        ctx.fillStyle = "rgba(27, 27, 34, 0.94)";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

        ctx.textBaseline = "middle";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("A* VISUALIZER", x + 12, y + 18);

        const status = this.done ? "DONE" : this.paused ? "PAUSED" : `${SPEEDS[this.speedIndex]} steps/s`;
        ctx.textAlign = "right";
        ctx.fillStyle = "#facc15";
        ctx.fillText(status, x + w - 12, y + 18);

        const legend = [
            ["Open", "rgba(74, 222, 128, 0.8)"],
            ["Closed", "rgba(59, 130, 246, 0.8)"],
            ["Current", "#ffffff"],
            ["Path", "#facc15"],
        ];
        ctx.font = "12px monospace";
        ctx.textAlign = "left";
        for (let i = 0; i < legend.length; i++) {
            const lx = x + 12 + (i % 2) * 130;
            const ly = y + 42 + Math.floor(i / 2) * 18;
            ctx.fillStyle = legend[i][1];
            ctx.fillRect(lx, ly - 6, 12, 12);
            ctx.fillStyle = "#e5e5ea";
            ctx.fillText(legend[i][0], lx + 18, ly);
        }

        ctx.fillStyle = "#e5e5ea";
        ctx.fillText(`Step ${this.step}/${this.trace.length}`, x + 12, y + 82);
        ctx.fillText(`Open: ${this.openCount}  Closed: ${this.closedCount}`, x + 12, y + 100);

        if (this.current >= 0) {
            const node = this.astar.nodes[this.current];
            ctx.fillText(`Node (${node.col},${node.row}) g=${node.g} h=${node.h} f=${node.f}`, x + 12, y + 118);
        } else {
            ctx.fillText("Node: -", x + 12, y + 118);
        }

        if (this.done) {
            ctx.fillStyle = this.path ? "#4ade80" : "#f87171";
            ctx.fillText(this.path ? `Path found: ${this.path.length} cells` : "NO PATH EXISTS", x + 12, y + 136);
        } else {
            ctx.fillStyle = "#8b8b99";
            ctx.fillText("Searching...", x + 12, y + 136);
        }

        ctx.font = "11px monospace";
        ctx.fillStyle = "#8b8b99";
        ctx.fillText("A off | S pause | -> step | [ ] speed", x + 12, y + 160);
    }
}