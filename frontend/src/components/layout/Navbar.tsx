import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { logout } from "../../store/slices/authSlice";

const Navbar = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-dark-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-primary-500 hover:text-primary-400 transition"
          >
            CarNation
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/home"
              className={`hover:text-primary-400 transition ${
                isActive('/home') ? 'text-primary-400 border-b-2 border-primary-400 pb-1' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/rent"
              className={`hover:text-primary-400 transition ${
                isActive('/rent') ? 'text-primary-400 border-b-2 border-primary-400 pb-1' : ''
              }`}
            >
              Rent
            </Link>
            <Link
              to="/used-cars"
              className={`hover:text-primary-400 transition ${
                isActive('/used-cars') || isActive('/buy') ? 'text-primary-400 border-b-2 border-primary-400 pb-1' : ''
              }`}
            >
              Buy
            </Link>
            <Link
              to="/about"
              className={`hover:text-primary-400 transition ${
                isActive('/about') ? 'text-primary-400 border-b-2 border-primary-400 pb-1' : ''
              }`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`hover:text-primary-400 transition ${
                isActive('/contact') ? 'text-primary-400 border-b-2 border-primary-400 pb-1' : ''
              }`}
            >
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-primary-400">👤 {user?.name}</span>
                <Link
                  to="/dashboard"
                  className="bg-gradient-primary hover:bg-gradient-primary-dark px-4 py-2 rounded-lg text-sm font-semibold transition shadow-soft hover:shadow-glow"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-error-600 hover:bg-error-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-soft hover:shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
            <Link
              to="/auth"
              className="bg-gradient-primary hover:bg-gradient-primary-dark px-4 py-2 rounded-lg text-sm font-semibold transition shadow-soft hover:shadow-glow"
            >
              Login / Sign Up
            </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-900/95 px-4 py-4 space-y-3">
          <Link
            to="/home"
            className={`block transition ${
              isActive('/home') ? 'text-primary-400 font-semibold' : 'hover:text-primary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/rent"
            className={`block transition ${
              isActive('/rent') ? 'text-primary-400 font-semibold' : 'hover:text-primary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Rent
          </Link>
          <Link
            to="/used-cars"
            className={`block transition ${
              isActive('/used-cars') || isActive('/buy') ? 'text-primary-400 font-semibold' : 'hover:text-primary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Buy
          </Link>
          <Link
            to="/about"
            className={`block transition ${
              isActive('/about') ? 'text-primary-400 font-semibold' : 'hover:text-primary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className={`block transition ${
              isActive('/contact') ? 'text-primary-400 font-semibold' : 'hover:text-primary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="block hover:text-primary-400 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 text-error-400 hover:text-error-300 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="block hover:text-primary-400 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

