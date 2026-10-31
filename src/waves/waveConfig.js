export function getWave(n) {
    return {
        count: 2 + n * 3,
        type: "basic",
        interval: Math.max(0.35, 1.1 - n * 0.05),
        healthMult: 1 + (n - 1) * 0.35,
        speedMult: 1 + (n - 1) * 0.03,
        rewardMult: 1 + (n - 1) * 0.1,
    };
}