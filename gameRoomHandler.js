let socketIO;
let app;


let gameRoom = {};
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
    handleSocket();
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
        addPlayerToRoom(gameRoom, request.session.user);
        response.render("public/game/game.ejs");
    });
}


/**
 * 
 * @param {the room we are adding the user to} room 
 * @param {the user we are adding to the room} user 
 */
function addPlayerToRoom(room, user)
{
    if (room.player1 == null)
    {
        room.player1 = {user, trun:true};
    }
    else
    {
        room.player2 = {user, turn: false};
    }
}


function handleSocket()
{
    socketIO.on("connection", function(socket)
    {
        // Todo: store the game components over here and then transfer them to
        // The players
        if (gameRoom.player2 == null) {
            socket.emit("initG", true);
        } else socket.emit("initG", false);

        socket.on("makeMove", function(gameComponents)
        {

            if (turn)
            {
                turn = false;
            } else turn = true;
            socket.broadcast.emit("gameAction", {turn: turn, board: gameComponents.board});
            // socket.broadcast.emit("changeTurn", {turn});
        });
    });
}

module.exports = {init};