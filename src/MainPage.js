import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function MainPage({ currentUser }) {
  const navigate = useNavigate();
  const [chatrooms, setChatrooms] = useState([]);
  const [chatroomName, setChatroomName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
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
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser.uid); // 過濾掉當前使用者
      setUsers(usersList);
    };
    fetchUsers();
  }, [currentUser]);

  const handleCreateChatroom = async () => {
    if (!chatroomName.trim()) {
      alert('請輸入聊天室名稱');
      return;
    }
    if (selectedMembers.length === 0) {
      alert('請選擇至少一位成員');
      return;
    }

    try {
      const chatroomRef = await addDoc(collection(db, 'chatrooms'), {
        name: chatroomName,
        members: [currentUser.uid, ...selectedMembers], // 自己自動成為成員
        createdAt: new Date(),
      });
      alert('聊天室創建成功！');
      setChatroomName('');
      setSelectedMembers([]);
      navigate(`/chatroom/${chatroomRef.id}`); // 創建後直接進入聊天室
    } catch (error) {
      alert(`無法創建聊天室：${error.message}`);
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <h1>歡迎，{currentUser.email}</h1>
        <button onClick={() => signOut(auth)} className="logout-button">登出</button>
      </header>
      <main className="login-main">
        <section className="create-chatroom-section">
          <h2>創建聊天室</h2>
          <input
            type="text"
            placeholder="聊天室名稱"
            value={chatroomName}
            onChange={(e) => setChatroomName(e.target.value)}
            className="chatroom-input"
          />
          <h3>選擇成員</h3>
          <ul className="user-list">
            {users.map(user => (
              <li key={user.id} className="user-item">
                <label>
                  <input
                    type="checkbox"
                    value={user.id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, user.id]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                      }
                    }}
                  />
                  {user.email}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleCreateChatroom} className="create-chatroom-button">創建聊天室</button>
        </section>
        <section className="chatroom-list-section">
          <h2>你的聊天室</h2>
          <ul className="chatroom-list">
            {chatrooms.map(chatroom => (
              <li key={chatroom.id} className="chatroom-item">
                <button onClick={() => navigate(`/chatroom/${chatroom.id}`)} className="chatroom-button">
                  {chatroom.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default MainPage;