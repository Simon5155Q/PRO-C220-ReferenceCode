const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));
var nodemailer = require("nodeMailer");
var transporter = nodemailer.createTransporter({
    "port": 587,
    "host": "smtp.gmail.com",
    "auth": {
        "user": "simon5155Q@gmail.com",
        "pass": "rnrvoywbipllbdhq"
    },
    "secure": true,
})


const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post("/sendmail", (req, res)=>{
    var to = req.body.to
    var url = req.body.url
    var mailInfo = {
        "from": "simon5155Q@gmail.com",
        "to": to,
        "subject": "join the video session",
        "html": `<p>join meeting here! ${url}</p>`,
    }
    transporter.sendMail(mailInfo, (error, info)=>{
        console.log(info);
        if(error){
            console.log(error);
        }
        else{
            res.send({
                "success": "message sent!",
                "messageID": info.messageID
            })
        }
    })
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);
