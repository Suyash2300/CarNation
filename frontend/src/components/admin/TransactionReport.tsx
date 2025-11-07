import { useState } from "react";
import { useGetTransactionReportQuery } from "../../services/platformFeesApi";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

const TransactionReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data, isLoading } = useGetTransactionReportQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 100,
  });

  const transactions = data?.transactions || [];
  const summary = data?.summary;

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-dark-900">
          Transaction Report
        </h2>
        <p className="text-dark-600 mt-1 text-sm md:text-base">
          View all completed transactions with fee breakdowns
        </p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 sm:p-5 shadow-lg shadow-primary-500/5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-dark-900">
                Filter by Date Range
              </h3>
              <p className="text-xs text-dark-500">
                Select a custom period to refine the report
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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
      </div>

      {/* Summary */}
      {summary && (
        <div className="px-1 sm:px-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            <div className="glass rounded-2xl p-4 sm:p-5 border border-white/30 shadow-lg shadow-primary-500/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-dark-500">
                    Total Transactions
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-dark-900 break-words">
                    {summary.totalTransactions}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary-600" />
              </div>
            </div>
            <div className="glass rounded-2xl p-4 sm:p-5 border border-white/30 shadow-lg shadow-primary-500/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-dark-500">
                    Total Sales
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-primary-600 break-words">
                    ₹{summary.totalSales.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-primary-600" />
              </div>
            </div>
            <div className="glass rounded-2xl p-4 sm:p-5 border border-white/30 shadow-lg shadow-primary-500/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-dark-500">
                    Platform Fees
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-success-600 break-words">
                    ₹{summary.totalPlatformFees.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-success-600" />
              </div>
            </div>
            <div className="glass rounded-2xl p-4 sm:p-5 border border-white/30 shadow-lg shadow-primary-500/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-dark-500">
                    Seller Earnings
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-secondary-600 break-words">
                    ₹{summary.totalSellerEarnings.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-secondary-600" />
              </div>
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
          <p className="text-xl text-dark-600">No transactions found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden w-full max-w-full shadow-xl shadow-primary-500/5">
          <div className="hidden md:block">
            <div className="overflow-x-auto md:max-h-[calc(100dvh-420px)] md:overflow-y-auto scrollbar-thin pr-2">
              <table className="w-full min-w-full">
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
                        <div className="text-xs text-dark-600">
                          {transaction.car.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-dark-900 break-words max-w-xs">
                          {transaction.car.seller.name}
                        </div>
                        <div className="text-xs text-dark-600 break-all max-w-xs">
                          {transaction.car.seller.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-dark-900 break-words max-w-xs">
                          {transaction.buyer.name}
                        </div>
                        <div className="text-xs text-dark-600 break-all max-w-xs">
                          {transaction.buyer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-dark-900">
                          ₹{transaction.salePrice.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary-600">
                          ₹{transaction.platformFee?.toLocaleString() || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-success-600">
                          ₹
                          {transaction.sellerEarnings?.toLocaleString() ||
                            "N/A"}
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

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-dark-100 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 space-y-3 shadow-md shadow-primary-500/5 rounded-2xl my-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-dark-900 text-sm">
                      {transaction.car.brand} {transaction.car.model}
                    </p>
                    <p className="text-xs text-dark-500">
                      {transaction.car.year}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    ₹{transaction.salePrice.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-dark-50 p-3">
                    <p className="text-xs uppercase text-dark-500 tracking-wide">
                      Seller
                    </p>
                    <p className="font-medium text-dark-900 break-words">
                      {transaction.car.seller.name}
                    </p>
                    <p className="text-xs text-dark-500 break-all">
                      {transaction.car.seller.email}
                    </p>
                  </div>
                  <div className="rounded-lg bg-dark-50 p-3">
                    <p className="text-xs uppercase text-dark-500 tracking-wide">
                      Buyer
                    </p>
                    <p className="font-medium text-dark-900 break-words">
                      {transaction.buyer.name}
                    </p>
                    <p className="text-xs text-dark-500 break-all">
                      {transaction.buyer.email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center rounded-full bg-primary-50 text-primary-700 px-3 py-1 font-semibold">
                    Platform Fee: ₹
                    {transaction.platformFee?.toLocaleString() || "N/A"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-success-50 text-success-700 px-3 py-1 font-semibold">
                    Seller: ₹
                    {transaction.sellerEarnings?.toLocaleString() || "N/A"}
                  </span>
                  <span className="text-xs text-dark-500 ml-auto">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionReport;
