import React from 'react';
import ReadyImage from '../../assets/ready.jpg';

const ReadyTransform = () => {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center">
        {/* Text Content - Left Side */}
        <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
            Ready to Transform Your Business?
          </h2>
          
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Join thousands of businesses that trust Lionsol for<br className="hidden sm:block" /> 
            their operational needs.
          </p>
          
          <div className="flex flex-row justify-center lg:justify-start gap-4">
            <button className="bg-orange-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-sm text-sm sm:text-base transition-colors">
              Request Demo
            </button>
            <button className="bg-white hover:bg-gray-50 text-orange-500 font-medium py-2 px-6 border border-orange-300 rounded-sm text-sm sm:text-base transition-colors">
              Call Us Now
            </button>
          </div>
        </div>

        {/* Image - Right Side */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end">
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
            <img 
              src={ReadyImage} 
              alt="Business transformation" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyTransform;