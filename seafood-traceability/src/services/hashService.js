const crypto = require('crypto');

/**
 * Tạo mã Hash SHA256 từ dữ liệu đối tượng
 */
const generateHash = (dataObj) => {
    // Sắp xếp các phím để đảm bảo hash luôn giống nhau nếu dữ liệu giống nhau
    const sortedData = Object.keys(dataObj).sort().reduce((acc, key) => {
        acc[key] = dataObj[key];
        return acc;
    }, {});

    const dataString = JSON.stringify(sortedData);
    
    // Tạo hash bằng thuật toán SHA256
    return crypto.createHash('sha256').update(dataString).digest('hex');
};

module.exports = { generateHash };