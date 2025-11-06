import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Select from "react-select";
import { useLazyGetRentalCarsQuery, type Car } from "../services/carApi";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Filter, MapPin, DollarSign, Car as CarIcon } from "lucide-react";
import CarCard from "../components/cars/CarCard";
import CarCardSkeleton from "../components/cars/CarCardSkeleton";
import EmptyState from "../components/common/EmptyState";
import FilterChip from "../components/common/FilterChip";

const Rent = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") || ""
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get("brand") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "asc"
  );

  // Infinite scroll state
  const [page, setPage] = useState(1);
  const [cars, setCars] = useState<Car[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<{
    cities: string[];
    brands: string[];
  }>({ cities: [], brands: [] });
  const [trigger, { isFetching }] = useLazyGetRentalCarsQuery();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Show unavailable cars by default so rented cars are visible
  const [showUnavailable, setShowUnavailable] = useState(true);

  const limit = 9;

  // Fetch a page
  const fetchPage = async (nextPage: number, replace = false) => {
    const { data } = await trigger({
      city: selectedCity || undefined,
      brand: selectedBrand || undefined,
      sortBy,
      sortOrder,
      includeUnavailable: true,
      page: nextPage,
      limit,
    });
    if (!data) return;
    setHasMore(nextPage < data.pagination.totalPages);
    if (replace && data.filters) {
      setFilters({
        cities: data.filters.cities || [],
        brands: data.filters.brands || [],
      });
    }
    setCars((prev) => (replace ? data.cars : [...prev, ...data.cars]));
  };

  // Reset when filters/sort change
  useEffect(() => {
    setPage(1);
    setCars([]);
    setHasMore(true);
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, selectedBrand, sortBy, sortOrder]);

  // IntersectionObserver to load more
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isFetching) {
          const next = page + 1;
          setPage(next);
          fetchPage(next);
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [page, hasMore, isFetching]);

  const cityOptions = [
    { value: "", label: "All Cities" },
    ...filters.cities.map((city) => ({ value: city, label: city })),
  ];

  const brandOptions = [
    { value: "", label: "All Brands" },
    ...filters.brands.map((brand) => ({ value: brand, label: brand })),
  ];

  const sortOptions = [
    { value: "price", label: "Price (Low to High)" },
    { value: "price-desc", label: "Price (High to Low)" },
    { value: "city", label: "City (A-Z)" },
    { value: "city-desc", label: "City (Z-A)" },
    { value: "brand", label: "Brand (A-Z)" },
    { value: "brand-desc", label: "Brand (Z-A)" },
  ];

  const handleSortChange = (selected: any) => {
    if (selected?.value.includes("-desc")) {
      setSortBy(selected.value.split("-")[0]);
      setSortOrder("desc");
    } else {
      setSortBy(selected?.value || "price");
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-section">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-900 mb-3 text-balance">
            Rental Cars
          </h1>
          <p className="text-lg text-dark-600 max-w-2xl">
            Find the perfect car for your journey
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="glass rounded-2xl p-6 md:p-8 space-component relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-dark-900">
                Filters & Sort
              </h2>
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
                  label={`City: ${
                    cityOptions.find((opt) => opt.value === selectedCity)
                      ?.label || selectedCity
                  }`}
                  onRemove={() => setSelectedCity("")}
                />
              )}
              {selectedBrand && (
                <FilterChip
                  label={`Brand: ${
                    brandOptions.find((opt) => opt.value === selectedBrand)
                      ?.label || selectedBrand
                  }`}
                  onRemove={() => setSelectedBrand("")}
                />
              )}
              <button
                onClick={() => {
                  setSelectedCity("");
                  setSelectedBrand("");
                  setSortBy("price");
                  setSortOrder("asc");
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
                onChange={(selected) => setSelectedCity(selected?.value || "")}
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
                onChange={(selected) => setSelectedBrand(selected?.value || "")}
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
                  (opt) =>
                    opt.value ===
                    `${sortBy}${sortOrder === "desc" ? "-desc" : ""}`
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
                  setSelectedCity("");
                  setSelectedBrand("");
                  setSortBy("price");
                  setSortOrder("asc");
                }}
                className="w-full px-4 py-2 bg-gradient-primary hover:bg-gradient-primary-dark text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg"
              >
                Reset Filters
              </button>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-dark-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showUnavailable}
                  onChange={(e) => setShowUnavailable(e.target.checked)}
                />
                Show unavailable cars
              </label>
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        {cars.length === 0 && isFetching ? (
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
              description="We couldn't find any rental cars matching your filters. Try adjusting your search criteria or check back later."
              actionLabel="Clear Filters"
              onAction={() => {
                setSelectedCity("");
                setSelectedBrand("");
                setSortBy("price");
                setSortOrder("asc");
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {(showUnavailable
              ? cars
              : cars.filter((car) => {
                  const status =
                    car.availability?.status ||
                    (car.status as string | undefined);
                  if (status === "RENTED") return false;
                  if (status === "BOOKED_UNTIL") {
                    const next = car.availability?.nextAvailableDate
                      ? new Date(car.availability.nextAvailableDate)
                      : null;
                    if (next) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      next.setHours(0, 0, 0, 0);
                      if (next > today) return false;
                    }
                  }
                  return true;
                })
            ).map((car) => (
              <CarCard key={car.id} car={car} variant="rental" />
            ))}
            {/* Sentinel for infinite scroll */}
            <div ref={loadMoreRef} className="h-1" />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Rent;
