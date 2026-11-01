import { Projectile } from "./Projectile.js";

export class ProjectileManager {
    constructor() {
        this.items = [];
        this.effects = [];
        this.fired = 0;
        this.hits = 0;
    }

    add(x, y, target, tower) {
        this.items.push(new Projectile(x, y, target, tower));
        this.fired++;
    }

    update(dt, enemies) {
        const items = this.items;
        for (let i = items.length - 1; i >= 0; i--) {
            const projectile = items[i];
            if (projectile.update(dt, enemies, this.effects)) {
                if (projectile.landed) this.hits++;
                items[i] = items[items.length - 1];
                items.pop();
            }
        }

        const effects = this.effects;
        for (let i = effects.length - 1; i >= 0; i--) {
            effects[i].life -= dt;
            if (effects[i].life <= 0) {
                effects[i] = effects[effects.length - 1];
                effects.pop();
            }
        }
    }

    render(ctx) {
        for (let i = 0; i < this.effects.length; i++) {
            const e = this.effects[i];
            const t = 1 - e.life / e.maxLife;
            ctx.fillStyle = `rgba(251, 146, 60, ${0.5 * (1 - t)})`;
            ctx.strokeStyle = `rgba(254, 215, 170, ${1 - t})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius * (0.4 + 0.6 * t), 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        for (let i = 0; i < this.items.length; i++) this.items[i].render(ctx);

        ctx.fillStyle = "#e5e5ea";
        ctx.font = "14px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`Shots: ${this.fired} | Hits: ${this.hits}`, 10, 82);
    }
}