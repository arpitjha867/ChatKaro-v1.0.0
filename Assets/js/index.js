let localStream ;
let username;
let remoteUser;
let peerConnection;
let remoteStream;
(function(){
    let socket = io.connect(`${window.location.hostname}:${window.location.port}`);
    let configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    let room_id_of_other_user = ' ';

    socket.on('ack', (d) => {
        socket.emit('privateRoom', {
          "room": "private room"
        });
    });

      // Update this part to handle WebRTC signaling
  socket.on('offer', async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
  });

  socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on('ice-candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });

    window.onbeforeunload = function(e) {
        var dialogText = '';
        e.returnValue = dialogText;
        return dialogText;
    };

    socket.on('toast', (data) => {
        console.log(data.message);
    });
    
    socket.on('wait', (data) => {
      console.log(data.message);
    });

    socket.on('private ack', (data) => {
        room_id_of_other_user = data.roomID;
        console.log(data.roomID);
        // Initialize the peer connection
    peerConnection = new RTCPeerConnection(configuration);

    // Get local video stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;
        document.getElementById('local-video').srcObject = stream;

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      })
      .catch((error) => console.error('Error accessing media devices: ', error));

    // Create offer
    peerConnection.createOffer()
      .then((offer) => peerConnection.setLocalDescription(offer))
      .then(() => {
        socket.emit('offer', peerConnection.localDescription);
      })
      .catch((error) => console.error('Error creating offer: ', error));


    // Inside the sender's RTCPeerConnection.onicecandidate event listener
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', { candidate: event.candidate, roomID: room_id_of_other_user });
        }
    };


    });


    socket.on('alone', (data) => {
        console.log(data.warning.message, data.warning.title);
    });
})();


// const init = async () => {
//     // setting the video/audio data stream to localStream variable
//     localStream = await navigator.mediaDevices.getUserMedia({
//         video:true,
//         audio:true
//     })
//     // set localStream to the user-1 video tag
//     document.getElementById('user-1').srcObject = localStream;
//     createOffer();

// }


// let socket = io.connect();




// // console.log(username)
// socket.on("connect",()=>{
//     if(socket.connected){
//         socket.emit("userconnect",{
            
//         })
//     }
// })

// let servers = {
//     iceServers: [
//         {
//             urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302"]
//         }
//     ]
// }


// let createPeerConnection = async () => {
//     peerConnection = new RTCPeerConnection(servers);
//     remoteStream = new MediaStream();
//     document.getElementById('user-2').srcObject = remoteStream;
//     localStream.getTracks().forEach((track)=>{
//         peerConnection.addTrack(track,localStream);
//     })
//     peerConnection.ontrack = async (event)=>{
//         event.streams[0].getTracks().forEach((track)=>{
//             remoteStream.addTrack(track);
//         })
//     }
//     remoteStream.oninactive=()=>{
//         remoteStream.getTracks().forEach((track)=>{
//             track.enabled = !track.enabled;
//         });
//         peerConnection.close();
//     }
//     peerConnection.onicecandidate = async (event) =>{
//         if(event.candidate){
//             socket.emit("candidateSentToUser",{
//                 username:username,
//                 remoteUser:remoteUser,
//                 iceCandidateData : event.candidate
//             })
//         }
//     }
// }

// let createOffer = async () =>{
//     createPeerConnection()
//     // peerConnection = new RTCPeerConnection(servers)
//     let offer = await peerConnection.createOffer()
//     await peerConnection.setLocalDescription(offer);
//     socket.emit("offerSentToRemote",{
//         username:username,
//         remoteUser : remoteUser,
//         offer : peerConnection.localDescription
//     })
// }

// let createAnswer = async (data) =>{
//     createPeerConnection()
//     remoteUser = data.username
//     // peerConnection = new RTCPeerConnection(servers)
//     await peerConnection.setRemoteDescription(data.offer)
//     let answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer)
//     socket.emit("answerSentToUser1",{
//         answer:answer,
//         sender:data.remoteUser,
//         receiver :data.username       
//     })
// }

// socket.on("RecieverOffer",function(data){
//     createAnswer(data);
// })

// let addAnswer = async (data) => {
//     if(!peerConnection.currentRemoteDescription){
//         peerConnection.setRemoteDescription(data.answer);
//     }
// }

// socket.on("ReceiveAnswer",function(data){
//     addAnswer(data);
// })

// socket.on("candidateReceiver",function(data){
//     peerConnection.addIceCandidate(data.iceCandidateData)
// })