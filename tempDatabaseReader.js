const fs = require('fs');
/**
 * This file is the simulator of the so called 'database'. For now there is only a json file which would be read and
 * written to by the given methods below.
 */


 /**
  * This method is responsible for reading the so called database.
  */
function getUsers() {
    let json = require('./tempDatabase.json');
    return json;
}
/**
 * this method adds the user to the so called database.
 * @param {is the user we want to add to the so called database} user 
 */
function addUser(user) {
    
    users = getUsers().allusers;
    users.push(user);
    fs.writeFile('./tempDatabase.json', JSON.stringify({allusers:users}), function(error) {
        if (error){
            console.log(error);
        } 
        else {
            console.log("Added");
        }
    });
}
/**
 * this method would update the json file according to the elements of the users.
 * @param {the current stats of the users} users 
 */
function update(users) {
    fs.writeFile('./tempDatabase.json', JSON.stringify({allusers:users}), function(error) {
        if (error){
            console.log(error);
        } 
        else {
            console.log("Added");
        }
    });
}

function updateTheUserInDataBase(user) 
{
    users = getUsers().allusers;
    for (let i = 0; i < users.length;i++) 
    {
        if (users[i].id == user.id)
        {
            users[i] = user;
        }
    }
    fs.writeFile('./tempDatabase.json', JSON.stringify({allusers:users}), function(error) 
    {
        if (error)
        {
            console.log(error);
        } 
        else 
        {
            console.log("Added");
        }
    });
}
// exporting the modules.
module.exports = {getUsers, addUser, update, updateTheUserInDataBase};