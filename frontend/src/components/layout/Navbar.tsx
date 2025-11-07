import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, MessageCircle } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { logout } from "../../store/slices/authSlice";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-dark-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group select-none">
            <span className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 text-dark-950 font-black text-lg tracking-wide shadow-[0_8px_20px_rgba(0,0,0,0.35)] ring-2 ring-white/20 ring-offset-2 ring-offset-dark-900 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-200">
              CN
            </span>
            <span className="leading-tight">
              <span className="block text-[1.35rem] sm:text-[1.6rem] font-black uppercase tracking-wide bg-gradient-to-r from-white via-primary-100 to-primary-300 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                <span className="pr-1">Car</span>
                <span className="text-primary-200">Nation</span>
              </span>
              <span className="block text-[0.7rem] sm:text-xs font-semibold text-white/70 group-hover:text-primary-100 transition-colors">
                Drive Beyond Ordinary
              </span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/home"
              className={`hover:text-primary-400 transition ${
                isActive("/home")
                  ? "text-primary-400 border-b-2 border-primary-400 pb-1"
                  : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/rent"
              className={`hover:text-primary-400 transition ${
                isActive("/rent")
                  ? "text-primary-400 border-b-2 border-primary-400 pb-1"
                  : ""
              }`}
            >
              Rent
            </Link>
            <Link
              to="/used-cars"
              className={`hover:text-primary-400 transition ${
                isActive("/used-cars") || isActive("/buy")
                  ? "text-primary-400 border-b-2 border-primary-400 pb-1"
                  : ""
              }`}
            >
              Buy
            </Link>
            <Link
              to="/about"
              className={`hover:text-primary-400 transition ${
                isActive("/about")
                  ? "text-primary-400 border-b-2 border-primary-400 pb-1"
                  : ""
              }`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`hover:text-primary-400 transition ${
                isActive("/contact")
                  ? "text-primary-400 border-b-2 border-primary-400 pb-1"
                  : ""
              }`}
            >
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/chat"
                  className={`flex items-center gap-2 hover:text-primary-400 transition ${
                    isActive("/chat")
                      ? "text-primary-400 border-b-2 border-primary-400 pb-1"
                      : ""
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </Link>
                <ProfileDropdown />
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
            className="md:hidden p-2 rounded-lg hover:bg-dark-800 transition focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-900/95 px-4 py-4 space-y-3">
          <Link
            to="/home"
            className={`block transition ${
              isActive("/home")
                ? "text-primary-400 font-semibold"
                : "hover:text-primary"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/rent"
            className={`block transition ${
              isActive("/rent")
                ? "text-primary-400 font-semibold"
                : "hover:text-primary"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Rent
          </Link>
          <Link
            to="/used-cars"
            className={`block transition ${
              isActive("/used-cars") || isActive("/buy")
                ? "text-primary-400 font-semibold"
                : "hover:text-primary"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Buy
          </Link>
          <Link
            to="/about"
            className={`block transition ${
              isActive("/about")
                ? "text-primary-400 font-semibold"
                : "hover:text-primary"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className={`block transition ${
              isActive("/contact")
                ? "text-primary-400 font-semibold"
                : "hover:text-primary"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className={`block transition ${
                  isActive("/profile")
                    ? "text-primary-400 font-semibold"
                    : "hover:text-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/chat"
                className={`block transition ${
                  isActive("/chat")
                    ? "text-primary-400 font-semibold"
                    : "hover:text-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </div>
              </Link>
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
