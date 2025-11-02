import { useState } from 'react';
import { useGetTransactionReportQuery } from '../../services/platformFeesApi';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

const TransactionReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data, isLoading } = useGetTransactionReportQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 100,
  });

  const transactions = data?.transactions || [];
  const summary = data?.summary;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark-900">Transaction Report</h2>
        <p className="text-dark-600 mt-1">View all completed transactions with fee breakdowns</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Filter by Date Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-900 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-900 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-600 mb-1">Total Transactions</p>
                <p className="text-3xl font-bold text-dark-900">{summary.totalTransactions}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary-600" />
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-600 mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-primary-600">
                  ₹{summary.totalSales.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-primary-600" />
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-600 mb-1">Platform Fees</p>
                <p className="text-3xl font-bold text-success-600">
                  ₹{summary.totalPlatformFees.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-success-600" />
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-600 mb-1">Seller Earnings</p>
                <p className="text-3xl font-bold text-secondary-600">
                  ₹{summary.totalSellerEarnings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-secondary-600" />
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-dark-600">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 glass rounded-xl">
          <DollarSign className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <p className="text-xl text-dark-600">No transactions found</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-900 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-900 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-900 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-900 uppercase tracking-wider">
                    Sale Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-900 uppercase tracking-wider">
                    Platform Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-900 uppercase tracking-wider">
                    Seller Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-900 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dark-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-dark-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-dark-900">
                        {transaction.car.brand} {transaction.car.model}
                      </div>
                      <div className="text-xs text-dark-600">{transaction.car.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark-900">{transaction.car.seller.name}</div>
                      <div className="text-xs text-dark-600">{transaction.car.seller.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark-900">{transaction.buyer.name}</div>
                      <div className="text-xs text-dark-600">{transaction.buyer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-dark-900">
                        ₹{transaction.salePrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-primary-600">
                        ₹{transaction.platformFee?.toLocaleString() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-success-600">
                        ₹{transaction.sellerEarnings?.toLocaleString() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionReport;

