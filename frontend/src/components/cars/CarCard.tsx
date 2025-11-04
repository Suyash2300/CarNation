import { Link } from 'react-router-dom';
import { MapPin, Calendar, Fuel, Settings, Users, ChevronRight, Car as CarIcon } from 'lucide-react';
import type { Car } from '../../services/carApi';
import AvailabilityBadge from '../rental/AvailabilityBadge';

interface CarCardProps {
  car: Car;
  variant?: 'rental' | 'sale';
}

const CarCard = ({ car, variant = 'rental' }: CarCardProps) => {
  // Validate car data and provide safe defaults
  if (!car || !car.id) {
    return null;
  }

  // Safely handle images array - create a copy to avoid frozen array issues
  const imagesArray = car.images && Array.isArray(car.images) ? [...car.images] : [];
  const imageUrl = car.primaryImage || (imagesArray.length > 0 ? imagesArray[0] : '') || '';
  const hasMultipleImages = imagesArray.length > 1;
  const price = variant === 'rental' ? (car.rentalPrice || 0) : (car.salePrice || 0);
  
  // Safe defaults for car properties
  const brand = car.brand || 'Unknown';
  const model = car.model || 'Model';
  const year = car.year || new Date().getFullYear();
  const fuelType = car.fuelType || null;
  const transmission = car.transmission || null;
  const seats = car.seats || null;
  const city = car.city || null;
  const mileage = car.mileage || null;

  return (
    <Link
      to={`/car/${car.id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative w-full h-48 min-h-[12rem] overflow-hidden bg-gradient-to-br from-dark-100 to-dark-200">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`${brand} ${model} ${year}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <CarIcon className="w-16 h-16 text-dark-300 mx-auto mb-2" />
              <p className="text-sm text-dark-400">No Image Available</p>
            </div>
          </div>
        )}

        {/* Badge Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {variant === 'rental' && car.availability && (
            <AvailabilityBadge availability={car.availability} />
          )}
          {variant === 'sale' && car.status && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                car.status === 'AVAILABLE'
                  ? 'bg-success-500/90 text-white'
                  : car.status === 'SOLD'
                  ? 'bg-dark-600/90 text-white'
                  : 'bg-warning-500/90 text-white'
              }`}
            >
              {car.status}
            </span>
          )}
        </div>

        {/* Image Count Badge */}
        {hasMultipleImages && imagesArray.length > 0 && (
          <div className="absolute top-4 right-4 bg-dark-900/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <span>+{imagesArray.length - 1}</span>
          </div>
        )}

        {/* View Details Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full font-semibold text-dark-900 flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Details
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 min-h-0">
        {/* Title and Price Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-dark-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
              {brand} {model}
            </h3>
            <div className="flex items-center gap-2 text-xs text-dark-600">
              <span className="font-medium">{year}</span>
              {city && (
                <>
                  <span className="text-dark-300">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{city}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary-600">
                ₹{price > 0 ? price.toLocaleString() : 'N/A'}
              </span>
              {variant === 'rental' && price > 0 && (
                <span className="text-xs text-dark-500 font-medium">/day</span>
              )}
            </div>
          </div>
        </div>

        {/* Car Features */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {fuelType && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
              <Fuel className="w-3 h-3" />
              <span>{fuelType}</span>
            </div>
          )}
          {transmission && (
            <div className="flex items-center gap-1 px-2 py-1 bg-accent-50 text-accent-700 rounded-md text-xs font-medium">
              <Settings className="w-3 h-3" />
              <span>{transmission}</span>
            </div>
          )}
          {seats && (
            <div className="flex items-center gap-1 px-2 py-1 bg-success-50 text-success-700 rounded-md text-xs font-medium">
              <Users className="w-3 h-3" />
              <span>{seats}</span>
            </div>
          )}
          {variant === 'sale' && mileage && (
            <div className="flex items-center gap-1 px-2 py-1 bg-secondary-50 text-secondary-700 rounded-md text-xs font-medium">
              <span>{mileage.toLocaleString()} km</span>
            </div>
          )}
        </div>

        {/* Additional Info - Compact - Always reserve space */}
        <div className="mb-2 min-h-[2.5rem] flex items-end">
          {variant === 'rental' && car.availability?.nextAvailableDate && (
            <div className="p-2 bg-warning-50 border border-warning-200 rounded-md w-full">
              <p className="text-xs text-warning-700 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="line-clamp-1">
                  Available {new Date(car.availability.nextAvailableDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              </p>
            </div>
          )}

          {variant === 'sale' && car.seller && (
            <p className="text-xs text-dark-500 line-clamp-1">
              By <span className="font-semibold text-dark-700">{car.seller.name}</span>
            </p>
          )}
        </div>

        {/* CTA Button - Always at bottom */}
        <div className="mt-auto pt-2">
          <div className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md group-hover:shadow-lg text-center flex items-center justify-center gap-2 text-sm">
            <span>{variant === 'rental' ? 'Rent Now' : 'View Details'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;

