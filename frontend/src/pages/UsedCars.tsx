import { useState } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { useGetUsedCarsQuery, type Car } from '../services/carApi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Filter, MapPin, DollarSign, Car as CarIcon } from 'lucide-react';
import CarCard from '../components/cars/CarCard';
import CarCardSkeleton from '../components/cars/CarCardSkeleton';
import EmptyState from '../components/common/EmptyState';
import FilterChip from '../components/common/FilterChip';

const UsedCars = () => {
  // Filter states
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useGetUsedCarsQuery({
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-section">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-900 mb-3 text-balance">
            Used Cars
          </h1>
          <p className="text-lg text-dark-600 max-w-2xl">
            Browse quality pre-owned vehicles
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="glass rounded-2xl p-6 md:p-8 space-component">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-dark-900">Filters & Sort</h2>
              {(selectedCity || selectedBrand) && (
                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                  {(selectedCity ? 1 : 0) + (selectedBrand ? 1 : 0)}
                </span>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {(selectedCity || selectedBrand) && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-dark-200">
              {selectedCity && (
                <FilterChip
                  label={`City: ${cityOptions.find((opt) => opt.value === selectedCity)?.label || selectedCity}`}
                  onRemove={() => setSelectedCity('')}
                />
              )}
              {selectedBrand && (
                <FilterChip
                  label={`Brand: ${brandOptions.find((opt) => opt.value === selectedBrand)?.label || selectedBrand}`}
                  onRemove={() => setSelectedBrand('')}
                />
              )}
              <button
                onClick={() => {
                  setSelectedCity('');
                  setSelectedBrand('');
                  setSortBy('price');
                  setSortOrder('asc');
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold underline"
              >
                Clear All
              </button>
            </div>
          )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CarCardSkeleton key={index} />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="glass rounded-2xl">
            <EmptyState
              icon={CarIcon}
              title="No cars available"
              description="We couldn't find any used cars matching your filters. Try adjusting your search criteria or check back later."
              actionLabel="Clear Filters"
              onAction={() => {
                setSelectedCity('');
                setSelectedBrand('');
                setSortBy('price');
                setSortOrder('asc');
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} variant="sale" />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UsedCars;

