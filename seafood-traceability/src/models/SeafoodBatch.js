const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    fisherman_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_name: { type: String, required: true },
    status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'REMOVED'], 
    default: 'PENDING' 
},
    // THÊM TRƯỜNG DANH MỤC Ở ĐÂY
    category: { 
        type: String, 
        enum: ['Tôm', 'Cua', 'Cá', 'Mực', 'Hàu', 'Sò', 'Bạch Tuộc', 'Tổng hợp'], 
        default: 'Cá' 
    },

    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' }, 
    catch_location: { type: String, required: true },
    catch_time: { type: Date, required: true },
    capture_time: { type: Date },
    image_url: { type: String },
    
    price: { type: Number, default: 0 }, 
    price_unit: { type: String, default: 'VNĐ/kg' },

    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approved_at: { type: Date },
    approval_document_url: { type: String },
    blockchain_hash: { type: String },
    qr_code: { type: String, unique: true, sparse: true },
    is_locked: { type: Boolean, default: false }
    
}, { timestamps: true });

module.exports = mongoose.model('SeafoodBatch', batchSchema);