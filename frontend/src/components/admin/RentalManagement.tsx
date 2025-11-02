import { useState } from 'react';
import Select from 'react-select';
import {
  useGetAdminRentalsQuery,
  useGetAdminEarningsQuery,
  type Rental,
} from '../../services/carApi';
import { DollarSign, Calendar, User, Car as CarIcon } from 'lucide-react';

const RentalManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [earningsPeriod, setEarningsPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: rentalsData, isLoading: rentalsLoading } = useGetAdminRentalsQuery(
    statusFilter ? { status: statusFilter } : {},
    { skip: false }
  );

  const { data: earningsData, isLoading: earningsLoading } = useGetAdminEarningsQuery({
    period: earningsPeriod,
  });

  const rentals = rentalsData?.rentals || [];
  const earnings = earningsData || { totalEarnings: 0, earnings: [], count: 0 };
  const isLoading = rentalsLoading || earningsLoading;

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const periodOptions = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last Year' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark-900 mb-6">Rentals & Earnings</h2>

      {/* Earnings Summary */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-dark-900">Earnings Report</h3>
          <div className="w-48">
            <Select
              options={periodOptions}
              value={periodOptions.find(opt => opt.value === earningsPeriod)}
              onChange={(selected) => setEarningsPeriod(selected?.value as 'week' | 'month' | 'year')}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 p-4 rounded-lg">
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-dark-600 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-dark-900">
                ₹{earnings.totalEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-dark-600 mt-1">{earnings.count} rental(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rentals List */}
      <div className="mb-4">
        <div className="w-64">
          <Select
            options={statusOptions}
            value={statusOptions.find(opt => opt.value === statusFilter)}
            onChange={(selected) => setStatusFilter(selected?.value || '')}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Filter by status"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading rentals...</div>
      ) : rentals.length === 0 ? (
        <div className="text-center py-12">
          <CarIcon className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <p className="text-dark-600">No rentals found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <div key={rental.id} className="glass rounded-xl p-6 hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {rental.car.primaryImage && (
                  <img
                    src={rental.car.primaryImage}
                    alt={`${rental.car.brand} ${rental.car.model}`}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-dark-900 mb-2">
                    {rental.car.brand} {rental.car.model} ({rental.car.year})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-dark-500" />
                      <div>
                        <p className="text-dark-600">Renter</p>
                        <p className="font-semibold text-dark-900">{rental.buyer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-dark-500" />
                      <div>
                        <p className="text-dark-600">Period</p>
                        <p className="font-semibold text-dark-900">{rental.totalDays} days</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-dark-600">Amount</p>
                      <p className="font-semibold text-dark-900">₹{rental.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-dark-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        rental.status === 'COMPLETED' ? 'bg-success-100 text-success-700' :
                        rental.status === 'ACTIVE' ? 'bg-primary-100 text-primary-700' :
                        rental.status === 'PENDING' ? 'bg-warning-100 text-warning-700' :
                        'bg-error-100 text-error-700'
                      }`}>
                        {rental.status}
                      </span>
                    </div>
                  </div>
                  {!rental.buyer.isAadhaarVerified && (
                    <div className="mt-3 bg-warning-50 border border-warning-200 rounded-lg p-2">
                      <p className="text-sm text-warning-700">
                        ⚠️ Renter's Aadhaar not verified
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalManagement;

