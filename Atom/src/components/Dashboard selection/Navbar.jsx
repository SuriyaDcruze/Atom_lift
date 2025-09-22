import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const Navbar = ({ toggleSidebar, isMobile, sidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [username, setUsername] = useState('Admin');
  const [photo, setPhoto] = useState(null); // Store profile photo URL

  const navigate = useNavigate();

  // Fetch username and photo from API
  const fetchUsername = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.get(`${apiBaseUrl}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const data = response.data;
        setUsername(data.username || 'Admin');
        setPhoto(data.photo || null); // Set photo URL or null
      }
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchUsername();
  }, []);

  const handleSignOut = () => {
    console.log("Sign out button clicked");
    localStorage.removeItem("access_token");
    setIsProfileOpen(false);
    navigate("/login");
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isProfileOpen &&
        !e.target.closest('.profile-dropdown-trigger') &&
        !e.target.closest('.profile-dropdown-menu')
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  // Render profile picture or default initial
  const renderProfilePicture = () => {
    if (photo) {
      return (
        <img
          src={photo}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            setPhoto(null); // Fallback to default on error
          }}
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
        {username.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-sm flex justify-between items-center p-4 relative z-30">
      {/* Left side - Menu button and Search */}
      <div className="flex items-center space-x-4">
        {/* Menu button - Mobile only */}
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className="mobile-menu-toggle text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-md"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        )}

        {/* Search - Desktop */}
        {!isMobile && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 6.65a7.5 7.5 0 01-10.3 10.3"
              />
            </svg>
          </div>
        )}

        {/* Search - Mobile */}
        {isMobile && (
          <>
            <button 
              onClick={toggleSearch}
              className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none ml-7 pt-0"
              aria-label={searchOpen ? "Close search" : "Open search"}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 6.65a7.5 7.5 0 01-10.3 10.3"
                />
              </svg>
            </button>

            {searchOpen && (
              <div className="absolute left-0 right-0 top-full bg-white p-2 shadow-md z-10">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <svg
                    className="w-5 h-5 text-gray-500 absolute left-3 top-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 6.65a7.5 7.5 0 01-10.3 10.3"
                    />
                  </svg>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </nav>
  );
};

export default Navbar;