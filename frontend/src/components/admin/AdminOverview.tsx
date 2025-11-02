import { useGetAdminStatsQuery } from '../../services/carApi';
import { TrendingUp, Car, Calendar, Shield, DollarSign } from 'lucide-react';

const AdminOverview = () => {
  const { data, isLoading, error } = useGetAdminStatsQuery();

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard stats...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-error-600">Error loading stats</div>;
  }

  const stats = data?.stats || {
    totalEarnings: 0,
    activeRentals: 0,
    totalCars: 0,
    pendingVerifications: 0,
    todayEarnings: 0,
    monthlyEarnings: 0,
  };

  const statCards = [
    {
      label: 'Total Earnings',
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      label: 'Monthly Earnings',
      value: `₹${stats.monthlyEarnings.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Today\'s Earnings',
      value: `₹${stats.todayEarnings.toLocaleString()}`,
      icon: Calendar,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      label: 'Active Rentals',
      value: stats.activeRentals,
      icon: Car,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      label: 'Total Cars',
      value: stats.totalCars,
      icon: Car,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: Shield,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark-900 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl p-6 border-2 border-transparent hover:border-primary/20 transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <h3 className="text-sm font-medium text-dark-600 mb-1">{stat.label}</h3>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOverview;

