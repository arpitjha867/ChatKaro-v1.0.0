import express  from "express";
import path,{ dirname } from "path";
import { fileURLToPath } from 'url';
import routes from "./Routes/router.js"
import bodyparser from 'body-parser'
import {Server}  from 'socket.io';

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

var userConnection = [];

io.on("connection",(socket)=>{
    // console.log("Socket id is : ",socket.id)
    socket.on("userconnect",(data)=>{
        // console.log("logged in user : ",data.displayName);
        userConnection.push({
            connectionId : socket.id,
            user_id: data.displayName
        })
        // get how many users are connected to our application
        console.log(userConnection)
        var userCount = userConnection.length;
        console.log("user count : ",userCount);
    })
    socket.on("offerSentToRemote",(data)=>{
        var offerReceiver = userConnection.find((o)=>{
            o.user_id === data.remote_user
        })
        if(offerReceiver){
            // console.log("offerReceiver user is : ",offerReceiver.connectionId);
            socket.to(offerReceiver.connectionId).emit("RecieverOffer",data);
        }
    })
    socket.on("answerSentToUser1",(data)=>{
        var answerReceiver = userConnection.find((o)=>o.user_id === data.receiver); 
        if(answerReceiver){
            // console.log("answer receiver user : ",answerReceiver.connectionId);
            socket.to(offerReceiver.connectionId).emit("ReceiveAnswer",data);
        }
    })
    socket.on("candidateSentToUser",(data)=>{
        var candidateReceiver = userConnection.find((o)=>o.user_id === data.remoteUser); 
        if(candidateReceiver){
            // console.log("candidateReceiver  user : ",candidateReceiver.connectionId);
            socket.to(candidateReceiver.connectionId).emit("candidateReceiver",data);
        }
    })

    socket.on("disconnect",()=>{
        // console.log("user disconnected");
        var disUser = userConnection.find(p=>p.connectionId = socket.id)
        if(disUser){
            userConnection = userConnection.filter(p => p.connectionId != socket.id);
        }
    })

})