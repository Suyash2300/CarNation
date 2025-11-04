import { useState, useEffect } from 'react';
import { Car, Users, Calendar, TrendingUp } from 'lucide-react';

interface Stat {
  icon: typeof Car;
  label: string;
  value: number;
  suffix?: string;
}

const StatisticsSection = () => {
  const [stats] = useState<Stat[]>([
    {
      icon: Car,
      label: 'Total Vehicles',
      value: 500,
      suffix: '+',
    },
    {
      icon: Users,
      label: 'Happy Customers',
      value: 2000,
      suffix: '+',
    },
    {
      icon: Calendar,
      label: 'Bookings Completed',
      value: 5000,
      suffix: '+',
    },
    {
      icon: TrendingUp,
      label: 'Cities Covered',
      value: 25,
      suffix: '+',
    },
  ]);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-3 font-heading">
            CarNation in Numbers
          </h2>
          <p className="text-dark-600 text-lg">
            Trusted by thousands of customers nationwide
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-xl bg-primary-100 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-dark-900 mb-2">
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </div>
                <p className="text-sm md:text-base text-dark-600 font-medium">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;

