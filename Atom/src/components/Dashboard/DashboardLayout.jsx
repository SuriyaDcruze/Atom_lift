import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useState, useEffect, useCallback } from 'react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(prev => !prev); // Toggle only on mobile
    }
  }, [isMobile]);

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;

    const handleResize = () => {
      const mobile = checkMobile();
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Force expanded on desktop
      } else if (mobile && !sidebarOpen) {
        setSidebarOpen(false); // Ensure closed on mobile unless toggled
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0  bg-opacity-50 z-40" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar h-full ${isMobile ? 'fixed z-50' : 'relative'} transform transition-all duration-300 ease-in-out ${
          isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
        } ${isMobile && !sidebarOpen ? 'hidden' : ''}`}
      >
        <Sidebar 
          isCollapsed={!sidebarOpen} 
          toggleSidebar={toggleSidebar} 
          isMobile={isMobile}
        />
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <header className="z-30">
          <Navbar 
            toggleSidebar={toggleSidebar} 
            className="mobile-menu-toggle"
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
          />
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;