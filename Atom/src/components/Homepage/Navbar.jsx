import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.png';

const Navbar = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  return (
    <nav className="bg-transparent absolute w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img className="h-8" src={Logo} alt="Logo" />
          </div>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {/* All Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="text-gray-800 hover:text-gray-900 flex items-center focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isProductsOpen}
              >
                All Products
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProductsOpen && (
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Product 1</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Product 2</a>
                </div>
              )}
            </div>

            {/* Help Centre Link */}
            <a href="#" className="text-gray-800 hover:text-gray-900">
              Help Centre
            </a>

            {/* Testimonial Link */}
            <a href="#" className="text-gray-800 hover:text-gray-900">
              Testimonial
            </a>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-800 hover:text-gray-900 border-t-2 border-transparent md:border-none md:border-t-0 rounded-lg p-2"
              style={{ borderTopColor: 'transparent' }}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
