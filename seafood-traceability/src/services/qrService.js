const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Hàm tạo QR Code
const generateQRCode = async (dataText, fileName) => {
    try {
        // Đảm bảo thư mục tồn tại
        const dir = path.join(__dirname, '../../public/qrs');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = path.join(dir, `${fileName}.png`);
        
        // Tạo file ảnh QR
        await QRCode.toFile(filePath, dataText);
        
        // Trả về đường dẫn
        return `/qrs/${fileName}.png`;
    } catch (err) {
        console.error("Lỗi tại qrService:", err);
        throw new Error('Không thể tạo mã QR');
    }
};

// Xuất hàm ra để Controller dùng
module.exports = { generateQRCode };