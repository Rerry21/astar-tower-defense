export class Enemy {
    constructor(x, y, def, healthMult = 1, speedMult = 1, rewardMult = 1) {
        this.x = x;
        this.y = y;
        this.maxHealth = Math.round(def.maxHealth * healthMult);
        this.health = this.maxHealth;
        this.speed = def.speed * speedMult;
        this.damage = def.damage;
        this.reward = Math.round(def.reward * rewardMult);
        this.radius = def.radius;
        this.color = def.color;
        this.outline = def.outline;
        this.path = null;
        this.pathIndex = 0;
        this.reachedGoal = false;
        this.dead = false;
    }

    get active() {
        return !this.dead && !this.reachedGoal;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
        }
    }

    setPath(path) {
        this.path = path;
        this.pathIndex = 0;
    }

    isPathBlocked(grid) {
        if (!this.path) return false;
        for (let i = this.pathIndex; i < this.path.length; i++) {
            if (!grid.isWalkable(this.path[i].col, this.path[i].row)) return true;
        }
        return false;
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
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.outline;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.health < this.maxHealth) {
            const w = 24;
            const h = 4;
            const x = this.x - w / 2;
            const y = this.y - this.radius - 9;
            ctx.fillStyle = "#450a0a";
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = "#4ade80";
            ctx.fillRect(x, y, w * (this.health / this.maxHealth), h);
        }
    }
}