import { TOWER_TYPES } from "../towers/TowerTypes.js";

const BAR_Y = 640;
const BAR_H = 80;

const BUTTONS = [
    { id: "wave", x: 500, y: 650, w: 160, h: 34 },
    { id: "pause", x: 672, y: 650, w: 110, h: 34 },
    { id: "speed", x: 794, y: 650, w: 150, h: 34 },
];

const TOWER_BUTTONS = Object.keys(TOWER_TYPES).map((type, i) => ({
    id: `tower:${type}`,
    type,
    x: 16 + i * 160,
    y: 688,
    w: 152,
    h: 26,
}));

const RESTART = { x: 400, y: 340, w: 160, h: 48 };

function inside(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export class HUD {
    hitTest(x, y, game) {
        if (game.state.status === "gameover") return inside(x, y, RESTART) ? "restart" : null;
        for (let i = 0; i < BUTTONS.length; i++) {
            if (inside(x, y, BUTTONS[i])) return BUTTONS[i].id;
        }
        for (let i = 0; i < TOWER_BUTTONS.length; i++) {
            if (inside(x, y, TOWER_BUTTONS[i])) return TOWER_BUTTONS[i].id;
        }
        return null;
    }

    drawButton(ctx, rect, label, enabled) {
        ctx.fillStyle = enabled ? "#2563eb" : "#33333d";
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = enabled ? "#60a5fa" : "#4a4a56";
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
        ctx.fillStyle = enabled ? "#ffffff" : "#8b8b99";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
    }

    drawTowerButton(ctx, rect, index, game) {
        const def = TOWER_TYPES[rect.type];
        const selected = game.towers.selectedType === rect.type;
        const affordable = game.state.money >= def.cost;

        ctx.fillStyle = selected ? "#2a2a38" : "#23232c";
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = selected ? "#facc15" : "#4a4a56";
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);

        ctx.fillStyle = def.color;
        ctx.fillRect(rect.x + 8, rect.y + 7, 12, 12);

        ctx.fillStyle = affordable ? "#e5e5ea" : "#8b8b99";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`${index + 1} ${def.label} $${def.cost}`, rect.x + 28, rect.y + rect.h / 2);
    }

    render(ctx, game) {
        const { state, waves, enemies } = game;

        ctx.fillStyle = "#1b1b22";
        ctx.fillRect(0, BAR_Y, game.width, BAR_H);
        ctx.fillStyle = "#3a3a46";
        ctx.fillRect(0, BAR_Y, game.width, 2);

        ctx.font = "bold 18px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#facc15";
        ctx.fillText(`$${state.money}`, 16, 667);
        ctx.fillStyle = "#f87171";
        ctx.fillText(`Lives: ${state.lives}`, 110, 667);
        ctx.fillStyle = "#e5e5ea";
        ctx.fillText(`Wave: ${waves.wave}`, 250, 667);
        ctx.fillText(`Enemies: ${waves.enemiesLeft(enemies)}`, 350, 667);

        const canStart = waves.canStart() && state.status === "playing";
        this.drawButton(ctx, BUTTONS[0], waves.canStart() ? `Start Wave ${waves.wave + 1}` : `Wave ${waves.wave} running`, canStart);
        this.drawButton(ctx, BUTTONS[1], game.paused ? "Resume" : "Pause", true);
        this.drawButton(ctx, BUTTONS[2], `Speed x${game.speed}`, true);

        for (let i = 0; i < TOWER_BUTTONS.length; i++) this.drawTowerButton(ctx, TOWER_BUTTONS[i], i, game);

        ctx.font = "11px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#8b8b99";
        ctx.fillText("1-3: select tower | L-click: place | R-click: sell", 500, 698);
        ctx.fillText("Space: wave | P: pause | F: speed | D: debug | V: paths", 500, 711);

        if (game.paused && state.status === "playing") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fillRect(0, 0, game.width, BAR_Y);
            ctx.fillStyle = "#e5e5ea";
            ctx.font = "bold 48px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("PAUSED", game.width / 2, BAR_Y / 2);
        }

        if (state.status === "gameover") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
            ctx.fillRect(0, 0, game.width, BAR_Y);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ef4444";
            ctx.font = "bold 64px sans-serif";
            ctx.fillText("GAME OVER", game.width / 2, 250);
            ctx.fillStyle = "#e5e5ea";
            ctx.font = "20px sans-serif";
            ctx.fillText(`You reached wave ${waves.wave}`, game.width / 2, 310);
            this.drawButton(ctx, RESTART, "Restart (R)", true);
        }
    }
}