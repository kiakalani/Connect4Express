const fs = require("fs");
/**
 * This method adds a game to game rooms.
 * @param {The owner of the room} user 
 * @param {The name of the room} roomname 
 * @param {The password of the room} password 
 */
function makeGame(user, roomname, password)
{
    let current = getGames();
    current.games.push({name: roomname,player1: user, player2: null, password:password});

    fs.writeFile('./games.json', JSON.stringify({game: current.games}), function(error) {
        if (error){
            console.log(error);
        } 
        else {
            console.log("Added");
        }
    });
}

/**
 * This method gets the games components from the <code>games.json</code> file.
 */
function getGames()
{
    return require("./games.json");
}

/**
 * This method joins the player to the game room.
 * @param {the name of the room} gameName 
 * @param {the user that is joining} user 
 */
function joinGame(gameName, user)
{
    let games = getGames().games;
    for (let i =0; i < games.length; ++i)
    {
        if (gameName == games[i].name)
        {
            games[i].player2 = user;
            return;
        }
    }
}

module.exports = {makeGame, getGames, joinGame};
