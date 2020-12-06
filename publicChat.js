/**
 * @author Kia Kalani
 * Student ID: 101145220
 * This script file contains all of the components related to the public chat portion of
 * the code. This contains both of the get calls related to the rest api and functionality
 * of it.
 * @version 1.00
 * @since 1.00
 */


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
        let currentID = connectedUsers.length - 1;
        socket.on("sendChat", function(message)
        {
            socket.broadcast.emit("chat-message", {message: message, name: connectedUsers[currentID].username, id: connectedUsers[currentID].id});
        });
        socket.on("disconnect", function()
        {
            delete connectedUsers[currentID];
            connectedUsers.splice(currentID,1);
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