import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from "react-webcam";
import { useNavigate } from 'react-router-dom';

export default function FishermanDashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // FORM STATE: Đầy đủ các mục Phân loại và Khối lượng
  const [form, setForm] = useState({ 
    product_name: '', 
    category: 'Cá', 
    quantity: '', 
    unit: 'kg', 
    catch_location: '', 
    catch_time: '' 
  });
  
  const [imgSrc, setImgSrc] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [useUpload, setUseUpload] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // 🛡️ BẢO VỆ ĐƯỜNG TRUYỀN (GUARD)
  useEffect(() => {
    if (!token || user?.role !== 'FISHERMAN') {
      localStorage.clear();
      navigate('/login/fisherman');
    }
  }, [token, user, navigate]);

  // 📥 LẤY DANH SÁCH NHẬT KÝ
  const fetchMy = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/batch/my', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setBatches(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        localStorage.clear();
        navigate('/login/fisherman');
      }
    }
  }, [token, navigate]);

  useEffect(() => { fetchMy(); }, [fetchMy]);

  // 📸 XỬ LÝ ẢNH
  const capture = useCallback(() => { 
    const image = webcamRef.current.getScreenshot();
    setImgSrc(image); 
    setIsCameraOpen(false); 
  }, [webcamRef]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImgSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 🚀 GỬI DUYỆT SẢN PHẨM
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imgSrc) return alert("Cần cung cấp ảnh xác thực sản phẩm!");
    setLoading(true);
    try {
      const resImg = await fetch(imgSrc); 
      const blob = await resImg.blob();
      const file = new File([blob], "seafood.jpg", { type: "image/jpeg" });
      
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      fd.append('image', file);
      fd.append('capture_time', new Date().toISOString());

      await axios.post('http://localhost:5000/api/batch', fd, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("⚓ Đã gửi lô hàng thành công! Đang chờ cán bộ kiểm định."); 
      setImgSrc(null); 
      setForm({ product_name: '', category: 'Cá', quantity: '', unit: 'kg', catch_location: '', catch_time: '' });
      fetchMy();
    } catch (err) { 
        alert("Lỗi: Không thể gửi dữ liệu. Vui lòng kiểm tra lại!"); 
    }
    setLoading(false);
  };

  // ❌ XỬ LÝ XÓA SẢN PHẨM BỊ TỪ CHỐI (REJECTED)
  const handleConfirmDelete = async (id) => {
    if (window.confirm("Bạn xác nhận gỡ bỏ bản ghi sản phẩm bị lỗi này?")) {
        try {
            await axios.delete(`http://localhost:5000/api/batch/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("🗑️ Đã xóa bản ghi sản phẩm.");
            fetchMy();
        } catch (err) {
            alert("Lỗi xóa dữ liệu!");
        }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login/fisherman');
  };

  return (
    <div style={containerS}>
      {/* --- SIDEBAR LUXURY --- */}
      <aside style={sidebarS}>
        <div style={{ flex: 1 }}>
          <div style={avatarS}>⚓</div>
          <h3 style={{ margin: '15px 0 5px 0' }}>{user?.full_name}</h3>
          <p style={{ fontSize: '11px', color: '#bae6fd', letterSpacing: '1px', textTransform:'uppercase' }}>Thuyền trưởng tàu cá</p>
          <div style={badgeS}>Hệ thống: Sẵn sàng</div>
          <div style={infoBoxS}>
            <p>📧 <b>{user?.email}</b></p>
            <p>🚢 Tàu: <b>HQ-7799-TS</b></p>
            <p>🆔 GP: <b>VN-001223</b></p>
          </div>
        </div>
        <button onClick={handleLogout} style={logoutBtnS}>ĐĂNG XUẤT AN TOÀN</button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={mainS}>
        <header style={headerS}>
          <h2 style={{ margin: 0, color: '#0f172a' }}>🌊 NHẬT KÝ ĐÁNH BẮT ĐIỆN TỬ</h2>
          <div style={statS}>Chuyến biển tháng này: <b>{batches.length}</b></div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
          {/* CỘT 1: KHAI BÁO MỚI */}
          <section style={cardS}>
            <h3 style={{ color: '#0284c7', marginTop: 0 }}>➕ Khai báo hải sản mới</h3>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
               <button onClick={() => {setUseUpload(false); setImgSrc(null);}} style={!useUpload ? tabActiveS : tabS}>📷 Camera</button>
               <button onClick={() => {setUseUpload(true); setImgSrc(null);}} style={useUpload ? tabActiveS : tabS}>📁 Tải ảnh</button>
            </div>

            <div style={mediaContainerS}>
              {useUpload ? (
                <div style={{textAlign:'center'}}>
                    {imgSrc ? <img src={imgSrc} style={fullImgS} alt="Preview" /> : <p style={{color:'#94a3b8'}}>Chưa chọn ảnh</p>}
                    <input type="file" accept="image/*" onChange={handleFile} style={{marginTop:'10px', fontSize:'12px'}} />
                </div>
              ) : (
                isCameraOpen ? (
                    <>
                        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" height="220px" style={{objectFit:'cover'}} />
                        <button onClick={capture} style={captureBtnS}>CHỤP NGAY 📸</button>
                    </>
                ) : imgSrc ? (
                    <img src={imgSrc} style={fullImgS} alt="Captured" />
                ) : (
                    <button onClick={() => setIsCameraOpen(true)} style={openCamBtnS}>MỞ CAMERA TÀU</button>
                )
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <label style={labS}>Phân loại hải sản</label>
              <select style={inpS} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="Cá">🐟 Cá các loại</option>
                <option value="Tôm">🦐 Tôm tươi sống</option>
                <option value="Cua">🦀 Cua, Ghẹ</option>
                <option value="Mực">🦑 Mực, Bạch tuộc</option>
                <option value="Hàu">🦪 Hàu, Ngao</option>
                <option value="Sò">🐚 Sò, Ốc</option>
                <option value="Bạch Tuộc">🐙 Bạch Tuộc</option>
              </select>

              <label style={labS}>Tên sản phẩm cụ thể</label>
              <input type="text" placeholder="VD: Cá Ngừ Đại Dương" required style={inpS} value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} />
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{flex:2}}><label style={labS}>Khối lượng</label><input type="number" placeholder="0.00" required style={inpS} value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} /></div>
                <div style={{flex:1}}><label style={labS}>Đơn vị</label><select style={inpS} value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}><option value="kg">kg</option><option value="g">gam</option></select></div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{flex:1}}><label style={labS}>Vùng biển</label><input type="text" placeholder="VD: Hoàng Sa" required style={inpS} value={form.catch_location} onChange={e => setForm({...form, catch_location: e.target.value})} /></div>
                <div style={{flex:1}}><label style={labS}>Ngày đánh bắt</label><input type="date" required style={inpS} value={form.catch_time} onChange={e => setForm({...form, catch_time: e.target.value})} /></div>
              </div>

              <button type="submit" disabled={loading} style={submitBtnS}>
                  {loading ? "ĐANG ĐỒNG BỘ..." : "XÁC NHẬN & GỬI DUYỆT"}
              </button>
            </form>
          </section>

          {/* CỘT 2: LỊCH SỬ CHUYẾN BIỂN */}
          <section style={cardS}>
            <h3 style={{ marginTop: 0 }}>📋 Chuyến biển gần đây</h3>
            <div style={{ maxHeight: '650px', overflowY: 'auto' }}>
              {batches.map(b => (
                <div key={b._id} style={historyRowS}>
                  <img src={`http://localhost:5000${b.image_url}`} style={miniThumbS} alt={b.product_name} />
                  <div style={{flex: 1}}>
                    <h4 style={{ margin: 0 }}>{b.product_name}</h4>
                    <p style={{fontSize:'12px', color:'#64748b', margin:'2px 0'}}>{b.category} • {b.quantity} {b.unit}</p>
                    <span style={statusBadgeS(b.status)}>{b.status}</span>
                    
                    {/* NÚT XÓA NẾU BỊ TỪ CHỐI */}
                    {b.status === 'REJECTED' && (
                        <button 
                            onClick={() => handleConfirmDelete(b._id)}
                            style={btnDeleteS}
                        >
                            Xác nhận & Xóa lỗi
                        </button>
                    )}
                  </div>
                  <div style={{fontSize:'10px', color:'#94a3b8'}}>{new Date(b.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// --- STYLES (Đảm bảo Luxury & Sạch lỗi) ---
const containerS = { display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', sans-serif" };
const sidebarS = { width: '280px', background: '#0284c7', color: 'white', padding: '40px 20px', position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column', textAlign: 'center', boxShadow: '4px 0 10px rgba(0,0,0,0.1)' };
const avatarS = { width: '70px', height: '70px', background: 'white', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px', color: '#0284c7' };
const badgeS = { background: '#075985', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', marginTop: '10px', display: 'inline-block' };
const infoBoxS = { marginTop: '30px', textAlign: 'left', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px', lineHeight: '2' };
const logoutBtnS = { background: 'rgba(255,255,255,0.1)', border: '1px solid white', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' };

const mainS = { flex: 1, padding: '40px 40px 40px 320px' };
const headerS = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' };
const statS = { background: 'white', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };

const cardS = { background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' };
const mediaContainerS = { background: '#0f172a', height: '220px', borderRadius: '15px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '20px' };
const fullImgS = { width: '100%', height: '220px', objectFit: 'cover' };
const openCamBtnS = { background: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const captureBtnS = { position: 'absolute', bottom: '15px', background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };

const tabS = { flex: 1, padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' };
const tabActiveS = { ...tabS, background: '#0284c7', color: 'white', border: 'none' };

const labS = { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '5px', textTransform: 'uppercase' };
const inpS = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box', outline: 'none' };
const submitBtnS = { width: '100%', padding: '16px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' };

const historyRowS = { display: 'flex', gap: '15px', padding: '15px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' };
const miniThumbS = { width: '55px', height: '55px', borderRadius: '12px', objectFit: 'cover' };
const statusBadgeS = (s) => ({ fontSize: '10px', fontWeight: 'bold', color: s === 'APPROVED' ? '#166534' : s === 'REJECTED' ? '#ef4444' : '#9a3412', background: s === 'APPROVED' ? '#dcfce7' : s === 'REJECTED' ? '#fee2e2' : '#ffedd5', padding: '3px 10px', borderRadius: '20px' });
const btnDeleteS = { display:'block', marginTop:'8px', background:'#ef4444', color:'white', border:'none', padding:'4px 10px', borderRadius:'5px', fontSize:'10px', cursor:'pointer', fontWeight:'bold' };