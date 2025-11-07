import { useNavigate } from "react-router-dom";
import { ChevronRight, Car as CarIcon } from "lucide-react";
import { useGetRentalCarsQuery } from "../../services/carApi";
import CarCard from "../cars/CarCard";
import CarCardSkeleton from "../cars/CarCardSkeleton";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";

const PopularCarsSection = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetRentalCarsQuery({
    limit: 4,
    sortBy: 'price',
    sortOrder: 'asc',
  });

  const cars = data?.cars || [];
  const displayedCars = cars; // Show all 4 cars fetched

  const handleViewAll = () => {
    navigate('/rent');
  };

  return (
    <section className="py-12 md:py-16 bg-light-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 md:mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 font-heading mb-2">
              Popular Vehicles
            </h2>
            <p className="text-dark-600">
              Most booked cars on our platform
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleViewAll}
            className="hidden md:flex items-center gap-2"
          >
            View All <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <CarCardSkeleton key={index} />
            ))}
          </div>
        ) : displayedCars.length === 0 ? (
          <div className="glass rounded-2xl">
            <EmptyState
              icon={CarIcon}
              title="No popular cars available"
              description="Check back soon for featured vehicles"
              actionLabel="Browse All Cars"
              onAction={handleViewAll}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {displayedCars.map((car) => (
                <CarCard key={car.id} car={car} variant="rental" />
              ))}
            </div>
            <div className="flex justify-center mt-6 md:hidden">
              <Button
                variant="primary"
                onClick={handleViewAll}
                className="flex items-center gap-2"
              >
                View All Cars <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PopularCarsSection;

