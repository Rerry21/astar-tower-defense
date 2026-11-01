export class Projectile {
    constructor(x, y, target, tower) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = tower.damage;
        this.speed = tower.projectileSpeed;
        this.splashPx = tower.splashPx;
        this.color = tower.projectileColor;
        this.size = tower.projectileSize;
        this.aimX = target.x;
        this.aimY = target.y;
        this.landed = false;
    }

    update(dt, enemies, effects) {
        const target = this.target;

        if (target.active) {
            this.aimX = target.x;
            this.aimY = target.y;
        } else if (this.splashPx === 0) {
            return true;
        }

        const dx = this.aimX - this.x;
        const dy = this.aimY - this.y;
        const dist = Math.hypot(dx, dy);
        const step = this.speed * dt;
        const reach = target.active ? target.radius : 2;

        if (dist <= step + reach) {
            this.explode(enemies, effects);
            return true;
        }

        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        return false;
    }

    explode(enemies, effects) {
        this.landed = true;

        if (this.splashPx === 0) {
            this.target.takeDamage(this.damage);
            return;
        }

        const radiusSq = this.splashPx * this.splashPx;
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (!enemy.active) continue;
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            if (dx * dx + dy * dy <= radiusSq) enemy.takeDamage(this.damage);
        }
        effects.push({ x: this.x, y: this.y, radius: this.splashPx, life: 0.25, maxLife: 0.25 });
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}