const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const batchController = require('../controllers/batchController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const adminController = require('../controllers/adminController');
router.get('/batch/inspector-history', verifyToken, checkRole(['INSPECTOR']), batchController.getInspectorHistory);
router.post('/batch/:id/reject', verifyToken, checkRole(['INSPECTOR']), batchController.rejectBatch);
router.put('/batch/:id/remove', verifyToken, checkRole(['INSPECTOR']), batchController.removeProduct);
router.get('/admin/activities', verifyToken, checkRole(['ADMIN']), adminController.getInspectorActivity);
router.post('/admin/create-user', verifyToken, checkRole(['ADMIN']), adminController.adminCreateUser);
// 1. PUBLIC ROUTES (Ai cũng vào được)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/batch/qr/:qr_code', batchController.getByQR);
router.get('/admin/all-products', verifyToken, checkRole(['ADMIN']), adminController.getAllProducts);
// DÒNG NÀY PHẢI CÓ - ĐÂY LÀ DÒNG MỞ CỬA CHO TRANG STORE
router.get('/store/products', batchController.getApprovedBatches); 

// 2. FISHERMAN ROUTES
router.post('/batch', verifyToken, checkRole(['FISHERMAN']), upload.single('image'), batchController.createBatch);
router.get('/batch/my', verifyToken, checkRole(['FISHERMAN']), batchController.getMyBatches);

// 3. INSPECTOR ROUTES
router.get('/batch/pending', verifyToken, checkRole(['INSPECTOR']), batchController.getPendingBatches);
router.post('/batch/:id/approve', verifyToken, checkRole(['INSPECTOR']), batchController.approveBatch);

module.exports = router;