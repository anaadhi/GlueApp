
var socket = io("https://glueapp.herokuapp.com/");

console.log("connected")

function emit(){
    msg = {'email':'dickinson@gmail.com','password':'dickinchild'}
    socket.emit("check",msg)
}