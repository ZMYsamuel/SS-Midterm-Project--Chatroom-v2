import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, setDoc, doc, addDoc } from 'firebase/firestore';

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
      <div>
        <h1>歡迎，{currentUser.email}</h1>
        <button onClick={() => signOut(auth)}>登出</button>
        <h2>創建聊天室</h2>
        <input
          type="text"
          placeholder="聊天室名稱"
          value={chatroomName}
          onChange={(e) => setChatroomName(e.target.value)}
        />
        <h3>選擇成員</h3>
        <ul>
          {users.map(user => (
            <li key={user.id}>
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
        <button onClick={handleCreateChatroom}>創建聊天室</button>
        <h2>你的聊天室</h2>
        <ul>
          {chatrooms.map(chatroom => (
            <li key={chatroom.id}>
              <button onClick={() => navigate(`/chatroom/${chatroom.id}`)}>
                {chatroom.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1>{isLogin ? '登入' : '註冊'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? '登入' : '註冊'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? '切換到註冊' : '切換到登入'}
      </button>
    </div>
  );
}

export default LoginPage;