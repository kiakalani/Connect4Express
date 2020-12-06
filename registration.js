/**
 * @author Kia Kalani
 * Student ID: 101145220
 * This script file contains the components related to the registartion
 * in terms of both the get calls for the rest api and handling them on
 * the server side.
 * @version 1.00
 * @since 1.00 
 */




/**
 * This method takes care of functionality of the get methods
 * related to sign in and sign up events.
 * @param {the server} server 
 * @param {the user manager object} userManager 
 */
function setRegistrationGets(server, userManager)
{
    setSignUpPage(server, userManager);
    setSignInPage(server, userManager);
}

/**
 * This method is responsible for the get calls of the sign
 * in events as well as handling them accordingly.
 * @param {the server} server 
 * @param {The user manager object} userManager 
 */
function setSignUpPage(server, userManager)
{
    server.get("/signup", function(request, response)
    {
        if (request.session.user != null)
        {
            response.redirect("/user");
        }
        else
        {
            let username = request.query.username;
            let fullName = request.query.fullname;
            let password = request.query.password;
            let repeatPassword = request.query.repeatPassword;
            if (request.url.includes("?"))
            {
                switch(signUpUserCondition(username, fullName, password, repeatPassword, userManager))
                {
                    case -1:
                        response.send("This page came up because you selected either a used username or invalid full name or username. Please try again<a href=\"/signup\">Go back</a>");
                        return;
                    case 0:
                        response.send("This page came up because you selected either an invalid password or your password is not matching with the repeat password. Please try again<a href=\"/signup\">Go back</a>");
                        return;
                    default:
                        userManager.addUser(username, password, fullName, request, server);
                        response.redirect("/user");
                        return;
                }
            }
            response.render("public/signup/signUp.ejs");
        }
    });
}

/**
 * This method is responsible for indicating whether the log in information is valid.
 * @param {the username} username 
 * @param {the full name of the person} fullName 
 * @param {the passwrd that has to be at least six characters} password 
 * @param {the repeat of the password} repeatPassword 
 * @param {the user manager object} userManager 
 * @returns -1 if the username or the full name are invalid, 0 if the password is invalid otherwise 1.
 */
function signUpUserCondition(username, fullName, password, repeatPassword, userManager)
{
    if (userManager.userByUserName(username) != null || !fullName.includes(" "))
    {
        return -1;
    }
    else if (password.length < 6 || password != repeatPassword)
    {
        return 0;
    }
    else return 1;

}

/**
 * This method is responsible for handling the get calls related to the 
 * sign in events.
 * @param {the server} server 
 * @param {the user manager object} userManager 
 */
function setSignInPage(server, userManager)
{
    server.get("/signin", function(request, response)
    {
        if (request.session.user != null)
        {
            response.redirect("/user");
        }
        else
        {
            let username = request.query.username;
            let password = request.query.password;
            if (request.url.includes("?"))
            {
                let logInStats = userManager.loginUser(username, password, request);
                if (logInStats)
                {
                    response.redirect("/user");
                    return;
                }
                else
                {
                    response.send("Invalid Login Information! <a href=\"/signin\">Go back</a>");
                    return;
                }
            }
            response.render("public/signin/signIn.ejs");
        }
    });
}

module.exports = {setRegistrationGets};