import React from 'react';
import BusinessAppImage from '../../assets/BusinessApp.jpeg';

const BusinessApp = () => {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lionsol One Business App
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your business on the go with our powerful mobile application.
          </p>
        </div>

        {/* Features Section - 4 Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="text-center p-4">
            <img 
              src={BusinessAppImage} 
              alt="Digital Work" 
              className="rounded-lg shadow-md w-24 h-24 mx-auto mb-4 object-cover"
            />
            <div className="text-gray-700 space-y-1">
              <p className="font-semibold">Encourage Field</p>
              <p>Employees to Work</p>
              <p>Digitally</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="text-center p-4">
            <img 
              src={BusinessAppImage} 
              alt="Job Navigation" 
              className="rounded-lg shadow-md w-24 h-24 mx-auto mb-4 object-cover"
            />
            <div className="text-gray-700 space-y-1">
              <p>Help Employee</p>
              <p>to navigate to the</p>
              <p>Job site</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="text-center p-4">
            <img 
              src={BusinessAppImage} 
              alt="Automated Reports" 
              className="rounded-lg shadow-md w-24 h-24 mx-auto mb-4 object-cover"
            />
            <div className="text-gray-700 space-y-1">
              <p>Reports to be</p>
              <p>sent to customer's</p>
              <p>Automate</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="text-center p-4">
            <img 
              src={BusinessAppImage} 
              alt="Time Monitoring" 
              className="rounded-lg shadow-md w-24 h-24 mx-auto mb-4 object-cover"
            />
            <div className="text-gray-700 space-y-1">
              <p>Monitor Work Time</p>
              <p>taken by field</p>
              <p>Employee</p>
            </div>
          </div>
        </div>

        {/* App Download Buttons - Centered */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#" className="block w-full sm:w-auto">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-gray-800 transition">
              <div className="mr-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs">GET IT ON</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </div>
          </a>
          
          <a href="#" className="block w-full sm:w-auto">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-gray-800 transition">
              <div className="mr-3">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.8 2H7.2C5.4 2 4 3.4 4 5.2v13.6C4 20.6 5.4 22 7.2 22h7.6c1.8 0 3.2-1.4 3.2-3.2V5.2C18 3.4 16.6 2 14.8 2zM11 20c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm5-11H6V6h10v3z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default BusinessApp;