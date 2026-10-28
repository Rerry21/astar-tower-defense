import { Node } from "./Node.js";
import { MinHeap } from "./MinHeap.js";

const DIR_COLS = [0, 1, 0, -1];
const DIR_ROWS = [-1, 0, 1, 0];

export class AStar {
    constructor(grid) {
        this.grid = grid;
        this.nodes = new Array(grid.cols * grid.rows);
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                this.nodes[row * grid.cols + col] = new Node(col, row);
            }
        }
        this.open = new MinHeap();
        this.searchId = 0;
        this.lastStats = { found: false, pathLength: 0, nodesExpanded: 0, timeMs: 0 };
    }

    heuristic(col, row, goalCol, goalRow) {
        return Math.abs(col - goalCol) + Math.abs(row - goalRow);
    }

    nodeAt(col, row) {
        return this.nodes[row * this.grid.cols + col];
    }

    touch(node) {
        if (node.searchId !== this.searchId) {
            node.searchId = this.searchId;
            node.g = Infinity;
            node.h = 0;
            node.f = 0;
            node.parent = null;
            node.open = false;
            node.closed = false;
            node.heapIndex = -1;
        }
        return node;
    }

    findPath(startCol, startRow, goalCol, goalRow) {
        const startTime = performance.now();
        const stats = this.lastStats;
        stats.found = false;
        stats.pathLength = 0;
        stats.nodesExpanded = 0;

        let path = null;
        if (this.grid.isWalkable(startCol, startRow) && this.grid.isWalkable(goalCol, goalRow)) {
            path = this.search(startCol, startRow, goalCol, goalRow);
        }

        stats.timeMs = performance.now() - startTime;
        return path;
    }

    search(startCol, startRow, goalCol, goalRow) {
        this.searchId++;
        this.open.clear();

        const grid = this.grid;
        const goal = this.touch(this.nodeAt(goalCol, goalRow));
        const start = this.touch(this.nodeAt(startCol, startRow));

        start.g = 0;
        start.h = this.heuristic(startCol, startRow, goalCol, goalRow);
        start.f = start.h;
        start.open = true;
        this.open.push(start);

        while (this.open.size > 0) {
            const current = this.open.pop();
            current.open = false;
            current.closed = true;
            this.lastStats.nodesExpanded++;

            if (current === goal) return this.reconstructPath(current);

            for (let i = 0; i < 4; i++) {
                const col = current.col + DIR_COLS[i];
                const row = current.row + DIR_ROWS[i];
                if (!grid.isWalkable(col, row)) continue;

                const neighbor = this.touch(this.nodeAt(col, row));
                if (neighbor.closed) continue;

                const g = current.g + 1;
                if (g < neighbor.g) {
                    neighbor.g = g;
                    neighbor.h = this.heuristic(col, row, goalCol, goalRow);
                    neighbor.f = g + neighbor.h;
                    neighbor.parent = current;
                    if (neighbor.open) {
                        this.open.update(neighbor);
                    } else {
                        neighbor.open = true;
                        this.open.push(neighbor);
                    }
                }
            }
        }

        return null;
    }

    reconstructPath(end) {
        const path = [];
        let node = end;
        while (node) {
            path.push({ col: node.col, row: node.row });
            node = node.parent;
        }
        path.reverse();
        this.lastStats.found = true;
        this.lastStats.pathLength = path.length;
        return path;
    }
}