import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Hero from './Hero';
import BusinessApp from './BusinessApp';
import LionsolProduct from './LionsolProduct';
import PrimeCustomer from './PrimeCustomer';
import WhyChoose from './WhyChoose';
import ReadyTransform from './ReadyTransform';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar Component */}
      <Navbar />
      {/* Main Content */}
      <main className="flex-grow">
            <Hero />
            <BusinessApp />
            <LionsolProduct />
            <PrimeCustomer />
            <WhyChoose />
            <ReadyTransform />

        
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Home;