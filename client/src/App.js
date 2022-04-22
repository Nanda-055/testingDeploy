import './App.css';
import io from "socket.io-client";
import { useEffect, useState } from "react";

function App() {
  const [socket,setSocket] = useState(null)
  const [message,setMessage] = useState({});
  const [messages,setMessages] = useState([]);
  const [room,setRoom] = useState({currentRoom: "", lastRoom:""});
  const [isTyping,setIsTyping] = useState(false);
  const [countOnlineInRoom, setcountOnlineInRoom] = useState(0)

  useEffect(() => { //awal buka halaman
    const newSocket = io.connect('http://localhost:8080/chat')
    newSocket.on("connect", () => 
      {console.log("Socket is connected!");  //cek koneksi socket di client
    });

    setSocket(newSocket)

  }, []);

  const handleSendMessage = () =>{
    const payload ={...message, room:room.currentRoom} 
    console.log(payload)
    socket.emit("SEND_MESSAGE",payload);
    setMessage((prev) => ({...prev,message: ""}))
  }

  useEffect(() => {
    if(socket){
      socket.on("RECEIVE_MESSAGE", (dataMessage) => {
        console.log("RECEIVE_MESSAGE",dataMessage);
        setMessages((prev) => [...prev,dataMessage]);
      });
      socket.on("RECEIVE_TYPING", isTyping => {
          setIsTyping(isTyping);
      });
      socket.on("RECEIVE_USERS_ONLINE_IN_ROOM", (userOnlineInRoom) => {
        setcountOnlineInRoom(userOnlineInRoom);
      });
      socket.on("USERS_LEFT_IN_ROOM", (userOnlineInRoom) => {
        setcountOnlineInRoom(userOnlineInRoom);
      });
    }
  }, [socket]);

  const handleJoinRoom = () => {
    socket.emit("JOIN_ROOM", room);
    setRoom((prev) => ({...prev, lastRoom:room.currentRoom}));
  };

  useEffect(() => {
    if(message.message){
      socket.emit("IS_TYPING", {isTyping:true, room:room.currentRoom});
    } else if (socket){
      socket.emit("IS_TYPING", {isTyping:false, room:room.currentRoom});
    }
  },[message]);

  return (<div className="App">
      <div>
        User online in room: {countOnlineInRoom}
      </div>
      {isTyping && <span>Someone typing message...</span>}
      <div>
      <input placeholder="Room" onChange={(e) => setRoom((prev) => ({...prev, currentRoom:e.target.value}))}/>
      <button onClick={handleJoinRoom}>Join Room</button>
      </div>
      

      <input placeholder="Username" onChange={(e) => {
        setMessage((prev)=> ({...prev,username:e.target.value}));
      }} 
      />

      <input placeholder="Type message..."onChange={(e) => {
        setMessage((prev)=> ({...prev,message:e.target.value}));
      }} 
      />
      <button onClick={handleSendMessage}>Send Message</button>

      <div className="nampilChat">
        <ul>
          {messages.map((message, index) => {
            return <li key={index}>{message.message}</li>
          })}
        </ul>
      </div>
     </div>);
}

export default App;
