import React from 'react';
import { Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import Logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#192733] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Content with Vertical Separator */}
        <div className="flex flex-col md:flex-row">
          {/* Left Side: Logo, Quick Links, Products */}
          <div className="md:w-1/2 md:pr-8 flex flex-col">
                            <img src={Logo} alt="logo" className='h-14 w-40 pb-4'/>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Quick Links */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-blue-400">Home</a></li>
                  <li><a href="#" className="hover:text-blue-400">About Us</a></li>
                  <li><a href="#" className="hover:text-blue-400">Schedule a Demo</a></li>
                  <li><a href="#" className="hover:text-blue-400">Terms and Conditions</a></li>
                  <li><a href="#" className="hover:text-blue-400">Privacy and Policy</a></li>
                  <li><a href="#" className="hover:text-blue-400">Customer Testimonial</a></li>
                  <li><a href="#" className="hover:text-blue-400">Help Center</a></li>
                </ul>
              </div>
              
              {/* Products */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-3">Products</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-blue-400">Field Service</a></li>
                  <li><a href="#" className="hover:text-blue-400">Lionsel HR</a></li>
                  <li><a href="#" className="hover:text-blue-400">Lionsel Geo</a></li>
                  <li><a href="#" className="hover:text-blue-400">Elevator AMC</a></li>
                  <li><a href="#" className="hover:text-blue-400">Whatsapp API</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Vertical Separator - Increased Height */}
          <div className="hidden md:block relative mx-8">
            <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-600 h-full"></div>
          </div>
          
          {/* Right Side: Email ID, Corporate Office, Contact Us */}
          <div className="md:w-1/2 md:pl-8 mt-6 md:mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email ID */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Email ID</h3>
                <ul className="space-y-2">
                  <li><a href="mailto:customersupport@lionsol.in" className="hover:text-blue-400">customersupport@lionsol.in</a></li>
                  <li><a href="mailto:software@lionsol.in" className="hover:text-blue-400">software@lionsol.in</a></li>
                </ul>
              </div>
              
              {/* Corporate Office */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Corporate Office</h3>
                <p className="text-sm">
                  Office No 602, Rajavi Arcade,<br />
                  Nr. Gurukul Metro Station,<br />
                  Oppo Swaminaryan Temple,<br />
                  Mennagar, Ahmedabad - 380052,<br />
                  Gujarat, India.
                </p>
              </div>
            </div>
            
            {/* Contact Us */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
              <ul className="space-y-2">
                <li>Toll Free: 91.11.6931.3323</li>
                <li>Monday - Friday</li>
                <li>9:30 AM - 6:30 PM</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Horizontal Separator with Icons */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-[#192733] px-4 flex space-x-4">
              <a href="#" className="hover:text-blue-400">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-400">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-400">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-400">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
       
      </div>
    </footer>
  );
};

export default Footer;