import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FishermanLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // KIỂM TRA ROLE: Phải là FISHERMAN mới cho vào
      if (res.data.role !== 'FISHERMAN') {
        alert("Lỗi: Bạn không phải Ngư dân!");
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ role: res.data.role }));
      navigate('/fisherman/dashboard');
    } catch (err) { alert("Sai tài khoản ngư dân!"); }
  };

  return (
    <div style={{ background: '#e0f2fe', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '15px', width: '350px', borderTop: '8px solid #0284c7', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#0369a1', textAlign: 'center' }}>⚓ ĐĂNG NHẬP NGƯ DÂN</h2>
        <p style={{textAlign:'center', fontSize:'12px', color:'#64748b'}}>Hệ thống nhật ký đánh bắt</p>
        <input type="email" placeholder="Email ngư dân" onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Mật khẩu" onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>VÀO NHẬT KÝ</button>
      </form>
    </div>
  );
}
const inputStyle = { width: '92%', padding: '12px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ddd' };