import { Link } from "react-router-dom";
import {
  MapPin,
  Fuel,
  Settings,
  Users,
  ChevronRight,
  Car as CarIcon,
  CheckCircle,
} from "lucide-react";
import type { Car } from "../../services/carApi";
import AvailabilityBadge from "../rental/AvailabilityBadge";

interface CarCardProps {
  car: Car;
  variant?: "rental" | "sale";
}

const CarCard = ({ car, variant = "rental" }: CarCardProps) => {
  // Validate car data and provide safe defaults
  if (!car || !car.id) {
    return null;
  }

  // Safely handle images array - create a copy to avoid frozen array issues
  const imagesArray =
    car.images && Array.isArray(car.images) ? [...car.images] : [];
  const imageUrl =
    car.primaryImage || (imagesArray.length > 0 ? imagesArray[0] : "") || "";
  const hasMultipleImages = imagesArray.length > 1;
  const price =
    variant === "rental" ? car.rentalPrice || 0 : car.salePrice || 0;

  // Safe defaults for car properties
  const brand = car.brand || "Unknown";
  const model = car.model || "Model";
  const year = car.year || new Date().getFullYear();
  const fuelType = car.fuelType || null;
  const transmission = car.transmission || null;
  const seats = car.seats || null;
  const city = car.city || null;
  const mileage = car.mileage || null;

  return (
    <Link
      to={`/car/${car.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-dark-200/60 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-700 dark:bg-dark-800"
    >
      {/* Image Section */}
      <div className="relative w-full h-52 sm:h-56 md:h-60 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-800 dark:to-dark-900">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`${brand} ${model} ${year}`}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-800 dark:to-dark-900">
            <div className="text-center">
              <CarIcon className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 dark:text-dark-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 dark:text-dark-500">
                No Image Available
              </p>
            </div>
          </div>
        )}

        {/* Badge Overlays */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2">
            {variant === "rental" && car.availability && (
              <AvailabilityBadge availability={car.availability} />
            )}
            {variant === "sale" && car.status && (
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md shadow-lg ${
                  car.status === "AVAILABLE"
                    ? "bg-emerald-500/95 text-white"
                    : car.status === "SOLD"
                    ? "bg-slate-700/95 text-white"
                    : "bg-amber-500/95 text-white"
                }`}
              >
                {car.status}
              </span>
            )}
          </div>

          {/* Image Count Badge */}
          {hasMultipleImages && imagesArray.length > 0 && (
            <div className="bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
              +{imagesArray.length - 1}
            </div>
          )}
        </div>

        {/* View Details Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="translate-y-6 rounded-xl bg-white/98 dark:bg-dark-800/98 px-6 py-3.5 font-bold text-dark-900 dark:text-white shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 flex items-center gap-2.5 border border-dark-200/20">
            View Details
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        {/* Title and Price Row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1.5 min-h-[2.5rem] line-clamp-2 text-base sm:text-lg font-bold leading-tight text-dark-900 dark:text-white transition-colors group-hover:text-primary-600">
              {brand} {model}
            </h3>
            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600 dark:text-dark-300">
              <span className="font-semibold bg-slate-100 dark:bg-dark-700 px-2 py-0.5 rounded">
                {year}
              </span>
              {city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                  <span className="truncate max-w-[100px] sm:max-w-[150px]">
                    {city}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black leading-none tracking-tight text-primary-600">
                ₹{price > 0 ? price.toLocaleString() : "N/A"}
              </span>
            </div>
            {variant === "rental" && price > 0 && (
              <span className="text-xs font-semibold text-slate-500 dark:text-dark-400 mt-0.5">
                per day
              </span>
            )}
          </div>
        </div>

        {/* Car Features - 2x2 Grid */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          {fuelType && (
            <div className="flex items-center gap-1.5 rounded-lg border-2 border-primary-200 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800 px-2.5 py-2 text-xs font-bold text-primary-700 dark:text-primary-400">
              <Fuel className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{fuelType}</span>
            </div>
          )}
          {transmission && (
            <div className="flex items-center gap-1.5 rounded-lg border-2 border-slate-200 bg-slate-50 dark:bg-dark-700 dark:border-dark-600 px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-dark-200">
              <Settings className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{transmission}</span>
            </div>
          )}
          {seats && (
            <div className="flex items-center gap-1.5 rounded-lg border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-2.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{seats} seats</span>
            </div>
          )}
          {variant === "rental" && car.availability?.nextAvailableDate && (() => {
            const nextDate = new Date(car.availability.nextAvailableDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            nextDate.setHours(0, 0, 0, 0);
            
            // Only show if the date is in the future
            if (nextDate > today) {
              return (
                <div className="flex items-center gap-1.5 rounded-lg border-2 border-emerald-200 bg-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 px-2.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {nextDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              );
            }
            return null;
          })()}
          {variant === "sale" && mileage && (
            <div className="flex items-center gap-1.5 rounded-lg border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 px-2.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-400">
              <span className="truncate">{mileage.toLocaleString()} km</span>
            </div>
          )}
        </div>

        {/* CTA Button - Always at bottom */}
        <div className="mt-auto pt-2">
          <div className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:from-primary-700 hover:to-primary-600 group-hover:scale-[1.02]">
            <span>{variant === "rental" ? "Rent Now" : "View Details"}</span>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
