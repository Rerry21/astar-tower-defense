const open = ".".repeat(30);
const wallA = ".".repeat(10) + "#" + ".".repeat(19);
const wallB = ".".repeat(10) + "#" + ".".repeat(9) + "#" + ".".repeat(9);
const wallC = ".".repeat(20) + "#" + ".".repeat(9);
const middle = "A" + ".".repeat(9) + "#" + ".".repeat(9) + "#" + ".".repeat(8) + "B";

export const level1 = [
    open, open, open, open,
    wallA, wallA,
    wallB, wallB, wallB, wallB,
    middle,
    wallB, wallB, wallB,
    wallC, wallC,
    open, open, open, open,
];