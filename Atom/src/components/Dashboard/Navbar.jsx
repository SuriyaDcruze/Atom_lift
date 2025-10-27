import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const Navbar = ({ toggleSidebar, isMobile, sidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [username, setUsername] = useState('Admin');
  const [photo, setPhoto] = useState(null); // Store profile photo URL
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
    fetchNotifications();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.get(`${apiBaseUrl}/auth/notifications/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
      // Set mock notifications for demo
      setNotifications([
        { id: 1, title: 'New AMC Contract', message: 'A new AMC contract has been created', time: '2 min ago', read: false },
        { id: 2, title: 'Payment Received', message: 'Payment of ₹50,000 received from ABC Corp', time: '1 hour ago', read: false },
        { id: 3, title: 'Service Due', message: 'Routine service due for Lift #L001', time: '3 hours ago', read: true },
      ]);
      setUnreadCount(2);
    }
  };

  // Search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.get(`${apiBaseUrl}/auth/search/?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSearchResults(response.data.results || []);
      }
    } catch (error) {
      console.error('Error searching:', error.response?.data || error.message);
      // Mock search results for demo
      setSearchResults([
        { type: 'customer', title: 'ABC Corporation', subtitle: 'Customer', id: 1 },
        { type: 'lift', title: 'Lift #L001', subtitle: 'Lift', id: 2 },
        { type: 'amc', title: 'AMC Contract #A001', subtitle: 'AMC Contract', id: 3 },
      ]);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await axios.put(`${apiBaseUrl}/auth/notifications/${notificationId}/mark-read/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data || error.message);
    }
  };

  const handleSignOut = () => {
    console.log("Sign out button clicked");
    localStorage.removeItem("access_token");
    setIsProfileOpen(false);
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isProfileOpen &&
        !e.target.closest('.profile-dropdown-trigger') &&
        !e.target.closest('.profile-dropdown-menu')
      ) {
        setIsProfileOpen(false);
      }
      
      if (
        notificationsOpen &&
        !e.target.closest('.notification-dropdown-trigger') &&
        !e.target.closest('.notification-dropdown-menu')
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, notificationsOpen]);

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
              placeholder="Search customers, lifts, AMCs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
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
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      // Navigate to the appropriate page based on result type
                      if (result.type === 'customer') {
                        navigate('/dashboard/customers');
                      } else if (result.type === 'lift') {
                        navigate('/dashboard/lifts');
                      } else if (result.type === 'amc') {
                        navigate('/dashboard/amc');
                      }
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <div className="font-medium text-gray-900">{result.title}</div>
                    <div className="text-sm text-gray-500">{result.subtitle}</div>
                  </div>
                ))}
              </div>
            )}
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
                    placeholder="Search customers, lifts, AMCs..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
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
                  
                  {/* Mobile Search Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            if (result.type === 'customer') {
                              navigate('/dashboard/customers');
                            } else if (result.type === 'lift') {
                              navigate('/dashboard/lifts');
                            } else if (result.type === 'amc') {
                              navigate('/dashboard/amc');
                            }
                            setSearchQuery('');
                            setSearchResults([]);
                            setSearchOpen(false);
                          }}
                        >
                          <div className="font-medium text-gray-900">{result.title}</div>
                          <div className="text-sm text-gray-500">{result.subtitle}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right side - User and Notifications */}
      <div className="flex items-center space-x-4">
        {/* Notifications - Hidden when search is open on mobile */}
        {(!isMobile || !searchOpen) && (
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1 text-gray-500 hover:text-gray-700 focus:outline-none notification-dropdown-trigger"
              aria-label="Notifications"
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 notification-dropdown-menu">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-sm text-gray-500">{unreadCount} unread</span>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        // Mark all as read
                        notifications.forEach(notif => {
                          if (!notif.read) {
                            markAsRead(notif.id);
                          }
                        });
                      }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 focus:outline-none profile-dropdown-trigger"
            aria-label="User profile"
          >
            {!isMobile && <span className="text-gray-700">{username}</span>}
            {renderProfilePicture()}
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ${isMobile ? 'origin-top-right' : ''} profile-dropdown-menu`}>
              <Link
                to="/dashboard/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Profile link clicked");
                  setIsProfileOpen(false);
                }}
              >
                Your Profile
              </Link>
              <Link
                to="/dashboard/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Settings link clicked");
                  setIsProfileOpen(false);
                }}
              >
                Settings
              </Link>
              <div className="border-t border-gray-200"></div>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;