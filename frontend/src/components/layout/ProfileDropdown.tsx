import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, MessageCircle, LayoutDashboard } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:text-primary-400 transition focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-lg p-1"
        aria-label="Profile menu"
      >
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name || 'Profile'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-400/50 hover:ring-primary-400 transition"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase() || '👤'}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-dark-200 overflow-hidden animate-slide-down z-50">
          <div className="p-4 border-b border-dark-200">
            <p className="font-semibold text-dark-900 text-sm">{user?.name}</p>
            <p className="text-xs text-dark-600 truncate">{user?.email}</p>
          </div>

          <div className="py-2">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-primary-50 text-dark-700 hover:text-primary-600 transition text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-primary-50 text-dark-700 hover:text-primary-600 transition text-sm"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <Link
              to="/chat"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-primary-50 text-dark-700 hover:text-primary-600 transition text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-primary-50 text-dark-700 hover:text-primary-600 transition text-sm"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          <div className="border-t border-dark-200 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-error-50 text-error-600 hover:text-error-700 transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

