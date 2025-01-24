import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa"; // Importing social media icons

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-black text-white py-16 mt-16 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {/* Column 1: About */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-200">About Us</h3>
            <p className="text-sm text-gray-300">
              We offer top-notch home services that you can trust. From repairs to consultations, we've got the best professionals ready to help you.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-200">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-300 hover:text-yellow-500 transition duration-300 ease-in-out transform hover:scale-105">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-gray-300 hover:text-yellow-500 transition duration-300 ease-in-out transform hover:scale-105">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-300 hover:text-yellow-500 transition duration-300 ease-in-out transform hover:scale-105">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-300 hover:text-yellow-500 transition duration-300 ease-in-out transform hover:scale-105">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-200">Contact</h3>
            <p className="text-sm text-gray-300">1234 Street Name, City, State</p>
            <p className="text-sm text-gray-300">Email: support@example.com</p>
            <p className="text-sm text-gray-300">Phone: +1 (123) 456-7890</p>
          </div>

          {/* Column 4: Social Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-200">Follow Us</h3>
            <div className="flex space-x-8">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-yellow-500 transition duration-300 ease-in-out transform hover:scale-110"
              >
                <FaFacebookF className="text-3xl" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-yellow-500 transition duration-300 ease-in-out transform hover:scale-110"
              >
                <FaTwitter className="text-3xl" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-yellow-500 transition duration-300 ease-in-out transform hover:scale-110"
              >
                <FaInstagram className="text-3xl" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-yellow-500 transition duration-300 ease-in-out transform hover:scale-110"
              >
                <FaLinkedinIn className="text-3xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Line and Bottom Text */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-r from-transparent via-gray-700 to-transparent h-2"></div>
        <div className="mt-12 border-t border-gray-600 pt-8 text-center">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} FixNgo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
