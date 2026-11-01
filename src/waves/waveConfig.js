const SCRIPTED = {
    1: [["basic", 5]],
    2: [["basic", 8]],
    3: [["basic", 6], ["fast", 2]],
    4: [["basic", 6], ["fast", 4]],
    5: [["basic", 4], ["boss", 1]],
};

function generateGroups(n) {
    const groups = [["basic", 6 + n]];
    groups.push(["fast", Math.floor(n / 2)]);
    if (n >= 6) groups.push(["tank", Math.floor((n - 4  / 2))]);
    if (n % 5 === 0 ) groups.push(["boss", n / 5]);
    return groups;
}

export function getWave(n) {
    return {
        groups: SCRIPTED[n] || generateGroups(n),
        interval: Math.max(0.35, 1.1 - n * 0.05),
        healthMult: 1 + (n - 1) * 0.35,
        speedMult: 1 + (n - 1) * 0.03,
        rewardMult: 1 + (n - 1) * 0.1,
    };
}