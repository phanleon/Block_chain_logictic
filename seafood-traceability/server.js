require('dotenv').config();
const express = require('express');
const http = require('http'); // Thêm thư viện HTTP
const { Server } = require('socket.io'); // Thêm Socket.io
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/config/db');
const app = require('./src/app');

// 1. Kết nối Database
connectDB();

// 2. Tạo HTTP Server từ Express App
const server = http.createServer(app);

// 3. Khởi tạo Socket.io với cấu hình CORS (cho phép React cổng 3003 kết nối)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

// 4. Chia sẻ 'io' cho các Controller sử dụng
app.set('io', io);

io.on('connection', (socket) => {
    console.log('🟢 Khách hàng kết nối Real-time:', socket.id);
});

// 5. Tạo các thư mục lưu trữ
const dirs = ['public/uploads', 'public/qrs', 'public/pdfs'];
dirs.forEach(dir => {
    if (!fs.existsSync(path.join(__dirname, dir))) {
        fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
    }
});

// 6. Chạy Server (Lưu ý: Dùng server.listen thay vì app.listen)
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`🚀 Hệ thống Real-time đang chạy tại cổng ${PORT}`);
});