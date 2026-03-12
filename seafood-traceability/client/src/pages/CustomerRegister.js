import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CustomerRegister() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'CUSTOMER' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert("🎉 Chào mừng bạn! Đăng ký thành công.");
      navigate('/login/customer');
    } catch (err) { alert("Lỗi: Email này đã được sử dụng."); }
  };

  return (
    <div style={bgStyle}>
      <form onSubmit={handleRegister} style={formStyle}>
        <h2 style={{ color: '#0369a1', textAlign: 'center' }}>💎 ĐĂNG KÝ THÀNH VIÊN</h2>
        <p style={{textAlign:'center', color:'#64748b', fontSize:'13px'}}>Gia nhập cộng đồng hải sản minh bạch</p>
        
        <input type="text" placeholder="Họ và tên của bạn" required style={inputStyle} onChange={e => setForm({...form, full_name: e.target.value})} />
        <input type="email" placeholder="Email liên lạc" required style={inputStyle} onChange={e => setForm({...form, email: e.target.value})} />
        <input type="password" placeholder="Mật khẩu bảo mật" required style={inputStyle} onChange={e => setForm({...form, password: e.target.value})} />
        
        <button type="submit" style={btnStyle}>TẠO TÀI KHOẢN</button>
        <p onClick={() => navigate('/login/customer')} style={linkStyle}>Đã có tài khoản? Đăng nhập ngay</p>
      </form>
    </div>
  );
}

const bgStyle = { height: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const formStyle = { background: 'white', padding: '40px', borderRadius: '20px', width: '350px', boxShadow: '0 10px 25px rgba(2,132,199,0.1)' };
const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };
const linkStyle = { textAlign: 'center', marginTop: '15px', color: '#0284c7', cursor: 'pointer', fontSize: '14px' };