let localStream ;
let username;
let remoteUser;
let peerConnection;
let remoteStream;
(function(){
    let socket = io.connect(`${window.location.hostname}:${window.location.port}`);
    console.log("'index.js' FILE IS LOADED CONNECTION TO SOCKET.IO SENT SOCKET OBJECT => ",socket)
    let room_id_of_other_user = ' ';

    socket.on('ack', (d) => {
        socket.emit('privateRoom', {
          "room": "private room"
        });
    });

    window.onbeforeunload = function(e) {
        var dialogText = '';
        e.returnValue = dialogText;
        return dialogText;
    };

    socket.on('toast', (data) => {
        console.log("CONNECTED TO ROOM");
        toastr.remove();
        toastr.options = {
          "positionClass": "toast-top-center",
          "hideDuration": 300,
          "timeOut": 4000
        };
        toastr.success(data.message);
    });
    
    socket.on('wait', (data) => {
        console.log("CREATE ROOM OR CONNECT TO EXISTING ROOM");
        toastr.options = {
            "positionClass": "toast-top-center",
            "hideDuration": 300,
            "timeOut": 0,
            "extendedTimeOut": 0
          };
        toastr.info(data.message);
    });

    socket.on('private ack', (data) => {
        room_id_of_other_user = data.roomID;
        console.log(data.roomID);
    });


    socket.on('alone', (data) => {
        console.log(data.warning.message, data.warning.title);
    });
})();
