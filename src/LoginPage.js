import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, setDoc, doc, addDoc } from 'firebase/firestore';
import './styles.css';

function LoginPage({ currentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [chatrooms, setChatrooms] = useState([]);
  const [chatroomName, setChatroomName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (currentUser) {
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
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // 登入
        await signInWithEmailAndPassword(auth, email, password);
        alert('登入成功！');
      } else {
        // 註冊
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 將使用者資料新增到 Firestore 的 users 集合
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          uid: user.uid,
        });

        alert('註冊成功！');
      }
    } catch (error) {
      alert(`錯誤：${error.message}`);
    }
  };

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
      await addDoc(collection(db, 'chatrooms'), {
        name: chatroomName,
        members: [currentUser.uid, ...selectedMembers],
        createdAt: new Date(),
      });
      alert('聊天室創建成功！');
      setChatroomName('');
      setSelectedMembers([]);
    } catch (error) {
      alert(`無法創建聊天室：${error.message}`);
    }
  };

  if (currentUser) {
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

  if (!currentUser) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>{isLogin ? '登入' : '註冊'}</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" className="auth-button">{isLogin ? '登入' : '註冊'}</button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="switch-button">
            {isLogin ? '切換到註冊' : '切換到登入'}
          </button>
        </div>
      </div>
    );
  }
}

export default LoginPage;