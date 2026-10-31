import { Game } from "./core/Game.js";

const canvas = document.getElementById("game");
canvas.width = 960;
canvas.height = 720;

const game = new Game(canvas);
game.start();