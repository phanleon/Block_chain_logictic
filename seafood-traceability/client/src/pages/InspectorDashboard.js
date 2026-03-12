import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// 1. Kết nối tới Server Real-time
const socket = io('http://localhost:5000');

export default function InspectorDashboard() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' hoặc 'history'
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // 2. Hàm lấy danh sách chờ duyệt (Dùng useCallback để sửa lỗi ESLint)
  const fetchPending = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/batch/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPending(res.data);
    } catch (err) { console.error("Lỗi tải danh sách chờ:", err); }
    finally { setLoading(false); }
  }, [token]);

  // 3. Hàm lấy nhật ký ký số (Lịch sử duyệt cá nhân)
  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Backend cần route: GET /api/batch/inspector-log
      const res = await axios.get('http://localhost:5000/api/batch/inspector-log', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) { console.error("Lỗi tải nhật ký:", err); }
    finally { setLoading(false); }
  }, [token]);

  // 4. Lắng nghe tín hiệu Real-time từ Ngư dân và cập nhật dữ liệu
  useEffect(() => {
    if (activeTab === 'pending') fetchPending();
    else fetchHistory();

    // REAL-TIME: Khi ngư dân bấm gửi, hàng tự hiện lên Dashboard cán bộ
    socket.on('new_pending_batch', (newBatch) => {
        console.log("⚓ Hàng mới từ đại dương:", newBatch);
        if (activeTab === 'pending') {
            setPending(prev => [newBatch, ...prev]);
        }
    });

    return () => socket.off('new_pending_batch');
  }, [activeTab, fetchPending, fetchHistory]);

  // 5. Xử lý Duyệt & Định giá
  const handleApprove = async (id) => {
    const price = prices[id];
    if (!price || price <= 0) return alert("⚠️ Cán bộ vui lòng định giá sản phẩm trước khi ký duyệt!");
    if (!window.confirm("Xác nhận giá niêm yết và thực hiện KÝ DUYỆT ĐIỆN TỬ?")) return;
    
    try {
      const res = await axios.post(`http://localhost:5000/api/batch/${id}/approve`, 
        { price: Number(price) }, { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("🛡️ " + res.data.message);
      setPending(prev => prev.filter(p => p._id !== id));
    } catch (err) { 
        const msg = err.response?.data?.error || "Lỗi hệ thống!";
        alert("❌ THẤT BẠI: " + msg); 
    }
  };

  // 6. Xử lý Từ chối (Trả về cho Ngư dân xóa lỗi)
  const handleReject = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn TỪ CHỐI lô hàng này?")) return;
    try {
      await axios.post(`http://localhost:5000/api/batch/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("🚫 Đã từ chối phê duyệt.");
      setPending(prev => prev.filter(p => p._id !== id));
    } catch (err) { alert("Lỗi khi thực hiện!"); }
  };

  // 7. Xử lý Thu hồi/Gỡ sản phẩm khỏi Store
  const handleRemove = async (id) => {
    if (!window.confirm("Xác nhận GỠ sản phẩm này khỏi kệ hàng Siêu thị?")) return;
    try {
      await axios.put(`http://localhost:5000/api/batch/${id}/remove`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("🗑️ Đã thu hồi sản phẩm thành công.");
      fetchHistory(); // Tải lại lịch sử
    } catch (err) { alert("Lỗi khi thu hồi!"); }
  };

  const handleLogout = () => {
    if(window.confirm("Đăng xuất khỏi hệ thống an toàn?")) {
        localStorage.clear();
        window.location.href = '/login/inspector';
    }
  };

  return (
    <div style={containerStyle}>
      {/* --- SIDEBAR LUXURY NAVY --- */}
      <aside style={sidebarStyle}>
        <div style={profileCard}>
          <div style={avatarStyle}>👮‍♂️</div>
          <h3 style={{ margin: '15px 0 5px 0' }}>{user?.full_name}</h3>
          <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight:'bold', letterSpacing:'1px' }}>CÁN BỘ KIỂM ĐỊNH CẤP CAO</p>
          <div style={badgeStyle}>● Đang trực hệ thống</div>
          <div style={infoDivider} />
          <div style={inspectorMeta}>
             <p>🏢 Cơ quan: <b>Chi cục Thủy sản</b></p>
             <p>🔑 Quyền: <b>Duyệt & Thu hồi</b></p>
             <p>🕒 Phiên: <b>{new Date().toLocaleDateString('vi-VN')}</b></p>
          </div>
        </div>
        
        <div style={sidebarMenu}>
            <div 
              onClick={() => setActiveTab('pending')}
              style={activeTab === 'pending' ? menuItemActive : menuItem}
            >📥 Chờ kiểm định ({pending.length})</div>
            
            <div 
              onClick={() => setActiveTab('history')}
              style={activeTab === 'history' ? menuItemActive : menuItem}
            >📋 Nhật ký ký số ({history.length})</div>
        </div>

        <button onClick={handleLogout} style={logoutBtn}>ĐĂNG XUẤT</button>
      </aside>

      {/* --- NỘI DUNG CHÍNH --- */}
      <main style={mainContentStyle}>
        <header style={headerStyle}>
          <h2 style={{ margin: 0, color: '#0f172a' }}>
            {activeTab === 'pending' ? '🛡️ TRUNG TÂM PHÊ DUYỆT NGUỒN GỐC' : '📋 NHẬT KÝ KIỂM ĐỊNH ĐIỆN TỬ'}
          </h2>
          <div style={statusTag}>{activeTab === 'pending' ? 'YÊU CẦU MỚI' : 'DỮ LIỆU ĐÃ LƯU'}</div>
        </header>

        {loading ? (
            <div style={emptyState}>🔄 Đang kết nối dữ liệu bảo mật...</div>
        ) : (
            <>
            {/* TAB 1: DANH SÁCH CHỜ DUYỆT */}
            {activeTab === 'pending' && (
                <div style={gridStyle}>
                {pending.map(item => (
                    <div key={item._id} style={cardStyle}>
                        <div style={imageWrapper}>
                            <img src={`http://localhost:5000${item.image_url}`} alt={item.product_name} style={productImg} />
                            <div style={tagType}>{item.category}</div>
                        </div>
                        <div style={infoWrapper}>
                            <h3 style={{ margin: '0 0 10px 0', color:'#1e293b' }}>{item.product_name}</h3>
                            <div style={detailRow}><span>Ngư dân:</span> <b>{item.fisherman_id?.full_name}</b></div>
                            <div style={detailRow}><span>Khối lượng:</span> <b>{item.quantity} {item.unit || 'kg'}</b></div>
                            <div style={detailRow}><span>Vùng biển:</span> <b>{item.catch_location}</b></div>
                            
                            <div style={priceSection}>
                                <label style={priceLabel}>💰 ĐỊNH GIÁ NIÊM YẾT (VNĐ)</label>
                                <input 
                                    type="number" 
                                    placeholder="Nhập giá tiền..." 
                                    style={priceInput} 
                                    onChange={(e) => setPrices({...prices, [item._id]: e.target.value})} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button onClick={() => handleApprove(item._id)} style={approveBtn}>KÝ DUYỆT ✅</button>
                                <button onClick={() => handleReject(item._id)} style={rejectBtn}>TỪ CHỐI</button>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            )}

            {/* TAB 2: NHẬT KÝ KÝ SỐ (LỊCH SỬ) */}
            {activeTab === 'history' && (
                <div style={tableWrapper}>
                    <table style={tableStyle}>
                        <thead style={theadStyle}>
                            <tr>
                                <th>SẢN PHẨM</th><th>NGƯ DÂN</th><th>GIÁ NIÊM YẾT</th><th>THỜI GIAN KÝ</th><th>TRẠNG THÁI</th><th>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h._id} style={trStyle}>
                                    <td style={{fontWeight:'bold', padding:'15px'}}>{h.product_name}</td>
                                    <td>{h.fisherman_id?.full_name}</td>
                                    <td style={{color:'#10b981', fontWeight:'bold'}}>{h.price?.toLocaleString()}đ</td>
                                    <td>{new Date(h.approved_at).toLocaleString('vi-VN')}</td>
                                    <td><span style={statusBadge(h.status)}>{h.status}</span></td>
                                    <td>
                                        {h.status === 'APPROVED' && (
                                            <button onClick={() => handleRemove(h._id)} style={removeBtnS}>GỠ KHỎI STORE 🗑️</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </>
        )}

        {!loading && (activeTab === 'pending' ? pending.length : history.length) === 0 && (
          <div style={emptyState}>☕ Hiện không còn dữ liệu nào cần xử lý.</div>
        )}
      </main>
    </div>
  );
}

// --- CSS STYLES (Luxury Navy Theme) ---
const containerStyle = { display: 'flex', background: '#f1f5f9', minHeight: '100vh', fontFamily: "'Inter', sans-serif" };
const sidebarStyle = { width: '300px', background: '#0f172a', color: 'white', padding: '40px 20px', position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)' };
const profileCard = { textAlign: 'center', marginBottom: '30px' };
const avatarStyle = { width: '70px', height: '70px', background: '#3b82f6', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' };
const badgeStyle = { background: '#064e3b', color: '#10b981', fontSize: '10px', padding: '5px 12px', borderRadius: '20px', marginTop: '12px', display: 'inline-block', fontWeight:'bold' };
const infoDivider = { border: '0.5px solid #1e293b', margin: '25px 0' };
const inspectorMeta = { textAlign: 'left', fontSize: '13px', color: '#94a3b8', lineHeight: '2' };
const sidebarMenu = { flex: 1 };
const menuItem = { padding: '15px', borderRadius: '12px', cursor: 'pointer', color: '#94a3b8', marginBottom: '10px' };
const menuItemActive = { ...menuItem, background: '#1e293b', color: '#3b82f6', fontWeight: 'bold' };
const logoutBtn = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const mainContentStyle = { flex: 1, padding: '40px 50px 40px 350px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'white', padding: '25px', borderRadius: '20px' };
const statusTag = { background: '#0f172a', color: 'white', padding: '8px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '30px' };
const cardStyle = { background: 'white', borderRadius: '24px', overflow: 'hidden', display: 'flex', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' };
const imageWrapper = { width: '200px', position:'relative' };
const productImg = { width: '100%', height: '100%', objectFit: 'cover' };
const tagType = { position:'absolute', bottom:10, left:10, background:'rgba(15, 23, 42, 0.8)', color:'white', fontSize:'10px', padding:'4px 10px', borderRadius:'8px' };
const infoWrapper = { padding: '25px', flex: 1 };
const detailRow = { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#475569' };
const priceSection = { marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1.5px solid #e2e8f0' };
const priceLabel = { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' };
const priceInput = { width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #cbd5e1', outline: 'none', fontWeight:'bold', color:'#0284c7' };
const approveBtn = { flex: 1, padding: '14px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const rejectBtn = { flex: 0.6, padding: '14px', background: 'none', border: '1.5px solid #ef4444', color: '#ef4444', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const tableWrapper = { background: 'white', borderRadius: '24px', padding: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #f8fafc' };
const statusBadge = (s) => ({ fontSize:'10px', fontWeight:'bold', padding:'4px 10px', borderRadius:'20px', background: s === 'APPROVED' ? '#dcfce7' : s === 'REMOVED' ? '#f1f5f9' : '#fee2e2', color: s === 'APPROVED' ? 'green' : s === 'REMOVED' ? '#64748b' : 'red' });
const removeBtnS = { padding: '8px 15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' };
const emptyState = { textAlign: 'center', padding: '100px 0', color: '#94a3b8', fontSize: '18px' };