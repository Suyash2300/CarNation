import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Search } from "lucide-react";
import Input from "../common/Input";
import Button from "../common/Button";

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void;
}

interface SearchParams {
  city?: string;
  searchType: "rent" | "buy";
  startDate?: string;
  endDate?: string;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<"rent" | "buy">("rent");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = () => {
    const params: SearchParams = {
      city: city || undefined,
      searchType,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    if (onSearch) {
      onSearch(params);
    } else {
      // Default navigation behavior
      const searchParams = new URLSearchParams();
      if (city) searchParams.set("city", city);
      if (startDate) searchParams.set("startDate", startDate);
      if (endDate) searchParams.set("endDate", endDate);

      navigate(
        searchType === "rent"
          ? `/rent?${searchParams.toString()}`
          : `/used-cars?${searchParams.toString()}`
      );
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto mt-8 glass rounded-2xl shadow-2xl p-4 md:p-6">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          searchType === "rent" ? "md:grid-cols-4" : "md:grid-cols-3"
        } gap-4 sm:gap-5 items-end`}
      >
        {/* City Input */}
        <div className="min-w-0">
          <div className="relative">
            <label className="block text-sm font-medium text-dark-900 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-dark-200 focus:border-primary-600 focus:outline-none transition bg-white text-dark-900"
              />
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div className="min-w-0">
          <div className="relative">
            <label className="block text-sm font-medium text-dark-900 mb-2">
              {searchType === "rent" ? "Pick-up Date" : "Available From"}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-dark-200 focus:border-primary-600 focus:outline-none transition bg-white text-dark-900"
              />
            </div>
          </div>
        </div>

        {/* End Date (only for rentals) */}
        {searchType === "rent" && (
          <div className="min-w-0">
            <div className="relative">
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Return Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-dark-200 focus:border-primary-600 focus:outline-none transition bg-white text-dark-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Search Button & Type Toggle */}
        <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <span className="text-sm text-dark-600 font-medium">
              {searchType === "rent" ? "Rent" : "Buy"}
            </span>
            <button
              onClick={() =>
                setSearchType(searchType === "rent" ? "buy" : "rent")
              }
              className={`w-12 h-6 rounded-full transition relative ${
                searchType === "rent" ? "bg-primary-600" : "bg-dark-300"
              }`}
              aria-label={`Switch to ${searchType === "rent" ? "buy" : "rent"}`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 ${
                  searchType === "rent" ? "left-0.5" : "left-6"
                }`}
              />
            </button>
          </div>
          <Button
            variant="primary"
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2 py-3"
            size="lg"
          >
            <Search className="w-5 h-5" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
