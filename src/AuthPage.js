import React, { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import './styles.css';

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert('登入成功！');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('註冊成功！');
      }
    } catch (error) {
      alert(`錯誤：${error.message}`);
    }
  };

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
        <p className="auth-switch">
          {isLogin ? '還沒有帳號嗎？' : '已經有帳號了嗎？'}
          <button onClick={() => setIsLogin(!isLogin)} className="switch-button">
            {isLogin ? '點這裡註冊' : '點這裡登入'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;