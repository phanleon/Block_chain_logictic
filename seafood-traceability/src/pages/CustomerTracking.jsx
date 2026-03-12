import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function CustomerTracking() {
    const { qr_code } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/batch/qr/${qr_code}`)
            .then(res => setData(res.data))
            .catch(err => console.error("Invalid QR Code"));
    }, [qr_code]);

    if (!data) return <div className="text-center p-10 font-bold">Đang tải dữ liệu Blockchain...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-blue-50 p-6 shadow-lg rounded-xl mt-10">
            <h1 className="text-2xl font-bold text-blue-800 text-center mb-6">🐟 MINH BẠCH HẢI SẢN</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h2 className="text-xl font-bold">{data.product_name}</h2>
                        <p className="text-gray-500">Mã lô: BATCH-{data.id}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        ĐÃ KIỂM ĐỊNH
                    </span>
                </div>

                {/* Timeline Hành Trình */}
                <div className="mt-6 border-l-4 border-blue-500 pl-4 space-y-6">
                    <div>
                        <h3 className="font-bold text-gray-800">🎣 1. Đánh bắt</h3>
                        <p className="text-sm">Ngư dân: <b>{data.fisherman.full_name}</b></p>
                        <p className="text-sm">Vị trí: {data.catch_location}</p>
                        <p className="text-sm">Thời gian: {new Date(data.catch_time).toLocaleString()}</p>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-gray-800">🛡️ 2. Kiểm duyệt & Đóng dấu điện tử</h3>
                        <p className="text-sm">Cơ quan/Người duyệt: <b>{data.inspector.full_name}</b></p>
                        <p className="text-sm">Thời gian: {new Date(data.approved_at).toLocaleString()}</p>
                        <a href={`http://localhost:5000${data.approval_document_url}`} target="_blank" className="text-blue-500 underline text-sm">
                            📄 Xem văn bản chứng nhận (PDF)
                        </a>
                    </div>
                </div>

                {/* Blockchain Proof */}
                <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs break-all">
                    <p className="text-white font-bold mb-1">🔗 Dữ liệu chống giả mạo (SHA-256 Hash):</p>
                    {data.blockchain_hash}
                </div>
            </div>
        </div>
    );
}