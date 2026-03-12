import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('giamsat'); // giamsat | sanpham | nhansu
    const [activities, setActivities] = useState([]); // Hoạt động kiểm định
    const [allProducts, setAllProducts] = useState([]); // Toàn bộ sản phẩm hệ thống
    const [users, setUsers] = useState([]); // Danh sách nhân sự
    const [stats, setStats] = useState([]);
    const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'FISHERMAN' });
    
    const token = localStorage.getItem('token');
    const adminInfo = JSON.parse(localStorage.getItem('user'));

    // 1. Lấy dữ liệu thống kê & Hoạt động kiểm định
    const fetchActivities = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/activities', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivities(res.data.activities);
            setStats(res.data.stats);
        } catch (err) { console.error(err); }
    }, [token]);

    // 2. Lấy danh sách TOÀN BỘ sản phẩm (Mục mới)
    const fetchAllProducts = useCallback(async () => {
        try {
            // Lưu ý: Đảm bảo Backend có API /api/admin/all-products
            const res = await axios.get('http://localhost:5000/api/admin/all-products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllProducts(res.data);
        } catch (err) { console.error(err); }
    }, [token]);

    // 3. Lấy danh sách nhân sự
    const fetchUsers = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) { console.error(err); }
    }, [token]);

    useEffect(() => { 
        fetchActivities();
        fetchUsers();
        fetchAllProducts();
    }, [fetchActivities, fetchUsers, fetchAllProducts]);

    // 4. Xử lý tạo tài khoản (Dành cho tab Nhân sự)
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/admin/create-user', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✨ " + res.data.message);
            setForm({ full_name: '', email: '', password: '', role: 'FISHERMAN' });
            fetchUsers();
        } catch (err) { alert("Lỗi: " + (err.response?.data?.error || "Email đã tồn tại")); }
    };

    // 5. Xử lý Khóa/Mở khóa tài khoản
    const toggleUserStatus = async (userId) => {
        if(!window.confirm("Xác nhận thay đổi quyền truy cập của tài khoản này?")) return;
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) { alert("Lỗi cập nhật"); }
    };

    return (
        <div style={adminContainer}>
            {/* --- SIDEBAR QUYỀN LỰC --- */}
            <aside style={sidebarStyle}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={adminAvatar}>👑</div>
                    <h3 style={{ margin: '15px 0' }}>{adminInfo?.full_name}</h3>
                    <span style={adminBadge}>QUẢN TRỊ TỐI CAO</span>
                </div>
                <nav>
                    <div onClick={() => setActiveTab('giamsat')} style={activeTab === 'giamsat' ? menuItemActive : menuItem}>📊 Giám sát hoạt động</div>
                    <div onClick={() => setActiveTab('sanpham')} style={activeTab === 'sanpham' ? menuItemActive : menuItem}>📦 Quản lý sản phẩm</div>
                    <div onClick={() => setActiveTab('nhansu')} style={activeTab === 'nhansu' ? menuItemActive : menuItem}>👥 Quản lý nhân sự</div>
                    <div style={menuItem}>🔐 Nhật ký hệ thống</div>
                </nav>
                <button onClick={() => { localStorage.clear(); window.location.href='/portal/admin-secret-login'; }} style={logoutBtn}>ĐĂNG XUẤT</button>
            </aside>

            {/* --- NỘI DUNG CHÍNH --- */}
            <main style={mainContent}>
                <header style={headerStyle}>
                    <h2>🛡️ BẢNG ĐIỀU KHIỂN: {
                        activeTab === 'giamsat' ? 'GIÁM SÁT CHIẾN LƯỢC' : 
                        activeTab === 'nhansu' ? 'QUẢN TRỊ NHÂN SỰ' : 'QUẢN LÝ HÀNG HÓA'
                    }</h2>
                    <div style={dateBox}>{new Date().toLocaleDateString('vi-VN')}</div>
                </header>

                {/* TAB 1: GIÁM SÁT HOẠT ĐỘNG (Thống kê) */}
                {activeTab === 'giamsat' && (
                    <>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                            <div style={statCardBox('#3b82f6')}><p style={statLabel}>SẢN PHẨM TRÊN KỆ</p><h2 style={statValue}>{activities.length}</h2></div>
                            <div style={statCardBox('#10b981')}><p style={statLabel}>NHÂN SỰ HỆ THỐNG</p><h2 style={statValue}>{users.length}</h2></div>
                            <div style={statCardBox('#f59e0b')}><p style={statLabel}>CÁN BỘ ĐANG TRỰC</p><h2 style={statValue}>{stats.length}</h2></div>
                        </div>
                        <section style={cardStyle}>
                            <h3 style={{ marginBottom: '20px' }}>🕵️ VẾT KÝ SỐ CỦA NGƯỜI DUYỆT</h3>
                            <table style={tableStyle}>
                                <thead style={theadStyle}>
                                    <tr><th>CÁN BỘ</th><th>SẢN PHẨM</th><th>NGƯ DÂN</th><th>GIÁ NIÊM YẾT</th><th>THỜI GIAN KÝ</th></tr>
                                </thead>
                                <tbody>
                                    {activities.map((act) => (
                                        <tr key={act._id} style={trStyle}>
                                            <td style={{ fontWeight: 'bold' }}>{act.approved_by?.full_name}</td>
                                            <td>{act.product_name}</td>
                                            <td>{act.fisherman_id?.full_name}</td>
                                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>{act.price?.toLocaleString()}đ</td>
                                            <td>{new Date(act.approved_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </>
                )}

                {/* TAB 2: QUẢN LÝ SẢN PHẨM (Mọi trạng thái) */}
                {activeTab === 'sanpham' && (
                    <section style={cardStyle}>
                        <h3 style={{ marginTop: 0 }}>📦 TẤT CẢ SẢN PHẨM TRÊN HỆ THỐNG</h3>
                        <table style={tableStyle}>
                            <thead style={theadStyle}>
                                <tr><th>SẢN PHẨM</th><th>NGƯ DÂN</th><th>CÁN BỘ</th><th>TRẠNG THÁI</th><th>HÀNH ĐỘNG</th></tr>
                            </thead>
                            <tbody>
                                {allProducts.map(p => (
                                    <tr key={p._id} style={trStyle}>
                                        <td><b>{p.product_name}</b></td>
                                        <td>{p.fisherman_id?.full_name}</td>
                                        <td>{p.approved_by?.full_name || '---'}</td>
                                        <td><span style={statusBadge(p.status)}>{p.status}</span></td>
                                        <td><button style={btnDetail}>CHI TIẾT</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* TAB 3: QUẢN LÝ NHÂN SỰ (Form + Danh sách + Khóa) */}
                {activeTab === 'nhansu' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px' }}>
                        <section style={cardStyle}>
                            <h3 style={{ color: '#3b82f6', marginTop: 0 }}>➕ Cấp tài khoản chuyên dụng</h3>
                            <form onSubmit={handleCreateUser}>
                                <label style={labS}>Họ tên</label><input type="text" style={inputS} value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} required />
                                <label style={labS}>Email</label><input type="email" style={inputS} value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
                                <label style={labS}>Mật khẩu</label><input type="password" style={inputS} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
                                <label style={labS}>Vai trò</label>
                                <select style={inputS} value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                                    <option value="FISHERMAN">⚓ Ngư dân</option>
                                    <option value="INSPECTOR">👮 Cán bộ</option>
                                </select>
                                <button type="submit" style={btnCreate}>TẠO TÀI KHOẢN</button>
                            </form>
                        </section>

                        <section style={cardStyle}>
                            <h3 style={{ marginTop: 0 }}>👥 Danh sách nhân sự & Quyền truy cập</h3>
                            <table style={tableStyle}>
                                <thead style={theadStyle}>
                                    <tr><th>NHÂN SỰ</th><th>VAI TRÒ</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} style={trStyle}>
                                            <td><b>{u.full_name}</b><br/><small>{u.email}</small></td>
                                            <td><span style={roleBadge(u.role)}>{u.role}</span></td>
                                            <td>{u.is_active ? <span style={{color:'green'}}>● Hoạt động</span> : <span style={{color:'red'}}>● Đã khóa</span>}</td>
                                            <td>
                                                <button onClick={() => toggleUserStatus(u._id)} style={u.is_active ? btnLock : btnUnlock}>
                                                    {u.is_active ? 'KHÓA' : 'MỞ KHÓA'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

// --- CSS LUXURY STYLES ---
const adminContainer = { display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', sans-serif" };
const sidebarStyle = { width: '280px', background: '#0f172a', color: 'white', padding: '40px 20px', position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)' };
const adminAvatar = { width: '60px', height: '60px', background: '#3b82f6', borderRadius: '50%', margin: '0 auto', fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const adminBadge = { fontSize: '10px', background: '#3b82f6', padding: '3px 10px', borderRadius: '10px', fontWeight: 'bold', marginTop: '10px', display: 'inline-block' };
const menuItem = { padding: '15px', borderRadius: '12px', cursor: 'pointer', color: '#94a3b8', marginTop: '10px', transition: '0.3s' };
const menuItemActive = { ...menuItem, background: '#1e293b', color: '#3b82f6', fontWeight: 'bold' };
const logoutBtn = { marginTop: 'auto', background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };

const mainContent = { flex: 1, padding: '40px 40px 40px 320px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const dateBox = { background: 'white', padding: '8px 20px', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };

const statCardBox = (color) => ({ flex: 1, background: 'white', padding: '25px', borderRadius: '20px', borderLeft: `8px solid ${color}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' });
const statLabel = { fontSize: '11px', fontWeight: 'bold', color: '#64748b', margin: 0 };
const statValue = { fontSize: '32px', margin: '5px 0 0 0', color: '#0f172a' };

const cardStyle = { background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' };
const labS = { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '5px', textTransform: 'uppercase' };
const inputS = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' };
const btnCreate = { width: '100%', padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };

const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { background: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #f1f5f9', fontSize: '13px' };

const statusBadge = (s) => ({ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', background: s === 'APPROVED' ? '#dcfce7' : s === 'REJECTED' ? '#fee2e2' : '#fef3c7', color: s === 'APPROVED' ? 'green' : s === 'REJECTED' ? 'red' : 'orange' });
const roleBadge = (r) => ({ padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold', background: '#f1f5f9', color: '#475569' });
const btnLock = { padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnUnlock = { padding: '6px 12px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnDetail = { padding: '5px 10px', background: 'none', border: '1px solid #cbd5e1', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' };