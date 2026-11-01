import { TOWER_TYPES } from "../towers/TowerTypes.js";
import { getWave } from "../waves/waveConfig.js";

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

const PANEL = { x: 736, y: 10, w: 214, h: 270 };
const TARGET_BTN = { x: 748, y: 160, w: 190, h: 28 };
const UPGRADE_BTN = { x: 748, y: 196, w: 190, h: 30 };
const SELL_BTN = { x: 748, y: 234, w: 190, h: 26 };

const RESTART = { x: 400, y: 340, w: 160, h: 48 };

function inside(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function fmt(value) {
    return String(Math.round(value * 100) / 100);
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export class HUD {
    hitTest(x, y, game) {
        if (game.state.status === "gameover") return inside(x, y, RESTART) ? "restart" : null;

        if (game.selectedTower) {
            if (inside(x, y, TARGET_BTN)) return "targeting";
            if (inside(x, y, UPGRADE_BTN)) return "upgrade";
            if (inside(x, y, SELL_BTN)) return "sell";
            if (inside(x, y, PANEL)) return "panel";
        }

        for (let i = 0; i < BUTTONS.length; i++) {
            if (inside(x, y, BUTTONS[i])) return BUTTONS[i].id;
        }
        for (let i = 0; i < TOWER_BUTTONS.length; i++) {
            if (inside(x, y, TOWER_BUTTONS[i])) return TOWER_BUTTONS[i].id;
        }
        return null;
    }

    overPanel(x, y, game) {
        return game.selectedTower !== null && game.state.status === "playing" && inside(x, y, PANEL);
    }

    drawButton(ctx, rect, label, enabled, fill = "#2563eb", edge = "#60a5fa") {
        ctx.fillStyle = enabled ? fill : "#33333d";
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = enabled ? edge : "#4a4a56";
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

    renderPanel(ctx, game) {
        const tower = game.selectedTower;
        const next = tower.nextUpgrade();

        ctx.fillStyle = "rgba(27, 27, 34, 0.95)";
        ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 2;
        ctx.strokeRect(PANEL.x + 1, PANEL.y + 1, PANEL.w - 2, PANEL.h - 2);

        ctx.textBaseline = "middle";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(tower.name, PANEL.x + 14, PANEL.y + 22);
        ctx.fillStyle = "#facc15";
        ctx.textAlign = "right";
        ctx.fillText(`Lv ${tower.level}/${tower.maxLevel}`, PANEL.x + PANEL.w - 14, PANEL.y + 22);

        const rows = [
            ["Damage", fmt(tower.damage), next ? fmt(next.damage) : null],
            ["Range", fmt(tower.range), next ? fmt(next.range) : null],
            ["Speed", `${fmt(1 / tower.attackInterval)}/s`, next ? `${fmt(1 / next.attackInterval)}/s` : null],
        ];
        if (tower.splash > 0) {
            rows.push(["Splash", fmt(tower.splash), next ? fmt(next.splash !== undefined ? next.splash : tower.splash) : null]);
        }

        ctx.font = "13px monospace";
        ctx.textAlign = "left";
        for (let i = 0; i < rows.length; i++) {
            const [label, value, nextValue] = rows[i];
            const y = PANEL.y + 54 + i * 21;
            const text = `${label}: ${value}`;
            ctx.fillStyle = "#e5e5ea";
            ctx.fillText(text, PANEL.x + 14, y);
            if (nextValue !== null && nextValue !== value) {
                const w = ctx.measureText(text).width;
                ctx.fillStyle = "#4ade80";
                ctx.fillText(` -> ${nextValue}`, PANEL.x + 14 + w, y);
            }
        }

        this.drawButton(ctx, TARGET_BTN, `Target: ${capitalize(tower.targetingMode)}`, true, "#374151", "#9ca3af");

        if (next) {
            this.drawButton(ctx, UPGRADE_BTN, `Upgrade $${next.cost}`, game.state.money >= next.cost);
        } else {
            this.drawButton(ctx, UPGRADE_BTN, "MAX LEVEL", false);
        }
        this.drawButton(ctx, SELL_BTN, `Sell $${tower.sellValue()}`, true, "#b91c1c", "#f87171");
    }

    renderNextWave(ctx, game) {
        const { waves, state } = game;
        if (!waves.canStart() || state.status !== "playing") return;

        const groups = getWave(waves.wave + 1).groups.filter((group) => group[1] > 0);
        const text = `Next wave ${waves.wave + 1}: ${groups.map((group) => `${group[1]} ${group[0]}`).join(", ")}`;

        ctx.font = "bold 14px monospace";
        const w = ctx.measureText(text).width + 28;
        const x = (game.width - w) / 2;
        const y = BAR_Y - 36;

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(x, y, w, 26);
        ctx.fillStyle = "#e5e5ea";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, game.width / 2, y + 13);
    }

    renderBanner(ctx, game) {
        const banner = game.banner;
        if (!banner || game.state.status !== "playing") return;

        ctx.globalAlpha = Math.min(1, banner.life / 0.6);
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#000000";
        ctx.strokeText(banner.text, game.width / 2, 130);
        ctx.fillStyle = "#4ade80";
        ctx.fillText(banner.text, game.width / 2, 130);
        ctx.globalAlpha = 1;
    }

    renderTooltip(ctx, game) {
        const input = game.input;
        if (!input.inside || game.state.status !== "playing") return;

        let rect = null;
        for (let i = 0; i < TOWER_BUTTONS.length; i++) {
            if (inside(input.x, input.y, TOWER_BUTTONS[i])) rect = TOWER_BUTTONS[i];
        }
        if (!rect) return;

        const def = TOWER_TYPES[rect.type];
        const lines = [
            [def.name, "#ffffff"],
            [`Cost: $${def.cost}`, "#facc15"],
            [`Damage: ${fmt(def.damage)}`, "#e5e5ea"],
            [`Range: ${fmt(def.range)}`, "#e5e5ea"],
            [`Speed: ${fmt(1 / def.attackInterval)}/s`, "#e5e5ea"],
        ];
        if (def.splash > 0) lines.push([`Splash: ${fmt(def.splash)}`, "#e5e5ea"]);

        const w = 170;
        const h = 16 + lines.length * 18;
        const x = rect.x;
        const y = rect.y - h - 6;

        ctx.fillStyle = "rgba(27, 27, 34, 0.96)";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = def.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

        ctx.font = "bold 13px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        for (let i = 0; i < lines.length; i++) {
            ctx.fillStyle = lines[i][1];
            ctx.fillText(lines[i][0], x + 12, y + 17 + i * 18);
        }
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
        ctx.fillText("1-3: tower | L-click: place/select | R-click: sell", 500, 698);
        ctx.fillText("Space wave | P pause | F speed | D debug | V paths | U upgrade | T target", 500, 711);

        if (game.selectedTower && state.status === "playing") this.renderPanel(ctx, game);
        this.renderNextWave(ctx, game);
        this.renderBanner(ctx, game);

        if (game.paused && state.status === "playing") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fillRect(0, 0, game.width, BAR_Y);
            ctx.fillStyle = "#e5e5ea";
            ctx.font = "bold 48px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("PAUSED", game.width / 2, BAR_Y / 2);
        }

        this.renderTooltip(ctx, game);

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