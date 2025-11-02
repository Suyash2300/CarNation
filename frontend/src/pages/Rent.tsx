import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Select from 'react-select';
import { useGetRentalCarsQuery, type Car } from '../services/carApi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AvailabilityBadge from '../components/rental/AvailabilityBadge';
import { Filter, MapPin, DollarSign } from 'lucide-react';

const Rent = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc'
  );

  const { data, isLoading } = useGetRentalCarsQuery({
    city: selectedCity || undefined,
    brand: selectedBrand || undefined,
    sortBy,
    sortOrder,
  });

  const cars = data?.cars || [];
  const filters = data?.filters || { cities: [], brands: [] };

  const cityOptions = [
    { value: '', label: 'All Cities' },
    ...filters.cities.map((city) => ({ value: city, label: city })),
  ];

  const brandOptions = [
    { value: '', label: 'All Brands' },
    ...filters.brands.map((brand) => ({ value: brand, label: brand })),
  ];

  const sortOptions = [
    { value: 'price', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'city', label: 'City (A-Z)' },
    { value: 'city-desc', label: 'City (Z-A)' },
    { value: 'brand', label: 'Brand (A-Z)' },
    { value: 'brand-desc', label: 'Brand (Z-A)' },
  ];

  const handleSortChange = (selected: any) => {
    if (selected?.value.includes('-desc')) {
      setSortBy(selected.value.split('-')[0]);
      setSortOrder('desc');
    } else {
      setSortBy(selected?.value || 'price');
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">Rental Cars</h1>
          <p className="text-dark-600">Find the perfect car for your journey</p>
        </div>

        {/* Filters and Sorting */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-dark-900">Filters & Sort</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                City
              </label>
              <Select
                options={cityOptions}
                value={cityOptions.find((opt) => opt.value === selectedCity)}
                onChange={(selected) => setSelectedCity(selected?.value || '')}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Brand
              </label>
              <Select
                options={brandOptions}
                value={brandOptions.find((opt) => opt.value === selectedBrand)}
                onChange={(selected) => setSelectedBrand(selected?.value || '')}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select brand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Sort By
              </label>
              <Select
                options={sortOptions}
                value={sortOptions.find(
                  (opt) => opt.value === `${sortBy}${sortOrder === 'desc' ? '-desc' : ''}`
                )}
                onChange={handleSortChange}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Sort by"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCity('');
                  setSelectedBrand('');
                  setSortBy('price');
                  setSortOrder('asc');
                }}
                className="w-full px-4 py-2 bg-dark-100 text-dark-700 rounded-lg font-semibold hover:bg-dark-200 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-dark-600">Loading cars...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-dark-600 mb-2">No cars found</p>
            <p className="text-dark-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <Link
                key={car.id}
                to={`/car/${car.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
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
                  <div className="absolute top-2 left-2">
                    <AvailabilityBadge availability={car.availability} />
                  </div>
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

                  <div className="flex items-center justify-between mb-3">
                    {car.city && (
                      <div className="flex items-center gap-1 text-sm text-dark-600">
                        <MapPin className="w-4 h-4" />
                        <span>{car.city}</span>
                      </div>
                    )}
                    {!car.primaryImage && (
                      <AvailabilityBadge availability={car.availability} />
                    )}
                  </div>
                  {car.availability?.nextAvailableDate && (
                    <p className="text-xs text-warning-600 mb-2">
                      Available after {new Date(car.availability.nextAvailableDate).toLocaleDateString()}
                    </p>
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
                    Rent Now
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Rent;

