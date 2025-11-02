import { useAppSelector } from '../hooks/redux';
import Navbar from '../components/layout/Navbar';
import { useGetRentalCarsQuery } from '../services/carApi';
import { useGetDealsQuery } from '../services/dealsApi';
import { useGetRentalsQuery } from '../services/rentalApi';
import DealStatusBadge from '../components/deals/DealStatusBadge';
import { Car as CarIcon, MapPin, Search, Calendar, UserCheck, Handshake, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-dark-900 mb-2">Welcome Back!</h1>
            <p className="text-dark-600">
              Hello, <span className="font-semibold text-primary">{user?.name}</span>! 
              Ready to find your perfect ride?
            </p>
          </div>
          <Link
            to="/chat"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Messages
          </Link>
        </div>

        {/* Account Status Card */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 p-4 rounded-lg">
                <UserCheck className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-dark-900 mb-1">Account Status</h2>
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
                className="bg-warning-600 hover:bg-warning-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
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
              Find the perfect car for your journey. Available now for immediate booking.
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
              Quality used cars from verified sellers. Great deals waiting for you.
            </p>
          </Link>
        </div>

        {/* Active Deals & Rentals */}
        {(deals.length > 0 || rentals.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">My Deals & Rentals</h2>
            
            {deals.length > 0 && (
              <div className="glass rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
                  <Handshake className="w-5 h-5" />
                  Active Deals
                </h3>
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div key={deal.id} className="border border-dark-200 rounded-lg p-4">
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
                                {deal.car.brand} {deal.car.model} ({deal.car.year})
                              </h4>
                              <p className="text-sm text-dark-600">
                                {deal.dealType === 'PURCHASE' ? 'Purchase' : 'Rental'} with {deal.seller.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <DealStatusBadge status={deal.status} />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="text-sm text-dark-600">Agreed Price</p>
                          <p className="font-semibold text-dark-900">₹{deal.agreedPrice.toLocaleString()}</p>
                        </div>
                        {deal.purchase?.platformFee && (
                          <div>
                            <p className="text-sm text-dark-600">Platform Fee</p>
                            <p className="font-semibold text-primary-600">₹{deal.purchase.platformFee.toLocaleString()}</p>
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
                  {rentals.map((rental) => (
                    <div key={rental.id} className="border border-dark-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {rental.car.primaryImage && (
                            <img
                              src={rental.car.primaryImage}
                              alt={`${rental.car.brand} ${rental.car.model}`}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-dark-900">
                              {rental.car.brand} {rental.car.model}
                            </h4>
                            <p className="text-sm text-dark-600">
                              {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-dark-600">{rental.totalDays} days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-dark-900">₹{rental.totalAmount.toLocaleString()}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            rental.status === 'COMPLETED' ? 'bg-success-100 text-success-700' :
                            rental.status === 'ACTIVE' ? 'bg-primary-100 text-primary-700' :
                            'bg-warning-100 text-warning-700'
                          }`}>
                            {rental.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Featured Rental Cars */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-dark-900">Featured Rental Cars</h2>
            <Link
              to="/rent"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
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
            <p className="text-xl text-dark-600 mb-2">No rental cars available</p>
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
          <h3 className="text-lg font-semibold text-dark-900 mb-4">How It Works</h3>
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
              <h4 className="font-semibold text-dark-900 mb-2">Verify Aadhaar</h4>
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

