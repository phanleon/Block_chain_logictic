import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            
            // CHỈ CHO PHÉP ADMIN VÀO
            if (res.data.role !== 'ADMIN') {
                alert("❌ CẢNH BÁO: Bạn không có quyền truy cập khu vực quân sự này!");
                return;
            }

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            
            // Tiến vào Dashboard Admin
            navigate('/admin/dashboard');
        } catch (err) {
            alert("Lỗi: Thông tin quản trị viên không chính xác!");
        }
    };

    return (
        <div style={bgContainer}>
            <form onSubmit={handleLogin} style={loginCard}>
                <div style={iconStyle}>🛡️</div>
                <h2 style={{ margin: '10px 0 5px 0' }}>HỆ THỐNG QUẢN TRỊ</h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '30px' }}>TRUY CẬP HẠN CHẾ - CHỈ DÀNH CHO TỔNG QUẢN</p>
                
                <div style={{ textAlign: 'left', width: '100%' }}>
                    <label style={labelStyle}>MÃ ĐỊNH DANH ADMIN</label>
                    <input type="email" placeholder="admin@system.com" required style={inputStyle} onChange={e => setEmail(e.target.value)} />
                    
                    <label style={labelStyle}>MẬT MÃ TỐI CAO</label>
                    <input type="password" placeholder="••••••••" required style={inputStyle} onChange={e => setPassword(e.target.value)} />
                </div>

                <button type="submit" style={btnStyle}>XÁC THỰC QUYỀN ADMIN</button>
                
                <p onClick={() => navigate('/')} style={{ marginTop: '20px', cursor: 'pointer', fontSize: '13px', color: '#64748b' }}>
                    ← Quay lại cửa hàng
                </p>
            </form>
        </div>
    );
}

// STYLES LUXURY DARK MODE
const bgContainer = { height: '100vh', background: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Inter', sans-serif" };
const loginCard = { background: '#0f172a', padding: '50px', borderRadius: '24px', width: '350px', textAlign: 'center', color: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #1e293b' };
const iconStyle = { fontSize: '50px', marginBottom: '10px' };
const labelStyle = { fontSize: '10px', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '1px', display: 'block', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: 'white', marginBottom: '20px', boxSizing: 'border-box', outline: 'none' };
const btnStyle = { width: '100%', padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '10px', transition: '0.3s' };