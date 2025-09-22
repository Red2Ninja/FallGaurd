import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const API_BASE = "http://127.0.0.1:8000";

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      if (res.data.success) {
        setIsLoggedIn(true);            // ✅ set global login state
        navigate('/dashboard');         // ✅ redirect only if backend approves
      } else {
        alert(res.data.message);        // show backend message
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Please try again later.');
    }
    setLoading(false);
  };

  return (
    
  
    <div className="login-container">
      <div class="scanner-line"></div>
  <div class="scanner-line-2"></div>
      <form className="login-form" onSubmit={handleLogin}>
        <h2>CareFall Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
