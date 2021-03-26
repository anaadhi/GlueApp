var port = chrome.extension.connect({
    name: "Sample Communication"
});

document.getElementById("login").addEventListener('submit', e => {
    e.preventDefault()
    var type="login"
    var email = document.getElementById('email').value;
    var pass = document.getElementById('pass').value;
    var id = makeid(20)
    console.log("ok")
    var msg = {type:'login', 'email':email, 'pass':pass, 'id':id}
    port.postMessage(msg)
})

// make temp id for login
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
