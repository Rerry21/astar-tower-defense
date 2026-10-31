import { getWave } from "./waveConfig.js";

export class WaveManager {
    constructor() {
        this.wave = 0;
        this.phase = "idle";
        this.config = null;
        this.remainingToSpawn = 0;
        this.timer = 0;
    }

    canStart() {
        return this.phase === "idle";
    }

    start() {
        if (!this.canStart()) return false;
        this.wave++;
        this.config = getWave(this.wave);
        this.remainingToSpawn = this.config.count;
        this.timer = 0;
        this.phase = "spawning";
        return true;
    }

    enemiesLeft(enemyManager) {
        return this.remainingToSpawn + enemyManager.enemies.length;
    }

    update(dt, enemyManager) {
        if (this.phase === "spawning") {
            const cfg = this.config;
            this.timer -= dt;
            while (this.timer <= 0 && this.remainingToSpawn > 0) {
                enemyManager.spawn(cfg.type, cfg.healthMult, cfg.speedMult, cfg.rewardMult);
                this.remainingToSpawn--;
                this.timer += cfg.interval;
            }
            if (this.remainingToSpawn === 0) this.phase = "clearing";
            return false;
        }

        if (this.phase === "clearing" && enemyManager.enemies.length === 0) {
            this.phase = "idle";
            return true;
        }

        return false;
    }
}