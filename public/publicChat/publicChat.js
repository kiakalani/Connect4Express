/**
 * Connecting to the socket that has been opened by the http server for public chats.
 */
const socket = io("http://localhost:4800");
/**
 * The form that contains the elements related to sending the message
 */
const messageForm = document.getElementById("messageContainer");
/**
 * The input of the message
 */
const messageInput = document.getElementById("messageInput");
/**
 * Here all of the messages would be stored.
 */
const allMessages = document.getElementById("allMessages");

socket.on("chat-message", function(data)
{
    addMessage(data.message, data.name, data.id);
});

messageForm.addEventListener("submit", function(e)
{
    e.preventDefault();
    let message = messageInput.value;
    socket.emit("sendChat", message);
    messageInput.value = "";
    addMessage(message, "You", "/user");
});

function addMessage(message, name, id)
{
    const messageElement = document.createElement("li");
    const link = document.createElement("a");
    if (id == "/user")
    {
        link.href="/user"
    } else
    {
        link.href="/users/"+id;
    }
    link.innerText = name;
    messageElement.className = "list-group-item";
    const p = document.createElement("p");
    p.innerText = message;
    messageElement.appendChild(link);
    messageElement.appendChild(p);
    allMessages.append(messageElement);
}