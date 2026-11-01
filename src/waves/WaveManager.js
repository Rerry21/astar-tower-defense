import { getWave } from "./waveConfig.js";

export class WaveManager {
    constructor() {
        this.wave = 0;
        this.phase = "idle";
        this.config = null;
        this.queue = [];
        this.nextIndex = 0;
        this.timer = 0;
    }

    canStart() {
        return this.phase === "idle";
    }

    start() {
        if (!this.canStart()) return false;
        this.wave++;
        this.config = getWave(this.wave);
        this.queue = [];
        for (const [type, count] of this.config.groups) {
            for (let i = 0; i < count; i++) this.queue.push(type);
        }
        this.nextIndex = 0;
        this.timer = 0;
        this.phase = this.queue.length > 0 ? "spawning" : "clearing";
        return true;
    }

    enemiesLeft(enemyManager) {
        return this.queue.length - this.nextIndex + enemyManager.enemies.length;
    }

    update(dt, enemyManager) {
        if (this.phase === "spawning") {
            const cfg = this.config;
            this.timer -= dt;
            while (this.timer <= 0 && this.nextIndex < this.queue.length) {
                enemyManager.spawn(this.queue[this.nextIndex], cfg.healthMult, cfg.speedMult, cfg.rewardMult);
                this.nextIndex++;
                this.timer += cfg.interval;
            }
            if (this.nextIndex >= this.queue.length) this.phase = "clearing";
            return false;
        }

        if (this.phase === "clearing" && enemyManager.enemies.length === 0) {
            this.phase = "idle";
            return true;
        }

        return false;
    }
}