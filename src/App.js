import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import LoginPage from './LoginPage';
import ChatroomPage from './ChatroomPage';
import { auth } from './firebase';

function ChatroomPageWrapper({ currentUser }) {
  const { chatroomId } = useParams();
  return <ChatroomPage currentUser={currentUser} chatroomId={chatroomId} />;
}

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
        <Route path="/" element={<LoginPage currentUser={currentUser} />} />
        <Route path="/chatroom/:chatroomId" element={<ChatroomPageWrapper currentUser={currentUser} />} />
      </Routes>
    </Router>
  );
}

export default App;