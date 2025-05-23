// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const joinRoom = () => {
    const roomId = prompt("Enter Room ID:");
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div>
      <h1>Welcome to EchoFlix</h1>
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
};

export default Home;
