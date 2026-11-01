import { findTarget } from "./Targeting.js";

export class Tower {
    constructor(col, row, grid, def, typeName) {
        this.def = def;
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
        this.splash = def.splash;
        this.splashPx = def.splash * grid.cellSize;
        this.projectileSpeed = def.projectileSpeed;
        this.projectileColor = def.projectileColor;
        this.projectileSize = def.projectileSize;
        this.cost = def.cost;
        this.invested = def.cost;
        this.sellRatio = def.sellRatio;
        this.color = def.color;
        this.outline = def.outline;
        this.level = 1;
        this.maxLevel = def.upgrades.length + 1;
        this.targetingMode = "closest";
        this.cooldown = 0;
        this.target = null;
        this.flash = 0;
    }

    nextUpgrade() {
        return this.def.upgrades[this.level - 1] || null;
    }

    upgrade() {
        const next = this.nextUpgrade();
        if (!next) return false;
        this.level++;
        this.invested += next.cost;
        this.damage = next.damage;
        this.range = next.range;
        this.rangePx = next.range * this.cellSize;
        this.attackInterval = next.attackInterval;
        if (next.splash !== undefined) {
            this.splash = next.splash;
            this.splashPx = next.splash * this.cellSize;
        }
        return true;
    }

    sellValue() {
        return Math.floor(this.invested * this.sellRatio);
    }

    update(dt, enemies, projectiles) {
        if (this.flash > 0) this.flash -= dt;
        if (this.cooldown > 0) this.cooldown -= dt;
        if (this.cooldown > 0) return;

        const target = findTarget(this, enemies);
        if (!target) {
            this.target = null;
            return;
        }

        this.target = target;
        projectiles.add(this.x, this.y, target, this);
        this.cooldown = this.attackInterval;
        this.flash = 0.12;
    }

    render(ctx) {
        const s = this.cellSize;
        const inset = 5;

        if (this.flash > 0 && this.target) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.stroke();
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(this.col * s + inset, this.row * s + inset, s - inset * 2, s - inset * 2);
        ctx.strokeStyle = this.outline;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.col * s + inset, this.row * s + inset, s - inset * 2, s - inset * 2);
        ctx.fillStyle = this.outline;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.splashPx > 0 ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#facc15";
        for (let i = 1; i < this.level; i++) {
            ctx.fillRect(this.col * s + 7 + (i - 1) * 7, this.row * s + s - 10, 5, 4);
        }
    }
}