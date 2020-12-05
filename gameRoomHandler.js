let socketIO;
let app;


let gameRoom = [];
let turn = true;
function init(server, userManager)
{
    setGame(server, userManager);
    app = require("http").Server(server);
    socketIO = require("socket.io")(app, {cors:{origin:"*"}});
    app.listen(5000, function()
    {
        console.log("Game socket is being hosted at port 5000");
    });
    handleSocket(userManager);
}

/**
 * This method sets the get call for the game itself.
 * @param {the server} server 
 * @param {user manager object} userManager 
 */
function setGame(server, userManager)
{
    // Todo: Figure out how to make this multiplayer with socket.io
    server.get("/game", function(request, response)
    {
        if (request.session.user == null)
        {
            response.redirect("/user");
        }
        else
        {
            addPlayerToRoom(gameRoom, request.session.user);
            response.render("public/game/game.ejs");
        }
    });
}


/**
 * 
 * @param {the room we are adding the user to} room 
 * @param {the user we are adding to the room} user 
 */
function addPlayerToRoom(room, user)
{
    if (room.length == 0)
    {
        room.push([user, true]);
    }
    else if (room.length == 1 && room[0][1] != false)
    {
        room.push([user, false]);
    }
    else room.push([user, "spectate"]);
}


/**
 * This function handles the events related to the players getting connected
 * and handling their playing moves. Additionally, it handles the game moves.
 * Todo:
 * 1: Check the winning condition over here and if it happens, restart
 * the board.
 * 2: Make rooms for playing the games.
 * 3: In the main menu let the players spectate the games.
 * 4: Update win loss record of the players. 
 */
function handleSocket(userManager)
{
    socketIO.on("connection", function(socket)
    {
        let currentPlayerID = gameRoom.length - 1;
        socket.emit("initG", gameRoom[currentPlayerID][1]);
        socket.on("makeMove", function(gameComponents)
        {
            if (turn)
            {
                turn = false;
            } else turn = true;
            socket.broadcast.emit("gameAction", {turn: turn, board: gameComponents.board});
            if (gameOver(gameComponents.board))
            {
                addWinnerScore(userManager, gameRoom[currentPlayerID][1]);
                socket.broadcast.emit("gg", gameRoom[currentPlayerID][1]);
                gameRoom = [];
                turn = true;
            }
        });
        socket.on("disconnect", function()
        {
            let happened = false;
            if ((!gameOver() && hasBothPlayers() && gameRoom[currentPlayerID][1] != "spectate"))
            {
                declareWinnerOnQuit(userManager, currentPlayerID);
                happened = true;
            }
            if (happened)
            {
                socket.broadcast.emit("gg", !gameRoom[currentPlayerID][1]);
                gameRoom = [];
            }
            if (gameRoom.length == 1)
            {
                gameRoom = [];
            } else gameRoom.splice(currentPlayerID, 1);
            console.log("Disconnected" + gameRoom.length);

        });
    });
}

/**
 * Todo: Handle the logic behind this
 * @param {the game board} board 
 */
function gameOver(board)
{
    if (board == null) return true;
    return checkWinHorizontally(board) || checkWinVertically(board) || checkWinDiagonally(board);
}

function hasBothPlayers()
{
    let te = false;
    let fe = false;
    for (let i = 0; i < gameRoom.length; ++i)
    {
        if (gameRoom[i][1] == true) te = true;
        if (gameRoom[i][1] == false) fe = true;
    }
    return te && fe;
}
function addWinnerScore(userManager, winner)
{
    for (let i = 0; i < gameRoom.length; ++i)
    {
        if (gameRoom[i][1] == winner)
        {
            userManager.addWin(gameRoom[i][0]);
        } else if (gameRoom[i][1] != "spectate" && gameRoom[i][1] != winner)
        {
            userManager.addLoss(gameRoom[i][0]);
        }
    }
}
function declareWinnerOnQuit(userManager, userID)
{
    if ((gameRoom[userID][1] == true || gameRoom[userID][1] == false))
    {
        console.log(gameRoom[userID][0]);
        userManager.addLoss(gameRoom[userID][0]);
        for (let i = 0; i < gameRoom.length; ++i)
        {
            if (i == userID) continue;
            if (gameRoom[i][1] == true || gameRoom[i][1] == false)
            {
                userManager.addWin(gameRoom[i][0]);
            }
        }
    }
}
/**
 * This method checks the win condition for horizontal cases.
 */
function checkWinHorizontally(circles) {
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
                return true;
            }
        }
    }
    return false;
}

/**
 * This method is responsible for checking the win condition vertically.
 */
function checkWinVertically(circles) {
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
                return true;
            }
        }
    }
    return false;
}

/**
 * This method is responsible for checking the win cases diagonally.
 */
function checkWinDiagonally(circles) {
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
                return true;
            }
        }
    }
    return false;
}

module.exports = {init};