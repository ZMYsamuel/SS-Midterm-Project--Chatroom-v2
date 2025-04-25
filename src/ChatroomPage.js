import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import './styles.css';

function ChatroomPage({ currentUser }) {
  const { chatroomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatroomName, setChatroomName] = useState('');
  const [chatrooms, setChatrooms] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchChatrooms = async () => {
      const q = query(
        collection(db, 'chatrooms'),
        where('members', 'array-contains', currentUser.uid)
      );
      const chatroomsSnapshot = await getDocs(q);
      const chatroomsList = chatroomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatrooms(chatroomsList);
    };

    fetchChatrooms();
  }, [currentUser]);

  useEffect(() => {
    if (!chatroomId || !currentUser) return;

    const verifyMembership = async () => {
      const chatroomDoc = await getDoc(doc(db, 'chatrooms', chatroomId));
      if (!chatroomDoc.exists()) {
        alert('聊天室不存在！');
        navigate('/');
        return;
      }

      const chatroomData = chatroomDoc.data();
      if (!chatroomData.members.includes(currentUser.uid)) {
        alert('您不是此聊天室的成員，無法進入！');
        navigate('/');
        return;
      }

      setChatroomName(chatroomData.name);
    };

    verifyMembership();

    const q = query(
      collection(db, `chatrooms/${chatroomId}/messages`),
      orderBy('timestamp')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    });
    return () => unsubscribe();
  }, [chatroomId, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await addDoc(collection(db, `chatrooms/${chatroomId}/messages`), {
        text: newMessage,
        timestamp: new Date(),
        uid: currentUser.uid,
        email: currentUser.email,
      });
      setNewMessage('');
    } catch (error) {
      alert(`無法發送訊息：${error.message}`);
    }
  };

  return (
    <div className="chatroom-container">
      <aside className="sidebar">
        <h2>聊天室清單</h2>
        <ul>
          {chatrooms.map(chatroom => (
            <li key={chatroom.id}>
              <button className="chatroom-button" onClick={() => navigate(`/chatroom/${chatroom.id}`)}>
                {chatroom.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="chatroom-main">
        <header className="chatroom-header">
          <h1>{chatroomName}</h1>
          <div className="chatroom-header-actions">
            <span>目前登入：{currentUser.email}</span>
            <button onClick={() => navigate('/')} className="back-to-main-button">返回主頁</button>
          </div>
        </header>
        <div className="message-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.uid === currentUser.uid ? 'own-message' : ''}`}>
              <strong>{message.email}:</strong> {message.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            placeholder="輸入訊息..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">發送</button>
        </form>
      </main>
    </div>
  );
}

export default ChatroomPage;