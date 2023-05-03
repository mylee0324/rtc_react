import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import JoinRoomPage from './JoinRoomPage/JoinRoomPage';
import IntroductionPage from './IntroductionPage/IntroductionPage';
import RoomPage from './RoomPage/RoomPage';
import { connectWithSocketIOServer } from './utils/wss';

function App() {
  useEffect(() => {
    connectWithSocketIOServer();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/join-room'
          element={<JoinRoomPage />}></Route>
        <Route
          path='/room'
          element={<RoomPage />}></Route>
        <Route
          path='/'
          element={<IntroductionPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
