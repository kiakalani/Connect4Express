/**
 * The board of the game.
 */
var circles = makeCircles(125, 125, 40);

/**
 * A boolean indicator for whether it is the red player's turn or yellow player's.
 * Note that the turn would be transferred to the database and system to make the
 * game functional multiplayer.
 * Todo: figure out a way to transfer this file to the databse in order to make the game
 * interactive.
 */
var turn;
var currentTurn;

/**
 * This method is responsible for making the circles in the board of
 * the game.
 * @param {x} x refers to the x position of the board 
 * @param {y} y refers to the y position of the board
 * @param {rad} rad refers to the radius of the circles.
 */
function makeCircles(x, y, rad) {
    let circles = new Array(6);
    for (let r = 0; r < 6; r++) {
        circles[r] = new Array(7);
        for (let c = 0; c < 7; c++) {
            let color = new Array(3);
            color[0] = 255; color[1] = 255; color[2] = 255;
            circles[r][c] = { x: x + (c * rad), y: y + (r * rad), radius: rad, color: 'white' };

        }
    }
    return circles;
}

/**
 * The setup function
 */
function setup() {
    currentTurn = true;
    createCanvas(500, 500);
    socket = io("http://localhost:5000");
    socket.on("initG", function(data)
    {
        turn = data;
        console.log(turn);
        // console.log(data);
        // console.log(data.turn);
        // console.log("init");
        // console.log(turn)
    });
    socket.on("gameAction", function(data)
    {
        circles = data.board;
        currentTurn = data.turn;
        console.log(currentTurn);
    });
    // socket.on("changeTurn", function(data)
    // {
    //     console.log(data);
    //     currentTurn = data;
    // });
}

/**
 * This method is responsible for detecting the collision between a point and a circle.
 * @param {the x position of the circle} circleX 
 * @param {the y position of the circle} circleY 
 * @param {the radius of the circle} radius 
 * @param {point of collision in x axis} pointX 
 * @param {point of collision in y axis} pointY 
 */
function circleCollidedWithPoint(circleX, circleY, radius, pointX, pointY) {
    return Math.pow(radius / 2, 2) > (Math.pow(pointX - circleX, 2) + Math.pow(pointY - circleY, 2));
}

/**
 * This method is responsible for changing the color in case of collision with mouse click.
 */
function changeCircleColor() {
    let col = -1;
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            if (circleCollidedWithPoint(circles[r][c].x, circles[r][c].y, circles[r][c].radius, mouseX, mouseY)) {
                column = c;
                break;
            }
        }
    }
    for (let r = 5; r > -1; r--) {
        if (circles[r][column].color == 'white') {
            circles[r][column].color = getColor();
            // changeTurn();
            break;
        }
    }
    socket.emit("makeMove", {board: circles, turn: turn});
    currentTurn = !currentTurn;
}

/**
 * This method is responsible for resetting the board in any winning condition or in case of tying.
 */
function clearBoard() {
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            circles[r][c].color = 'white';
        }
    }
}

/**
 * This method would check for a tie in the game and if so, it would reset the game.
 */
function checkTie() {
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            if (circles[r][c].color == 'white') {
                return;
            }
        }
    }
    window.alert("The game was a tie!");
    clearBoard();
    resetTurn();
}

/**
 * This method would change the player's turn.
 */
function changeTurn() {
    if (turn) {
        turn = false;
    } else turn = true;
}

/**
 * This method provides the color of the circle for the next move.
 * @return the color of the next movement in the game.
 */
function getColor() {
    if (turn) {
        return 'red';
    }
    return 'yellow';
}

/**
 * This method is responsible for resetting the players' turn.
 */
function resetTurn() {
    turn = true;
}

/**
 * This method checks the win condition for horizontal cases.
 */
function checkWinHorizontally() {
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
            if (circles[r][c].color == 'white') continue;
            let checked = true;
            for (let counter = 1; counter < 4; counter++) {
                if (circles[r][c].color != circles[r][c + counter].color) {
                    checked = false;
                    break;
                }
            }
            if (checked) {
                window.alert("Game over");
                clearBoard();
                resetTurn();
                return;
            }
        }
    }
}

/**
 * This method is responsible for checking the win condition vertically.
 */
function checkWinVertically() {
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 7; c++) {
            if (circles[r][c].color == 'white') continue;
            let checked = true;
            for (let counter = 1; counter < 4; counter++) {
                if (circles[r][c].color != circles[r + counter][c].color) {
                    checked = false;
                    break;
                }

            }
            if (checked) {
                window.alert("Game over");
                clearBoard();
                resetTurn();
                return;
            }
        }
    }
}

/**
 * This method is responsible for checking the win cases diagonally.
 */
function checkWinDiagonally() {
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            if (circles[r][c].color == 'white') continue;
            let checked = false;
            let forwardCounter = 1;
            let ffc = 1;
            let fbc = 1;
            let bbc = 1;
            let bfc = 1;
            let backwardCounter = 1;
            for (let counter = 1; counter < 4; counter++) {
                if (r + 3 < 6) {
                    if (c + 3 < 7) {
                        if (circles[r][c].color == circles[r + counter][c + counter].color) {
                            ffc++;
                        }
                    } else if (c - 3 > -1) {
                        if (circles[r][c].color == circles[r + counter][c - counter].color) {
                            fbc++;
                        }
                    }
                } else if (r - 3 > -1) {
                    if (c - 3 > -1) {
                        if (circles[r][c].color == circles[r - counter][c - counter].color) {
                            bbc++;
                        }
                    } else if (c + 3 < 7) {
                        if (circles[r][c].color == circles[r - counter][c + counter].color) {
                            bfc++;
                        }
                    }
                }
            }
            if (ffc == 4 || fbc == 4 || bbc == 4 || bfc == 4) {
                window.alert("Game over");
                clearBoard();
                resetTurn();
                return;
            }
        }
    }
}
let socket;
/**
 * Handling the events related to the situation when the mouse is pressed.
 */
function mouseReleased() {
    if (currentTurn == turn)
    {
        changeCircleColor();
    }

    checkWinHorizontally();
    checkWinVertically();
    checkWinDiagonally();
    checkTie();
}

/**
 * The draw method for drawing the game.
 */
function draw() {
    background(70);
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            fill(circles[r][c].color);
            circle(circles[r][c].x, circles[r][c].y, circles[r][c].radius);
        }
    }
}