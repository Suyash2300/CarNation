import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Rent from './pages/Rent';
import UsedCars from './pages/UsedCars';
import CarDetail from './pages/CarDetail';
import Auth from './pages/Auth';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Sell from './pages/Sell';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/rent" element={<Rent />} />
      <Route path="/used-cars" element={<UsedCars />} />
      <Route path="/buy" element={<Navigate to="/used-cars" replace />} />
      <Route path="/car/:id" element={<CarDetail />} />
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
    </Routes>
  );
}

export default App;
