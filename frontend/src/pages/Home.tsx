import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Shield, Clock, Award, MapPin, Calendar, ChevronRight, Facebook, Instagram, Twitter, Menu, X } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';

const Home = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchType, setSearchType] = useState<'rent' | 'buy'>('rent');

  const features = [
    {
      icon: <Car className="w-12 h-12" />,
      title: 'Wide Selection',
      description: 'Choose from hundreds of vehicles ranging from economy to luxury cars',
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Fully Insured',
      description: 'All vehicles come with comprehensive insurance coverage for your peace of mind',
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: '24/7 Support',
      description: 'Our customer service team is available round the clock to assist you',
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: 'Best Prices',
      description: 'Competitive rates with no hidden fees. Get the best value for your money',
    },
  ];

  const popularCars = [
    {
      name: 'Tesla Model 3',
      type: 'Electric Sedan',
      price: '$89/day',
      rating: 4.9,
      features: ['Auto Pilot', '350mi Range', 'Premium Interior'],
    },
    {
      name: 'BMW X5',
      type: 'Luxury SUV',
      price: '$129/day',
      rating: 4.8,
      features: ['All-Wheel Drive', 'Spacious', 'Premium Sound'],
    },
    {
      name: 'Toyota Camry',
      type: 'Sedan',
      price: '$49/day',
      rating: 4.7,
      features: ['Fuel Efficient', 'Reliable', 'Comfortable'],
    },
    {
      name: 'Mercedes-Benz C-Class',
      type: 'Luxury Sedan',
      price: '$99/day',
      rating: 4.9,
      features: ['Luxury Interior', 'Advanced Tech', 'Smooth Ride'],
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Business Traveler',
      comment: 'Amazing service! The booking process was seamless and the car was in perfect condition.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Weekend Explorer',
      comment: 'Great prices and excellent customer support. Highly recommend CarNation for road trips!',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Daily Commuter',
      comment: "I've been using CarNation for months now. Reliable, affordable, and always on time.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-light">
      {/* Navigation */}
      <nav className="bg-dark text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition">
              CarNation
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <Link to="/cars?type=rent" className="text-primary border-b-2 border-primary pb-1 hover:text-primary/80 transition">
                Rent
              </Link>
              <Link to="/cars?type=buy" className="hover:text-primary transition">
                Buy
              </Link>
              {user?.role === 'SELLER' || user?.role === 'ADMIN' ? (
                <Link to="/sell" className="hover:text-primary transition">
                  Sell Your Car
                </Link>
              ) : null}
              <Link to="/about" className="hover:text-primary transition">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-primary transition">
                Contact
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm">👤 {user?.name}</span>
                  <Link
                    to="/dashboard"
                    className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  to="/signin"
                  className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-dark/95 px-4 py-4 space-y-3">
            <Link to="/cars?type=rent" className="block hover:text-primary transition">
              Rent
            </Link>
            <Link to="/cars?type=buy" className="block hover:text-primary transition">
              Buy
            </Link>
            {user?.role === 'SELLER' || user?.role === 'ADMIN' ? (
              <Link to="/sell" className="block hover:text-primary transition">
                Sell Your Car
              </Link>
            ) : null}
            <Link to="/about" className="block hover:text-primary transition">
              About Us
            </Link>
            <Link to="/contact" className="block hover:text-primary transition">
              Contact
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="block hover:text-primary transition">
                Dashboard
              </Link>
            ) : (
              <Link to="/signin" className="block hover:text-primary transition">
                Login / Sign Up
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-dark via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight font-heading">
              CarNation: Your Journey<br />
              Starts Here
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Rent the perfect ride or find your next dream car with ease
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => navigate('/cars?type=rent')}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition shadow-lg"
              >
                Rent a Car
              </button>
              <button
                onClick={() => navigate('/cars?type=buy')}
                className="bg-white hover:bg-gray-100 text-primary px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition shadow-lg"
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
                  className="flex-1 outline-none text-dark text-sm md:text-base bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 px-4 border-l border-gray-200">
                <span className="text-dark text-sm font-medium">{searchType === 'rent' ? 'Rent' : 'Buy'}</span>
                <button
                  onClick={() => setSearchType(searchType === 'rent' ? 'buy' : 'rent')}
                  className={`w-12 h-6 rounded-full transition ${
                    searchType === 'rent' ? 'bg-primary' : 'bg-gray-300'
                  } relative`}
                >
                  <span
                    className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${
                      searchType === 'rent' ? 'left-0.5' : 'left-6'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-dark mb-12 font-heading">
            Why Choose CarNation?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-smooth"
              >
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-dark mb-2">{feature.title}</h3>
                <p className="text-dark/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cars Section */}
      <section className="py-16 md:py-24 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark font-heading">Popular Vehicles</h2>
            <button className="text-primary hover:text-primary/80 font-semibold flex items-center gap-2 transition">
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
                      <h3 className="text-xl font-bold text-dark">{car.name}</h3>
                      <p className="text-dark/60 text-sm">{car.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-accent">⭐</span>
                      <span className="text-sm font-semibold text-dark">{car.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {car.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">{car.price}</span>
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-dark mb-12 font-heading">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass rounded-xl p-6 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-accent">⭐</span>
                  ))}
                </div>
                <p className="text-dark/80 mb-4 italic">"{testimonial.comment}"</p>
                <div>
                  <p className="font-bold text-dark">{testimonial.name}</p>
                  <p className="text-sm text-dark/60">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-heading">Ready to Hit the Road?</h2>
          <p className="text-xl mb-8 text-white/90">Join thousands of satisfied customers and start your journey today</p>
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition shadow-xl"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition shadow-xl"
            >
              Get Started Now
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-4">CarNation</h3>
              <p className="text-gray-400">Your Journey Your Way</p>
              <div className="flex gap-4 mt-4">
                <Facebook className="w-6 h-6 hover:text-primary cursor-pointer transition" />
                <Instagram className="w-6 h-6 hover:text-primary cursor-pointer transition" />
                <Twitter className="w-6 h-6 hover:text-primary cursor-pointer transition" />
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/cars?type=rent" className="hover:text-white transition">
                    Rent
                  </Link>
                </li>
                <li>
                  <Link to="/cars?type=buy" className="hover:text-white transition">
                    Buy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/sell" className="hover:text-white transition">
                    Sell
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-white transition">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/contact" className="hover:text-white transition">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400">© 2024 CarNation. All rights reserved.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Newsletter email"
                  className="px-4 py-2 rounded-l-lg bg-slate-700 text-white outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-r-lg font-semibold transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
