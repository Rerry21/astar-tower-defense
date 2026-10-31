export class Projectile {
    constructor(x, y, target, damage) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = 420;
    }

    update(dt) {
        const target = this.target;
        if (!target.active) return true;

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        const step = this.speed * dt;

        if (dist <= step + target.radius * 0.5) {
            target.takeDamage(this.damage);
            return true;
        }

        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        return false;
    }

    render(ctx) {
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }
}