const express = require("express");
const path = require("path");
const gamedb = require("./gamedb");
const server = express();
const fileio = require('./tempDatabaseReader.js');
const cookieParser = require("cookie-parser");
const session = require("express-session");
/**
 * All of the current users loaded from the so called database.
 */
const users = fileio.getUsers().allusers;

/**
 * This port would be used to run the server.
 */
const port = process.env.PORT || 8085;

/**
 * For loading static websites and rendering ejs
 */
server.use(express.static(path.join(__dirname, "public")));
server.use(cookieParser());
server.use(session({secret: "The security is not a concern:)"}));

/**
 * For loading the ejs pages
 */
server.set('view-engine', 'ejs');

//--------------------------------------------------------------The Get Components of the Server----------------------------------------------

/**
 * Loading the main menu of the project
 */
server.get("/", function (request, response) {
    response.render('public/index.ejs');
});

/**
 * Loading the game page./public" of the project.
 * <strong> Note: </strong>
 * This part of the project is fully functional however it still does not support
 * multiplayer from different systems. For that a database would be required.
 * However winning and losing condition and the game itself is fully functional and
 * playable.
 */
server.get("/game", function (request, response) {
    response.render("public/game/game.ejs");
});

/**
 * Rendering the how to play page.
 */
server.get("/howto", function (request, response) {
    response.render("public/howto/howTo.ejs");
});

/**
 * Rendering the user page in case of having a user logged in.
 */
server.get("/user", function (request, response) {
    if (request.session.user == null) {
        response.send("<h1>Bad Request</h1> <a href=\"/\"> return to main menu");
        return;
    }
    response.render("public/userPage/user.ejs", {user:request.session.user});
});

/**
 * This get call is responsible for handling the log out request from the user side.
 */
server.get("/logout", function(request, response) {
    if (request.session.user!=null){
        logoutUser(request.session.user.username, request);

    }
    response.redirect("/");
});
/**
 * A get for making a room by the provided room name and password by the user.
 * This still needs some work since the rooms themselves are not functional due to
 * not having real time update of the display for the players.
 */
server.get("/makeroom", function(request, response)
{
    if (request.session.user == null)
    {
        response.redirect("/signin");
    }
    else
    {
        if (request.url !="/makeroom/")
        {
            gamedb.makeGame(request.session.user, request.query.username, request.query.password);
            response.redirect("/game");
            return;
        }
        response.render("public/game/makeGame.ejs");
    }
});
/**
 * A get for finding the current rooms for playing games.
 */
server.get("/findrooms", function(request, response)
{
    if (request.session.user == null) 
    {
        response.redirect("/signin");
        return;
    }
    response.render("public/search/searchGames.ejs", {current:gamedb.getGames().game});
});

/**
 * This method is responsible for rendering the log in page for the user as well as
 * handling the login logic.
 */
server.get("/signin", function (request, response) {
    if (request.session.user != null) {
        // Currently logged in.
        response.redirect("/user");
        return;
    }
    if (request.url != "/signin/") {
        // There has been a request made.
        username = request.query.username;
        password = request.query.password;
        if (username != null) {
            let situation = login(users, username, password, request);
            if (situation == -1) {
                response.send("The user name does not exist! <a href=\"/signin\">Go back</a>");
                return;
            } else if (situation == 0) {
                response.send("Incorrect password! <a href=\"/signin\">Go back</a>");
                return;
            } else {
                response.redirect("/user");
                return;
            }
        }
    }
    response.render("public/signin/signIn.ejs");
});

/**
 * This method is responsible for rendering the sign up page as well as taking care of the sign up logic.
 * <strong>Note:</strong>
 * Due to the shortage of time the database has yet to be set up and therefore theoretically when the server is
 * running the username and password would be stored in the tempDatabase.json file.
 * @see tempDatabase.json
 */
server.get("/signup", function (request, response) {
    if (request.session.user != null) {
        response.redirect("/signin");
        return;
    }
    if (request.url != "/signup/") {    // response.send("<script> let users = "+users+"</script>");
        if (request.query.username != null) {
            let condition = signUp(users, request.query.username, request.query.fullname, request.query.password, request.query.repeatPassword);
            if (condition == -1) {
                response.send("This page came up because you selected either a used username or invalid full name or username. Please try again<a href=\"/signup\">Go back</a>");
                return;
            } else if (condition == 0) {
                response.send("This page came up because you selected either an invalid password or your password is not matching with the repeat password. Please try again<a href=\"/signup\">Go back</a>");
                return;
            }
            response.send("You have successfully created your account. Please go to the <a href=\"/signin\"> sign in</a> page to sign in!");
            return;
        }
    }
    response.render("public/signup/signUp.ejs");

});

/**
 * This method decides whether the player should be followed or unfollowed.
 * @param {The request parameter of server get communication} request 
 * @param {The target user} user 
 * @returns a string indicator as of whether this player should be followed or unfollowed.
 */
function decideFollowUnfollow(request, user)
{
    if (request.session.user!=null) {
        let loggedin = request.session.user;
        for (let i = 0; i < loggedin.following.length; i++)
        {
            if (loggedin.following[i] == user.id)
            {
                return "Unfollow";
            }
        }
    }
    
    return "Follow";
}

/**
 * This method utilizes the get method for following and demonstrating all of the users.
 */
function setAllUsersView()
{
    for (let i = 0; i < users.length;++i)
    {
        server.get("/users/"+users[i].id, function(request, response)
        {
            if (request.session.user!=null&&users[i].id == request.session.user.id) 
            {
                response.redirect("/user");
                
            }else response.render("public/userPage/usersPage.ejs", {
                user: users[i],
                followTxt: decideFollowUnfollow(request, users[i])
            }
            );
        }
        );
        server.get("/users/"+users[i].id+"/follow", function(request, response) {
            if (request.session.user == null) response.redirect("/signin");
            else {
                if (request.session.user.following.includes(users[i].id)){
                    let following = [];
                    for (let j = 0; j < request.session.user.following.length;j++) {
                        if (request.session.user.following[j] == users[i].id) {
                            continue;
                        } else following.push(request.session.user.following[j]);
                    }
                    request.session.user.following=following;
                    fileio.updateTheUserInDataBase(request.session.user);
                } else{
                    request.session.user.following.push(users[i].id);
                    fileio.updateTheUserInDataBase(request.session.user);
                }
                
                
                response.redirect("/users/"+users[i].id);
            }
        })
    }
}
setAllUsersView();

/**
 * Demonstrating all of the users in the website and searching through them.
 */
server.get("/search", function (request, response) {

    response.render("public/search/search.ejs", {current:fileio.getUsers().allusers,});
    
});

/**
 * This method is responsible for determining the followers/following of the user and provide them in an array.
 * @param {The traget user} user 
 * @returns an array containing all of the followers/following users.
 */
function getAllOfTheFollowings(user) {
    let following = []
    for (let i = 0; i < users.length;i++){
        if (user.following.includes(users[i].id) || users[i].following.includes(user.id)) {
            following.push(users[i]);
        }
    }
    return following;
}
/**
 * This get call shows all of the friends of a user. i.e those he follows and those who follow him.
 */
server.get("/user/following", function(request, response) {
    response.render("public/search/search.ejs", {
        current: getAllOfTheFollowings(request.session.user)
    });
});

/**
 * This get is responsible for setting the status of the logged in player as if they
 * want to be seen offline or online.
 */
server.get("/user/off", function(request, response) {

    request.session.user.status= request.session.user.status == "online"?"offline":"online";
    fileio.updateTheUserInDataBase(request.session.user);
    // fileio.updateTheUserInDataBase(request.session.user);
    response.redirect("/user");
});

//--------------------------------------------------------The Helper Functions-------------------------------------------------------

/**
 * This method takes care of the login logic.
 * @param {is the provided username} username 
 * @param {is the provided password} password
 * @returns 1 if the username and password are correct, 0 if the password is incorrect and -1 if the user does not exist.
 */
function login(users, username, password, request) {
    //Logging in the user
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == username && users[i].password == password) {
            users[i].status = "online";
            request.session.user = users[i];
            fileio.update(users);

            return 1;
        } else if (username == users[i].userName) {
            return 0;
        }
    }
    return -1;
}

/**
 * This method takes care of registering a user within the users.js file.
 * @see users.js
 * @param {The users in the project, would be replaced with database later on} users 
 * @param {the username} userName 
 * @param {full name of the user} fullName 
 * @param {their password} password 
 * @param {their password repeated} repeatPassword 
 * @returns -1 if the user already exists or the username or full name is invalid, 0 if the password is invalid and 1 if registering was successful.
 */
function signUp(users, userName, fullName, password, repeatPassword) {
    //Making sure the provided answer is valid
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == userName) {
            return -1;
        }
    }
    if (password != repeatPassword || password.length < 6) {
        return 0;
    }
    else if (userName.length < 4 || !fullName.includes(" ")) {
        return -1;
    }
    fileio.addUser({id:users.length == 0?1000:users[users.length-1].id+1, username: userName, fullname: fullName, password: repeatPassword, following: [], status: "offline", won: 0, currentGame: [false, false] });
    return 1;

}

/**
 * This method is responsible for logging out the users.
 * @param {the username that would be logged out} username 
 */
function logoutUser(username, request) {
    request.session.user = null;
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == username) {
            users[i].status = "offline";
            fileio.update(users);
            // fileio.updateTheUserInDataBase(users[i]);

            break;
        }
    }
}

/**
 * This method would add the provided username to the list of the following users.
 * @param {the user who wants to follow} loggedInuser 
 * @param {the user that is going to be followed by the loggedInuser} username 
 */
function followUser(loggedInuser, username) {
    loggedInuser.following.push(username);
}

/**
 * this method would set the given user's status to offline.
 * @param {the given username} username 
 */
function goOffline(username) {
    for (let i =0;i<users.length;i++) {
        if (users[i].username == username) {
            users[i].status = "offline";
            return;
        }
    }
}

/**
 * Running the server on the provided port above.
 */
server.listen(port, function () {
    console.log("This server is being hosted at port", port);
});