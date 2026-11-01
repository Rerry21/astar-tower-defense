export const TARGETING_MODES = ["closest", "weakest", "first", "last"];

export function nextTargetingMode(mode) {
    return TARGETING_MODES[(TARGETING_MODES.indexOf(mode) + 1) % TARGETING_MODES.length];
}

function remainingDistance(enemy, cellSize) {
    const path = enemy.path;
    if (!path || enemy.pathIndex >= path.length) return 0;
    const waypoint = path[enemy.pathIndex];
    const dx = (waypoint.col + 0.5) * cellSize - enemy.x;
    const dy = (waypoint.row + 0.5) * cellSize - enemy.y;
    return Math.hypot(dx, dy) + (path.length - 1 - enemy.pathIndex) * cellSize;
}

function score(mode, tower, enemy, distSq) {
    if (mode === "weakest") return enemy.health;
    if (mode === "first") return remainingDistance(enemy, tower.cellSize);
    if (mode === "last") return -remainingDistance(enemy, tower.cellSize);
    return distSq;
}

export function findTarget(tower, enemies) {
    const rangeSq = tower.rangePx * tower.rangePx;
    const mode = tower.targetingMode;
    let best = null;
    let bestScore = Infinity;

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (!enemy.active) continue;
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > rangeSq) continue;

        const s = score(mode, tower, enemy, distSq);
        if (s < bestScore) {
            bestScore = s;
            best = enemy;
        }
    }

    return best;
}