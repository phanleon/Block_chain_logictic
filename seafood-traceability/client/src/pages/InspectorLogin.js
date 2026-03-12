import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function InspectorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // KIỂM TRA ROLE: Phải là INSPECTOR mới cho vào
      if (res.data.role !== 'INSPECTOR') {
        alert("Lỗi: Bạn không phải Cán bộ kiểm định!");
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ role: res.data.role }));
      navigate('/inspector/dashboard');
    } catch (err) { alert("Sai tài khoản cán bộ!"); }
  };

  return (
    <div style={{ background: '#f1f5f9', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '10px', width: '350px', borderTop: '8px solid #475569', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1e293b', textAlign: 'center' }}>👮 ĐĂNG NHẬP CÁN BỘ</h2>
        <p style={{textAlign:'center', fontSize:'12px', color:'#64748b'}}>Hệ thống kiểm định cảng cá</p>
        <input type="email" placeholder="Email cán bộ" onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Mật khẩu" onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#475569', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>XÁC NHẬN HỆ THỐNG</button>
      </form>
    </div>
  );
}
const inputStyle = { width: '92%', padding: '12px', margin: '10px 0', borderRadius: '5px', border: '1px solid #cbd5e1' };