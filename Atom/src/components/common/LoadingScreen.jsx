"use client";
import logo from '../../assets/logo.png';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px), radial-gradient(circle at 75% 75%, #6366f1 1px, transparent 1px)`,
            backgroundSize: "80px 80px, 60px 60px",
          }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute animate-float opacity-30"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          >
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg"></div>
          </div>
        ))}
      </div>

      {/* Expanding rings animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={`ring-${i}`}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              animationDelay: `${i * 1.2}s`,
            }}
          >
            <div
              className="border-2 border-blue-300/40 rounded-full animate-ping"
              style={{
                width: `${120 + i * 60}px`,
                height: `${120 + i * 60}px`,
                animationDuration: `${4 + i * 0.8}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-8 max-w-lg">
        {/* Logo container with enhanced animations */}
        <div className="transform transition-all duration-1500 ease-out opacity-100 translate-y-0 mb-8">
          <div className="relative inline-block">
            {/* Logo glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-2xl blur-xl animate-pulse"></div>
            
            {/* Logo with enhanced styling */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50">
              <img 
                src={logo} 
                alt="Atom Lifts India Pvt Ltd" 
                className="h-20 w-auto mx-auto animate-[fade-in-scale_1.5s_ease-out] drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.15))'
                }}
              />
            </div>

            {/* Rotating border effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400 animate-spin opacity-30"
                 style={{ 
                   animationDuration: '8s',
                   mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                   maskComposite: 'xor'
                 }}>
            </div>
          </div>
        </div>

        {/* Enhanced loading animation */}
        <div className="transform transition-all duration-1000 delay-700 opacity-100 translate-y-0">
          {/* Modern loading spinner */}
          <div className="relative mx-auto mb-8 w-16 h-16">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-indigo-500 rounded-full animate-spin shadow-lg"
                 style={{ animationDuration: "2s" }}>
            </div>
            
            {/* Inner counter-spinning ring */}
            <div className="absolute inset-2 border-2 border-transparent border-b-blue-400 border-l-indigo-400 rounded-full animate-spin opacity-70"
                 style={{ animationDuration: "1.5s", animationDirection: "reverse" }}>
            </div>
            
            {/* Center pulsing dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse shadow-lg"></div>
            </div>
          </div>

          {/* Loading text with typing effect */}
          <div className="relative">
            <p className="font-semibold text-lg text-gray-700 tracking-wide animate-[fade-in_1s_ease-out_1s_both]">
              Loading your experience...
            </p>
            <div className="mt-2 flex justify-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1.4s' }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"
             style={{ animationDelay: "2s" }}>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
