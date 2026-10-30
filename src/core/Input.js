export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;
        this.inside = false;
        this.clicks = [];

        canvas.addEventListener("mousemove", (e) => this.track(e));
        canvas.addEventListener("mouseleave", () => {
            this.inside = false;
        });
        canvas.addEventListener("mousedown", (e) => {
            this.track(e);
            this.clicks.push({ x: this.x, y: this.y, button: e.button });
        });
        canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    track(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.x = ((e.clientX - rect.left) * this.canvas.width) / rect.width;
        this.y = ((e.clientY - rect.top) * this.canvas.height) / rect.height;
        this.inside = true;
    }

    nextClick() {
        return this.clicks.shift() || null;
    }
}