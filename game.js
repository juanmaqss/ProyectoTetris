const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

context.scale(20, 20);
nextCtx.scale(20, 20);

const arena = Array.from({ length: 20 }, () => Array(12).fill(0));

const colors = [
    null,
    "purple",
    "yellow",
    "orange",
    "blue",
    "cyan",
    "green",
    "red"
];

function randomPiece() {
    const pieces = "TJLOSZI";
    return pieces[Math.floor(Math.random() * pieces.length)];
}

function createPiece(type) {
    switch (type) {
        case "T":
            return [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ];
        case "O":
            return [
                [2, 2],
                [2, 2]
            ];
        case "L":
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3]
            ];
        case "J":
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0]
            ];
        case "I":
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0]
            ];
        case "S":
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ];
        case "Z":
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ];
    }
}

const next = {
    matrix: createPiece(randomPiece())
};

const player = {
    pos: { x: 5, y: 0 },
    matrix: createPiece(randomPiece())
};

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) continue outer;
        }

        arena[y].fill(6);

        setTimeout(() => {
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
        }, 100);
    }
}

function playerReset() {
    player.matrix = next.matrix;
    next.matrix = createPiece(randomPiece());

    player.pos.y = 0;
    player.pos.x = 5;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        arenaSweep();
        playerReset();
    }
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function rotate(matrix) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    matrix.forEach(row => row.reverse());
}

function playerRotate() {
    const pos = player.pos.x;
    rotate(player.matrix);

    let offset = 1;
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > player.matrix[0].length) {
            rotate(player.matrix);
            rotate(player.matrix);
            rotate(player.matrix);
            player.pos.x = pos;
            return;
        }
    }
}

function drawMatrix(ctx, matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(context, arena, { x: 0, y: 0 });
    drawMatrix(context, player.matrix, player.pos);
}

function drawNext() {
    nextCtx.fillStyle = "black";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    drawMatrix(nextCtx, next.matrix, { x: 1, y: 1 });
}

let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;

    dropCounter += delta;
    if (dropCounter > dropInterval) {
        playerDrop();
        dropCounter = 0;
    }

    draw();
    drawNext();
    requestAnimationFrame(update);
}

document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") playerMove(-1);
    if (event.key === "ArrowRight") playerMove(1);
    if (event.key === "ArrowDown") playerDrop();
    if (event.key === "ArrowUp") playerRotate();
});

update();