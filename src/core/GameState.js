export class GameState {
    constructor(money, lives) {
        this.money = money;
        this.lives = lives;
        this.status = "playing";
    }

    earn(amount) {
        this.money += amount;
    }

    spend(amount) {
        this.money -= amount;
    }

    loseLives(amount) {
        this.lives = Math.max(0, this.lives - amount);
        if (this.lives === 0) this.status = "gameover";
    }
}