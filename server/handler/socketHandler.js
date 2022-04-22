const { Server } = require("socket.io");

exports.socketConnection = (server) => {
    const io = new Server(server, {
        cors:{
            origin:"*",
            methods:"*",
        },
    });

    const namespace = io.of("/chat")
    namespace.on("connection", (socket) => {
        console.log("socket connect to server!")
        //event listener here

        socket.on("JOIN_ROOM", (room) => {
            if(room.lastRoom){
                console.log("User leave room " +room.lastRoom)
                socket.leave(room.lastRoom)

                const isRoomAvailable = socket.nsp.adapter.rooms.get(room.lastRoom);
                if(isRoomAvailable){
                    //get users left in last room
                    const userOnlineInRoom = socket.nsp.adapter.rooms.get(room.lastRoom).size.toString();
                    socket.nsp.to(room.lastRoom).emit("USERS_LEFT_IN_ROOM", userOnlineInRoom);
                }
                
                
            }
            // socket.leave(room);
            console.log("ROOM", room);
            socket.join(room.currentRoom);
            //GET DATA CHAT KE DATABASE
            //PROSES EMIT
            // socket.nsp.to(room).emit("RECEIVE_MESSAGE", dataMessage);

            //TO GET HOW MANY USERS JOIN OR AVAILABLE IN ROOM
            const userOnlineInRoom = socket.nsp.adapter.rooms.get(room.currentRoom).size.toString(); //berapa connect di dalam room
            console.log("USERS ONLINE IN ROOM", userOnlineInRoom)
            socket.nsp.to(room.currentRoom).emit("RECEIVE_USERS_ONLINE_IN_ROOM", userOnlineInRoom)

            

            console.log("User with id" + socket.id + "join to room " + room.currentRoom)
        });
        socket.on("SEND_MESSAGE",(dataMessage) => {
            console.log("DATA MESSAGE", dataMessage);

            //basic emit
            // socket.emit("RECEIVE_MESSAGE", dataMessage);

            //global message
            // namespace.emit("RECEIVE_MESSAGE", dataMessage); 
            
            //broadcast message for all client expect sender
            // socket.broadcast.emit("RECEIVE_MESSAGE", dataMessage);

            //emit to join room
            socket.nsp.to(dataMessage.room).emit("RECEIVE_MESSAGE", dataMessage);
        });
        socket.on("IS_TYPING", (data) => {
            socket.broadcast.to(data.room).emit("RECEIVE_TYPING", data.isTyping)
        });
    });
};