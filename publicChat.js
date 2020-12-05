/**
 * HTTP server for running the socket
 */
let app;

/**
 * The socketio object
 */
let socketIO;

/**
 * An array of the users who are in the public chat.
 */
const connectedUsers = [];
/**
 * This method is responsible for initializing the socket and running it on
 * port 4800.
 * @param {the main server} server 
 */
function init(server)
{
    app = require("http").Server(server);
    socketIO = require("socket.io")(app, {cors:{origin:"*"}});
    app.listen(4800, function()
    {
        console.log("Socket is listening at port", 4800);
    });
    handleTheSocketEvents();
}


/**
 * This method handles the events related to the socket in order to broadcast what one user types.
 */
function handleTheSocketEvents()
{
    socketIO.on("connection", function(socket)
    {
        if (connectedUsers.length > 0)
        {
            console.log(connectedUsers[connectedUsers.length-1].username + " has been connected to the public chat!!");
        }
        let currentID = connectedUsers.length - 1;
        socket.on("sendChat", function(message)
        {
            socket.broadcast.emit("chat-message", {message: message, name: connectedUsers[currentID].username, id: connectedUsers[currentID].id});
        });
        
    });

}


/**
 * This method is responsible for setting the get calls related to the public chat room
 * @param {the user} server 
 * @param {the user manager object} userManager 
 */
function getCall(server, userManager)
{
    init(server);
    server.get("/publicchat", function(request, response)
    {
        if (request.session.user == null)
        {
            response.redirect("/signin");
        }
        else
        {
            connectedUsers.push(request.session.user);
            response.render("public/publicChat/publicChat.ejs", {users: connectedUsers});
        }
    });
}

module.exports = {getCall}