const io = require("socket.io")(3000, {
    cors: {
        origin: ["http://127.0.0.1:5500"],
        methods: ["GET", "POST"],
    },
});

class Game {
    constructor() {
        this.players = [];
        this.canvasWidth = 1280;
        this.canvasHeight = 720;
        this.lastId = 1;
        this.tick = 1;
    }
    addPlayer(id) {
        const player = new Player(id, this.lastId);
        player.positions[this.tick] = {
            x: player.posX,
            y: player.posY,
            movingAngle: 0,
        };
        player.spareX = player.posX;
        player.spareY = player.posY;
        player.spareMovingAngle = 0;
        this.players.push(player);
        this.lastId += 1;
    }
    update() {
        for (const player of this.players) {
            player.update(this.canvasWidth, this.canvasHeight);
        }
    }
}

class Character {
    constructor() {
        this.posX = 100 + Math.floor(Math.random() * 500);
        this.posY = 100 + Math.floor(Math.random() * 500);
        this.velocityX = 0;
        this.velocityY = 0;
        this.ammo = 30;
        this.level = 1;
        this.maxHealth = 150;
        this.health = 150;
    }
}

class Player extends Character {
    constructor(id, clientId) {
        super();
        this.xp = 0;
        this.maxHealth = 150;
        this.health = 100;
        this.speed = 10;
        this.movingRight = false;
        this.movingLeft = false;
        this.movingUp = false;
        this.movingDown = false;
        this.size = 50;
        this.movingAngle = 0;
        this.maxAmmo = 30;
        this.id = id;
        this.clientId = clientId;
        this.score = 0;
        //unprocessed left, right, up and down inputs
        this.moveStack = {};
        this.positions = {};
        this.sentPositions = {};
    }

    checkAmmo() {
        if (this.ammo < 0) {
            return;
        }
        if (this.ammo == 0) {
            setTimeout(() => {
                this.ammo = 30;
            }, 1000);
        }
    }

    decreaseAmmo() {
        this.ammo -= 1;
    }
    update(cvsWidth, cvsHeight) {
        this.move();
        this.checkBorders(cvsWidth, cvsHeight);
    }

    move() {
        const ticksOrdered = Object.keys(this.moveStack).sort((a, b) => {
            return parseInt(a) - parseInt(b);
        });
        for (const strtick of ticksOrdered) {
            const tick = parseInt(strtick);
            const lastPos = this.positions[tick - 1];
            const movingLeft = this.moveStack[tick][0];
            const movingRight = this.moveStack[tick][1];
            const movingUp = this.moveStack[tick][2];
            const movingDown = this.moveStack[tick][3];
            if (lastPos) {
                this.positions[tick] = {};
                if (movingLeft && movingRight) {
                    this.positions[tick].x = lastPos.x;
                    if (movingUp && movingDown) {
                        this.positions[tick].movingAngle = lastPos.movingAngle;
                        this.positions[tick].y = lastPos.y;
                    } else if (movingUp) {
                        this.positions[tick].movingAngle = -Math.PI / 2;
                        this.positions[tick].y = lastPos.y - this.speed;
                    } else if (movingDown) {
                        this.positions[tick].movingAngle = -Math.PI / 2;
                        this.positions[tick].y = lastPos.y + this.speed;
                    } else {
                        this.positions[tick].movingAngle = lastPos.movingAngle;
                        this.positions[tick].y = lastPos.y;
                    }
                } else if (movingLeft) {
                    if (movingUp && movingDown) {
                        this.positions[tick].movingAngle = Math.PI;
                        this.positions[tick].x = lastPos.x - this.speed;
                        this.positions[tick].y = lastPos.y;
                    } else if (movingUp) {
                        this.positions[tick].movingAngle = (-3 * Math.PI) / 4;
                        this.positions[tick].x = lastPos.x - this.speed * 0.75;
                        this.positions[tick].y = lastPos.y - this.speed * 0.75;
                    } else if (movingDown) {
                        this.positions[tick].movingAngle = (3 * Math.PI) / 4;
                        this.positions[tick].x = lastPos.x - this.speed * 0.75;
                        this.positions[tick].y = lastPos.y + this.speed * 0.75;
                    } else {
                        this.positions[tick].movingAngle = Math.PI;
                        this.positions[tick].x = lastPos.x - this.speed;
                        this.positions[tick].y = lastPos.y;
                    }
                } else if (movingRight) {
                    if (movingUp && movingDown) {
                        this.positions[tick].movingAngle = 0;
                        this.positions[tick].x = lastPos.x + this.speed;
                        this.positions[tick].y = lastPos.y;
                    } else if (movingUp) {
                        this.positions[tick].movingAngle = -Math.PI / 4;
                        this.positions[tick].x = lastPos.x + this.speed * 0.75;
                        this.positions[tick].y = lastPos.y - this.speed * 0.75;
                    } else if (movingDown) {
                        this.positions[tick].movingAngle = Math.PI / 4;
                        this.positions[tick].x = lastPos.x + this.speed * 0.75;
                        this.positions[tick].y = lastPos.y + this.speed * 0.75;
                    } else {
                        this.positions[tick].movingAngle = 0;
                        this.positions[tick].x = lastPos.x + this.speed;
                        this.positions[tick].y = lastPos.y;
                    }
                } else {
                    this.positions[tick].x = lastPos.x;
                    if (movingUp && movingDown) {
                        this.positions[tick].movingAngle = lastPos.movingAngle;
                        this.positions[tick].y = lastPos.y;
                    } else if (movingUp) {
                        this.positions[tick].movingAngle = -Math.PI / 2;
                        this.positions[tick].y = lastPos.y - this.speed;
                    } else if (movingDown) {
                        this.positions[tick].movingAngle = Math.PI / 2;
                        this.positions[tick].y = lastPos.y + this.speed;
                    } else {
                        this.positions[tick].movingAngle = lastPos.movingAngle;
                        this.positions[tick].y = lastPos.y;
                    }
                }
                this.spareMovingAngle = this.positions[tick].movingAngle;
                this.spareX = this.positions[tick].x;
                this.spareY = this.positions[tick].y;
                delete this.moveStack[tick];
            } else {
                this.positions[tick] = {};
                this.positions[tick].x = this.spareX;
                this.positions[tick].y = this.spareY;
                this.positions[tick].movingAngle = this.spareMovingAngle;
                delete this.moveStack[tick];
            }
        }
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
}

const game = new Game();
let t = 0;

setInterval(() => {
    const data = game.players.map((player) => {
        const temp = {};
        let lastPosition = -1;
        for (const position in player.positions) {
            if (lastPosition < parseInt(position)) {
                lastPosition = parseInt(position);
            }
            temp[position] = player.positions[position];
        }
        const lastPosObject = {};
        lastPosObject[lastPosition] = player.positions[lastPosition];
        player.positions = {};
        for (const key in lastPosObject) {
            player.positions[key] = lastPosObject[key];
        }
        temp.id = player.id;
        /*         if (t < 50) {
            console.log(temp);
            t++;
        } */
        return temp;
    });
    data.push(game.tick);
    io.sockets.emit("players_information", data);
}, 1000 / 30);

setInterval(() => {
    game.update();
    game.tick++;
}, 1000 / 60);

io.on("connection", (socket) => {
    game.addPlayer(socket.id);
    socket.on("player_movement_update", (movement) => {
        const player = game.players.find((player) => {
            return player.id.toString() == socket.id.toString();
        });
        for (const movementTick of movement) {
            player.moveStack[movementTick.clientTick] = [0, 0, 0, 0];
            if (movementTick.movingLeft) {
                player.moveStack[movementTick.clientTick][0] = 1;
            }
            if (movementTick.movingRight) {
                player.moveStack[movementTick.clientTick][1] = 1;
            }
            if (movementTick.movingUp) {
                player.moveStack[movementTick.clientTick][2] = 1;
            }
            if (movementTick.movingDown) {
                player.moveStack[movementTick.clientTick][3] = 1;
            }
        }
    });
    socket.on("disconnect", () => {
        game.players = game.players.filter((player) => player.id !== socket.id);
    });
});
