const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email đã tồn tại' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ full_name, email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ message: 'Tạo tài khoản thành công', user: { id: user._id, email, role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
        }
        if (!user.is_active) return res.status(403).json({ error: 'Tài khoản bị khóa' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};