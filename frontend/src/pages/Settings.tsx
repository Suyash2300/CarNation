import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import Navbar from '../components/layout/Navbar';
import { LogOut, Settings as SettingsIcon, User } from 'lucide-react';

const Settings = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-light-subtle dark:bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-dark-600 dark:text-dark-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-subtle dark:bg-dark-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 dark:text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary-600" />
            Settings
          </h1>
          <p className="text-dark-600 dark:text-dark-300">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Section */}
          <div className="glass rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-200 dark:border-dark-700">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">Account</h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-800/50 rounded-xl border border-dark-200 dark:border-dark-700 hover:bg-dark-100 dark:hover:bg-dark-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div className="text-left">
                    <h3 className="font-semibold text-dark-900 dark:text-white">Edit Profile</h3>
                    <p className="text-sm text-dark-600 dark:text-dark-300">
                      Update your personal information
                    </p>
                  </div>
                </div>
                <span className="text-dark-400 dark:text-dark-500">→</span>
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="glass rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-200 dark:border-dark-700">
              <div className="p-2 bg-error-100 dark:bg-error-900/30 rounded-lg">
                <LogOut className="w-5 h-5 text-error-600 dark:text-error-400" />
              </div>
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">Session</h2>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-pink-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow-md">
                    <LogOut className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-300">Logout</h3>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Sign out of your account
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 hover:from-red-600 hover:via-orange-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

