import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-dark-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-primary-500 mb-4">
              CarNation
            </h3>
            <p className="text-gray-400 mb-4">Your Journey Your Way</p>
            <div className="flex gap-4">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Twitter, label: "Twitter" },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/rent" className="hover:text-white transition">
                  Rent a Car
                </Link>
              </li>
              <li>
                <Link to="/used-cars" className="hover:text-white transition">
                  Buy a Car
                </Link>
              </li>
              <li>
                <Link to="/sell" className="hover:text-white transition">
                  Sell Your Car
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">
              © 2024 CarNation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
