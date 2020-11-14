Name: Kia Kalani
Student ID: 101145220
Partners: I am working individually.

REQUIRED MODULES FOR RUNNING THIS SUBMISSION:
1. express
2. nodemon (This is just for debugging)
3. path
4. mongoose
5. fs
6. express-session
7. ejs

Open Stack information: For whatever reason there was no COMP2406 in my
open stack page and I was unable to do it. As a proof, you can find a screenshot
of the openstack page.

Therefore, please consider running it as you would normally by installing all of the
dependencies and then running it. The program will start running by the command `npm start`.
However, before running it make sure you have installed the packages mentioned above.

Explanation:
The server is functional in terms of having sessions. You can log in, log out, set your status, etc.
Additionally, for making the game itself, I used p5JS which is a very flexible library for making games.
The game is fully functional; however, the remaining part related to it is to make the players being able
to play multiplayer using the game room setup. All of these properties and logic can be accessed within the
`index.js` and `gamedb.js` files. Additionallly, the following mechanism is fully functional and logged in users
can either follow or unfollow others and it would be updated inside the dashboard of the user when they trigger the
button for viewing their current friends. For any explanation related to the functionality of the server, please refer
to their script files. In conculsion, most of the components are done excluding making the game real time update and
replacing json files with mongodb. 