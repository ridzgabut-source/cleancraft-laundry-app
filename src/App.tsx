import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { BookingPage } from './pages/public/BookingPage';
import { BookingSuccessPage } from './pages/public/BookingSuccessPage';
import { TrackingPage } from './pages/public/TrackingPage';

// Admin Pages
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { BookingsPage } from './pages/admin/BookingsPage';
import { BookingDetailPage } from './pages/admin/BookingDetailPage';
import { ServicesAdminPage } from './pages/admin/ServicesAdminPage';
import { CustomersAdminPage } from './pages/admin/CustomersAdminPage';
import { PickupAdminPage } from './pages/admin/PickupAdminPage';
import { SettingsAdminPage } from './pages/admin/SettingsAdminPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Customer Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/success/:code" element={<BookingSuccessPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
        </Route>

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="services" element={<ServicesAdminPage />} />
          <Route path="customers" element={<CustomersAdminPage />} />
          <Route path="pickup" element={<PickupAdminPage />} />
          <Route path="settings" element={<SettingsAdminPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
