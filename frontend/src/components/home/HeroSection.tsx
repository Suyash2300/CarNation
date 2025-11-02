import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import bannerImage from "../../assets/images/banner.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<"rent" | "buy">("rent");

  return (
    <div className="relative bg-gradient-to-br from-dark-900 via-dark-800 to-dark-950 text-white overflow-hidden">
      {/* Banner Image Background */}
      <div className="absolute inset-0">
        <img
          src={bannerImage}
          alt="CarNation Banner"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-800/80 to-dark-900/60"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 z-10">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight font-heading text-white drop-shadow-2xl">
            CarNation: Your Journey
            <br />
            Starts Here
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto drop-shadow-lg">
            Rent the perfect ride or find your next dream car with ease
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/cars?type=rent")}
              className="bg-gradient-primary hover:bg-gradient-primary-dark text-white px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition shadow-lg hover:shadow-glow"
            >
              Rent a Car
            </button>
            <button
              onClick={() => navigate("/cars?type=buy")}
              className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition shadow-lg"
            >
              Buy a Car
            </button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 glass rounded-full shadow-2xl p-2 flex items-center">
            <div className="flex items-center flex-1 px-4">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Location, Pick-up / Return Dates"
                className="flex-1 outline-none text-dark-800 text-sm md:text-base bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-4 border-l border-gray-200">
              <span className="text-dark-800 text-sm font-medium">
                {searchType === "rent" ? "Rent" : "Buy"}
              </span>
              <button
                onClick={() =>
                  setSearchType(searchType === "rent" ? "buy" : "rent")
                }
                className={`w-12 h-6 rounded-full transition ${
                  searchType === "rent" ? "bg-gradient-primary" : "bg-gray-300"
                } relative`}
              >
                <span
                  className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${
                    searchType === "rent" ? "left-0.5" : "left-6"
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
