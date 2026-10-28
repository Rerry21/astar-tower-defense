export const CellType = {
    WALKABLE: 0,
    BLOCKED: 1,
    TOWER: 2,
    SPAWN: 3,
    GOAL: 4,
};

const COLORS = ["#25252d", "#5b5b6b", "#3b82f6", "#16a34a", "#dc2626"];

export class Grid {
    constructor(layout, cellSize) {
        this.cellSize = cellSize;
        this.rows = layout.length;
        this.cols = layout[0].length;
        this.cells = new Uint8Array(this.cols * this.rows);
        this.spawn = null;
        this.goal = null;
        this.version = 0;
        this.load(layout);
    }

    load(layout) {
        for (let row = 0; row < this.rows; row++) {
            if (layout[row].length !== this.cols) {
                throw new Error(`Map row ${row} has length ${layout[row].length}, expected ${this.cols}`);
            }
            for (let col = 0; col < this.cols; col++) {
                const ch = layout[row][col];
                let type = CellType.WALKABLE;
                if (ch === "#") type = CellType.BLOCKED;
                else if (ch === "A") {
                    type = CellType.SPAWN;
                    this.spawn = { col, row };
                } else if (ch === "B") {
                    type = CellType.GOAL;
                    this.goal = { col, row };
                }
                this.cells[row * this.cols + col] = type;
            }
        }
        if (!this.spawn || !this.goal) {
            throw new Error("Map needs both an A (spawn) and a B (goal)");
        }
    }

    inBounds(col, row) {
        return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
    }

    getType(col, row) {
        return this.cells[row * this.cols + col];
    }

    setType(col, row, type) {
        this.cells[row * this.cols + col] = type;
        this.version++;
    }

    isWalkable(col, row) {
        if (!this.inBounds(col, row)) return false;
        const type = this.cells[row * this.cols + col];
        return type !== CellType.BLOCKED && type !== CellType.TOWER;
    }

    cellCenterX(col) {
        return col * this.cellSize + this.cellSize / 2;
    }

    cellCenterY(row) {
        return row * this.cellSize + this.cellSize / 2;
    }

    worldToCol(x) {
        return Math.floor(x / this.cellSize);
    }

    worldToRow(y) {
        return Math.floor(y / this.cellSize);
    }

    render(ctx) {
        const s = this.cellSize;
        const w = this.cols * s;
        const h = this.rows * s;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                ctx.fillStyle = COLORS[this.cells[row * this.cols + col]];
                ctx.fillRect(col * s, row * s, s, s);
            }
        }

        ctx.strokeStyle = "#33333d";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let col = 0; col <= this.cols; col++) {
            ctx.moveTo(col * s + 0.5, 0);
            ctx.lineTo(col * s + 0.5, h);
        }
        for (let row = 0; row <= this.rows; row++) {
            ctx.moveTo(0, row * s + 0.5);
            ctx.lineTo(w, row * s + 0.5);
        }
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("A", this.cellCenterX(this.spawn.col), this.cellCenterY(this.spawn.row));
        ctx.fillText("B", this.cellCenterX(this.goal.col), this.cellCenterY(this.goal.row));
    }
}