import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'FISHERMAN' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Gửi yêu cầu đăng ký xuống Backend cổng 5000
      await axios.post('http://localhost:5000/api/auth/register', form);
      
      alert("🎉 Đăng ký thành công!");
      
      // Sau khi đăng ký xong, dẫn người dùng về trang Login tương ứng
      if (form.role === 'FISHERMAN') {
        navigate('/login/fisherman');
      } else {
        navigate('/login/inspector');
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error || "Email đã tồn tại!"));
    }
  };

  return (
    <div style={{ height: '100vh', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial' }}>
      <form onSubmit={handleRegister} style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', color: '#1e293b' }}>TẠO TÀI KHOẢN MỚI</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Họ và tên</label>
          <input type="text" placeholder="Nguyễn Văn A" required style={inputStyle}
            onChange={e => setForm({...form, full_name: e.target.value})} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Email</label>
          <input type="email" placeholder="nguyenvana@gmail.com" required style={inputStyle}
            onChange={e => setForm({...form, email: e.target.value})} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Mật khẩu</label>
          <input type="password" placeholder="******" required style={inputStyle}
            onChange={e => setForm({...form, password: e.target.value})} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Bạn đăng ký với vai trò:</label>
          <select style={inputStyle} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="FISHERMAN">⚓ Ngư dân (Đánh bắt)</option>
            <option value="INSPECTOR">👮 Cán bộ (Kiểm định)</option>
          </select>
        </div>

        <button type="submit" style={btnStyle}>ĐĂNG KÝ TÀI KHOẢN</button>
        
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          Đã có tài khoản? Quay lại trang Login tương ứng.
        </p>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#475569' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };