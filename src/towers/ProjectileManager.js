import { Projectile } from "./Projectile.js";

export class ProjectileManager {
    constructor() {
        this.items = [];
    }

    add(x, y, target, damage) {
        this.items.push(new Projectile(x, y, target, damage));
    }

    update(dt) {
        const items = this.items;
        for (let i = items.length - 1; i >= 0; i--) {
            if (items[i].update(dt)) {
                items[i] = items[items.length - 1];
                items.pop();
            }
        }
    }

    render(ctx) {
        for (let i = 0; i < this.items.length; i++) this.items[i].render(ctx);
    }
}