const User = require('../models/User');
const SeafoodBatch = require('../models/SeafoodBatch');
const bcrypt = require('bcryptjs');

// 1. Lấy thống kê tổng quan và hoạt động của người duyệt
exports.getInspectorActivity = async (req, res) => {
    try {
        // Lấy tất cả các lô hàng đã duyệt và thông tin người duyệt
        const activities = await SeafoodBatch.find({ status: 'APPROVED' })
            .populate('approved_by', 'full_name email')
            .populate('fisherman_id', 'full_name')
            .sort({ approved_at: -1 });

        // Thống kê số lượng duyệt theo từng cán bộ
        const stats = await SeafoodBatch.aggregate([
            { $match: { status: 'APPROVED' } },
            { $group: { _id: '$approved_by', count: { $sum: 1 } } }
        ]);

        res.json({ activities, stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Admin xem tất cả sản phẩm và mọi hoạt động
exports.getAllProducts = async (req, res) => {
    const products = await SeafoodBatch.find()
        .populate('fisherman_id', 'full_name')
        .populate('approved_by', 'full_name')
        .sort({ createdAt: -1 });
    res.json(products);
};
// 2. Admin tạo tài khoản trực tiếp cho Ngư dân/Cán bộ
exports.adminCreateUser = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;
        
        // 1. Log dữ liệu để kiểm tra (Xem ở Terminal Backend)
        console.log("Dữ liệu nhận từ Admin Dashboard:", req.body);

        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ error: "Bạn chưa điền đủ các ô thông tin!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ full_name, email, password: hashedPassword, role });
        
        await newUser.save();
        res.status(201).json({ message: "Cấp tài khoản thành công!", user: newUser });
        
    } catch (err) {
        // 2. In lỗi thật ra Terminal để lập trình viên xem
        console.log("❌ LỖI TẠO USER THẬT SỰ:", err.message);

        if (err.code === 11000) {
            return res.status(400).json({ error: "Email này đã được đăng ký trước đó rồi!" });
        }
        
        // Trả về lỗi chi tiết cho Frontend
        res.status(500).json({ error: "Lỗi hệ thống: " + err.message });
    }
};