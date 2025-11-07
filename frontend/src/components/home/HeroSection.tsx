import { useNavigate } from "react-router-dom";
import bannerImage from "../../assets/images/banner.png";
import SearchBar from "./SearchBar";
import Button from "../common/Button";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-br from-dark-900 via-dark-800 to-dark-950 text-white overflow-hidden min-h-[75vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center py-16">
      {/* Banner Image Background */}
      <div className="absolute inset-0">
        <img
          src={bannerImage}
          alt="CarNation Banner"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-800/80 to-dark-900/60"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 z-10 w-full">
        <div className="text-center space-y-6 md:space-y-8 animate-fade-in">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-heading text-white drop-shadow-2xl animate-fade-in-up">
              CarNation: Your Journey
              <br />
              Starts Here
            </h1>
            <p
              className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Rent the perfect ride or find your next dream car with ease
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4 pt-4 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/rent")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
            >
              Rent a Car
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/used-cars")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
            >
              Buy a Car
            </Button>
          </div>

          {/* Functional Search Bar */}
          <div
            className="animate-fade-in-up mt-6"
            style={{ animationDelay: "0.6s" }}
          >
            <SearchBar />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <ChevronDown className="w-6 h-6 text-white/80" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
