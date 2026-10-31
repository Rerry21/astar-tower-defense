export function findTarget(tower, enemies) {
    const rangeSq = tower.rangePx * tower.rangePx;
    let best = null;
    let bestDist = Infinity;

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (!enemy.active) continue;
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        const dist = dx * dx + dy * dy;
        if (dist <= rangeSq && dist < bestDist) {
            bestDist = dist;
            best = enemy;
        }
    }

    return best;
}