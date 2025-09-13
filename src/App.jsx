import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Landing Page Components
import LandingLayout from './components/layout/LandingLayout';
import HomePage from './pages/landing/HomePage';
import ProfilePage from './pages/landing/ProfilePage';
import InfographicsPage from './pages/landing/InfographicsPage';
import NewsPage from './pages/landing/NewsPage';
import NewsDetailPage from './pages/landing/NewsDetailPage';
import ShopPage from './pages/landing/ShopPage';
import ShopDetailPage from './pages/landing/ShopDetailPage';
import APBPage from './pages/landing/APBPage';

// Admin Components
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import AdminNewsPage from './pages/admin/AdminNewsPage';
import AdminNewsForm from './pages/admin/AdminNewsForm';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminInfographicsPage from './pages/admin/AdminInfographicsPage';
import AdminShopPage from './pages/admin/AdminShopPage';
import AdminShopForm from './pages/admin/AdminShopForm';
import AdminBannerPage from './pages/admin/AdminBannerPage';
import AdminBannerForm from './pages/admin/AdminBannerForm';
import AdminContactSettingsPage from './pages/admin/AdminContactSettingsPage';
import AdminAPBPage from './pages/admin/AdminAPBPage';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Landing Page Routes */}
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profil" element={<ProfilePage />} />
          <Route path="infografis" element={<InfographicsPage />} />
          <Route path="berita" element={<NewsPage />} />
          <Route path="berita/:id" element={<NewsDetailPage />} />
          <Route path="belanja" element={<ShopPage />} />
          <Route path="belanja/:id" element={<ShopDetailPage />} />
          <Route path="apb" element={<APBPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="berita" element={<AdminNewsPage />} />
          <Route path="berita/tambah" element={<AdminNewsForm />} />
          <Route path="berita/edit/:id" element={<AdminNewsForm />} />
          <Route path="profil" element={<AdminProfilePage />} />
          <Route path="infografis" element={<AdminInfographicsPage />} />
          <Route path="toko" element={<AdminShopPage />} />
          <Route path="toko/tambah" element={<AdminShopForm />} />
          <Route path="toko/edit/:id" element={<AdminShopForm />} />
          <Route path="banner" element={<AdminBannerPage />} />
          <Route path="banner/tambah" element={<AdminBannerForm />} />
          <Route path="banner/edit/:id" element={<AdminBannerForm />} />
          <Route path="kontak" element={<AdminContactSettingsPage />} />
          <Route path="apb" element={<AdminAPBPage />} />
          {/* Organization routes reuse AdminProfilePage section, so no separate pages needed */}
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;