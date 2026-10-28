export class MinHeap {
    constructor() {
        this.items = [];
    }

    get size() {
        return this.items.length;
    }

    clear() {
        this.items.length = 0;
    }

    push(node) {
        node.heapIndex = this.items.length;
        this.items.push(node);
        this.siftUp(node.heapIndex);
    }

    pop() {
        const items = this.items;
        const top = items[0];
        const last = items.pop();
        if (items.length > 0) {
            items[0] = last;
            last.heapIndex = 0;
            this.siftDown(0);
        }
        top.heapIndex = -1;
        return top;
    }

    update(node) {
        this.siftUp(node.heapIndex);
    }

    less(a, b) {
        return a.f < b.f || (a.f === b.f && a.h < b.h);
    }

    siftUp(i) {
        const items = this.items;
        const node = items[i];
        while (i > 0) {
            const p = (i - 1) >> 1;
            const parent = items[p];
            if (!this.less(node, parent)) break;
            items[i] = parent;
            parent.heapIndex = i;
            i = p;
        }
        items[i] = node;
        node.heapIndex = i;
    }

    siftDown(i) {
        const items = this.items;
        const n = items.length;
        const node = items[i];
        while (true) {
            const left = 2 * i + 1;
            if (left >= n) break;
            const right = left + 1;
            let child = left;
            if (right < n && this.less(items[right], items[left])) child = right;
            if (!this.less(items[child], node)) break;
            items[i] = items[child];
            items[i].heapIndex = i;
            i = child;
        }
        items[i] = node;
        node.heapIndex = i;
    }
}