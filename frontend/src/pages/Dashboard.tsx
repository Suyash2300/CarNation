import { useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { useAppDispatch } from '../hooks/redux';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-light">
      <nav className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">CarNation</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-error text-white rounded-xl hover:bg-error/90 transition-smooth"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-dark mb-4">Dashboard</h2>
          <div className="space-y-4">
            <p className="text-lg text-dark/70">
              Welcome, <span className="font-semibold text-primary">{user?.name}</span>!
            </p>
            <p className="text-dark/70">Role: <span className="font-semibold">{user?.role}</span></p>
            <p className="text-dark/70">Email: {user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

