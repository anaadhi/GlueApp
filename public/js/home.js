
var socket = io("http://localhost:3000");

console.log("connected")

function emit(){
    msg = {'email':'dickinson@gmail.com','password':'dickinchild'}
    socket.emit("check",msg)
}