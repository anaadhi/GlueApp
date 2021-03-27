
const domain = "https://glueapp.herokuapp.com:443/"
var socket = io(domain);
var token = undefined

function copyTextToClipboard(text) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    document.body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy'); 
    copyFrom.blur();
    document.body.removeChild(copyFrom);
  }
copyTextToClipboard("hello")

chrome.extension.onConnect.addListener(function(port) {
  console.log("Connected .....");

  
  port.onMessage.addListener(function(msg) { 
    if (msg.type = "login"){
      socket.emit('login', msg)
    }
    
  })
})

// * -------------------------check for cookies-------------------------

  chrome.cookies.get({"url": domain, "name": "token"}, function(cookie) {
    try{
      console.log(cookie.value)
      token = cookie.value
      joinroom(token)

    } catch(err){
      chrome.tabs.create({ url: domain + "login" });
      checkcookie()
    }
  });
function checkcookie(){
  const interval = setInterval(function() {
    chrome.cookies.get({"url": domain, "name": "token"}, function(cookie) {
      try{
        console.log("working")
        token = cookie.value

        clearInterval(interval);
        alert("logged in")
        

        joinroom(token)

    } catch(err){}
  });
  }, 1000);
}

// * ------------------------- join room -------------------------

  function joinroom(tokn){
    socket.emit('login', tokn)
    token = tokn
  }

  socket.on('check', (msg) => {
    console.log(msg)
    if (msg == "room joined"){
      start()
    }
  })

// * ------------------------- copy -------------------------
var old = ""
function start() {

  var copyFrom = document.createElement("textarea");
  document.body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('paste')
  var text = copyFrom.value;
  
  copyFrom.blur();
  document.body.removeChild(copyFrom);
  if (text != old){
    console.log("emitted")
    msg = {jwt:token, content: text}
    socket.emit('copy', msg)
  }
  old = text
  setTimeout(start, 2000);
}

// * ------------------------- paste -------------------------
  
  socket.on('paste', (msg) => {
    console.log(msg)
    copyTextToClipboard(msg)
  })