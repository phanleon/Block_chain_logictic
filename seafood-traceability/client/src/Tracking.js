import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function Tracking() {
    const { qr_code } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/batch/qr/${qr_code}`).then(res => setData(res.data));
    }, [qr_code]);

    if (!data) return <div style={{textAlign:'center', marginTop:'50px'}}>Đang truy xuất Blockchain...</div>;

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', background: 'white', borderRadius: '15px', boxShadow: '0 0 20px #ccc' }}>
            <h2 style={{ textAlign: 'center', color: '#0369a1' }}>🐟 THÔNG TIN MINH BẠCH</h2>
            <img src={`http://localhost:5000${data.image_url}`} style={{ width: '100%', borderRadius: '10px' }} alt="Hai san" />
            <hr />
            <p>📦 Sản phẩm: <b>{data.product_name}</b></p>
            <p>🎣 Ngư dân: {data.fisherman_id?.full_name}</p>
            <p>👮 Kiểm định: {data.approved_by?.full_name}</p>
            <p>🕒 Ngày duyệt: {new Date(data.approved_at).toLocaleString()}</p>
            
            <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '5px', border: '1px solid #bbf7d0' }}>
                <a href={`http://localhost:5000${data.approval_document_url}`} target="_blank" rel="noreferrer" style={{color:'green', fontWeight:'bold'}}>📄 Tải Chứng Nhận Nguồn Gốc (PDF)</a>
            </div>

            <div style={{ marginTop: '20px', background: '#1e293b', color: '#4ade80', padding: '10px', fontSize: '10px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                <strong>🔗 BLOCKCHAIN HASH:</strong><br />
                {data.blockchain_hash}
            </div>
        </div>
    );
}