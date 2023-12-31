let localStream ;
let username;
let remoteUser;
let peerConnection;
let remoteStream;
let url = new URL(window.location.href)
username = url.searchParams.get("username")
remoteUser = url.searchParams.get("remoteUser")

const init = async () => {
    // setting the video/audio data stream to localStream variable
    localStream = await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true
    })
    // set localStream to the user-1 video tag
    document.getElementById('user-1').srcObject = localStream;
    createOffer();

}
init();

let socket = io.connect();

// console.log(username)
socket.on("connect",()=>{
    if(socket.connected){
        socket.emit("userconnect",{
            displayName:username
        })
    }
})

let servers = {
    iceServers: [
        {
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302"]
        }
    ]
}


let createPeerConnection = async () => {
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;
    localStream.getTracks().forEach((track)=>{
        peerConnection.addTrack(track,localStream);
    })
    peerConnection.ontrack = async (event)=>{
        event.streams[0].getTracks().forEach((track)=>{
            remoteStream.addTrack(track);
        })
    }
    remoteStream.oninactive=()=>{
        remoteStream.getTracks().forEach((track)=>{
            track.enabled = !track.enabled;
        });
        peerConnection.close();
    }
    peerConnection.onicecandidate = async (event) =>{
        if(event.candidate){
            socket.emit("candidateSentToUser",{
                username:username,
                remoteUser:remoteUser,
                iceCandidateData : event.candidate
            })
        }
    }
}

let createOffer = async () =>{
    createPeerConnection()
    // peerConnection = new RTCPeerConnection(servers)
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer);
    socket.emit("offerSentToRemote",{
        username:username,
        remoteUser : remoteUser,
        offer : peerConnection.localDescription
    })
}

let createAnswer = async (data) =>{
    createPeerConnection()
    remoteUser = data.username
    // peerConnection = new RTCPeerConnection(servers)
    await peerConnection.setRemoteDescription(data.offer)
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer)
    socket.emit("answerSentToUser1",{
        answer:answer,
        sender:data.remoteUser,
        receiver :data.username       
    })
}

socket.on("RecieverOffer",function(data){
    createAnswer(data);
})

let addAnswer = async (data) => {
    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(data.answer);
    }
}

socket.on("ReceiveAnswer",function(data){
    addAnswer(data);
})

socket.on("candidateReceiver",function(data){
    peerConnection.addIceCandidate(data.iceCandidateData)
})