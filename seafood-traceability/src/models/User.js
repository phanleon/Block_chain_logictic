const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['ADMIN', 'FISHERMAN', 'INSPECTOR', 'CUSTOMER'], 
        default: 'CUSTOMER' 
    },
    is_active: { type: Boolean, default: true }
}, { timestamps: true }); // Tự động tạo created_at, updated_at

module.exports = mongoose.model('User', userSchema);