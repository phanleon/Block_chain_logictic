import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate(); // Bây giờ chúng ta sẽ sử dụng nó

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
    }, []);

    const removeItem = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    return (
        <div style={{ padding: '50px 10%', fontFamily: 'Arial', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Nút quay lại mua sắm */}
            <button 
                onClick={() => navigate('/')} 
                style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}
            >
                ← QUAY LẠI CỬA HÀNG
            </button>

            <h2 style={{ color: '#0284c7', borderBottom: '2px solid #0284c7', paddingBottom: '10px' }}>
                🛒 GIỎ HÀNG CỦA BẠN
            </h2>

            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p style={{ color: '#64748b' }}>Giỏ hàng của bạn đang trống.</p>
                    <button 
                        onClick={() => navigate('/')} 
                        style={{ padding: '10px 20px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
                    >
                        MUA SẮM NGAY
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', marginTop: '30px' }}>
                    {/* Danh sách sản phẩm trong giỏ */}
                    <div>
                        {cart.map((item, index) => (
                            <div key={index} style={itemContainer}>
                                <img 
                                    src={`http://localhost:5000${item.image_url}`} 
                                    width="100" 
                                    height="100" 
                                    style={{ borderRadius: '10px', objectFit: 'cover' }} 
                                    alt={item.product_name} 
                                />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#075985' }}>{item.product_name}</h4>
                                    <p style={{ fontSize: '12px', color: '#64748b' }}>Nguồn gốc: {item.catch_location}</p>
                                    <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: 'bold' }}>✔ Đã chứng thực nguồn gốc</p>
                                </div>
                                <button 
                                    onClick={() => removeItem(index)} 
                                    style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Xóa
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Hóa đơn tạm tính */}
                    <div style={summaryCard}>
                        <h3 style={{ marginTop: 0 }}>TÓM TẮT ĐƠN HÀNG</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Số lượng sản phẩm:</span>
                            <span>{cart.length}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '20px' }}>
                            * Sản phẩm đã được kiểm định bởi Chi cục Thủy sản
                        </div>
                        <hr style={{ borderColor: '#0ea5e9' }} />
                        <button 
                            onClick={() => alert("Hệ thống thanh toán đang được tích hợp. Cảm ơn bạn đã tin dùng hải sản minh bạch!")} 
                            style={checkoutBtn}
                        >
                            THANH TOÁN AN TOÀN
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Styles
const itemContainer = { 
    display: 'flex', 
    gap: '20px', 
    background: 'white', 
    padding: '20px', 
    borderRadius: '15px', 
    marginBottom: '15px', 
    alignItems: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

const summaryCard = { 
    background: '#075985', 
    color: 'white', 
    padding: '30px', 
    borderRadius: '20px', 
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
    boxShadow: '0 10px 20px rgba(7,89,133,0.2)'
};

const checkoutBtn = { 
    width: '100%', 
    padding: '15px', 
    borderRadius: '30px', 
    border: 'none', 
    background: '#22c55e', 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: '16px', 
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 4px 10px rgba(34,197,94,0.3)'
};