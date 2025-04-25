import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';
import MainPage from './MainPage';
import ChatroomPage from './ChatroomPage';
import { auth } from './firebase';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={currentUser ? <MainPage currentUser={currentUser} /> : <AuthPage />} />
        <Route path="/chatroom/:chatroomId" element={<ChatroomPage currentUser={currentUser} />} />
      </Routes>
    </Router>
  );
}

export default App;