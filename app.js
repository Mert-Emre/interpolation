import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("button");

const scoreboard = document.body.querySelector(".scoreboard span");
const greentile = document.getElementById("green-tile");
const browntile = document.getElementById("brown-tile");
const hitman = document.getElementById("hitman");

canvas.width = 1280;
canvas.height = 768;
let t = 0;
const tiles_coord = {
    brown_bush: {
        x: 64 * 26 + 38,
        y: 64 * 7 - 4,
    },
    box: {
        x: 64 * 23 + 10,
        y: 64 * 5 - 20,
    },
    wood_floor: {
        x: 64 * 16 + 12,
        y: 64 * 3 + 30,
    },
    stone_wall: {
        x: 64 * 10 + 40,
        y: 64 * 21 - 12,
        height: 64,
        width: 36,
    },
    glass: {
        x: 64 * 3 - 40,
        y: 64 * 20 + 50,
    },
};

const drawMap = () => {
    for (let row = 0; row < 15; row++) {
        for (let column = 0; column < 30; column++) {
            ctx.drawImage(
                tilesheet,
                0,
                0,
                64,
                64,
                column * 64,
                row * 64,
                64,
                64
            );
        }
    }
};

const drawHouse = (x, y) => {
    for (let i = 0; i < 6; i++) {
        ctx.drawImage(
            tilesheet,
            tiles_coord.stone_wall.x,
            tiles_coord.stone_wall.y,
            tiles_coord.stone_wall.width,
            tiles_coord.stone_wall.height,
            x,
            y + i * tiles_coord.stone_wall.height,
            tiles_coord.stone_wall.width,
            tiles_coord.stone_wall.height
        );
    }
    for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(x + i * tiles_coord.stone_wall.height, y - 32);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(
            tilesheet,
            tiles_coord.stone_wall.x,
            tiles_coord.stone_wall.y,
            tiles_coord.stone_wall.width,
            tiles_coord.stone_wall.height,
            0,
            -96,
            tiles_coord.stone_wall.width,
            tiles_coord.stone_wall.height
        );
        ctx.restore();
    }
    for (let i = 0; i < 6; i++) {
        ctx.drawImage(
            tilesheet,
            tiles_coord.stone_wall.x,
            tiles_coord.stone_wall.y,
            tiles_coord.stone_wall.width,
            tiles_coord.stone_wall.height,
            x +
                6 * tiles_coord.stone_wall.height +
                tiles_coord.stone_wall.width -
                10,
            y + i * tiles_coord.stone_wall.height,
            tiles_coord.stone_wall.width,
            tiles_coord.stone_wall.height
        );
    }

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            ctx.drawImage(
                tilesheet,
                tiles_coord.wood_floor.x,
                tiles_coord.wood_floor.y,
                64,
                64,
                x + i * 64 + 31,
                y + j * 64,
                64,
                64
            );
        }
    }
    ctx.drawImage(
        tilesheet,
        tiles_coord.glass.x,
        tiles_coord.glass.y,
        64,
        64,
        x - 14,
        y + 64,
        72,
        64
    );
    ctx.drawImage(
        tilesheet,
        tiles_coord.glass.x,
        tiles_coord.glass.y,
        64,
        64,
        x - 14,
        y + 128,
        72,
        64
    );
};

const projectiles = [];
const enemies = [];

/* window.addEventListener("load", () => {
    const p1 = new Player();
    const enemy1 = new Enemy();
    enemies.push(enemy1);
    document.addEventListener("keydown", p1.onKeyPress.bind(p1));
    document.addEventListener("keyup", p1.onKeyUp.bind(p1));

    addEventListener("click", (e) => {
        if (p1.ammo <= 0) {
            p1.checkAmmo();
            return;
        }
        let projectileX = 0;
        let projectileY = 0;
        let isUsable = false;
        if (p1.movingAngle == 0) {
            projectileX = p1.posX + p1.size * 1.1;
            projectileY = p1.posY + p1.size * 0.7;
            isUsable = e.x > p1.posX ? true : false;
        } else if (p1.movingAngle == -Math.PI) {
            projectileX = p1.posX - p1.size * 0.1;
            projectileY = p1.posY + p1.size * 0.3;
            isUsable = e.x < p1.posX ? true : false;
        } else if (p1.movingAngle == Math.PI / 2) {
            projectileX = p1.posX + p1.size * 0.3;
            projectileY = p1.posY + p1.size;
            isUsable = e.y > p1.posY ? true : false;
        } else if (p1.movingAngle == -Math.PI / 2) {
            projectileX = p1.posX + p1.size * 0.7;
            projectileY = p1.posY;
            isUsable = e.y < p1.posY ? true : false;
        }
        if (isUsable) {
            const projectile = new Projectile(
                projectileX,
                projectileY,
                e.x,
                e.y,
                p1
            );
            projectiles.push(projectile);
            p1.decreaseAmmo();
        }
    });

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap();
        drawHouse(600, 200);
        enemies.forEach((enemy) => {
            enemy.update();
        });
        p1.update();
        projectiles.forEach((projectile, index) => {
            if (projectile.posX + projectile.radius > canvas.width) {
                projectiles.splice(index, 1);
            }
            projectile.detectCollision(enemies);
            projectile.update();
        });

        requestAnimationFrame(animate);
    };
    animate();
}); */

window.addEventListener("load", () => {
    let is_connected = false;
    let socket;
    startButton.addEventListener("click", () => {
        if (!is_connected) {
            socket = io("http://127.0.0.1:3000");
            socket.on("connect", () => {
                startButton.innerText = "Stop";
                is_connected = true;
                const game = new Game(
                    socket,
                    ctx,
                    greentile,
                    browntile,
                    600,
                    200
                );
                game.start();
                socket.on("players_information", (players_data) => {
                    const players = players_data.slice(0, -1);
                    const server_tick = players_data[players_data.length - 1];
                    const didQuit = {};
                    for (const playerId in game.players) {
                        didQuit[playerId] = true;
                    }
                    for (const server_player of players) {
                        if (game.players[server_player.id]) {
                            didQuit[server_player.id] = false;
                            if (server_player.id == socket.id) {
                                for (const key in server_player) {
                                    if (key !== "id") {
                                        game.players[
                                            server_player.id
                                        ].serverPositions[key] =
                                            server_player[key];
                                    }
                                }
                                for (const position of Object.keys(
                                    game.hero.serverPositions
                                ).sort((a, b) => {
                                    return parseInt(a) - parseInt(b);
                                })) {
                                    if (
                                        game.hero.positions[position] &&
                                        game.hero.serverPositions[position]
                                    ) {
                                        if (
                                            game.hero.positions[position].x !=
                                                game.hero.serverPositions[
                                                    position
                                                ].x ||
                                            game.hero.positions[position].y !=
                                                game.hero.serverPositions[
                                                    position
                                                ].y
                                        ) {
                                            if (game.count < 1000) {
                                                console.log(
                                                    game.hero.serverPositions[
                                                        position
                                                    ],
                                                    "server",
                                                    position
                                                );
                                                console.log(
                                                    game.hero.positions[
                                                        position
                                                    ],
                                                    "client",
                                                    position
                                                );
                                            }
                                            for (const posClient in game.hero
                                                .positions) {
                                                if (
                                                    parseInt(posClient) >=
                                                    parseInt(position)
                                                ) {
                                                    delete game.hero.positions[
                                                        posClient
                                                    ];
                                                }
                                            }
                                            game.hero.positions[position] =
                                                game.hero.serverPositions[
                                                    position
                                                ];
                                        }
                                    }
                                    for (const posClient in game.hero
                                        .positions) {
                                        if (
                                            parseInt(posClient) <
                                                parseInt(position) &&
                                            game.hero.animationTick - 1 >
                                                parseInt(posClient)
                                        ) {
                                            delete game.hero.positions[
                                                posClient
                                            ];
                                        }
                                    }
                                    delete game.hero.serverPositions[position];
                                }
                            } else {
                                let totalKeys = 0;
                                for (const key in server_player) {
                                    if (key == "id") {
                                        continue;
                                    } else {
                                        totalKeys += 1;
                                        game.players[
                                            server_player.id
                                        ].serverPositions[key] =
                                            server_player[key];
                                        let itemInserted = false;
                                        for (
                                            let oppTickIdx = 0;
                                            oppTickIdx <
                                            game.players[server_player.id]
                                                .opponentTicks.length;
                                            oppTickIdx++
                                        ) {
                                            if (
                                                game.players[server_player.id]
                                                    .opponentTicks[
                                                    oppTickIdx
                                                ] == parseInt(key)
                                            ) {
                                                itemInserted = true;
                                                break;
                                            }
                                            if (
                                                parseInt(key) >
                                                game.players[server_player.id]
                                                    .opponentTicks[oppTickIdx]
                                            ) {
                                                continue;
                                            }
                                            game.players[
                                                server_player.id
                                            ].opponentTicks.splice(
                                                oppTickIdx,
                                                0,
                                                parseInt(key)
                                            );
                                            itemInserted = true;
                                            break;
                                        }
                                        if (!itemInserted) {
                                            game.players[
                                                server_player.id
                                            ].opponentTicks.push(parseInt(key));
                                        }
                                    }
                                }
                                if (totalKeys > 1) {
                                    game.players[
                                        server_player.id
                                    ].infoStack.push(totalKeys - 1);
                                }
                            }
                        } else if (!game.players[server_player.id]) {
                            if (server_player.id == socket.id) {
                                let playerX;
                                let playerY;
                                for (const key in server_player) {
                                    if (key != "id") {
                                        playerX = server_player[key].x;
                                        playerY = server_player[key].y;
                                    }
                                }
                                const newPlayer = new Player(
                                    playerX,
                                    playerY,
                                    150,
                                    150,
                                    0,
                                    server_player.id,
                                    server_tick,
                                    true
                                );
                                game.hero = newPlayer;
                                game.hero.serverPositions[server_tick] = {
                                    x: playerX,
                                    y: playerY,
                                };
                                game.hero.positions[server_tick] = {
                                    x: playerX,
                                    y: playerY,
                                    moveAngle: 0,
                                };
                                document.addEventListener(
                                    "keydown",
                                    newPlayer.onKeyPress.bind(newPlayer)
                                );
                                document.addEventListener(
                                    "keyup",
                                    newPlayer.onKeyUp.bind(newPlayer)
                                );
                                document.addEventListener(
                                    "click",
                                    newPlayer.onClick.bind(newPlayer, game)
                                );
                                game.players[server_player.id] = newPlayer;
                            } else if (server_player.id != socket.id) {
                                let lastPos = -1;
                                for (const key in server_player) {
                                    if (key != "id") {
                                        if (parseInt(key) > lastPos) {
                                            lastPos = parseInt(key);
                                        }
                                    }
                                }
                                if (lastPos != -1) {
                                    const newPlayer = new Player(
                                        server_player[lastPos].x,
                                        server_player[lastPos].y,
                                        150,
                                        150,
                                        0,
                                        server_player.id,
                                        server_tick,
                                        false
                                    );
                                    newPlayer.serverPositions = {};
                                    newPlayer.serverPositions[lastPos] = {
                                        x: server_player[lastPos].x,
                                        y: server_player[lastPos].y,
                                        movingAngle:
                                            server_player[lastPos].movingAngle,
                                    };
                                    newPlayer.opponentTicks = [lastPos];
                                    newPlayer.infoStack = [1];
                                    game.players[server_player.id] = newPlayer;
                                }
                            }
                        }
                    }
                    for (const playerId in didQuit) {
                        if (didQuit[playerId]) {
                            delete game.players[playerId];
                        }
                    }
                    /* for (const key in game.playersHash) {
                        game.playersHash[key][1] = false;
                    }
                    for (
                        let playerIdx = 0;
                        playerIdx < players.length;
                        playerIdx++
                    ) {
                        const player = players[playerIdx];
                        if (game.playersHash[player.id] === undefined) {
                            const newPlayer = new Player(
                                player.posX,
                                player.posY,
                                player.health,
                                player.maxHealth,
                                player.movingAngle,
                                player.id
                            );
                            if (player.id == socket.id) {
                                game.hero = newPlayer;
                                game.hero.serverPositions[server_tick] = {
                                    x: player.posX,
                                    y: player.posY,
                                    moveAngle: player.moveAngle,
                                };
                                game.hero.positions[server_tick] = {
                                    x: player.posX,
                                    y: player.posY,
                                    moveAngle: player.moveAngle,
                                };
                                document.addEventListener(
                                    "keydown",
                                    newPlayer.onKeyPress.bind(newPlayer)
                                );
                                document.addEventListener(
                                    "keyup",
                                    newPlayer.onKeyUp.bind(newPlayer)
                                );
                            }
                            game.players.push(newPlayer);
                            game.playersHash[player.id] = [
                                game.players.length - 1,
                                true,
                            ];
                        } else if (
                            game.playersHash[player.id] ||
                            game.playersHash[player.id] === 0
                        ) {
                            if (player.id == socket.id) {
                                if (game.count < 20) {
                                    game.hero.serverPositions[server_tick] = {
                                        x: player.posX,
                                        y: player.posY,
                                        moveAngle: player.moveAngle,
                                    };
                                }
                            }
                            if (player.id != socket.id) {
                                game.players[
                                    game.playersHash[player.id][0]
                                ].posX = player.posX;
                                game.players[
                                    game.playersHash[player.id][0]
                                ].posY = player.posY;
                            }
                            game.players[
                                game.playersHash[player.id][0]
                            ].health = player.health;
                            game.players[
                                game.playersHash[player.id][0]
                            ].maxHealth = player.maxHealth;
                            game.players[
                                game.playersHash[player.id][0]
                            ].movingAngle = player.movingAngle;
                            game.playersHash[player.id][1] = true;
                        }
                    }
                    for (const key in game.playersHash) {
                        let deletedIndex = null;
                        if (!game.playersHash[key][1]) {
                            deletedIndex = game.playersHash[key][0];
                            game.players.splice(game.playersHash[key][0], 1);
                        }
                        if (deletedIndex !== null) {
                            for (let [
                                keyWillHaveDifferentValue,
                                value,
                            ] of Object.entries(game.playersHash)) {
                                if (value > deletedIndex) {
                                    game.playersHash[
                                        keyWillHaveDifferentValue
                                    ] -= 1;
                                }
                            }
                        }
                    } */
                    if (!game.serverTick) {
                        game.currentClientTick = server_tick;
                        game.lastClientTick = server_tick;
                    }
                    game.serverTick = server_tick;
                });
                setInterval(() => {
                    if (game.hero) {
                        game.hero.calculatePosition(
                            game.player.movingLeft,
                            game.player.movingRight,
                            game.player.movingUp,
                            game.player.movingDown,
                            game.currentClientTick + 1
                        );
                        game.unprocessedInputs.push({
                            movingLeft: game.player.movingLeft,
                            movingRight: game.player.movingRight,
                            movingDown: game.player.movingDown,
                            movingUp: game.player.movingUp,
                            clientTick: game.currentClientTick + 1,
                        });
                        game.currentClientTick += 1;
                        game.count += 1;
                    }
                }, 1000 / 60);
                setInterval(() => {
                    game.sendInformation();
                }, 30);
                const animate = () => {
                    /* if (game.hero) {
                        game.hero.move();
                        game.hero.checkBorders(canvas.width, canvas.height);
                    } */

                    game.update();

                    requestAnimationFrame(animate);
                };
                animate();
                /* setInterval(() => {
                    socket.emit("PLAYER_DATA");
                }, 1000 / 30);
                const animate = () => {
                    game.update();
                    requestAnimationFrame(animate);
                };
                animate(); */
            });
        } else {
            socket.disconnect();
            is_connected = false;
            startButton.innerText = "Start";
        }
    });
});

class Game {
    constructor(socket, ctx, greentile, browntile, houseX, houseY) {
        this.socket = socket;
        this.cvsWidth = 512;
        this.cvsHeight = 512;
        this.ctx = ctx;
        this.greentile = greentile;
        this.browntile = browntile;
        this.houseX = houseX;
        this.houseY = houseY;
        this.players = {};
        this.playersHash = {};
        this.player = {
            movingLeft: false,
            movingRight: false,
            movingUp: false,
            movingDown: false,
        };
        this.orangeVfxs = [];
        this.grayVfxs = [];
        this.bullets = [];
        this.ownBullets = [];
        this.hero = null;
        this.lastUpdate = Date.now();
        this.count = 0;
        this.totalDistX = 0;
        this.totalDistY = 0;
        this.distX = 0;
        this.distY = 0;
        this.lastUpdate = Date.now();
        this.unprocessedInputs = [];
        this.map = [
            [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            ],
            [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            ],
            ,
        ];
    }
    start() {
        this.update();
        document.addEventListener("keydown", (e) => {
            this.onKeyPress(e);
        });
        document.addEventListener("keyup", (e) => {
            this.onKeyUp(e);
        });
    }
    sendInformation() {
        if (this.hero) {
            this.socket.emit("player_movement_update", this.unprocessedInputs);
            this.unprocessedInputs = [];
        }
    }
    correctHeroMovement(posX, posY) {
        this.correction_frame = 0;
        this.totalDistX = posX - this.hero.posX;
        this.totalDistY = posY - this.hero.posY;
        this.distX = posX - this.hero.posX;
        this.distY = posY - this.hero.posY;
    }
    update() {
        this.draw();
        /* if (this.correction_frame < this.correction_frame_limit && this.hero) {
            this.hero.posX += this.totalDistX / this.correction_frame_limit;
            this.hero.posY += this.totalDistY / this.correction_frame_limit;
            this.distX -= this.totalDistX / this.correction_frame_limit;
            this.distY -= this.totalDistY / this.correction_frame_limit;
            this.correction_frame += 1;
            if (this.distX ** 2 + this.distY ** 2 < 20) {
                this.hero.posX += this.distX;
                this.hero.posY += this.distY;
                this.distX = 0;
                this.distY = 0;
                this.correction_frame = this.correction_frame_limit;
            }
        } */
    }
    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawMap();
        if (this.hero) {
            this.hero.draw();
            const now = Date.now();
            this.hero.move(
                this.currentClientTick,
                this.serverTick,
                (now - this.lastUpdate) / (1000 / 60)
            );
            for (const playerId in this.players) {
                this.players[playerId].drawHealth();
                if (playerId != this.hero.id) {
                    this.players[playerId].draw();
                    this.players[playerId].move(
                        this.currentClientTick,
                        this.serverTick,
                        (now - this.lastUpdate) / (1000 / 60)
                    );
                }
            }
            for (let i = 0; i < this.grayVfxs.length; i++) {
                this.grayVfxs[i].update();
                if (this.grayVfxs[i].radius <= 1) {
                    this.grayVfxs.splice(i, 1);
                    i--;
                }
            }
            for (let i = 0; i < this.orangeVfxs.length; i++) {
                this.orangeVfxs[i].update();
                if (this.orangeVfxs[i].radius <= 1) {
                    this.orangeVfxs.splice(i, 1);
                    i--;
                }
            }
            this.lastUpdate = now;
        }
        for (const bullet of this.bullets) {
            bullet.update(this.currentClientTick);
        }
    }
    onKeyPress(e) {
        if (e.key == "a") {
            this.player.movingLeft = true;
        } else if (e.key == "d") {
            this.player.movingRight = true;
        } else if (e.key == "s") {
            this.player.movingDown = true;
        } else if (e.key == "w") {
            this.player.movingUp = true;
        }
    }
    onKeyUp(e) {
        if (e.key == "a") {
            this.player.movingLeft = false;
        } else if (e.key == "d") {
            this.player.movingRight = false;
        } else if (e.key == "w") {
            this.player.movingUp = false;
        } else if (e.key == "s") {
            this.player.movingDown = false;
        }
    }
    drawMap() {
        if (this.hero) {
            for (let row = 0; row < 24; row++) {
                for (let column = 0; column < 40; column++) {
                    if (this.map[row][column] === 1) {
                        this.ctx.drawImage(
                            this.browntile,
                            0,
                            0,
                            64,
                            64,
                            column * 32,
                            row * 32,
                            32,
                            32
                        );
                    } else if (this.map[row][column] === 0) {
                        this.ctx.drawImage(
                            this.greentile,
                            0,
                            0,
                            64,
                            64,
                            column * 32,
                            row * 32,
                            32,
                            32
                        );
                    }
                }
            }
        }
    }
    /* drawHouse() {
        for (let i = 0; i < 6; i++) {
            ctx.drawImage(
                tilesheet,
                tiles_coord.stone_wall.x,
                tiles_coord.stone_wall.y,
                tiles_coord.stone_wall.width,
                tiles_coord.stone_wall.height,
                this.houseX,
                this.houseY + i * tiles_coord.stone_wall.height,
                tiles_coord.stone_wall.width,
                tiles_coord.stone_wall.height
            );
        }
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.translate(
                this.houseX + i * tiles_coord.stone_wall.height,
                this.houseY - 32
            );
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(
                tilesheet,
                tiles_coord.stone_wall.x,
                tiles_coord.stone_wall.y,
                tiles_coord.stone_wall.width,
                tiles_coord.stone_wall.height,
                0,
                -96,
                tiles_coord.stone_wall.width,
                tiles_coord.stone_wall.height
            );
            ctx.restore();
        }
        for (let i = 0; i < 6; i++) {
            ctx.drawImage(
                tilesheet,
                tiles_coord.stone_wall.x,
                tiles_coord.stone_wall.y,
                tiles_coord.stone_wall.width,
                tiles_coord.stone_wall.height,
                this.houseX +
                    6 * tiles_coord.stone_wall.height +
                    tiles_coord.stone_wall.width -
                    10,
                this.houseY + i * tiles_coord.stone_wall.height,
                tiles_coord.stone_wall.width,
                tiles_coord.stone_wall.height
            );
        }

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                ctx.drawImage(
                    tilesheet,
                    tiles_coord.wood_floor.x,
                    tiles_coord.wood_floor.y,
                    64,
                    64,
                    this.houseX + i * 64 + 31,
                    this.houseY + j * 64,
                    64,
                    64
                );
            }
        }
        ctx.drawImage(
            tilesheet,
            tiles_coord.glass.x,
            tiles_coord.glass.y,
            64,
            64,
            this.houseX - 14,
            this.houseY + 64,
            72,
            64
        );
        ctx.drawImage(
            tilesheet,
            tiles_coord.glass.x,
            tiles_coord.glass.y,
            64,
            64,
            this.houseX - 14,
            this.houseY + 128,
            72,
            64
        );
    } */
}

class Character {
    constructor(posX, posY, health, maxHealth) {
        this.posX = posX;
        this.posY = posY;
        this.lastPosX = posX;
        this.lastPosY = posY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.ammo = 30;
        this.level = 1;
        this.maxHealth = maxHealth;
        this.health = health;
    }

    drawHealth() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.posX - 20, this.posY - 35, 40, 12);
        ctx.fillStyle = "red";
        ctx.fillRect(
            this.posX - 17,
            this.posY - 32,
            parseInt((34 / this.maxHealth) * this.health),
            6
        );
    }
}

class Player extends Character {
    constructor(posX, posY, health, maxHealth, movingAngle, id, tick, isHero) {
        super(posX, posY, health, maxHealth);
        this.isHero = isHero;
        this.xp = 0;
        this.speed = 10;
        this.movingRight = false;
        this.movingLeft = false;
        this.movingUp = false;
        this.movingDown = false;
        this.size = 40;
        this.movingAngle = movingAngle;
        this.maxAmmo = 30;
        this.score = 0;
        this.interpolationCount = 0;
        this.id = id;
        this.positions = {};
        this.serverPositions = {};
        this.animationTick = null;
    }

    draw() {
        ctx.fillStyle = "red";

        ctx.save();
        ctx.translate(this.posX, this.posY);
        ctx.rotate(this.movingAngle);
        ctx.drawImage(
            hitman,
            0,
            0,
            49,
            43,
            -this.size / 2,
            -this.size / 2,
            this.size,
            this.size
        );
        ctx.restore();
        /*         this.drawAmmo();
        this.drawHealth(); */
    }
    calculatePosition(moveLeft, moveRight, moveUp, moveDown, tick) {
        // positions object should be an object rather than an array
        const lastPos = this.positions[tick - 1];
        const dirX = -moveLeft + moveRight;
        const dirY = -moveUp + moveDown;
        const changeX = dirY ? dirX * this.speed * 0.75 : dirX * this.speed;
        const changeY = dirX ? dirY * this.speed * 0.75 : dirY * this.speed;
        let moveAngle;
        if (changeX > 0) {
            if (changeY > 0) {
                moveAngle = Math.PI / 4;
            } else if (changeY == 0) {
                moveAngle = 0;
            } else if (changeY < 0) {
                moveAngle = -Math.PI / 4;
            }
        } else if (changeX == 0) {
            if (changeY > 0) {
                moveAngle = Math.PI / 2;
            } else if (changeY == 0) {
                moveAngle = lastPos.moveAngle;
            } else if (changeY < 0) {
                moveAngle = -Math.PI / 2;
            }
        } else if (changeX < 0) {
            if (changeY > 0) {
                moveAngle = (3 * Math.PI) / 4;
            } else if (changeY == 0) {
                moveAngle = Math.PI;
            } else if (changeY < 0) {
                moveAngle = (-3 * Math.PI) / 4;
            }
        }
        let position;
        if (lastPos) {
            position = {
                x: lastPos.x + changeX,
                y: lastPos.y + changeY,
                moveAngle: moveAngle,
            };
        }
        this.positions[tick] = position;
    }

    move(tick, serverTick, smoother) {
        if (this.isHero) {
            if (this.positions[tick]) {
                if (this.animationTick === null) {
                    this.animationTick = tick;
                } else {
                    if (tick - this.animationTick >= 2) {
                        this.posX =
                            this.positions[parseInt(this.animationTick) + 1].x;
                        this.posY =
                            this.positions[parseInt(this.animationTick) + 1].y;
                        this.animationTick += 1;
                        return;
                    }
                }
                this.movingAngle = this.positions[tick].moveAngle;
                this.posX += (this.positions[tick].x - this.posX) * smoother;
                this.posY += (this.positions[tick].y - this.posY) * smoother;
            }
        } else {
            if (this.infoStack.length >= 3) {
                if (this.animationTick === null) {
                    this.animationTick = tick;
                    this.opponentAnimationIdx = this.infoStack[0];
                    this.opponentAnimationTick =
                        this.opponentTicks[this.infoStack[0]];
                } else {
                    const lastPos =
                        this.serverPositions[
                            this.opponentTicks[this.opponentAnimationIdx - 1]
                        ];
                    if (tick > this.animationTick) {
                        this.posX =
                            this.serverPositions[
                                parseInt(
                                    this.opponentTicks[
                                        this.opponentAnimationIdx
                                    ]
                                )
                            ].x;
                        this.posY =
                            this.serverPositions[
                                parseInt(
                                    this.opponentTicks[
                                        this.opponentAnimationIdx
                                    ]
                                )
                            ].y;
                        this.movingAngle =
                            this.serverPositions[
                                parseInt(
                                    this.opponentTicks[
                                        this.opponentAnimationIdx
                                    ]
                                )
                            ].movingAngle;
                        this.animationTick += 1;
                        this.opponentAnimationIdx += 1;
                        this.opponentAnimationTick =
                            this.opponentTicks[this.opponentAnimationIdx];
                        if (
                            this.opponentAnimationIdx ==
                            this.infoStack[0] + this.infoStack[1]
                        ) {
                            for (let i = 0; i < this.infoStack[0]; i++) {
                                this.opponentTicks.shift();
                            }
                            this.opponentAnimationIdx = this.infoStack[1];
                            this.opponentAnimationTick =
                                this.opponentTicks[this.opponentAnimationIdx];
                            this.infoStack.shift();
                        }
                        return;
                    }
                    this.posX +=
                        (this.serverPositions[this.opponentAnimationTick].x -
                            lastPos.x) *
                        smoother;
                    this.posY +=
                        (this.serverPositions[this.opponentAnimationTick].y -
                            lastPos.y) *
                        smoother;
                }
            } else {
                if (this.animationTick != null) {
                    this.animationTick += 1;
                }
            }
        }

        /*         if (
            (this.movingRight && this.movingLeft) ||
            (!this.movingLeft && !this.movingRight)
        ) {
            this.velocityX = 0;
        } else if (this.movingLeft) {
            this.movingAngle = -Math.PI;
            this.velocityX = -this.speed;
        } else if (this.movingRight) {
            this.movingAngle = 0;
            this.velocityX = this.speed;
        }
        if (
            (this.movingUp && this.movingDown) ||
            (!this.movingUp && !this.movingDown)
        ) {
            this.velocityY = 0;
        } else if (this.movingUp) {
            this.movingAngle = -Math.PI / 2;
            this.velocityY = -this.speed;
        } else if (this.movingDown) {
            this.movingAngle = Math.PI / 2;
            this.velocityY = this.speed;
        }

        if (this.velocityX != 0 && this.velocityY != 0) {
            this.velocityX =
                this.velocityX < 0
                    ? this.velocityX * 0.5 * 1.5
                    : this.velocityX * 0.5 * 1.5;
            this.velocityY =
                this.velocityY < 0
                    ? this.velocityY * 0.5 * 1.5
                    : this.velocityY * 0.5 * 1.5;
        }
        this.posX += this.velocityX * smoother;
        this.posY += this.velocityY * smoother; */
    }

    checkBorders(cvsWidth, cvsHeight) {
        if (this.posX < 0) {
            this.posX = 0;
        } else if (this.posX + this.size > cvsWidth) {
            this.posX = cvsWidth - this.size;
        }

        if (this.posY < 0) {
            this.posY = 0;
        } else if (this.posY + this.size > cvsHeight) {
            this.posY = cvsHeight - this.size;
        }
    }

    drawAmmo() {
        ctx.fillStyle = "yellow";
        ctx.fillRect(
            this.posX + 2,
            this.posY - 34,
            parseInt((37 / this.maxAmmo) * this.ammo),
            7
        );
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.strokeRect(this.posX, this.posY - 35, 40, 10);
    }
    decreaseAmmo() {
        this.ammo -= 1;
    }
    onKeyPress(e) {
        if (e.key == "a") {
            this.movingLeft = true;
        } else if (e.key == "d") {
            this.movingRight = true;
        } else if (e.key == "s") {
            this.movingDown = true;
        } else if (e.key == "w") {
            this.movingUp = true;
        }
    }
    onKeyUp(e) {
        if (e.key == "a") {
            this.movingLeft = false;
        } else if (e.key == "d") {
            this.movingRight = false;
        } else if (e.key == "w") {
            this.movingUp = false;
        } else if (e.key == "s") {
            this.movingDown = false;
        }
    }
    onClick(game, e) {
        const bulletObj = {};
        for (const enemyId in game.players) {
            if (enemyId != this.id) {
                bulletObj[enemyId] =
                    game.players[enemyId].opponentAnimationTick;
            }
        }
        bulletObj[this.id] = game.currentClientTick;
        bulletObj.srcX = this.posX;
        bulletObj.srcY = this.posY;
        bulletObj.angle = Math.atan2(e.y - this.posY, e.x - this.posX);
        game.ownBullets.push(bulletObj);
        for (let i = 0; i < Math.floor(Math.random() * 2) + 5; i++) {
            game.orangeVfxs.push(
                new vfx(this.posX, this.posY, bulletObj.angle, "orange")
            );
        }
        for (let i = 0; i < Math.floor(Math.random() * 2) + 5; i++) {
            game.grayVfxs.push(
                new vfx(this.posX, this.posY, bulletObj.angle, "gray")
            );
        }
    }
}

class Enemy extends Character {
    constructor() {
        super();
        this.maxHealth = 100;
        this.health = 100;
        this.posX = 200;
        this.posY = 200;
        this.size = 50;
    }

    draw() {
        ctx.drawImage(
            charsheet,
            166,
            0,
            48,
            44,
            this.posX,
            this.posY,
            this.size,
            this.size
        );
    }
    update() {
        if (this.health > 0) {
            this.drawHealth();
            this.draw();
        }
    }
}

class vfx {
    constructor(x, y, angle, type) {
        this.x = x + 15;
        this.y = y + 5;
        this.speed = 1 + Math.floor(Math.random());
        this.angle = angle + (Math.random() - 0.5);
        this.radius = Math.floor(Math.random() * 5) + 7;
        this.oranges = ["#ea9315", "#efb110", "#f4890b", "#f1720e", "#eb6614"];
        this.grays = ["#737373", "#5f5f5f", "#929292"];
        this.type = type;
        this.color =
            type === "orange"
                ? this.oranges[Math.floor(Math.random() * this.oranges.length)]
                : this.grays[Math.floor(Math.random() * this.grays.length)];
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.radius -= 0.2;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
}
class Projectile {
    constructor(x, y, angle, owner, tick) {
        this.posX = x;
        this.posY = y;
        this.radius = 5;
        this.angle = angle;
        this.owner = owner;
        this.tick = tick;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
    }

    update(clientTick) {
        this.draw();
        if (clientTick > this.tick) {
            this.posX += Math.cos(this.angle) * 30;
            this.posY += Math.sin(this.angle) * 30;
            this.tick = clientTick;
        }
    }

    detectCollision(enemies) {
        enemies.forEach((enemy, enemyidx) => {
            if (
                this.posX > enemy.posX + this.radius &&
                this.posX < enemy.posX + 50 - this.radius &&
                this.posY < enemy.posY + 50 - this.radius &&
                this.posY > enemy.posY - this.radius
            ) {
                if (enemy.health > 0) {
                    enemy.health -= 25;
                }
                if (enemy.health <= 0) {
                    this.owner.score += 1;
                    enemies.splice(enemyidx, 1);
                    scoreboard.innerHTML = this.owner.score;
                }
                projectiles.forEach((projectile, index) => {
                    if (projectile == this) {
                        projectiles.splice(index, 1);
                    }
                });
            }
        });
    }
}
