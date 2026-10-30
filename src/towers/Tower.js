export class Tower {
    constructor(col, row, grid) {
        this.col = col;
        this.row = row;
        this.x = grid.cellCenterX(col);
        this.y = grid.cellCenterY(row);
        this.range = 4;
        this.damage = 10;
        this.attackSpeed = 1;
        this.cost = 100;
        this.level = 1;
        this.targetingMode = "closest";
    }

    render(ctx, cellSize) {
        const inset = 5;
        ctx.fillStyle = "#60a5fa";
        ctx.fillRect(this.col * cellSize + inset, this.row * cellSize + inset, cellSize - inset * 2, cellSize - inset * 2);
        ctx.strokeStyle = "#1e3a8a";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.col * cellSize + inset, this.row * cellSize + inset, cellSize - inset * 2, cellSize - inset * 2);
        ctx.fillStyle = "#1e3a8a";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}