export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.maxHealth = 100;
        this.health = 100;
        this.speed = 120;
        this.damage = 1;
        this.reward = 25;
        this.radius = 10;
        this.path = null;
        this.pathIndex = 0;
        this.reachedGoal = false;
    }

    setPath(path) {
        this.path = path;
        this.pathIndex = 0;
    }

    update(dt, grid) {
        if (!this.path || this.reachedGoal) return;

        let remaining = this.speed * dt;
        while (remaining > 0 && this.pathIndex < this.path.length) {
            const target = this.path[this.pathIndex];
            const tx = grid.cellCenterX(target.col);
            const ty = grid.cellCenterY(target.row);
            const dx = tx - this.x;
            const dy = ty - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= remaining) {
                this.x = tx;
                this.y = ty;
                remaining -= dist;
                this.pathIndex++;
            } else {
                this.x += (dx / dist) * remaining;
                this.y += (dy / dist) * remaining;
                remaining = 0;
            }
        }

        if (this.pathIndex >= this.path.length) this.reachedGoal = true;
    }

    render(ctx) {
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#7c2d12";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}