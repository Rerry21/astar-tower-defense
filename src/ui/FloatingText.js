export class FloatingText {
    constructor() {
        this.items = [];
    }

    add(x, y, text, color) {
        this.items.push({ x, y, text, color, life: 0.9, maxLife: 0.9 });
    }

    update(dt) {
        const items = this.items;
        for (let i = items.length - 1; i >= 0; i--) {
            items[i].life -= dt;
            if (items[i].life <= 0) {
                items[i] = items[items.length - 1];
                items.pop();
            }
        }
    }

    render(ctx) {
        if (this.items.length === 0) return;

        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            ctx.globalAlpha = Math.min(1, (item.life / item.maxLife) * 2);
            ctx.fillStyle = item.color;
            ctx.fillText(item.text, item.x, item.y);
        }
        ctx.globalAlpha = 1;
    }
}