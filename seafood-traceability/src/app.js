const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // Import file api.js của bạn
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// DÒNG NÀY PHẢI CÓ: Kết nối mọi route trong api.js với tiền tố /api
app.use('/api', apiRoutes); 

app.use(express.static(path.join(__dirname, '../public')));

module.exports = app;