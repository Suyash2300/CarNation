import { Link } from 'react-router-dom';
import { MapPin, Calendar, Fuel, Settings, Users, ChevronRight, Car as CarIcon } from 'lucide-react';
import type { Car } from '../../services/carApi';
import AvailabilityBadge from '../rental/AvailabilityBadge';

interface CarCardProps {
  car: Car;
  variant?: 'rental' | 'sale';
}

const CarCard = ({ car, variant = 'rental' }: CarCardProps) => {
  const imageUrl = car.primaryImage || (car.images && car.images[0]) || '';
  const hasMultipleImages = car.images && car.images.length > 1;
  const price = variant === 'rental' ? car.rentalPrice : car.salePrice;

  return (
    <Link
      to={`/car/${car.id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      {/* Image Section */}
      <div className="relative w-full h-72 overflow-hidden bg-gradient-to-br from-dark-100 to-dark-200">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`${car.brand} ${car.model} ${car.year}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
        {hasMultipleImages && (
          <div className="absolute top-4 right-4 bg-dark-900/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <span>+{car.images.length - 1}</span>
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
      <div className="p-6">
        {/* Title and Year */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-xl font-bold text-dark-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {car.brand} {car.model}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-sm text-dark-600">
            <span className="font-medium">{car.year}</span>
            {car.city && (
              <>
                <span className="text-dark-300">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{car.city}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-4 pb-4 border-b border-dark-100">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary-600">
              ₹{price?.toLocaleString() || 'N/A'}
            </span>
            {variant === 'rental' && (
              <span className="text-sm text-dark-500 font-medium">/day</span>
            )}
          </div>
        </div>

        {/* Car Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {car.fuelType && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold">
              <Fuel className="w-3.5 h-3.5" />
              <span>{car.fuelType}</span>
            </div>
          )}
          {car.transmission && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-700 rounded-lg text-xs font-semibold">
              <Settings className="w-3.5 h-3.5" />
              <span>{car.transmission}</span>
            </div>
          )}
          {car.seats && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success-50 text-success-700 rounded-lg text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{car.seats} Seats</span>
            </div>
          )}
          {variant === 'sale' && car.mileage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-lg text-xs font-semibold">
              <span>{car.mileage.toLocaleString()} km</span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {variant === 'rental' && car.availability?.nextAvailableDate && (
          <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-xs text-warning-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Available after{' '}
                {new Date(car.availability.nextAvailableDate).toLocaleDateString()}
              </span>
            </p>
          </div>
        )}

        {variant === 'sale' && car.seller && (
          <div className="mb-4">
            <p className="text-xs text-dark-500">
              Sold by <span className="font-semibold text-dark-700">{car.seller.name}</span>
            </p>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-4 pt-4 border-t border-dark-100">
          <div className="w-full bg-gradient-primary hover:bg-gradient-primary-dark text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg group-hover:shadow-xl text-center flex items-center justify-center gap-2">
            <span>{variant === 'rental' ? 'Rent Now' : 'View Details'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;

