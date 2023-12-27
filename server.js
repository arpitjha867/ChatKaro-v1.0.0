import express  from "express";
import path,{ dirname } from "path";
import { fileURLToPath } from 'url';
import routes from "./Routes/router.js"
import bodyparser from 'body-parser'
import {Server}  from 'socket.io';
import uniqueID from 'uniqid';
import moment from "moment";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8080;
const app = express();

app.set("view engine","ejs");
app.use("/css",express.static(path.resolve(__dirname,"Assets/css")))
app.use("/img",express.static(path.resolve(__dirname,"Assets/img")))
app.use("/js",express.static(path.resolve(__dirname,"Assets/js")))
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())

app.use("/",routes);

var server = app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`)
})

const io = new Server(server,{
    allowEIO3 : true
});

export var onlineUsers = [];
var availableUsers = [];
var rooms = [];
var queue = [];

io.on("connection",(socket)=>{
    console.log("****************NEW CONNECTION******************")
    let windowID = socket;
    socket.emit('wait', { "message": "Please wait...connecting you to stranger!"});
    console.log("USER CONNECTED TO CONNECTION AND 'wait' EVENT IS SENT USERID => ",socket.id)
    availableUsers.push(socket);
    let resolveAfter5Seconds = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('resolved');
        }, 5000);
      });
    }
    console.log("USER ADDED TO 'availableUsers' LIST");
    async function asyncCall(){
        let result = await resolveAfter5Seconds();
        let selected = Math.floor(Math.random()*availableUsers.length);
        socket = availableUsers[selected];
        console.log("RANDOMLY SELECTING USER FROM 'availableUsers' LIST USER SELECTED => ",socket.id);
        availableUsers.splice(selected,1);
        socket.emit('ack', { id: socket.id, msg: "User connected" });
        onlineUsers.push(socket);
        console.log("SELECTED USER IS ADDED TO 'onlineUsers' LIST 'ack' EVENT IS SENT ")
        socket.on('privateRoom', (user) => {
            let unfilledRooms = rooms.filter((room) => {
              if (!room.isFilled) {
                return room;
              }
            });
            try {
              console.log("CHECKING IF ROOM EXIST");
              socket.join(unfilledRooms[0].roomID);
              let index = rooms.indexOf(unfilledRooms[0]);
              rooms[index].isFilled = true;
              unfilledRooms[0].isFilled = true;
              socket.emit('private ack', { "message": "Added to privateRoom", "roomID": unfilledRooms[0].roomID });
              socket.roomID = unfilledRooms[0].roomID;
              io.sockets.in(socket.roomID).emit('toast', { "message": "You are connected with a stranger!"});
              console.log("USER CONNECTED TO EXISTING ROOM 'private ack' EVENT SENT : ROOMID => ",socket.roomID);
            }
            catch(e) {
              console.log("CREATING A NEW ROOM");
              let uID = uniqueID();
              rooms.push({ "roomID": uID, "isFilled": false });
              socket.join(uID);
              socket.roomID = uID;
              socket.emit('private ack', { "message": "Added to privateRoom", "roomID": uID });
              console.log("ROOM CREATED  'private ack' EVENT SENT : ROOMID => ",uID);
            }
            console.log("ALL ROOMS => ",rooms);
          });
    }
    asyncCall()

    socket.on('typing', (data) => {
      io.sockets.in(data.room).emit('addTyping', { "senderId": windowID.id, "typingStatus": data.typingStatus });
    });

    socket.on("sendMessage",(data)=>{
      const timestamp = moment().format('LT')
      io.sockets.in(data.room).emit('newMessage',{"message":data,"senderId":windowID.id,"timestamp":timestamp})
    })

    socket.on('disconnect', () => {
      console.log("USER DISCONNECTING USERID => ",socket.id);
      let index = onlineUsers.indexOf(socket);
      onlineUsers.splice(index,1);
      console.log("USER REMOVED FROM onlineUsers");
      index = rooms.findIndex(x => x.roomID == windowID.roomID);
      if(index >= 0){
        if(rooms[index].isFilled == true){
          console.log("USER IS REMOVED FROM FILLED ROOM ROOMID => ",rooms[index].roomID);
          let warning = { "title": "Stranger is disconnected!", "message": "Please click on 'New' button to connect to someone else." };
          io.sockets.in(windowID.roomID).emit('alone', { "warning": warning, "roomID": windowID.roomID });
          rooms.splice(index,1);
        }
        else{
          console.log("USER IS REMOVED FROM UN-FILLED ROOM ROOMID => ",rooms[index].roomID);
          rooms.splice(index,1);
        }
      }
    });
})
