const http = require("http");
let httpServer;
let socket;

function setHttpServer(server)
{
    httpServer = http.createServer(server);
    socket = require("socket.io").listen(server);
    httpServer.listen(9999);
}

function turnOnSocket()
{
    let turn = true;
    socket.on("connection", (sock) =>
    {
        sock.emit("gamepage", turn);
    });
}