import { Car, ChevronRight } from "lucide-react";

const PopularCarsSection = () => {
  const popularCars = [
    {
      name: "Tesla Model 3",
      type: "Electric Sedan",
      price: "$89/day",
      rating: 4.9,
      features: ["Auto Pilot", "350mi Range", "Premium Interior"],
    },
    {
      name: "BMW X5",
      type: "Luxury SUV",
      price: "$129/day",
      rating: 4.8,
      features: ["All-Wheel Drive", "Spacious", "Premium Sound"],
    },
    {
      name: "Toyota Camry",
      type: "Sedan",
      price: "$49/day",
      rating: 4.7,
      features: ["Fuel Efficient", "Reliable", "Comfortable"],
    },
    {
      name: "Mercedes-Benz C-Class",
      type: "Luxury Sedan",
      price: "$99/day",
      rating: 4.9,
      features: ["Luxury Interior", "Advanced Tech", "Smooth Ride"],
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-light-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-900 font-heading">
            Popular Vehicles
          </h2>
          <button className="text-primary-600 hover:text-primary-500 font-semibold flex items-center gap-2 transition">
            View All <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCars.map((car, index) => (
            <div
              key={index}
              className="glass rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-smooth cursor-pointer"
            >
              <div className="h-48 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                <Car className="w-24 h-24 text-white opacity-80" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-dark-900">{car.name}</h3>
                    <p className="text-dark-600 text-sm">{car.type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-accent">⭐</span>
                    <span className="text-sm font-semibold text-dark-900">
                      {car.rating}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {car.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {car.price}
                  </span>
                  <button className="bg-gradient-primary hover:bg-gradient-primary-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-soft hover:shadow-glow">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCarsSection;

