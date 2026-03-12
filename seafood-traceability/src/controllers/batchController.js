const SeafoodBatch = require('../models/SeafoodBatch');
const User = require('../models/User');
const qrService = require('../services/qrService');
const hashService = require('../services/hashService');
const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

// 1. NGƯ DÂN TẠO LÔ HÀNG (Có Camera & Upload)
exports.createBatch = async (req, res) => {
    try {
        const { product_name, category, quantity, unit, catch_location, catch_time, capture_time } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        if (!imageUrl) return res.status(400).json({ error: "Vui lòng cung cấp hình ảnh sản phẩm!" });

        const batch = new SeafoodBatch({
            product_name, category, quantity, unit, catch_location, catch_time, capture_time,
            image_url: imageUrl,
            fisherman_id: req.user.id,
            status: 'PENDING'
        });

        await batch.save();

        // --- ĐOẠN CODE REAL-TIME: GỬI HÀNG QUA TRANG CÁN BỘ ---
        // 1. Lấy dữ liệu đầy đủ kèm tên ngư dân để cán bộ thấy luôn
        const fullBatchData = await SeafoodBatch.findById(batch._id).populate('fisherman_id', 'full_name');

        // 2. Lấy "Loa phát thanh" io
        const io = req.app.get('io');
        if (io) {
            // Phát tín hiệu 'new_pending_batch' đến tất cả cán bộ đang trực
            io.emit('new_pending_batch', fullBatchData);
            console.log("📣 Đã bắn dữ liệu sang trang Cán bộ duyệt!");
        }

        res.status(201).json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// 1. Cán bộ Từ chối sản phẩm
exports.rejectBatch = async (req, res) => {
    try {
        const batch = await SeafoodBatch.findByIdAndUpdate(req.params.id, { 
            status: 'REJECTED',
            is_locked: false // Để ngư dân có thể tác động (xóa)
        }, { new: true });
        res.json({ message: "Đã từ chối sản phẩm", batch });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Ngư dân xác nhận xóa sản phẩm bị từ chối
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await SeafoodBatch.findById(req.params.id);
        if (batch.status !== 'REJECTED') return res.status(400).json({ error: "Chỉ có thể xóa sản phẩm bị từ chối!" });
        await SeafoodBatch.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa bản ghi sản phẩm lỗi" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Cán bộ gỡ sản phẩm đang bán xuống
exports.removeProduct = async (req, res) => {
    try {
        const batch = await SeafoodBatch.findByIdAndUpdate(req.params.id, { status: 'REMOVED' }, { new: true });
        // Phát tín hiệu Real-time để Store xóa hàng ngay lập tức
        req.app.get('io').emit('product_removed', req.params.id);
        res.json({ message: "Đã gỡ sản phẩm khỏi cửa hàng", batch });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
exports.getInspectorHistory = async (req, res) => {
    try {
        // Tìm tất cả lô hàng mà Cán bộ này đã Duyệt (APPROVED) hoặc đã Gỡ (REMOVED)
        const history = await SeafoodBatch.find({ 
            approved_by: req.user.id,
            status: { $in: ['APPROVED', 'REMOVED'] } 
        }).populate('fisherman_id', 'full_name').sort({ approved_at: -1 });
        
        res.json(history);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
// 4. Lấy nhật ký ký số của riêng cán bộ đó
exports.getInspectorLog = async (req, res) => {
    const batches = await SeafoodBatch.find({ approved_by: req.user.id }).populate('fisherman_id', 'full_name');
    res.json(batches);
};
// 2. CÁN BỘ DUYỆT (Định giá, Ký số, QR, PDF, Hash, Real-time)
exports.approveBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { price } = req.body; 
        
        if (!price || price <= 0) return res.status(400).json({ error: "Cán bộ vui lòng nhập giá tiền hợp lệ!" });

        // Tìm lô hàng và kết nối thông tin ngư dân
        let batch = await SeafoodBatch.findById(id).populate('fisherman_id');
        if (!batch) return res.status(404).json({ error: "Không tìm thấy lô hàng!" });
        if (batch.is_locked) return res.status(400).json({ error: "Lô hàng đã được duyệt và khóa!" });

        // Thông tin cán bộ hiện tại
        const inspector = await User.findById(req.user.id);
        
        // --- XỬ LÝ TÊN AN TOÀN (Chống lỗi undefined 'full_name') ---
        const fishermanName = batch.fisherman_id ? batch.fisherman_id.full_name : "Ngư dân ẩn danh";
        const inspectorName = inspector ? inspector.full_name : "Cán bộ trực";

        // --- ĐẢM BẢO THƯ MỤC TỒN TẠI ---
        ['public/qrs', 'public/pdfs'].forEach(dir => {
            const absolutePath = path.join(__dirname, '../../', dir);
            if (!fs.existsSync(absolutePath)) fs.mkdirSync(absolutePath, { recursive: true });
        });

        // 1. Tạo QR Code (Link tới cổng 3001)
        const qrCode = `QR-${batch._id.toString().substring(18)}-${Date.now()}`;
        const qrLink = `http://localhost:3001/track/${qrCode}`;
        const qrPath = await qrService.generateQRCode(qrLink, qrCode);

        // 2. Tạo Hash Blockchain (Chốt chặn minh bạch: ID + GIÁ + NGƯ DÂN)
        const hash = hashService.generateHash({ 
            id: batch._id.toString(), 
            price: price.toString(), 
            fisherman: fishermanName 
        });
        
        // 3. Tạo File PDF Chứng nhận Luxury
        const pdfData = {
            id: batch._id,
            product_name: batch.product_name,
            quantity: batch.quantity,
            unit: batch.unit || 'kg',
            catch_time: batch.catch_time,
            price: price,
            fisherman: { full_name: fishermanName },
            inspector: { full_name: inspectorName }
        };
        const pdfPath = await pdfService.generateApprovalPDF(pdfData, hash, qrPath, `CERT-${batch._id}`);

        // 4. Cập nhật và KHÓA vĩnh viễn (Immutability)
        batch.price = price;
        batch.status = 'APPROVED';
        batch.approved_by = req.user.id;
        batch.approved_at = new Date();
        batch.qr_code = qrCode;
        batch.blockchain_hash = hash;
        batch.approval_document_url = pdfPath;
        batch.is_locked = true; 
        await batch.save();

        // 5. PHÁT TÍN HIỆU REAL-TIME CHO TRANG CHỦ (SOCKET.IO)
        const fullData = await SeafoodBatch.findById(id)
            .populate('fisherman_id', 'full_name')
            .populate('approved_by', 'full_name');
        
        const io = req.app.get('io');
        if (io) {
            io.emit('new_product_ready', fullData);
            console.log(`📣 [REAL-TIME] Đã lên kệ: ${batch.product_name}`);
        }

        res.json({ message: '🛡️ Đã phê duyệt và niêm yết giá thành công!', batch: fullData });

    } catch (err) { 
        console.error("❌ LỖI TẠI BACKEND:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống: " + err.message }); 
    }
};

// 3. LẤY HÀNG CHO SIÊU THỊ (Chỉ lấy hàng đã duyệt)
exports.getApprovedBatches = async (req, res) => {
    try {
        const products = await SeafoodBatch.find({ status: 'APPROVED' })
            .populate('fisherman_id', 'full_name')
            .populate('approved_by', 'full_name')
            .sort({ updatedAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Không thể lấy danh sách sản phẩm!" });
    }
};

// 4. LẤY HÀNG CHỜ DUYỆT (Dành cho Cán bộ)
exports.getPendingBatches = async (req, res) => {
    try {
        const batches = await SeafoodBatch.find({ status: 'PENDING' })
            .populate('fisherman_id', 'full_name')
            .sort({ createdAt: -1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. LẤY NHẬT KÝ RIÊNG (Dành cho Ngư dân)
exports.getMyBatches = async (req, res) => {
    try {
        const batches = await SeafoodBatch.find({ fisherman_id: req.user.id })
            .sort({ createdAt: -1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. TRUY XUẤT QR (Công cộng)
exports.getByQR = async (req, res) => {
    try {
        const batch = await SeafoodBatch.findOne({ qr_code: req.params.qr_code })
            .populate('fisherman_id', 'full_name')
            .populate('approved_by', 'full_name');
        if (!batch) return res.status(404).json({ error: "Mã QR không hợp lệ!" });
        res.json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};