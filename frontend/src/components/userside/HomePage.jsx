import React from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer';
import Navbar from './Navbar';

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-white pt-20"> {/* Added pt-20 for spacing */}
        {/* Top section */}
        <div className="flex flex-1 bg-white">
          {/* Image on the left side */}
          <div className="w-1/2 relative flex justify-center">
            <img
              src="/images/landing.png"
              alt="Top Image"
              className="w-3/4 h-auto object-contain mx-auto"
            />
          </div>

          {/* Content on the right side */}
          <div className="w-1/2 flex items-center justify-center p-8">
            <div className="max-w-lg space-y-4">
              <motion.h1
                className="text-4xl font-extrabold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                Looking for Experts?
                <br /> <span className="text-4xl font-semibold">Book trusted professionals for every task.</span>
              </motion.h1>
              <motion.p
                className="text-sm text-gray-600 leading-relaxed text-center"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
              >
                From home repairs to professional consultations, we’ve got you covered. 
                Whether you need help with maintenance, renovations, or expert advice, 
                our network of professionals is here to assist you every step of the way.
              </motion.p>
              <button className="px-6 py-2 bg-black text-white text-md font-semibold rounded-full shadow-md hover:bg-gray-800 transition duration-300">
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-1 bg-white mb-12">
          {/* Why Choose Us Section */}
          <div className="w-1/2 flex items-center justify-center p-8 bg-white">
            <div className="max-w-md space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Why Choose Us?</h2>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                <li>Experienced and trusted professionals.</li>
                <li>Wide range of services tailored to your needs.</li>
                <li>Seamless booking process with upfront pricing.</li>
                <li>24/7 customer support to assist you anytime.</li>
                <li>Guaranteed satisfaction with every service.</li>
              </ul>
            </div>
          </div>

          {/* Image on the right side */}
          <div className="w-1/2 relative flex justify-center">
            <img
              src="/images/landing2.png"
              alt="Bottom Image"
              className="w-3/4 h-auto object-contain mx-auto"
            />
          </div>
        </div>

        {/* Featured Section with Raw Images */}
        <div className="bg-white py-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">Featured</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 px-8">
            {/* Image 1 */}
            <img
              src="/images/0.png"
              alt="Featured 1"
            />
            {/* Image 2 */}
            <img
              src="/images/1.png"
              alt="Featured 2"
            />
            {/* Image 3 */}
            <img
              src="/images/2.png"
              alt="Featured 3"
            />
            {/* Image 4 */}
            <img
              src="/images/3.png"
              alt="Featured 4"
            />
          </div>
        </div>
        <br />
        <br />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
