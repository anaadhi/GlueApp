const http = require('http')
const path = require("path");
const express = require("express")
const app = express()
const server = http.createServer(app)
const socket = require('socket.io')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors');
const bcrypt = require('bcrypt')
const saltRounds = 10
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

// middleware
app.set('views', path.join(__dirname, '/views'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
dotenv.config()
app.use(cookieParser());


// database connection
mongoose.connect( process.env.DATABASE_SECRET ,
{ useNewUrlParser: true,useUnifiedTopology: true },
() => {console.log('connected to db');});

// socket cross origin
const io = socket(server,{
    cors: {
        origin: '*',
    }
});

// schemas
const accounts = require('./models/accounts.js') 



// ---------------- codes -----------------------

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
   
async function login(email, pass){    
    let user =await accounts.findOne({email: email})
        if(await bcrypt.compare(pass, user.password)){
            const accessToken = jwt.sign({id:user._id}, process.env.TOKEN_SECRET);
            return accessToken
        }   
}
    
   

// webpage
app.get('/', (req,res) => {
    res.render('register.ejs')
})
app.post('/', (req, res) => {
    pass = req.body.password
    emails = req.body.email
    console.log(pass)
    bcrypt.hash(pass, saltRounds, function(err, hash) {
        const post =new accounts({
            email : emails,
            password : hash
        });
        post.save()
    });
})

// ------------------------- login -------------------------
app.get('/login', (req, res) => {
    res.render('login.ejs')
})
app.post('/login',async (req, res) => {
    var email = req.body.email
    var pass = req.body.password 
    await accounts.findOne({email: email}, (err, user) => {
        bcrypt.compare(pass, user.password, (err, result) => {
            if(result){
                jwt.sign({id:user._id}, process.env.TOKEN_SECRET, (err, sign) => {
                    res.cookie('token', sign)
                    res.redirect('/home')
                })
            }
        })
    })
})

// ------------------------------ register ------------------
app.get('/home', (req,res) => {
    res.render('home.ejs')
})

// ------------------------- io connections ------------------------
io.on('connection', (socket) => {
    console.log('usr joined')
    socket.on('check', (msg) => {
        console.log(msg)
        
    });

    // * ------------------------- liste for copied text on "copy" -------------------------
    socket.on("copy", (msg) => {
        jwt.verify(msg.jwt , process.env.TOKEN_SECRET, (err, user) => {
            paste = msg.content
            io.to(user.id).emit('paste', paste)
            console.log(msg)
        })
    })

    // * ------------------------- emit jwt to "login" to join room -------------------------
    socket.on('login',async (token) => {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err == undefined){
            socket.join(user.id)
            msg = "room joined"
            io.to(user.id).emit('check', msg) // ? listen on "check" for login  
            } else {
                var temproom = makeid(7)
                socket.join(temproom)
                msg = err
                io.to(temproom).emit('check', msg) // ? listen on "check" for error
                socket.leave(temproom)
            }

        })
    })

    
    


});


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

// node server
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});
