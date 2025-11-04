import { useState } from "react";
import Select from "react-select";
import {
  useGetAdminRentalsQuery,
  useGetAdminEarningsQuery,
} from "../../services/carApi";
import {
  DollarSign,
  Calendar,
  User,
  Car as CarIcon,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock,
} from "lucide-react";

const RentalManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [earningsPeriod, setEarningsPeriod] = useState<
    "week" | "month" | "year"
  >("month");

  const { data: rentalsData, isLoading: rentalsLoading } =
    useGetAdminRentalsQuery(statusFilter ? { status: statusFilter } : {}, {
      skip: false,
    });

  const { data: earningsData, isLoading: earningsLoading } =
    useGetAdminEarningsQuery({
      period: earningsPeriod,
    });

  const rentals = rentalsData?.rentals || [];
  const earnings = earningsData || { totalEarnings: 0, earnings: [], count: 0 };
  const isLoading = rentalsLoading || earningsLoading;

  const statusOptions = [
    { value: "", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const periodOptions = [
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "year", label: "Last Year" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark-900 mb-6">
        Rentals & Earnings
      </h2>

      {/* Earnings Summary */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-dark-900">
            Earnings Report
          </h3>
          <div className="w-48">
            <Select
              options={periodOptions}
              value={periodOptions.find((opt) => opt.value === earningsPeriod)}
              onChange={(selected) =>
                setEarningsPeriod(selected?.value as "week" | "month" | "year")
              }
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
              <p className="text-sm text-dark-600 mt-1">
                {earnings.count} rental(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rentals List */}
      <div className="mb-4">
        <div className="w-64">
          <Select
            options={statusOptions}
            value={statusOptions.find((opt) => opt.value === statusFilter)}
            onChange={(selected) => setStatusFilter(selected?.value || "")}
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
          {rentals.map((rental) => {
            const formatAddress = () => {
              const parts = [];
              if (rental.buyer.address) parts.push(rental.buyer.address);
              if (rental.buyer.city) parts.push(rental.buyer.city);
              if (rental.buyer.state) parts.push(rental.buyer.state);
              if (rental.buyer.pincode) parts.push(rental.buyer.pincode);
              if (rental.buyer.country) parts.push(rental.buyer.country);
              return parts.length > 0
                ? parts.join(", ")
                : "Address not provided";
            };

            return (
              <div
                key={rental.id}
                className="glass rounded-xl p-6 hover:shadow-xl transition"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Section - Car Image and Basic Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {rental.car.primaryImage && (
                      <img
                        src={rental.car.primaryImage}
                        alt={`${rental.car.brand} ${rental.car.model}`}
                        className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-dark-900 mb-3">
                        {rental.car.brand} {rental.car.model} ({rental.car.year}
                        )
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-dark-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Renter:</span>
                          <span>{rental.buyer.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-dark-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(rental.startDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(rental.endDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-dark-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {rental.totalDays}{" "}
                            {rental.totalDays === 1 ? "day" : "days"}
                          </span>
                        </div>
                        {rental.car.city && (
                          <div className="flex items-center gap-2 text-sm text-dark-600">
                            <MapPin className="w-4 h-4 text-primary-600" />
                            <span className="font-medium">
                              Pickup Location: {rental.car.city}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Amount and Status */}
                  <div className="flex flex-col items-start lg:items-end gap-3 lg:w-48">
                    <div className="text-left lg:text-right">
                      <p className="text-sm text-dark-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{rental.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                          rental.status === "COMPLETED"
                            ? "bg-success-100 text-success-700"
                            : rental.status === "ACTIVE"
                            ? "bg-primary-100 text-primary-700"
                            : rental.status === "PENDING"
                            ? "bg-warning-100 text-warning-700"
                            : "bg-error-100 text-error-700"
                        }`}
                      >
                        {rental.status}
                      </span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                          rental.paymentStatus === "PAID"
                            ? "bg-success-100 text-success-700"
                            : rental.paymentStatus === "PENDING"
                            ? "bg-warning-100 text-warning-700"
                            : "bg-error-100 text-error-700"
                        }`}
                      >
                        <CreditCard className="w-3 h-3 inline mr-1" />
                        {rental.paymentStatus}
                      </span>
                    </div>
                    {!rental.buyer.isAadhaarVerified && (
                      <div className="bg-warning-50 border border-warning-200 rounded-lg p-2 w-full lg:w-auto">
                        <p className="text-xs text-warning-700">
                          ⚠️ Aadhaar not verified
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Information Section */}
                <div className="mt-4 pt-4 border-t border-dark-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rental Details */}
                    <div>
                      <h5 className="font-semibold text-dark-900 mb-3 text-sm">
                        Rental Details
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-dark-600">Daily Rate:</span>
                          <span className="font-medium text-dark-900">
                            ₹{rental.dailyPrice.toLocaleString()}/day
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-600">Total Days:</span>
                          <span className="font-medium text-dark-900">
                            {rental.totalDays} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-600">Booking ID:</span>
                          <span className="font-mono text-xs text-dark-900">
                            {rental.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Buyer Contact & Address */}
                    <div>
                      <h5 className="font-semibold text-dark-900 mb-3 text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Renter Information
                      </h5>
                      <div className="text-sm text-dark-700 space-y-2">
                        <div>
                          <p className="font-medium text-dark-900">
                            {rental.buyer.name}
                          </p>
                          {rental.buyer.email && (
                            <div className="flex items-center gap-1 mt-1 text-dark-600">
                              <Mail className="w-3 h-3" />
                              <span className="text-xs">
                                {rental.buyer.email}
                              </span>
                            </div>
                          )}
                          {rental.buyer.phone && (
                            <div className="flex items-center gap-1 text-dark-600">
                              <Phone className="w-3 h-3" />
                              <span className="text-xs">
                                {rental.buyer.phone}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-dark-200">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3 h-3 mt-0.5 text-primary-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-dark-600 mb-1">
                                Address:
                              </p>
                              <p className="text-xs text-dark-700">
                                {formatAddress()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RentalManagement;
