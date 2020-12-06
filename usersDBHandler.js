/**
 * @author Kia Kalani
 * Student ID: 101145220
 * This script file contains all of the components related to handling and rendering
 * the components of the users.
 * @version 1.00
 * @since 1.00
 */




const fs = require("fs");


/**
 * This method provides all of the users inside the database.
 * @returns a list that contains all of the users in the server.
 */
function readUsers()
{
    return require("./users.json").allUsers;
}

/**
 * This method registers the user and log him right in.
 * @param {The added username} username 
 * @param {The password of the user to be added} password 
 * @param {The full name of the user} fullName 
 * @param {The request for setting the session here right away} request 
 */
function addUser(username, password, fullName, request, server)
{
    let users = readUsers();
    let addableUser = {id: users.length == 0 ? 1000: users[users.length-1].id + 1, username: username, password: password,
    fullName: fullName, accountType: "public", status: "online", totalGamesPlayed: 0, wins: 0, losses: 0, sentFriendRequests: []
    , receivedFriendRequests: [], friends: [], room: [], record: []};
    setUserGet(addableUser, server);
    request.session.user = addableUser;
    users.push(addableUser);
    // fs.writeFile("./users.json", JSON.stringify({allUsers: users}));
    fs.writeFile("./users.json", JSON.stringify({allUsers: users}), function(error)
    {
        if (error) console.log("Error finding the file");
    });
}

/**
 * This method provides the string for the button to show what action to
 * perform for following.
 * @param {the first user} user1 
 * @param {the second user} user2
 * @returns a string indicating what the status of them are in terms of each other. 
 */
function followingText(user1, user2)
{
    if (user1.sentFriendRequests.includes(user2.id))
    {
        return "Waiting for " + user2.username + " to accept your request";
    }
    else if (user1.receivedFriendRequests.includes(user2.id))
    {
        return "accept " + user2.username + "'s friend request";
    }
    else if (user1.friends.includes(user2.id))
    {
        return "unfollow";
    }
    else return "follow";
}

/**
 * This method is responsible for removing the friend request that has been made by user 1.
 * @param {first user} user1 
 * @param {second user} user2 
 */
function removeFriendRequest(user1, user2)
{
    user1.sentFriendRequests = removeElementFromArray(user1.sentFriendRequests, user2.id);
    user2.receivedFriendRequests = removeElementFromArray(user2.receivedFriendRequests, user1.id);
    updateUser(user1);
    updateUser(user2);
}

/**
 * This method handles the following event according to the appropriate status of
 * the relation between two users.
 * @param {the user who is taking the action} user1 
 * @param {the user who is receiving the action} user2 
 */
function followingEvent(user1, user2)
{
    if (user1.sentFriendRequests.includes(user2.id))
    {
        removeFriendRequest(user1, user2);
        console.log("ici");
    }
    else if (user1.receivedFriendRequests.includes(user2.id))
    {
        handleFriendRequest(user1, user2.id, true);
    }
    else if (user1.friends.includes(user2.id))
    {
        unfollow(user1, user2.username);
    } else sendFollowRequest(user1, user2.id);
    
}

/**
 * This method sets the get methods related to the users.
 * @param {the user} user 
 * @param {the server} server 
 */
function setUserGet(user, server)
{
    server.get("/users/"+user.id, function(request, response)
    {
        if (request.session.user != null && user.id == request.session.user.id)
        {
            response.redirect("/user");
        }
        else
        {
            if (user.accountType == "public" || request.session.user.friends.includes(user.id) || 
            request.session.user.receivedFriendRequests.includes(user.id))
            {
                response.render("public/userPage/usersPage.ejs", {user,
                followTxt: followingText(request.session.user, user)});
            }
            else
            {
                response.redirect("/search");
            }
        }
    });
    setFollowPage(user, server);
}

/**
 * this method sets the follow page of each user.
 * @param {the user} user 
 * @param {the main server} server 
 */
function setFollowPage(user, server)
{
    server.get("/users/"+user.id+"/follow", function(request, response)
    {
        if (request.session.user == null) response.redirect("/signin");
        else
        {
            followingEvent(request.session.user, user);
            response.redirect("/users/"+user.id);
        }
    });
}

/**
 * This method initiates the view of all of the users that already exist in the code.
 * @param {the server} server 
 */
function setAllUsersGet(server)
{
    let users = readUsers();
    for (let i = 0; i < users.length; ++i)
    {
        setUserGet(users[i], server);
    }
}

/**
 * This method updates any changes that has been made to the user in the database.
 * @param {The user} user 
 */
function updateUser(user)
{
    let users = readUsers();
    for (let i = 0; i < users.length; ++i)
    {
        if (users[i].id == user.id)
        {
            users[i] = user;
            fs.writeFile("./users.json", JSON.stringify({allUsers: users}), function(error)
            {
                if (error) console.log("Error finding the file");
            });
            break;
        }
    }
}

/**
 * The getter of the user from the database using their id
 * @param {the id of the user} id 
 * @returns the user by the given id.
 */
function userByID(id)
{
    let users = readUsers();
    for (let i = 0; i < users.length; ++i)
    {
        if (users[i].id == id)
        {
            return users[i];
        }
    }
    return null;
}

/**
 * The getter of the user from the database according to their username
 * @param {name of the user} name 
 * @returns the user by their username.
 */
function userByUserName(name)
{
    let users = readUsers();
    for (let i = 0; i < users.length; ++i)
    {
        if (users[i].username == name)
        {
            return users[i];
        }
    }
    return null;
}

/**
 * This method sends a friend request to the user.
 * @param {the user that is sending the request} user 
 * @param {the id of the user who is receiveing the request} id 
 */
function sendFollowRequest(user, id)
{
    destinationUser = userByID(id);
    if (user.type != "public")
    {
        user.sentFriendRequests.push(destinationUser.id);
        destinationUser.receivedFriendRequests.push(user.id);
    }
    else
    {
        user.friends.push(id);
        destinationUser.push(user.id);
    }
    updateUser(user);
    updateUser(destinationUser);
}

/**
 * This method is responsible for removing an item from the array.
 * @param {the array we are removing the element from} array 
 * @param {the element that we are removing from the array} element 
 */
function removeElementFromArray(array, element)
{
    let arr = []
    for (let i = 0; i <  array.length; ++i)
    {
        if (element != array[i])
        {
            arr.push(array[i]);
        }
    }
    return arr;
}

/**
 * This method handles the friend request event related components.
 * @param {the user that we are handling the request for} user 
 * @param {id of the user that we are either accepting or rejecting} id 
 * @param {a boolean indicator of whether the request has been accepted or not} accepted 
 */
function handleFriendRequest(user, id, accepted)
{
    let destinationUser = userByID(id);
    if (accepted)
    {
        user.friends.push(id);
        user.receivedFriendRequests = removeElementFromArray(user.receivedFriendRequests, id);
        destinationUser.friends.push(user.id);
        destinationUser.sentFriendRequests = removeElementFromArray(destinationUser.sentFriendRequests, user.id);
    }
    else
    {
        user.receivedFriendRequests = removeElementFromArray(user.receivedFriendRequests, id);
        destinationUser.sentFriendRequests = removeElementFromArray(destinationUser.sentFriendRequests, user.id);
    }
    updateUser(user);
    updateUser(destinationUser);
}

/**
 * This method removes the friendship of the user by the given id.
 * @param {The user who wants to remove a friend.} user 
 * @param {is the id of the user is trying to remove.} id 
 */
function removeFriend(user, id)
{
    for (let i = 0; i < user.friends.length; ++i)
    {
        if (user.friends[i] == id)
        {
            user.friends.splice(i, 1);
            return;
        }
    }
}

/**
 * This method removes the friendship between two users biderctionally.
 * @param {the user who is making this request} user 
 * @param {the name of the user they are trying to unfollow} name 
 */
function unfollow(user, name)
{
    let destinationUser = userByUserName(name);
    removeFriend(user, destinationUser.id);
    removeFriend(destinationUser, user.id);
    updateUser(user);
    updateUser(destinationUser);
}

/**
 * This method sets the user to have either public or private account.
 * @param {the user who is making a request} user 
 */
function setUserType(user, server)
{
    user.accountType = user.accountType == "public" ? "private" : "public";
    updateUser(user);
    setUserGet(user, server);
}

/**
 * This method sets the user who is online to offline and vice versa.
 * @param {the user who wants to change the status} user 
 */
function setOnlineStatus(user)
{
    user.status = user.status == "offline" ? "online" : "offline";
    updateUser(user);
    
}

/**
 * This method provides all of the friends a user has.
 * @param {the user that we want to get the friends of} user 
 * @returns an array of users that are this user's friends.
 */
function usersFriends(user)
{
    let followingUsers = []
    for (let i = 0; i < user.friends.length; ++i)
    {
        followingUsers.push(userByID(user.friends[i]));
    }
    return followingUsers;
}

/**
 * This method adds a loss to the player's record.
 * @param {the user we are doing this for} user 
 */
function addLoss(user)
{
    user.losses++;
    user.totalGamesPlayed++;
    updateUser(user);
}

/**
 * This method adds a win to the player's record.
 * @param {the user we are doing this for} user 
 */
function addWin(user)
{
    user.wins++;
    user.totalGamesPlayed++;
    updateUser(user);
}

/**
 * This method shows all of the users that the user tried to send a friend request for.
 * @param {the user that we are looking for knowing his follow requests} user 
 * @returns an array containing all of those users.
 */
function showFollowRequests(user)
{
    let followRequests = [];
    for (let i = 0; i < user.sentFriendRequests.length; ++i)
    {
        followRequests.push(userByID(user.sentFriendRequests[i]));
    }
    return followRequests;
}

/**
 * This method is responsible for setting the user offline.
 * @param {the user} user 
 */
function setUserOffline(user)
{
    user.status = "offline";
    updateUser(user);
}

/**
 * This method is responsible for logging the users.
 * @param {username} username 
 * @param {user's password} password 
 * @param {the request that is coming from the client side} request 
 * @returns true if the user has been successfully logged in.
 */
function loginUser(username, password, request)
{
    let user = userByUserName(username);
    if (user == null) return false;
    if (user.password == password)
    {
        user.status = "online";
        updateUser(user);
        request.session.user = user;
        return true;
    }
    return false;
}

/**
 * This method is responsible for searching the users according to the term.
 * @param {the searched term} term 
 * @returns an array that contains all of the users with the matched term.
 */
function searchForUser(term, type)
{
    let users;
    if (type)
    {
        users = readUsers();
    }
    else users = getPublicUsers();
    let matchedUsers = [];
    for (let i = 0; i < users.length; ++i)
    {
        if (users[i].username.toLowerCase().includes(term) || users[i].status.toLowerCase() == term.toLowerCase())
        {
            matchedUsers.push(users[i]);
        }
    }
    return matchedUsers;
}

/**
 * This method provides all of the users in the user's friends who contain the specific search key.
 * @param {the user} user 
 * @param {the term they have searched for} term 
 */
function searchFollowingUser(user, term)
{
    let users = [];
    for (let i = 0; i < user.friends.length; ++i)
    {
        let current = userByID(user.friends[i]);
        if (current.username.toLowerCase().includes(term.toLowerCase()) || current.status.toLowerCase().includes(term.toLowerCase()))
        {
            users.push(current);
        }
    }
    return users;
}

/**
 * This method provides all of the users who have requested to follow the user
 * that has been provided below.
 * @param {the user} user 
 */
function getFollowRequestUsers(user)
{
    let users = [];
    for (let i = 0; i < user.receivedFriendRequests.length; ++i)
    {
        users.push(userByID(user.receivedFriendRequests));
    }
    return users;
}

function searchThroughFollowRequests(user, term)
{
    let allUsers = getFollowRequestUsers(user);
    let finalUsers = [];
    for (let i = 0; i < allUsers.length; ++i)
    {
        if (allUsers[i].username.toLowerCase().includes(term.toLowerCase()))
        {
            finalUsers.push(allUsers[i]);
        }
    }
    return finalUsers;
}

/**
 * This method is responsible for providing all of the public users
 * within the server.
 * @returns an array of the public users.
 */
function getPublicUsers()
{
    let users = readUsers();
    let publicUsers = [];
    for (let i = 0; i < users.length; ++i)
    {
        if (users[i].accountType == "public")
        {
            publicUsers.push(users[i]);
        }
    }
    return publicUsers;
}

function addToUsersRecord(user1, user2)
{
    user1.record.push([user2.username, "Won"]);
    user2.record.push([user1.username, "lost"]);
    updateUser(user1);
    updateUser(user2);
}

module.exports = {setUserOffline, showFollowRequests, addWin,
addLoss, usersFriends, setOnlineStatus, setUserType, 
setAllUsersGet, addUser, loginUser, userByUserName, userByID,
readUsers, searchForUser, searchFollowingUser,
searchThroughFollowRequests, addToUsersRecord};