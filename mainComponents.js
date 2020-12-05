const { urlencoded } = require("express");

/**
 * This method is responsible for main calls that are not specifically related
 * to the rest of the portion of the code.
 * @param {the server} server 
 * @param {the user manager object} userManager 
 */
function setGetCalls(server, userManager)
{
    setMainMenu(server);
    setInstructions(server);
    setSearchPage(server, userManager);
}

/**
 * This method is responsible for setting the components of the main menu.
 * @param {the server} server 
 */
function setMainMenu(server)
{
    server.get("/", function(request, response)
    {
        response.render("public/index.ejs");
        // console.log(server.session.user);
    });
}

/**
 * This method sets the instructions of the game.
 * @param {the server} server 
 */
function setInstructions(server)
{
    server.get("/howto", function(request, response)
    {
        response.render("public/howto/howTo.ejs");
    });
}

/**
 * This method is responsible for setting the get call of the search page.
 * @param {the server} server 
 * @param {The user manager object} userManager 
 */
function setSearchPage(server, userManager)
{
    server.get("/search", function(request, response)
    {
        if (request.url.includes("?"))
        {
            let users = userManager.searchForUser(request.query.searchTerm, false);
            response.render("public/search/search.ejs", {current: users});

        }
        else
        {
            response.redirect("/search/?searchTerm=");
            return;
        }
    });
}

module.exports = {setGetCalls};
