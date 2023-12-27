(function(){
    let socket = io.connect(`${window.location.hostname}:${window.location.port}`);
    console.log("'index.js' FILE IS LOADED CONNECTION TO SOCKET.IO SENT SOCKET OBJECT => ",socket)
    let room_id_of_other_user = ' ';

    // lets access all of the required dom elemets
    const message = $("#message_box");
    const sendBtn = $("#send_btn");
    const endBtn = $("#end_btn");
    const chatContainer = $("#chat_container");

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
        console.log("USER IS CONNECTED TO EXISTING ROOM OR CREATED A NEW ROOM ROOMID => ",room_id_of_other_user);
    });


    socket.on('alone', (data) => {
        console.log("OTHER USER DISCONNECTED SO ESTABLISH A NEW CONNECTION");
        toastr.options = {
            "positionClass": "toast-top-center",
            "hideDuration": 300,
            "timeOut": 4000
        };
        toastr.warning(data.warning.title,data.warning.message);
    });

    message.on("keydown",function(event){
        if (event.key === "Enter") {
            socket.emit('typing', {
                "room": room_id_of_other_user,
                "typingStatus": false
            });
            sendBtn.click();
        } else {
            resetTimer();
            socket.emit('typing', {
                "room": room_id_of_other_user,
                "typingStatus": true
            });
        }
    })

    let typeMessageShown = false;
    let stop;
    socket.on('addTyping', (data) => {
        // let msgs = document.querySelector("#msgs");
        // let typeMessage = document.querySelector('#typing');
        if (socket.id != data.senderId) {
        if (data.typingStatus === true) {
            if (typeMessageShown === false) {
                console.log("helo")
                const typingMsg = document.createElement("div");
                typingMsg.classList.add("message", "joke");
                typingMsg.innerHTML = `Stranger is typing...`;
                chatContainer.append(typingMsg);
                typeMessageShown = true;
            }
            else {
                window.clearTimeout(stop);
            }
            // typeMessage = document.querySelector('#typing');
            stop = window.setTimeout(function() {
            // typeMessage.remove();
            typeMessageShown = false;
            }, 2000);
        }
        else if (typeMessage) {
            // typeMessage.remove();
            typeMessageShown = false;
        }
        }
    });


    let t;
    let kick = () => {
      socket.disconnect();
    }
    let resetTimer = () => {
        clearTimeout(t);
        t = setTimeout(kick, 60000);  // time is in milliseconds
    }
})();
