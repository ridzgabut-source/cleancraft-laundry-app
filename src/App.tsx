import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";

// Public Pages
import { HomePage } from "./pages/public/HomePage";
const ServicesPage = lazy(() =>
  import("./pages/public/ServicesPage").then((module) => ({
    default: module.ServicesPage,
  })),
);
const BookingPage = lazy(() =>
  import("./pages/public/BookingPage").then((module) => ({
    default: module.BookingPage,
  })),
);
const BookingSuccessPage = lazy(() =>
  import("./pages/public/BookingSuccessPage").then((module) => ({
    default: module.BookingSuccessPage,
  })),
);
const TrackingPage = lazy(() =>
  import("./pages/public/TrackingPage").then((module) => ({
    default: module.TrackingPage,
  })),
);

// Admin Pages
const LoginPage = lazy(() =>
  import("./pages/admin/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./pages/admin/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const BookingsPage = lazy(() =>
  import("./pages/admin/BookingsPage").then((module) => ({
    default: module.BookingsPage,
  })),
);
const BookingDetailPage = lazy(() =>
  import("./pages/admin/BookingDetailPage").then((module) => ({
    default: module.BookingDetailPage,
  })),
);
const ServicesAdminPage = lazy(() =>
  import("./pages/admin/ServicesAdminPage").then((module) => ({
    default: module.ServicesAdminPage,
  })),
);
const CustomersAdminPage = lazy(() =>
  import("./pages/admin/CustomersAdminPage").then((module) => ({
    default: module.CustomersAdminPage,
  })),
);
const PickupAdminPage = lazy(() =>
  import("./pages/admin/PickupAdminPage").then((module) => ({
    default: module.PickupAdminPage,
  })),
);
const SettingsAdminPage = lazy(() =>
  import("./pages/admin/SettingsAdminPage").then((module) => ({
    default: module.SettingsAdminPage,
  })),
);

export function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <Suspense
          fallback={
            <div
              className="site-container py-16"
              role="status"
              aria-label="Memuat halaman"
            >
              <div className="skeleton h-16 mb-8" />
              <div className="skeleton h-80" />
              <span className="sr-only">Memuat halaman…</span>
            </div>
          }
        >
          <Routes>
            {/* Public Customer Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route
                path="/booking/success/:code"
                element={<BookingSuccessPage />}
              />
              <Route path="/tracking" element={<TrackingPage />} />
            </Route>

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
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
        </Suspense>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
