import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Peer from "peerjs";
import "./room.css";

const Room = () => {
  const [myStream, setMyStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [userList, setUserList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [hostId, setHostId] = useState("");

  const myVideoRef = useRef();

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    const newPeer = new Peer(undefined, {
      host: "/",
      port: "3001",
      path: "/peerjs",
    });

    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setCurrentUserId(id);
      const roomID = prompt("Enter Room ID or create new:");
      setRoomId(roomID);
      newSocket.emit("join-room", roomID, id);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setMyStream(stream);
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }

      newSocket.on("user-connected", (userId) => {
        const call = newPeer.call(userId, stream);
        call.on("stream", (remoteStream) => {
          setRemoteStreams((prev) => [...prev, { id: userId, stream: remoteStream }]);
        });
      });

      newPeer.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          setRemoteStreams((prev) => [...prev, { id: call.peer, stream: remoteStream }]);
        });
      });
    });

    newSocket.on("all-users", (users) => {
      setUserList(users);
      if (users.length > 0) setHostId(users[0]);
    });

    newSocket.on("user-disconnected", (userId) => {
      setRemoteStreams((prev) => prev.filter((s) => s.id !== userId));
      setUserList((prev) => prev.filter((id) => id !== userId));
    });

    newSocket.on("receive-message", ({ userId, text }) => {
      setMessages((prev) => [...prev, { userId, text }]);
    });

    return () => {
      newSocket.disconnect();
      if (peer) peer.destroy();
    };
  }, []);

  const sendMessage = () => {
    if (msg.trim() === "") return;
    socket.emit("send-message", { roomId, text: msg, userId: currentUserId });
    setMessages((prev) => [...prev, { userId: currentUserId, text: msg }]);
    setMsg("");
  };

  return (
    <div className="room-container">
      <div className="sidebar">
        <div className="user-list">
          <h3>👥 Participants</h3>
          <ul>
            {userList.map((user) => (
              <li key={user} className={`user-item ${user === currentUserId ? "me" : ""}`}>
                {user}
                {hostId === user && <span className="host-badge">👑 Host</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="video-section">
        <video ref={myVideoRef} autoPlay muted className="my-video" />
        {remoteStreams.map((remote) => (
          <video
            key={remote.id}
            autoPlay
            ref={(el) => el && (el.srcObject = remote.stream)}
            className="remote-video"
          />
        ))}
      </div>

      <div className="chat-section">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.userId === currentUserId ? "me" : "other"}`}>
              <strong>{msg.userId === currentUserId ? "You" : msg.userId}</strong>: {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Room;
