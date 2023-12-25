import express  from "express";
import path,{ dirname } from "path";
import { fileURLToPath } from 'url';
import routes from "./Routes/router.js"
import bodyparser from 'body-parser'
import {Server}  from 'socket.io';
import uniqueID from 'uniqid';
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
    let windowID = socket;
    socket.emit('wait', { "message": "Please wait...connecting you to stranger!"});
    availableUsers.push(socket);
    let resolveAfter5Seconds = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('resolved');
          }, 5000);
        });
    }
    async function asyncCall(){
        let result = await resolveAfter5Seconds();
        let selected = Math.floor(Math.random()*availableUsers.length);
        socket = availableUsers[selected];
        availableUsers.splice(selected,1);
        socket.emit('ack', { id: socket.id, msg: "User connected" });
        onlineUsers.push(socket);
        socket.on('privateRoom', (user) => {
            let unfilledRooms = rooms.filter((room) => {
              if (!room.isFilled) {
                return room;
              }
            });
            try {
              socket.join(unfilledRooms[0].roomID);
              let index = rooms.indexOf(unfilledRooms[0]);
              rooms[index].isFilled = true;
              unfilledRooms[0].isFilled = true;
              socket.emit('private ack', { "message": "Added to privateRoom", "roomID": unfilledRooms[0].roomID });
              socket.roomID = unfilledRooms[0].roomID;
              io.sockets.in(socket.roomID).emit('toast', { "message": "You are connected with a stranger!"});
            }
            catch(e) {
              let uID = uniqueID();
              rooms.push({ "roomID": uID, "isFilled": false });
              socket.join(uID);
              socket.roomID = uID;
              socket.emit('private ack', { "message": "Added to privateRoom", "roomID": uID });
            }
                  // Update this part to handle WebRTC signaling
      socket.on('offer', (offer) => {
        socket.to(socket.roomID).emit('offer', offer);
      });

      socket.on('answer', (answer) => {
        socket.to(socket.roomID).emit('answer', answer);
      });

      socket.on('ice-candidate', (candidate) => {
        io.to(data.roomID).emit('ice-candidate', { candidate: data.candidate, roomID: data.roomID });
      });
          });
    }
    asyncCall()

    socket.on('disconnect', () => {
        let index = onlineUsers.indexOf(socket);
        onlineUsers.splice(index,1);
        index = rooms.findIndex(x => x.roomID == windowID.roomID);
        if(index >= 0){
          if(rooms[index].isFilled == true){
            let warning = { "title": "Stranger is disconnected!", "message": "Please click on 'New' button to connect to someone else." };
            io.sockets.in(windowID.roomID).emit('alone', { "warning": warning, "roomID": windowID.roomID });
            rooms.splice(index,1);
          }
          else{
            rooms.splice(index,1);
          }
        }
    });
})

// const io = new Server(server,{
//   allowEIO3 : true
// });

// var userConnection = [];

// io.on("connection",(socket)=>{
//   // console.log("Socket id is : ",socket.id)
//   socket.on("userconnect",(data)=>{
//       // console.log("logged in user : ",data.displayName);
//       userConnection.push({
//           connectionId : socket.id,
//           user_id: data.displayName
//       })
//       // get how many users are connected to our application
//       console.log(userConnection)
//       var userCount = userConnection.length;
//       console.log("user count : ",userCount);
//   })
//   socket.on("offerSentToRemote",(data)=>{
//       var offerReceiver = userConnection.find((o)=> o.user_id === data.remoteUser)
//       if(offerReceiver){
//           // console.log("offerReceiver user is : ",offerReceiver.connectionId);
//           socket.to(offerReceiver.connectionId).emit("RecieverOffer",data);
//       }
//   })
//   socket.on("answerSentToUser1",(data)=>{
//       var answerReceiver = userConnection.find((o) => o.user_id === data.receiver); 
//       if(answerReceiver){
//           // console.log("answer receiver user : ",answerReceiver.connectionId);
//           socket.to(answerReceiver.connectionId).emit("ReceiveAnswer",data);
//       }
//   })
//   socket.on("candidateSentToUser",(data)=>{
//       var candidateReceiver = userConnection.find((o)=>o.user_id === data.remoteUser); 
//       if(candidateReceiver){
//           // console.log("candidateReceiver  user : ",candidateReceiver.connectionId);
//           socket.to(candidateReceiver.connectionId).emit("candidateReceiver",data);
//       }
//   })

//   socket.on("disconnect",()=>{
//       // console.log("user disconnected");
//       var disUser = userConnection.find(p=>p.connectionId = socket.id)
//       if(disUser){
//           userConnection = userConnection.filter(p => p.connectionId != socket.id);
//       }
//   })

// })