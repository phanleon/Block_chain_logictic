import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Kết nối tới Server Backend
const socket = io('http://localhost:5000');

export default function Store() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Hàm lấy danh sách sản phẩm ban đầu
    const fetchProducts = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/store/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi lấy hàng:", err);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();

        // LẮNG NGHE REAL-TIME: Khi có hàng mới được duyệt
        socket.on('new_product_ready', (newP) => {
            setProducts(prev => [newP, ...prev]);
        });

        // LẮNG NGHE REAL-TIME: Khi hàng bị gỡ xuống
        socket.on('product_removed', (productId) => {
            setProducts(prev => prev.filter(p => p._id !== productId));
        });

        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);

        return () => {
            socket.off('new_product_ready');
            socket.off('product_removed');
        };
    }, [fetchProducts]);

    // 2. Logic Lọc sản phẩm & Tìm kiếm
    useEffect(() => {
        let result = products;
        if (selectedCategory !== 'Tất cả') {
            result = result.filter(p => p.category === selectedCategory);
        }
        if (searchTerm) {
            result = result.filter(p => p.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setFilteredProducts(result);
    }, [selectedCategory, searchTerm, products]);

    const addToCart = (p) => {
        const newCart = [...cart, p];
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        alert(`🛒 Đã thêm ${p.product_name} vào giỏ!`);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>
            
            {/* --- HEADER --- */}
            <header style={headerStyle}>
                <div style={navTop}>
                    <div style={logoStyle} onClick={() => navigate('/')}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <span style={{fontSize:'35px'}}>🌊</span>
                            <div>
                                <div style={{fontSize:'28px', fontWeight:'900', color:'#0284c7', display:'flex', alignItems:'center'}}>
                                    Hải Sản <span style={{color:'#0ea5e9', marginLeft:'5px'}}>Tươi</span>
                                </div>
                                <div style={{fontSize:'12px', color:'#64748b'}}>Tươi ngon - Chất lượng</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={searchWrapper}>
                        <input type="text" placeholder="Tìm kiếm hải sản..." style={searchInput} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button style={searchBtn}>🔍</button>
                    </div>

                    <div style={iconGroup}>
                        <div style={authSection}>
                            {user ? (
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <span style={{fontSize:'13px'}}>Chào, <b>{user.full_name}</b></span>
                                    <button onClick={handleLogout} style={logoutBtnSmall}>Thoát</button>
                                </div>
                            ) : (
                                <div style={{display:'flex', gap:'10px'}}>
                                    <span onClick={() => navigate('/login/customer')} style={loginLink}>Đăng nhập</span>
                                    <span style={{color:'#cbd5e1'}}>|</span>
                                    <span onClick={() => navigate('/register/customer')} style={loginLink}>Đăng ký</span>
                                </div>
                            )}
                        </div>
                        <span style={{ cursor: 'pointer', fontSize:'24px' }}>🤍</span>
                        <div onClick={() => navigate('/cart')} style={{ cursor: 'pointer', position: 'relative', fontSize:'24px' }}>
                            🛒 <span style={cartBadgeSmall}>{cart.length}</span>
                        </div>
                    </div>
                </div>
                <nav style={navLinks}>
                    <span style={activeNavLink}>Trang chủ</span>
                    <span>Sản phẩm</span>
                    <span>Khuyến mãi</span>
                    <span>Về chúng tôi</span>
                    <span>Liên hệ</span>
                </nav>
            </header>

            {/* --- FEATURES --- */}
            <div style={featuresContainer}>
                <FeatureItem icon="🚚" title="Giao hàng nhanh" desc="Miễn phí từ 500K" />
                <FeatureItem icon="🛡️" title="Đảm bảo chất lượng" desc="1 đổi 1 nếu không tươi" />
                <FeatureItem icon="🔄" title="Tươi sống 100%" desc="Đánh bắt hàng ngày" />
                <FeatureItem icon="💳" title="Thanh toán linh hoạt" desc="COD, chuyển khoản" />
            </div>

            {/* --- DANH MỤC HẢI SẢN --- */}
            <section style={{ padding: '60px 10%', textAlign: 'center', background: '#f8fafc' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#1e293b' }}>Danh Mục Hải Sản</h2>
                <p style={{ color: '#64748b', marginBottom: '40px' }}>Khám phá đa dạng hải sản tươi ngon từ đại dương</p>
                <div style={catGrid}>
                    {['Tôm', 'Cua', 'Cá', 'Mực', 'Hàu', 'Sò', 'Bạch Tuộc', 'Tổng hợp'].map(cat => (
                        <div key={cat} style={selectedCategory === cat ? catCardActive : catCardStyle} onClick={() => setSelectedCategory(cat === 'Tổng hợp' ? 'Tất cả' : cat)}>
                            <div style={catIconCircle}>
                                {cat === 'Tôm' ? '🦐' : cat === 'Cua' ? '🦀' : cat === 'Cá' ? '🐟' : cat === 'Mực' ? '🦑' : cat === 'Hàu' ? '🦪' : cat === 'Sò' ? '🐚' : cat === 'Bạch Tuộc' ? '🐙' : '📦'}
                            </div>
                            <p style={{ fontWeight: 'bold', margin: '10px 0 5px 0', fontSize: '14px' }}>{cat}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- SẢN PHẨM NỔI BẬT --- */}
            <section style={{ padding: '60px 10%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '28px', margin: 0 }}>Sản Phẩm Nổi Bật</h2>
                    <div style={filterTabs}>
                        {['Tất cả', 'Tôm', 'Cua', 'Cá', 'Mực'].map(t => (
                            <button key={t} onClick={() => setSelectedCategory(t)} style={selectedCategory === t ? tabActive : tabInactive}>{t}</button>
                        ))}
                    </div>
                </div>
                
                {loading ? <p style={{textAlign:'center'}}>Đang truy xuất dữ liệu...</p> : (
                    <div style={productGrid}>
                        {filteredProducts.map(p => (
                            <div key={p._id} style={pCard}>
                                <div style={{ position: 'relative' }}>
                                    <img src={`http://localhost:5000${p.image_url}`} alt={p.product_name} style={pImg} />
                                    <span style={verifyBadge}>🛡️ ĐÃ KIỂM ĐỊNH</span>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color:'#0f172a' }}>{p.product_name}</h3>
                                    <p style={{ color: '#ef4444', fontWeight: '900', fontSize: '22px', margin: '0 0 10px 0' }}>
                                        {p.price?.toLocaleString()}đ <small style={{fontSize:'12px', color:'#94a3b8', fontWeight:'normal'}}>/ {p.unit}</small>
                                    </p>
                                    <div style={{fontSize:'12px', color:'#64748b', marginBottom:'15px'}}>
                                        ⚓ Ngư dân: <b>{p.fisherman_id?.full_name}</b> <br/>
                                        📍 Nguồn gốc: <b>{p.catch_location}</b>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => navigate(`/track/${p.qr_code}`)} style={btnTrace}>TRUY XUẤT</button>
                                        <button onClick={() => addToCart(p)} style={btnAdd}>MUA</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* --- FOOTER SANG TRỌNG --- */}
            <footer style={footerBg}>
                <div style={footerContainer}>
                    <div style={footerCol}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '30px', background: '#0ea5e9', borderRadius: '10px', padding: '5px' }}>🐟</span>
                            <h2 style={{ margin: 0, fontSize: '24px' }}>Hải Sản<span style={{ color: '#fff' }}>Fresh</span></h2>
                        </div>
                        <p style={footerDesc}>Siêu thị hải sản tươi sống chất lượng cao, phục vụ tận tâm.</p>
                    </div>
                    <div style={footerCol}>
                        <h3 style={footerTitle}>Liên Kết</h3>
                        <ul style={footerList}>
                            <li style={footerItem}>Trang chủ</li>
                            <li style={footerItem}>Sản phẩm</li>
                            <li style={footerItem}>Khuyến mãi</li>
                            <li style={footerItem}>Về chúng tôi</li>
                        </ul>
                    </div>
                    <div style={footerCol}>
                        <h3 style={footerTitle}>Hỗ Trợ</h3>
                        <ul style={footerList}>
                            <li style={footerItem}>Trung tâm trợ giúp</li>
                            <li style={footerItem}>Chính sách bảo mật</li>
                            <li style={footerItem}>Điều khoản sử dụng</li>
                            <li style={footerItem}>Chính sách đổi trả</li>
                        </ul>
                    </div>
                    <div style={footerCol}>
                        <h3 style={footerTitle}>Liên Hệ</h3>
                        <ul style={footerList}>
                            <li style={footerContactItem}><span>📞</span> 1900 1234</li>
                            <li style={footerContactItem}><span>📍</span> 123 Đường ABC, TP.HCM</li>
                            <li style={footerContactItem}><span>✉️</span> support@haisanfresh.com</li>
                        </ul>
                    </div>
                </div>
                <div style={footerBottom}>
                    <hr style={{ borderColor: '#1e293b', marginBottom: '20px' }} />
                    <p>© 2024 Hải Sản Fresh. Tất cả quyền được bảo lưu.</p>
                </div>
            </footer>
        </div>
    );
}

// --- CSS STYLE OBJECTS ---
const headerStyle = { padding: '20px 10%', background: '#b2ebf2', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 1000 };
const navTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const logoStyle = { cursor: 'pointer' };
const searchWrapper = { display: 'flex', flex: 0.5, background: '#e0f2f1', borderRadius: '30px', padding: '5px 20px', border:'1px solid #80deea' };
const searchInput = { border: 'none', background: 'none', outline: 'none', flex: 1, padding: '10px' };
const searchBtn = { border: 'none', background: 'none', cursor: 'pointer', fontSize:'18px' };
const iconGroup = { display: 'flex', gap: '25px', alignItems:'center' };
const authSection = { display: 'flex', alignItems: 'center', marginRight: '10px' };
const loginLink = { fontSize: '14px', fontWeight: 'bold', color: '#0369a1', cursor: 'pointer' };
const logoutBtnSmall = { background: '#ef4444', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' };
const cartBadgeSmall = { position: 'absolute', top: '-8px', right: '-12px', background: '#0284c7', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' };
const navLinks = { display: 'flex', gap: '35px', fontWeight: 'bold', fontSize: '16px', color: '#374151' };
const activeNavLink = { color: '#0284c7', borderBottom: '3px solid #0284c7', paddingBottom: '5px' };

const featuresContainer = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '50px 10%', background: '#fff' };
const FeatureItem = ({ icon, title, desc }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '30px', background: '#00bcd4', color: 'white', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>{icon}</div>
        <h4 style={{ margin: '0 0 5px 0' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{desc}</p>
    </div>
);

const catGrid = { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' };
const catCardStyle = { width: '120px', background: '#fff', padding: '20px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #f1f5f9', transition:'0.3s' };
const catCardActive = { ...catCardStyle, background:'#0284c7', color:'#fff', transform:'translateY(-5px)' };
const catIconCircle = { width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto' };

const filterTabs = { display: 'flex', gap: '10px' };
const tabInactive = { padding: '10px 25px', borderRadius: '30px', border: 'none', background: '#e0f2f1', cursor: 'pointer', fontWeight: 'bold' };
const tabActive = { ...tabInactive, background: '#0284c7', color: '#fff' };

const productGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '30px' };
const pCard = { background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const pImg = { width: '100%', height: '180px', objectFit: 'cover' };
const verifyBadge = { position: 'absolute', top: '10px', right: '10px', background: '#22c55e', color: '#fff', fontSize: '9px', padding: '4px 10px', borderRadius: '10px', fontWeight: 'bold' };
const btnTrace = { flex: 1.2, padding: '10px', borderRadius: '10px', border: '1px solid #0284c7', color: '#0284c7', background: 'none', cursor: 'pointer', fontWeight: 'bold' };
const btnAdd = { flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: 'bold' };

const footerBg = { background: '#0b1120', color: '#fff', padding: '70px 10% 30px 10%', marginTop: '50px' };
const footerContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'left' };
const footerCol = { display: 'flex', flexDirection: 'column' };
const footerTitle = { fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: '#fff' };
const footerDesc = { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '250px' };
const footerList = { listStyle: 'none', padding: 0, margin: 0 };
const footerItem = { fontSize: '14px', color: '#cbd5e1', marginBottom: '12px', cursor: 'pointer' };
const footerContactItem = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#cbd5e1', marginBottom: '15px' };
const footerBottom = { marginTop: '50px', textAlign: 'center', color: '#64748b', fontSize: '13px' };