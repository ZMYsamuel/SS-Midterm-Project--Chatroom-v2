import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

function ChatroomPage({ currentUser }) {
  const { chatroomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (!chatroomId) return;

    const q = query(
      collection(db, `chatrooms/${chatroomId}/messages`),
      orderBy('timestamp')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    });
    return () => unsubscribe();
  }, [chatroomId]);

  useEffect(() => {
    // Fetch all users for member selection
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

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
    <div>
      <h1>聊天室</h1>
      <p>登入中：{currentUser?.email}</p>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.email}:</strong> {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="輸入訊息..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">發送</button>
      </form>
    </div>
  );
}

export default ChatroomPage;