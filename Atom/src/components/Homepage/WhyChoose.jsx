import React from 'react';
import FeatureIcon from '../../assets/BusinessApp.jpeg';

const WhyChoose = () => {
  const features = [
    {
      title: "Cloud-Based",
      description: "Access your data anytime, anywhere with our secure cloud platform."
    },
    {
      title: "Fully Customizable",
      description: "Tailor our solutions to fit your unique business requirements."
    },
    {
      title: "Enterprise Security",
      description: "Your data is protected with industry-leading security measures."
    },
    {
      title: "Real-time Analytics",
      description: "Make data-driven decisions with powerful reporting tools."
    },
    {
      title: "Mobile Friendly",
      description: "Full functionality across all devices for maximum flexibility."
    },
    {
      title: "Remote Dedicated Training & Support",
      description: "Get expert assistance whenever you need it with our dedicated support team."
    }
  ];

  return (
    <div className="bg-[#192733] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Why Choose Lionsol?
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Powerful features designed for business success
          </p>
        </div>

        {/* Features Grid - Title and Icon Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-md p-6">
              {/* Icon and Title - Side by Side */}
              <div className="flex items-center mb-3">
                <img 
                  src={FeatureIcon} 
                  alt={feature.title} 
                  className="w-12 h-12 object-contain mr-4"
                />
                <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
              </div>
              
              {/* Description Below */}
              <p className="text-gray-600 pl-16">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChoose;