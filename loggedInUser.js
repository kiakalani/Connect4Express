/**
 * @author Kia Kalani
 * Student ID: 101145220
 * This file contains all of the components related to the display of the logged in user.
 * @version 1.00
 * @since 1.00
 */


/**
 * This method is responsible for setting all of the gets related to the logged in user.
 * @param {the server of the project} server 
 * @param {the user manager containing every event related to users} userManager 
 */
function setViews(server, userManager)
{
    displayUserPage(server, userManager);
    handleLogOut(server, userManager);
    displayFollowingUsers(server, userManager);
    goOfflineForUser(server, userManager);
    getFollowRequests(server, userManager);
    goPrivatePublicHandler(server, userManager);
}

/**
 * This method sets the get call in relates to viewing the personal profile.
 * @param {The server of the project} server 
 */
function displayUserPage(server, userManager)
{
    server.get("/user", function(request, response)
    {
        if (request.session.user == null)
        {
            response.redirect("/signin");
        }
        else
        {
            userManager.setAllUsersGet(server);
            response.render("public/userPage/user.ejs", {user: request.session.user, uerByUsername: userManager.userByUserName});
        }
    });
}


/**
 * This method is responsible for handling the get call for logging out.
 * @param {is the server} server 
 * @param {the user manager object} userManager 
 */
function handleLogOut(server, userManager)
{
    server.get("/logout", function(request, response)
    {
        if (request.session.user != null)
        {
            userManager.setUserOffline(request.session.user);
            request.session.user = null;
            response.redirect("/");
        }
    });
}

/**
 * This method deals with demonstrating the users that the logged in user follows.
 * @param {the server} server 
 * @param {user manager object} userManager 
 */
function displayFollowingUsers(server, userManager)
{
    server.get("/user/following", function(request, response)
    {
        if (!request.url.includes("?"))
        {
            response.redirect("/user/following/?searchTerm=");
            return;
        }
        else
        {
            let users = userManager.searchFollowingUser(request.session.user, request.query.searchTerm);
            response.render("public/search/search.ejs", {current: users});
        }
    });
}

/**
 * This method is responsible for the get call of going offline.
 * @param {is the server} server 
 * @param {the user manager object} userManager 
 */
function goOfflineForUser(server, userManager)
{
    server.get("/user/off", function(request, response)
    {
        userManager.setOnlineStatus(request.session.user);
        response.redirect("/user");
    });
}

function getFollowRequests(server, userManager)
{
    server.get("/user/followRequests", function(request, response)
    {
        if (!request.url.includes("?"))
        {
            response.redirect("/user/followRequests/?searchTerm=");
        }
        else
        {
            let users = userManager.searchThroughFollowRequests(request.session.user, request.query.searchTerm);
            response.render("public/search/search.ejs", {current: users});
        }
    })
}

function goPrivatePublicHandler(server, userManager)
{
    server.get("/user/pp", function(request, response)
    {
        if (request.session.user == null)
        {
            response.redirect("/");
        }
        else
        {
            userManager.setUserType(request.session.user, server);
            response.redirect("/user");
        }
    });
}


module.exports = {setViews};