export class Node {
    constructor(col, row) {
        this.col = col;
        this.row = row;
        this.g = Infinity;
        this.h = 0;
        this.f = 0;
        this.parent = null;
        this.open = false;
        this.closed = false;
        this.heapIndex = -1;
        this.searchId = 0;
    }
}