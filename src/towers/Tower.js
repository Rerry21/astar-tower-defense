import { findTarget } from "./Targeting.js";

export class Tower {
    constructor(col, row, grid, def, typeName) {
        this.typeName = typeName;
        this.col = col;
        this.row = row;
        this.x = grid.cellCenterX(col);
        this.y = grid.cellCenterY(row);
        this.cellSize = grid.cellSize;
        this.name = def.name;
        this.range = def.range;
        this.rangePx = def.range * grid.cellSize;
        this.damage = def.damage;
        this.attackInterval = def.attackInterval;
        this.projectileSpeed = def.projectileSpeed;
        this.projectileColor = def.projectileColor;
        this.projectileSize = def.projectileSize;
        this.splashPx = def.splash * grid.cellSize;
        this.cost = def.cost;
        this.invested = def.cost;
        this.sellRatio = def.sellRatio;
        this.color = def.color;
        this.outline = def.outline;
        this.level = 1;
        this.targetingMode = "closest";
        this.cooldown = 0;
    }

    update(dt, enemies, projectiles) {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
            if (this.cooldown > 0) return;
        }

        const target = findTarget(this, enemies);
        if (!target) return;

        projectiles.add(this.x, this.y, target, this);
        this.cooldown = this.attackInterval;
    }

    render(ctx) {
        const s = this.cellSize;
        const inset = 5;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.col * s + inset, this.row * s + inset, s - inset * 2, s - inset * 2);
        ctx.strokeStyle = this.outline;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.col * s + inset, this.row * s + inset, s - inset * 2, s - inset * 2);
        ctx.fillStyle = this.outline;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.splashPx > 0 ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
    }
}