import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Store from './pages/Store'; // Trang siêu thị sang trọng
import Cart from './pages/Cart';   // Giỏ hàng
import FishermanLogin from './pages/FishermanLogin';
import InspectorLogin from './pages/InspectorLogin';
import FishermanDashboard from './pages/FishermanDashboard';
import InspectorDashboard from './pages/InspectorDashboard';
import Register from './pages/Register';
import Tracking from './Tracking';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Hàm bảo vệ cho Dashboard
const Guard = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== role) return <Navigate to={`/login/${role.toLowerCase()}`} />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- KHU VỰC KHÁCH HÀNG (SIÊU THỊ) --- */}
        <Route path="/" element={<Store />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/track/:qr_code" element={<Tracking />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login/customer" element={<CustomerLogin />} />
        <Route path="/register/customer" element={<CustomerRegister />} />

        {/* --- KHU VỰC ĐĂNG NHẬP RIÊNG BIỆT --- */}
        <Route path="/login/fisherman" element={<FishermanLogin />} />
        <Route path="/login/inspector" element={<InspectorLogin />} />

        {/* --- KHU VỰC DASHBOARD BẢO MẬT --- */}
        <Route path="/fisherman/dashboard" element={<Guard role="FISHERMAN"><FishermanDashboard /></Guard>} />
        <Route path="/inspector/dashboard" element={<Guard role="INSPECTOR"><InspectorDashboard /></Guard>} />
        <Route path="/portal/admin-secret-login" element={<AdminLogin />} />

<Route path="/admin/dashboard" element={
  <Guard role="ADMIN">
    <AdminDashboard />
  </Guard>
} />

        {/* Mặc định dẫn về Store */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}