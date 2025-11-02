import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-dark-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-primary-500 mb-4">
              CarNation
            </h3>
            <p className="text-gray-400">Your Journey Your Way</p>
            <div className="flex gap-4 mt-4">
              <Facebook className="w-6 h-6 hover:text-primary-400 cursor-pointer transition" />
              <Instagram className="w-6 h-6 hover:text-primary-400 cursor-pointer transition" />
              <Twitter className="w-6 h-6 hover:text-primary-400 cursor-pointer transition" />
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
            <p className="text-gray-400">
              © 2024 CarNation. All rights reserved.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Newsletter email"
                className="px-4 py-2 rounded-l-lg bg-slate-700 text-white outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="bg-gradient-primary hover:bg-gradient-primary-dark px-6 py-2 rounded-r-lg font-semibold transition shadow-soft hover:shadow-glow">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

