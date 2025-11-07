import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all routes for code splitting
const Home = lazy(() => import('./pages/Home'));
const Rent = lazy(() => import('./pages/Rent'));
const UsedCars = lazy(() => import('./pages/UsedCars'));
const CarDetail = lazy(() => import('./pages/CarDetail'));
const Auth = lazy(() => import('./pages/Auth'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Sell = lazy(() => import('./pages/Sell'));
const Chat = lazy(() => import('./pages/Chat'));
const RentalBooking = lazy(() => import('./pages/RentalBooking'));
const PurchaseBooking = lazy(() => import('./pages/PurchaseBooking'));
const VerifyAadhaar = lazy(() => import('./pages/VerifyAadhaar'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const SupportChat = lazy(() => import('./pages/SupportChat'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-light flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-dark-600">Loading...</p>
    </div>
  </div>
);

// Component to handle route prefetching
const RoutePrefetcher = () => {
  const location = useLocation();

  useEffect(() => {
    // Prefetch likely next routes based on current location
    const prefetchRoutes = () => {
      // Prefetch critical routes on homepage
      if (location.pathname === '/' || location.pathname === '/home') {
        // Prefetch rent and used-cars (most common navigation)
        import('./pages/Rent');
        import('./pages/UsedCars');
        import('./pages/Auth');
      }
      
      // Prefetch dashboard routes after authentication
      if (location.pathname === '/auth') {
        import('./pages/Dashboard');
        import('./pages/Profile');
      }
      
      // Prefetch related routes
      if (location.pathname === '/rent') {
        import('./pages/UsedCars');
      }
      if (location.pathname === '/used-cars') {
        import('./pages/Rent');
      }
    };

    // Delay prefetching slightly to not interfere with initial load
    const timer = setTimeout(prefetchRoutes, 2000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <>
      <RoutePrefetcher />
      <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/rent" element={<Rent />} />
      <Route path="/used-cars" element={<UsedCars />} />
      <Route path="/buy" element={<Navigate to="/used-cars" replace />} />
      <Route path="/car/:id" element={<CarDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/support-chat"
          element={
            <ProtectedRoute>
              <SupportChat />
            </ProtectedRoute>
          }
        />
      <Route path="/auth" element={<Auth />} />
      <Route path="/signin" element={<Navigate to="/auth" replace />} />
      <Route path="/signup" element={<Navigate to="/auth?tab=signup" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sell"
        element={
          <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
            <Sell />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
        <Route
          path="/rental-booking/:id"
          element={
            <ProtectedRoute>
              <RentalBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-booking/:id"
          element={
            <ProtectedRoute>
              <PurchaseBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify-aadhaar"
          element={
            <ProtectedRoute>
              <VerifyAadhaar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
    </Routes>
      </Suspense>
    </>
  );
}

export default App;
