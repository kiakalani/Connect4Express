/**
 * @author Kia Kalani
 * Student ID: 101145220
 * This script file contains the game logic related to the rooms, in terms of
 * the rest api get calls and the logic behind setting up different rooms and
 * transferring signals.
 * @version 1.00
 * @since 1.00
 */


let socketIO;
let app;

let currentID = 1000;
const rooms = [];
/**
 * This method is responsible for opening up a socket for the players.
 * @param {the server} server 
 * @param {the user manager} userManager 
 */
function init(server, userManager)
{
    setGame(server, userManager);
    app = require("http").Server(server);
    socketIO = require("socket.io")(app, {cors:{origin:"*"}});
    setRoomCreation(server, userManager);
    setFindRooms(server);
    app.listen(5000, function()
    {
    });
}

/**
 * This method sets the get call for the game itself.
 * @param {the server} server 
 * @param {user manager object} userManager 
 */
function setGame(server, userManager)
{
    server.get("/game", function(request, response)
    {
        if (request.session.user == null || request.session.user.room.length == 0)
        {
            response.redirect("/user");
        }
        else
        {
            addPlayerToRoom(getRoomByID(request.session.user.room[0]).room, request.session.user);
            response.render("public/game/game.ejs");
        }
    });
}


/**
 * This method adds a player to the room
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
 * This method is responsible for handling the connected connection to the socket.
 * @param {the user manager object} userManager 
 * @param {the added user to a room} user 
 */
function handleSocket(userManager, user)
{
    let myfunc = function(socket)
    {
        let happened = false;
        let gameRoom;
        initializeRoomOnSocketForUser(user, socket);
        socket.off("provideRoomID",function(data){}).on("provideRoomID", function(data)
        {
            if (data == null) return;
            gameRoom = getRoomByID(data);
            let currentPlayerID = gameRoom.room.length - 1;
            socket.emit("initG", {turn: gameRoom.room[currentPlayerID][1], roomID: gameRoom.id});
            if (!happened)
            socket.on("makeMove", function(gameComponents)
            {
                happened = true;
                if (gameComponents.roomID == gameRoom.id)
                {
                    gameRoom.turn = !gameComponents.turn;
                    socket.broadcast.emit("gameAction", {turn: gameRoom.turn, board: gameComponents.board, roomID: gameRoom.id});
                    if (gameOver(gameComponents.board) &&gameRoom.room.length != 0)
                    {
                        addWinnerScore(userManager, gameRoom.room[currentPlayerID][1], gameRoom.room);
                        socket.broadcast.emit("gg", gameRoom.room[currentPlayerID][1], gameRoom.id);
                        gameRoom.room = [];
                        gameRoom.turn = true;
                    }
                }
                socket.on("disconnect", function()
                {
                    let happened = false;
                    if (gameRoom.room[currentPlayerID] != null > 0 &&(!gameOver(gameComponents.board) && hasBothPlayers(gameRoom.room) && gameRoom.room[currentPlayerID][1] != "spectate"))
                    {
                        declareWinnerOnQuit(userManager, currentPlayerID, gameRoom.room);
                        happened = true;
                    }
                    if (happened)
                    {
                        socket.broadcast.emit("gg", !gameRoom.room[currentPlayerID][1]);
                        gameRoom.room = [];
                    }
                    if (gameRoom.room.length == 1)
                    {
                        gameRoom.room = [];
                    } else gameRoom.room.splice(currentPlayerID, 1);
                    socket.close();
                });
            });
        });
        socket.on("turnItOff", function(){happened = false;})
    }
    socketIO.off("conncetion", myfunc).on("connection", myfunc);
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

/**
 * This method indicates whether both the true and false turns are in the room.
 * @param {the game room} gameRoom 
 */
function hasBothPlayers(gameRoom)
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

/**
 * This function adds the winner's score to its object in database and components
 * @param {the user manager object} userManager 
 * @param {the player who won the game} winner 
 * @param {the game room itself} gameRoom 
 */
function addWinnerScore(userManager, winner, gameRoom)
{
    let user1;
    let user2;
    for (let i = 0; i < gameRoom.length; ++i)
    {
        if (gameRoom[i][1] == winner)
        {
            user1 = gameRoom[i][0];
            user1.room = [];
            userManager.addLoss(gameRoom[i][0]);
            gameRoom[i][0].room = [];
            
        } else if (gameRoom[i][1] != "spectate" && gameRoom[i][1] != winner)
        {
            user2 = gameRoom[i][0];
            user2.room = [];
            userManager.addWin(gameRoom[i][0]);
            gameRoom[i][0].room = [];
        }
    }
    userManager.addToUsersRecord(user2, user1);
}

/**
 * This function is responsible for declaring the winner when a user gives up
 * the game.
 * @param {the user manager object} userManager 
 * @param {the id of the user} userID 
 * @param {the current game room of the user} gameRoom 
 */
function declareWinnerOnQuit(userManager, userID, gameRoom)
{
    let user1,user2;
    if ((gameRoom[userID][1] == true || gameRoom[userID][1] == false))
    {
        gameRoom[userID][0].room = [];
        userManager.addLoss(gameRoom[userID][0]);
        user1 = gameRoom[userID][0];
        for (let i = 0; i < gameRoom.length; ++i)
        {
            if (i == userID) continue;
            if (gameRoom[i][1] == true || gameRoom[i][1] == false)
            {
                user2 = gameRoom[i][0];
                userManager.addWin(gameRoom[i][0]);
            }
        }
        userManager.addToUsersRecord(user2, user1);
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
            let ffc = 1;
            let fbc = 1;
            let bbc = 1;
            let bfc = 1;
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

/**
 * this function would indicate whether the player is in the room or not.
 * @param {the room} room 
 * @param {the name of the player} playername 
 * @returns true if the player is in the room
 */
function roomHasPlayerName(room, playername)
{
    for (let i = 0; i <room.room.length; ++i)
    {
        if (room.room[i][0].username.toLowerCase().includes(playername.toLowerCase()))
        return true;
    }
    return false;
}

/**
 * This method is responsible for providing the rooms with the room name and player's name inside it.
 * @param {the name of the room} name 
 * @param {the name of the player} playername 
 */
function getRoomByFilters(name, playername)
{
    let neededrooms = []
    for (let i = 0; i <rooms.length; ++i)
    {
        if (roomHasPlayerName(rooms[i], playername) && rooms[i].name.toLowerCase().includes(name.toLowerCase()))
        {
            neededrooms.push(rooms[i]);
        }
    }
    return neededrooms;
}

/**
 * This method is responsible for setting the server's get call for finding the roooms.
 * @param {the server} server 
 */
function setFindRooms(server)
{
    server.get("/findrooms", function(request, response)
    {
        removeEmptyRoom();
        if (request.session.user == null)
        {
            response.redirect("/user");
        } else if (request.url.includes("?"))
        {
            response.render("public/search/searchGames.ejs", {current: getRoomByFilters(request.query.detail, request.query.player)});
        } else response.redirect("/findrooms/?player=&active=on&detail=");

    });
}

/**
 * This method takes care of the get call related to the making room portion of the code.
 * @param {the main server} server 
 * @param {the user manager object} userManager 
 */
function setRoomCreation(server, userManager)
{
    server.get("/makeroom", function(request, response)
    {
        if (request.session.user == null)
        {
            response.redirect("/user");
        }
        else
        {
            if (request.url.includes("?"))
            {
                createRoom(request.session.user, request.query.username, request.query.password, server);
                handleSocket(userManager, request.session.user);
                response.redirect("/game");
            }
            else response.render("public/game/makeGame.ejs");
        }
    });
}

/**
 * This function is responsible for setting the get of the room and authenticating them
 * and finally redirecting them to the game page.
 * @param {the user who creates the room} user 
 * @param {the name of the room} name 
 * @param {the password of the room} password 
 */
function createRoom(user, name, password, server, userManager)
{
    let id = currentID++;
    rooms.push({id: id, room:[[user, true, id]], name: name, password: password, turn: true});
    user.room.push(rooms[rooms.length-1].id);
    server.get("/rooms/"+id, function(request, response)
    {
        if (request.url.includes("?"))
        {
            if (request.query.password == password)
            {
                addUserToRoom(rooms[rooms.length-1], request.session.user);
                response.redirect("/game");
                handleSocket(userManager, user);
                return;
            }
        }
        response.render("public/game/joinRoom.ejs");
    });
}

/**
 * this function is responsible for initializing the room socket by sending
 * each client their room id.
 * @param {the user} user 
 * @param {the socket} socket 
 */
function initializeRoomOnSocketForUser(user, socket)
{
    socket.emit("sendRoom", user.room[0]);
}

/**
 * This method is responsible for adding a user to the room
 * @param {the room} room 
 * @param {the user to be added to the room} user 
 */
function addUserToRoom(room, user)
{
    room.room.push([user, room.room.length == 1 ? false: "spectate", room.id]);
    user.room.push(room.id);
}

/**
 * This method is responsible for providing the room with the given id.
 * @param {the id of the room} id 
 * @returns the room that matches the given id.
 */
function getRoomByID(id)
{
    for (let i = 0; i < rooms.length; ++i)
    {
        if (rooms[i].id == id) return rooms[i];
    }
    return null;
}

/**
 * @deprecated
 * This method takes care of joining a player to the room.
 * It would automatically join the rest of the players as spectators
 * once there are two people in the room.
 * @param {the user who is trying to join the game} user 
 * @param {the password of the room} password 
 * @param {the id of the room they are trying to join} roomID 
 */
function joinRoom(user, password, roomID)
{
    let room = getRoomByID(roomID);
    if (room.password == password)
    {
        room.room.push(user);
    }
}
/**
 * This method removes the rooms that have no active players within them.
 */
function removeEmptyRoom()
{
    for (let i = 0; i <rooms.length; ++i)
    {
        if (rooms[i].room.length == 0)
        {
            rooms.splice(i,1);
        }
    }
}

module.exports = {init};