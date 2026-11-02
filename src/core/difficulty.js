export const DIFFICULTIES = {
    easy: {
        label: "Easy",
        startMoney: 350,
        startLives: 30,
        enemyHealth: 0.8,
        reward: 1.15,
        waveBonus: 35,
    },
    normal: {
        label: "Normal",
        startMoney: 250,
        startLives: 20,
        enemyHealth: 1,
        reward: 1,
        waveBonus: 25,
    },
    hard: {
        label: "Hard",
        startMoney: 200,
        startLives: 12,
        enemyHealth: 1.3,
        reward: 0.9,
        waveBonus: 20,
    },
};

export const DIFFICULTY_ORDER = ["easy", "normal", "hard"];