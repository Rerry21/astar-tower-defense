export function drawPath(ctx, grid, path, startIndex, x, y) {
    if (!path || startIndex >= path.length) return;

    ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = startIndex; i < path.length; i++) {
        ctx.lineTo(grid.cellCenterX(path[i].col), grid.cellCenterY(path[i].row));
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(250, 204, 21, 0.85)";
    for (let i = startIndex; i < path.length; i++) {
        ctx.fillRect(grid.cellCenterX(path[i].col) - 2, grid.cellCenterY(path[i].row) - 2, 4, 4);
    }
}