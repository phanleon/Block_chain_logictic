const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Tạo file PDF chứng nhận
 */
const generateApprovalPDF = (batch, hash, qrPath, fileName) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A5' }); // Khổ giấy nhỏ gọn
            const pdfDir = path.join(__dirname, '../../public/pdfs');
            
            // Đảm bảo thư mục tồn tại
            if (!fs.existsSync(pdfDir)) {
                fs.mkdirSync(pdfDir, { recursive: true });
            }

            const pdfFileName = `${fileName}.pdf`;
            const pdfFilePath = path.join(pdfDir, pdfFileName);
            const stream = fs.createWriteStream(pdfFilePath);

            doc.pipe(stream);

            // --- THIẾT KẾ NỘI DUNG PDF ---
            doc.fillColor('#0000FF').fontSize(16).text('CHUNG NHAN NGUON GOC HAI SAN', { align: 'center' });
            doc.moveDown();
            
            doc.fillColor('#000000').fontSize(10);
            doc.text(`Ma Lo: BATCH-${batch.id}`);
            doc.text(`San pham: ${batch.product_name}`);
            doc.text(`Khoi luong: ${batch.quantity} kg`);
            doc.text(`Nguoi danh bat: ${batch.fisherman.full_name}`);
            doc.text(`Ngay danh bat: ${new Date(batch.catch_time).toLocaleDateString()}`);
            doc.text(`Nguoi duyet: ${batch.inspector.full_name}`);
            doc.moveDown();

            // Chèn mã QR vào PDF
            const absoluteQrPath = path.join(__dirname, '../../public', qrPath);
            if (fs.existsSync(absoluteQrPath)) {
                doc.image(absoluteQrPath, { fit: [80, 80], align: 'center' });
            }

            doc.moveDown();
            doc.fontSize(8).fillColor('gray').text(`Blockchain Hash SHA256:`, { underline: true });
            doc.fontSize(7).fillColor('green').text(hash);

            // Dấu mộc giả lập
            doc.moveDown();
            doc.fontSize(10).fillColor('red').text('[ DA KIEM DUYET ]', { align: 'right' });

            doc.end();

            stream.on('finish', () => {
                resolve(`/pdfs/${pdfFileName}`); // Trả về đường dẫn để lưu vào DB
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateApprovalPDF };