import { useAppSelector } from '../hooks/redux';
import Navbar from '../components/layout/Navbar';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-dark-900 mb-4">Dashboard</h2>
          <div className="space-y-4">
            <p className="text-lg text-dark-700">
              Welcome, <span className="font-semibold text-primary">{user?.name}</span>!
            </p>
            <p className="text-dark-700">Role: <span className="font-semibold">{user?.role}</span></p>
            <p className="text-dark-700">Email: {user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

