import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      if (res.data.role !== 'CUSTOMER') {
        alert("Đây là cổng dành cho khách mua hàng!");
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/'); 
    } catch (err) { alert("Sai email hoặc mật khẩu!"); }
  };

  return (
    <div style={bgStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        <h2 style={{ color: '#0369a1', textAlign: 'center' }}>🌊 ĐĂNG NHẬP KHÁCH HÀNG</h2>
        <input type="email" placeholder="Email của bạn" onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Mật khẩu" onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        <button type="submit" style={btnStyle}>BẮT ĐẦU MUA SẮM</button>
        <p onClick={() => navigate('/register/customer')} style={linkStyle}>Chưa có tài khoản? Đăng ký tại đây</p>
      </form>
    </div>
  );
}

// KHAI BÁO CÁC STYLE MÀ BẠN ĐANG THIẾU Ở ĐÂY:
const bgStyle = { height: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const formStyle = { background: 'white', padding: '40px', borderRadius: '20px', width: '350px', boxShadow: '0 10px 25px rgba(2,132,199,0.1)' };
const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };
const linkStyle = { textAlign: 'center', marginTop: '15px', color: '#0284c7', cursor: 'pointer', fontSize: '14px' };