const express = require("express");
const path = require("path");
const port = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const server = express();
/*-------------------------------------The server use calls----------------------------*/
server.use(express.static(path.join(__dirname, "public")));
server.use(cookieParser());
server.use(session({secret: "Security is the least concern ;)"}));
server.set("view-engine", "ejs");
/*-------------------------------------My defined components---------------------------*/
const userManager = require("./usersDBHandler");
const registration = require("./registration");
const loggedInUser = require("./loggedInUser");
const registrationDisplay = require("./registration");
const mainComponents = require("./mainComponents");
const publicChat = require("./publicChat");
const gameSocket = require("./gameRoomHandler");
gameSocket.init(server, userManager);
/*-------------------------------------Setting the get calls---------------------------*/
userManager.setAllUsersGet(server);
registration.setRegistrationGets(server, userManager);
loggedInUser.setViews(server, userManager);
registrationDisplay.setRegistrationGets(server, userManager);
mainComponents.setGetCalls(server, userManager);
publicChat.getCall(server, userManager);
/*--------------------------------------------Listening--------------------------------*/
server.listen(port, function()
{
    console.log("This server is being hosted at port", port);
});