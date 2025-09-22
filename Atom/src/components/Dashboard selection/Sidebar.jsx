import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Settings,
  Package,
  FileText,
  Calendar,
  DollarSign,
  Wrench,
  AlertCircle,
  BarChart2,
  CalendarCheck,
  ClipboardList,
  Warehouse,
  FileBarChart2,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Users,
  CreditCard,
  Repeat,
  FileBadge,
  ShoppingCart,
  ClipboardCheck,
} from 'lucide-react';
import { useState } from 'react';
import logo from '../../assets/logo.png';

const Sidebar = ({ isCollapsed, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    amc: false,
    sales: false,
    routineServices: false,
  });

  const menuItems = [
    { name: 'Home', path: '/dashboard-selection', key: 'dashboard-selection' },
    { name: 'All Products', path: '/dashboard-selection/all-product', key: 'all-product' },
    { name: 'Help Center', path: '/dashboard-selection/help-center', key: 'help-center' },
    { name: 'Testimonials', path: '/dashboard-selection/testimonials', key: 'testimonials' },
    
  ];

  const toggleMenuExpand = (key) => {
    setExpandedMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isMenuActive = (item) => {
    if (item.subItems) {
      return item.subItems.some((subItem) => location.pathname === subItem.path);
    }
    return location.pathname === item.path;
  };

  const handleLogout = async (e) => {
  e.preventDefault();
  
  try {
    // Clear client-side storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Optional: Make API call to logout if your backend requires it
    // await axios.post('/api/auth/logout', {}, { withCredentials: true });
    
    // Redirect to login page
    window.location.href = '/login';
    
    // Close mobile sidebar if open
    if (isMobile) {
      toggleSidebar();
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

  return (
    <div className={`
      h-full bg-white text-gray-800 flex flex-col
      ${isCollapsed ? 'w-14' : 'w-56'} 
      ${isMobile ? 'fixed z-50' : 'relative'}
      transition-all duration-300
      border-r border-gray-200
      shadow-sm
    `}>
      {/* Logo Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-center h-16">
        {isCollapsed ? (
          <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
        ) : (
          <img src={logo} alt="Company Logo" className="h-12 object-contain" />
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.key}>
              {item.subItems ? (
                <>
                  <div
                    onClick={() => toggleMenuExpand(item.key)}
                    className={`
                      flex items-center p-3 mx-2 rounded-md cursor-pointer
                      hover:bg-[#243158] hover:text-white transition-colors duration-200
                      ${isCollapsed ? 'justify-center' : 'px-4 justify-between'}
                      ${isMenuActive(item) ? 'bg-[#243158] text-white' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      <span className={`${isCollapsed ? '' : 'mr-3'} ${isMenuActive(item) ? 'text-white' : 'text-gray-600'}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="whitespace-nowrap text-sm font-medium">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      expandedMenus[item.key] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                  
                  {(!isCollapsed && expandedMenus[item.key]) && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.key}>
                          <Link
                            to={subItem.path}
                            onClick={() => isMobile && toggleSidebar()}
                            className={`
                              flex items-center p-2 pl-3 rounded-md
                              hover:bg-[#243158] hover:text-white transition-colors duration-200
                              ${location.pathname === subItem.path ? 'bg-[#243158] text-white' : ''}
                            `}
                          >
                            <span className={`mr-3 ${location.pathname === subItem.path ? 'text-white' : 'text-gray-600'}`}>
                              {item.key === 'sales' ? subItem.icon : item.icon}
                            </span>
                            <span className="whitespace-nowrap text-sm font-medium">
                              {subItem.name}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => isMobile && toggleSidebar()}
                  className={`
                    flex items-center p-3 mx-2 rounded-md
                    hover:bg-[#243158] hover:text-white transition-colors duration-200
                    ${isCollapsed ? 'justify-center' : 'px-4'}
                    ${location.pathname === item.path ? 'bg-[#243158] text-white' : ''}
                  `}
                >
                  <span className={`${isCollapsed ? '' : 'mr-3'} text-gray-600 ${location.pathname === item.path ? 'text-white' : ''}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="whitespace-nowrap text-sm font-medium">
                      {item.name}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Links */}
      <div className="p-2 border-t border-gray-200">
        <Link
          to="/dashboard/profile"
          onClick={() => isMobile && toggleSidebar()}
          className={`
            flex items-center p-3 mx-2 rounded-md hover:bg-[#243158] hover:text-white
            ${isCollapsed ? 'justify-center' : 'px-4'}
            ${location.pathname === '/profile' ? 'bg-[#243158] text-white' : ''}
          `}
        >
          <User className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-gray-600 ${location.pathname === '/profile' ? 'text-white' : ''}`} />
          {!isCollapsed && <span className="text-sm font-medium">Profile</span>}
        </Link>
      <Link
  to="/login"
  onClick={(e) => {
    handleLogout(e);
    if (isMobile) toggleSidebar();
  }}
  className={`
    flex items-center p-3 mx-2 rounded-md hover:bg-[#243158] hover:text-white
    ${isCollapsed ? 'justify-center' : 'px-4'}
    ${location.pathname === '/logout' ? 'bg-[#243158] text-white' : ''}
  `}
>
  <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-gray-600 ${location.pathname === '/logout' ? 'text-white' : ''}`} />
  {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
</Link>
      </div>
    </div>
  );
};

export default Sidebar;