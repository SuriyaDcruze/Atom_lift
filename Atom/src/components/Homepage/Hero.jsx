import BusinessApp from "../../assets/BusinessApp.png";

const Hero = () => {
  return (
    <section className="bg-[#FEF4EA] text-black py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Main headline and CTA */}
          <div className="space-y-6 mt-8 lg:mt-0 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Transform Your Business with Lionsol Cloud Solutions
            </h1>
            <p className="text-lg sm:text-xl text-gray-800 max-w-xl mx-auto lg:mx-0">
              Streamline operations, boost productivity, and drive growth with our comprehensive cloud-based software suite.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-md mx-auto lg:mx-0">
              <button className="w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600 font-semibold py-3 px-6 rounded-lg transition duration-300">
                Get Pricing
              </button>
              <button className="w-full sm:w-auto bg-white border-2 text-orange-500 border-orange-500 hover:bg-orange-100 font-semibold py-3 px-6 rounded-lg transition duration-300">
                Start Free Trial
              </button>
            </div>
          </div>

          {/* Image section */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden mt-8 lg:mt-0">
            <img 
              src={BusinessApp}
              alt="Business team collaborating with cloud technology"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
