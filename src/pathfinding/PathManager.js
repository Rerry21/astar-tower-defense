import { AStar } from "./AStar.js";
import { CellType } from "../core/Grid.js";

export class PathManager {
    constructor(grid) {
        this.grid = grid;
        this.checker = new AStar(grid);
    }

    routeExistsWithTower(col, row) {
        const grid = this.grid;
        const index = row * grid.cols + col;
        const previousType = grid.cells[index];
        const previousVersion = grid.version;

        grid.cells[index] = CellType.TOWER;
        const path = this.checker.findPath(grid.spawn.col, grid.spawn.row, grid.goal.col, grid.goal.row);
        grid.cells[index] = previousType;
        grid.version = previousVersion;

        return path !== null;
    }
}