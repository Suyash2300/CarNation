import { useAppSelector } from "../hooks/redux";
import Navbar from "../components/layout/Navbar";
import { useGetRentalCarsQuery } from "../services/carApi";
import { useGetDealsQuery } from "../services/dealsApi";
import { useGetRentalsQuery } from "../services/rentalApi";
import DealStatusBadge from "../components/deals/DealStatusBadge";
import {
  Car as CarIcon,
  MapPin,
  Search,
  Calendar,
  UserCheck,
  Handshake,
  MessageCircle,
  CreditCard,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { useGetShopsByCityQuery } from "../services/shopApi";

const PickupAddress: React.FC<{ city?: string }> = ({ city }) => {
  const { data } = useGetShopsByCityQuery({ city: city || undefined }, { skip: !city });
  const shop = data?.shops?.[0];
  if (!city) return null;
  const address = shop?.addressLine
    ? `${shop.addressLine}${shop.landmark ? ", " + shop.landmark : ""}${shop.pincode ? " - " + shop.pincode : ""}`
    : city;
  return <span className="font-medium text-dark-900 break-words">{address}</span>;
};

const BuyerDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetRentalCarsQuery({});
  const { data: dealsData } = useGetDealsQuery();
  const { data: rentalsData } = useGetRentalsQuery();

  const cars = data?.cars || [];
  const deals = dealsData?.deals || [];
  const rentals = rentalsData?.rentals || [];

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Buyer Dashboard" },
          ]}
        />

        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-6">
          <div>
            <h1 className="text-4xl font-bold text-dark-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-dark-600">
              Hello,{" "}
              <span className="font-semibold text-primary">{user?.name}</span>!
              Ready to find your perfect ride?
            </p>
          </div>
          <Link
            to="/chat"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Messages
          </Link>
        </div>

        {/* Account Status Card */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 p-4 rounded-lg">
                <UserCheck className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-dark-900 mb-1">
                  Account Status
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-dark-700">
                    <span className="font-semibold">Email:</span> {user?.email}
                  </p>
                  {user?.isAadhaarVerified ? (
                    <span className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold">
                      ✅ Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-xs font-semibold">
                      ⚠️ Not Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!user?.isAadhaarVerified && (
              <Link
                to="/verify-aadhaar"
                className="w-full sm:w-auto text-center bg-warning-600 hover:bg-warning-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
              >
                Verify Aadhaar
              </Link>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/rent"
            className="glass rounded-xl p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary-100 p-4 rounded-lg group-hover:bg-primary-200 transition">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-900">Rent a Car</h3>
                <p className="text-dark-600">Browse available rental cars</p>
              </div>
            </div>
            <p className="text-sm text-dark-500">
              Find the perfect car for your journey. Available now for immediate
              booking.
            </p>
          </Link>

          <Link
            to="/used-cars"
            className="glass rounded-xl p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-secondary-100 p-4 rounded-lg group-hover:bg-secondary-200 transition">
                <CarIcon className="w-8 h-8 text-secondary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-900">Buy a Car</h3>
                <p className="text-dark-600">Browse pre-owned vehicles</p>
              </div>
            </div>
            <p className="text-sm text-dark-500">
              Quality used cars from verified sellers. Great deals waiting for
              you.
            </p>
          </Link>
        </div>

        {/* Active Deals & Rentals */}
        {(deals.length > 0 || rentals.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">
              My Deals & Rentals
            </h2>

            {deals.length > 0 && (
              <div className="glass rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
                  <Handshake className="w-5 h-5" />
                  Active Deals
                </h3>
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="border border-dark-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {deal.car.primaryImage && (
                              <img
                                src={deal.car.primaryImage}
                                alt={`${deal.car.brand} ${deal.car.model}`}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <h4 className="font-semibold text-dark-900">
                                {deal.car.brand} {deal.car.model} (
                                {deal.car.year})
                              </h4>
                              <p className="text-sm text-dark-600">
                                {deal.dealType === "PURCHASE"
                                  ? "Purchase"
                                  : "Rental"}{" "}
                                with {deal.seller.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <DealStatusBadge status={deal.status} />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="text-sm text-dark-600">Agreed Price</p>
                          <p className="font-semibold text-dark-900">
                            ₹{deal.agreedPrice.toLocaleString()}
                          </p>
                        </div>
                        {deal.purchase?.platformFee && (
                          <div>
                            <p className="text-sm text-dark-600">
                              Platform Fee
                            </p>
                            <p className="font-semibold text-primary-600">
                              ₹{deal.purchase.platformFee.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rentals.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  My Rentals
                </h3>
                <div className="space-y-4">
                  {rentals.map((rental) => {
                    const formatAddress = () => {
                      const parts = [];
                      if (rental.buyer.address)
                        parts.push(rental.buyer.address);
                      if (rental.buyer.city) parts.push(rental.buyer.city);
                      if (rental.buyer.state) parts.push(rental.buyer.state);
                      if (rental.buyer.pincode)
                        parts.push(rental.buyer.pincode);
                      if (rental.buyer.country)
                        parts.push(rental.buyer.country);
                      return parts.length > 0
                        ? parts.join(", ")
                        : "Address not provided";
                    };

                    return (
                      <div
                        key={rental.id}
                        className="border border-dark-200 rounded-lg p-5 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Left Section - Car Image and Basic Info */}
                          <div className="flex items-start gap-4 flex-1">
                            {rental.car.primaryImage && (
                              <img
                                src={rental.car.primaryImage}
                                alt={`${rental.car.brand} ${rental.car.model}`}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg text-dark-900 mb-2">
                                {rental.car.brand} {rental.car.model} (
                                {rental.car.year})
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-dark-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(
                                      rental.startDate
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}{" "}
                                    -{" "}
                                    {new Date(
                                      rental.endDate
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
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
                                      <span>
                                        Pickup Location: <PickupAddress city={rental.car.city} />
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Right Section - Amount and Status */}
                          <div className="flex flex-col items-start sm:items-end gap-2 text-left sm:text-right">
                            <div>
                              <p className="text-sm text-dark-600 mb-1">
                                Total Amount
                              </p>
                              <p className="text-2xl font-bold text-primary-600">
                                ₹{rental.totalAmount.toLocaleString()}
                              </p>
                            </div>
                            {(() => {
                              // Check if rental period has ended
                              const endDate = new Date(rental.endDate);
                              endDate.setHours(23, 59, 59, 999); // End of the day
                              const today = new Date();
                              const isRentalPeriodOver = today > endDate;

                              // Determine display status
                              let displayStatus = rental.status;

                              // If rental period has ended, mark as COMPLETED
                              if (
                                isRentalPeriodOver &&
                                rental.status !== "COMPLETED" &&
                                rental.status !== "CANCELLED"
                              ) {
                                displayStatus = "COMPLETED";
                              }
                              // If payment is PAID but status is still PENDING, treat as ACTIVE
                              else if (
                                rental.paymentStatus === "PAID" &&
                                rental.status === "PENDING"
                              ) {
                                displayStatus = "ACTIVE";
                              }

                              const statusClass =
                                displayStatus === "COMPLETED"
                                  ? "bg-success-100 text-success-700"
                                  : displayStatus === "ACTIVE"
                                  ? "bg-primary-100 text-primary-700"
                                  : displayStatus === "PENDING"
                                  ? "bg-warning-100 text-warning-700"
                                  : "bg-error-100 text-error-700";
                              return (
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                                >
                                  {displayStatus}
                                </span>
                              );
                            })()}
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 self-start sm:self-auto ${
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
                        </div>

                        {/* Detailed Information Section */}
                        <div className="mt-4 pt-4 border-t border-dark-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Rental Details */}
                            <div>
                              <h5 className="font-semibold text-dark-900 mb-2 text-sm">
                                Rental Details
                              </h5>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-dark-600">
                                    Daily Rate:
                                  </span>
                                  <span className="font-medium text-dark-900">
                                    ₹{rental.dailyPrice.toLocaleString()}/day
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-dark-600">
                                    Total Days:
                                  </span>
                                  <span className="font-medium text-dark-900">
                                    {rental.totalDays} days
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-dark-600">
                                    Booking ID:
                                  </span>
                                  <span className="font-mono text-xs text-dark-900">
                                    {rental.id.substring(0, 8)}...
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Buyer Address */}
                            <div>
                              <h5 className="font-semibold text-dark-900 mb-2 text-sm flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Your Address
                              </h5>
                              <div className="text-sm text-dark-700 space-y-1">
                                {rental.buyer.name && (
                                  <p className="font-medium">
                                    {rental.buyer.name}
                                  </p>
                                )}
                                <p className="text-dark-600 break-words">
                                  {formatAddress()}
                                </p>
                                {rental.buyer.phone && (
                                  <div className="flex items-center gap-1 mt-2 text-dark-600">
                                    <Phone className="w-3 h-3" />
                                    <span className="text-xs">
                                      {rental.buyer.phone}
                                    </span>
                                  </div>
                                )}
                                {rental.buyer.email && (
                                  <div className="flex items-center gap-1 text-dark-600">
                                    <Mail className="w-3 h-3" />
                                    <span className="text-xs">
                                      {rental.buyer.email}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Featured Rental Cars */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-2xl font-bold text-dark-900">
              Featured Rental Cars
            </h2>
            <Link
              to="/rent"
              className="w-full md:w-auto text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
            >
              View All <span>→</span>
            </Link>
          </div>
          <p className="text-dark-600">
            Popular cars available for rent right now
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-dark-600">Loading cars...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <CarIcon className="w-16 h-16 text-dark-300 mx-auto mb-4" />
            <p className="text-xl text-dark-600 mb-2">
              No rental cars available
            </p>
            <p className="text-dark-500">Check back later for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.slice(0, 6).map((car) => (
              <Link
                key={car.id}
                to={`/rent`}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {car.primaryImage && (
                  <div className="relative w-full h-64 overflow-hidden">
                    <img
                      src={car.primaryImage}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                    {car.images && car.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-semibold">
                        +{car.images.length - 1} more
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-dark-900">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-sm text-dark-600">{car.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{car.rentalPrice}
                      </p>
                      <p className="text-xs text-dark-500">per day</p>
                    </div>
                  </div>

                  {car.city && (
                    <div className="flex items-center gap-1 text-sm text-dark-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{car.city}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {car.fuelType && (
                      <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                        {car.fuelType}
                      </span>
                    )}
                    {car.transmission && (
                      <span className="px-2 py-1 bg-secondary-50 text-secondary-700 rounded text-xs font-medium">
                        {car.transmission}
                      </span>
                    )}
                    {car.seats && (
                      <span className="px-2 py-1 bg-accent-50 text-accent-700 rounded text-xs font-medium">
                        {car.seats} Seats
                      </span>
                    )}
                  </div>

                  <button className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white px-4 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="glass rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h4 className="font-semibold text-dark-900 mb-2">Browse Cars</h4>
              <p className="text-sm text-dark-600">
                Explore our wide selection of rental cars and used vehicles
              </p>
            </div>
            <div>
              <div className="bg-secondary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h4 className="font-semibold text-dark-900 mb-2">
                Verify Aadhaar
              </h4>
              <p className="text-sm text-dark-600">
                Complete Aadhaar verification to unlock rental booking
              </p>
            </div>
            <div>
              <div className="bg-accent-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h4 className="font-semibold text-dark-900 mb-2">Book & Drive</h4>
              <p className="text-sm text-dark-600">
                Select dates, make payment, and hit the road!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
