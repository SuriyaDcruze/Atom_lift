import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../assets/logo.png';
import amcImg from '../../assets/amc.jpeg';
import complaintsImg from '../../assets/complaints.jpeg';
import customerLicenseImg from '../../assets/customer_license.jpeg';
import dashboardImg from '../../assets/dashboard.jpeg';
import inventoryImg from '../../assets/inventory.jpeg';
import itemImg from '../../assets/items.jpeg';
import liftImg from '../../assets/lift.jpeg';
import monthlyLoadImg from '../../assets/monthlyload.jpeg';
import reportsImg from '../../assets/reports.jpeg';
import routineServicesImg from '../../assets/routine_services.jpeg';
import salesImg from '../../assets/sales.jpeg';
import { ChevronDown, ChevronUp, User, LogOut, Users, CreditCard, Repeat, FileBadge, ShoppingCart, ClipboardList, ClipboardCheck } from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    amc: false,
    sales: false,
    routineServices: false,
    inventory: false,
    reports: false,
  });

  const menuItems = [
    { name: 'Dashboard', icon: <img src={dashboardImg} alt="Dashboard" className="h-4 w-4" />, path: '/dashboard', key: 'dashboard' },
    { name: 'Lifts', icon: <img src={liftImg} alt="Lifts" className="h-4 w-4" />, path: '/dashboard/lifts', key: 'lifts' },
    { name: 'Items', icon: <img src={itemImg} alt="Items" className="h-4 w-4" />, path: '/dashboard/items', key: 'items' },
    { name: 'Customer License', icon: <img src={customerLicenseImg} alt="Customer License" className="h-4 w-4" />, path: '/dashboard/customer-license', key: 'customer-license' },
    { 
      name: 'AMC', 
      icon: <img src={amcImg} alt="AMC" className="h-4 w-4" />, 
      path: '/amc', 
      key: 'amc',
      subItems: [
        { name: 'AMC', path: '/dashboard/amc', key: 'amc-all' },
        { name: 'This Month Expire', path: '/dashboard/this-month', key: 'amc-this-month' },
        { name: 'Last Month Expire', path: '/dashboard/last-month', key: 'amc-last-month' },
        { name: 'Next Month Expire', path: '/dashboard/next-month', key: 'amc-next-month' },
      ],
    },
    {
      name: 'Sales',
      icon: <img src={salesImg} alt="Sales" className="h-4 w-4" />,
      key: 'sales',
      subItems: [
        { name: 'Customers', icon: <Users className="h-4 w-4" />, path: '/dashboard/customers', key: 'customers' },
        { name: 'Delivery Challan', icon: <ShoppingCart className="h-4 w-4" />, path: '/dashboard/delivery-challan', key: 'delivery-challan' },
        { name: 'Quotation', icon: <ClipboardList className="h-4 w-4" />, path: '/dashboard/quotation', key: 'quotation' },
        { name: 'Orders', icon: <ClipboardList className="h-4 w-4" />, path: '/dashboard/orders', key: 'orders' },
        { name: 'Invoice', icon: <ClipboardList className="h-4 w-4" />, path: '/dashboard/invoice', key: 'invoice' },
        { name: 'Payment Received', icon: <CreditCard className="h-4 w-4" />, path: '/dashboard/payment-received', key: 'paymentReceived' },
        { name: 'Recurring Invoices', icon: <Repeat className="h-4 w-4" />, path: '/dashboard/recurring-invoices', key: 'recurringInvoices' },
      ],
    },
    {
      name: 'Routine Services',
      icon: <img src={routineServicesImg} alt="Routine Services" className="h-4 w-4" />,
      path: '/routine-services',
      key: 'routine-services',
      subItems: [
        { name: 'Routine Services', path: '/dashboard/routine-services', key: 'routine-all' },
        { name: 'Today Services', path: '/dashboard/today-services', key: 'routine-today' },
        { name: 'Route Wise Services', path: '/dashboard/route-wise-services', key: 'routine-route-wise' },
        { name: 'This Month Services', path: '/dashboard/this-month-services', key: 'routine-this-month' },
        { name: 'Last Month Services', path: '/dashboard/last-month-services', key: 'routine-last-month' },
        { name: 'This Month Overdue', path: '/dashboard/this-month-overdue', key: 'routine-this-month-overdue' },
        { name: 'Last Month Overdue', path: '/dashboard/last-month-overdue', key: 'routine-last-month-overdue' },
        { name: 'Last Month Completed', path: '/dashboard/last-month-completed', key: 'routine-last-month-completed' },
        { name: 'This Month Completed', path: '/dashboard/this-month-completed', key: 'routine-this-month-completed' },
        { name: 'Pending Assign', path: '/dashboard/pending-assign', key: 'routine-pending-assign' },
      ],
    },    
    { name: 'Complaints', icon: <img src={complaintsImg} alt="Complaints" className="h-4 w-4" />, path: '/dashboard/complaints', key: 'complaints' },
    { name: 'Monthly Load', icon: <img src={monthlyLoadImg} alt="Monthly Load" className="h-4 w-4" />, path: '/dashboard/monthly-load', key: 'monthly-load' },
    { name: 'Services Schedule', icon: <img src={monthlyLoadImg} alt="Services Schedule" className="h-4 w-4" />, path: '/dashboard/services-schedule', key: 'services-schedule' },
    { name: 'Material Request', icon: <img src={monthlyLoadImg} alt="Material Request" className="h-4 w-4" />, path: '/dashboard/material-request', key: 'material-request' },
    {
      name: 'Inventory',
      icon: <img src={inventoryImg} alt="Inventory" className="h-4 w-4" />,
      path: '/dashboard/inventory',
      key: 'inventory',
      subItems: [
        { name: 'Requisition', path: '/dashboard/requisition', key: 'requisition', icon: <ClipboardList className="h-4 w-4" /> },
        { name: 'Stock Register', path: '/dashboard/stock-register', key: 'stock-register', icon: <ClipboardCheck className="h-4 w-4" /> },
      ],
    },
    {
      name: 'Reports',
      icon: <img src={reportsImg} alt="Reports" className="h-4 w-4" />,
      path: '/reports',
      key: 'reports',
      subItems: [
        { name: 'Complaint', path: '/dashboard/complaint-report', key: 'report-complaint' },
        { name: 'Life Wise Complaint', path: '/dashboard/life-wise-complaint', key: 'report-life-wise-complaint' },
        { name: 'AMC', path: '/dashboard/amc-report', key: 'report-amc' },
        { name: 'Routine Services', path: '/dashboard/routine-services-report', key: 'report-routine-services' },
        { name: 'AMC Next Payment Due', path: '/dashboard/amc-next-payment-due-report', key: 'report-amc-next-payment-due' },
        { name: 'Invoice', path: '/dashboard/invoice-report', key: 'report-invoice' },
        { name: 'Payment', path: '/dashboard/payment-report', key: 'report-payment' },
        { name: 'Quotation', path: '/dashboard/quotation-report', key: 'report-quotation' },
        { name: 'Expiring', path: '/dashboard/expiring-report', key: 'report-expiring' },
        { name: 'No. of Expired Free Warranty', path: '/dashboard/expired-free-warranty-report', key: 'report-expired-free-warranty' },
      ],
    },
    { name: 'Employees', icon: <img src={dashboardImg} alt="Employees" className="h-4 w-4" />, path: '/dashboard/employees', key: 'employees' },
    { name: 'Users', icon: <img src={dashboardImg} alt="Users" className="h-4 w-4" />, path: '/dashboard/user', key: 'users' }
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
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
      if (isMobile) {
        toggleSidebar();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div
      className={`
        h-full bg-white text-gray-800 flex flex-col
        ${isCollapsed ? 'w-14' : 'w-56'}
        ${isMobile ? 'fixed z-50' : 'relative'}
        transition-all duration-300
        border-r border-gray-200
        shadow-sm
      `}
      style={{ fontFamily: "'Poppins'" }}
    >
      <div className="p-2 border-b border-gray-200 flex items-center justify-center h-14">
        {isCollapsed ? (
          <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
        ) : (
          <img src={logo} alt="Company Logo" className="h-10 object-contain" />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        <ul className="space-y-0.5">
          {menuItems.map((item) => (
            <li key={item.key}>
              {item.subItems ? (
                <>
                  <div
                    onClick={() => toggleMenuExpand(item.key)}
                    className={`
                      flex items-center p-2 mx-1 rounded-md cursor-pointer
                      hover:bg-[#243158] hover:text-white transition-colors duration-200
                      ${isCollapsed ? 'justify-center' : 'px-3 justify-between'}
                      ${isMenuActive(item) ? 'bg-[#243158] text-white' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      <span className={`${isCollapsed ? '' : 'mr-2'} ${isMenuActive(item) ? 'text-white' : 'text-gray-600'}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="whitespace-nowrap text-xs font-medium">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      expandedMenus[item.key] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                  
                  {(!isCollapsed && expandedMenus[item.key]) && (
                    <ul className="ml-6 mt-0.5 space-y-0.5">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.key}>
                          <Link
                            to={subItem.path}
                            onClick={() => isMobile && toggleSidebar()}
                            className={`
                              flex items-center p-1.5 pl-2 rounded-md
                              hover:bg-[#243158] hover:text-white transition-colors duration-200
                              ${location.pathname === subItem.path ? 'bg-[#243158] text-white' : ''}
                            `}
                          >
                            <span className={`mr-2 ${location.pathname === subItem.path ? 'text-white' : 'text-gray-600'}`}>
                              {item.key === 'sales' || item.key == 'inventory' ? subItem.icon : item.icon}
                            </span>
                            <span className="whitespace-nowrap text-xs font-medium">
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
                    flex items-center p-2 mx-1 rounded-md
                    hover:bg-[#243158] hover:text-white transition-colors duration-200
                    ${isCollapsed ? 'justify-center' : 'px-3'}
                    ${location.pathname === item.path ? 'bg-[#243158] text-white' : ''}
                  `}
                >
                  <span className={`${isCollapsed ? '' : 'mr-2'} text-gray-600 ${location.pathname === item.path ? 'text-white' : ''}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="whitespace-nowrap text-xs font-medium">
                      {item.name}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-1 border-t border-gray-200">
        <Link
          to="/dashboard/profile"
          onClick={() => isMobile && toggleSidebar()}
          className={`
            flex items-center p-2 mx-1 rounded-md hover:bg-[#243158] hover:text-white
            ${isCollapsed ? 'justify-center' : 'px-3'}
            ${location.pathname === '/profile' ? 'bg-[#243158] text-white' : ''}
          `}
        >
          <User className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4 text-gray-600 ${location.pathname === '/profile' ? 'text-white' : ''}`} />
          {!isCollapsed && <span className="text-xs font-medium">Profile</span>}
        </Link>
        <Link
          to="/login"
          onClick={(e) => {
            handleLogout(e);
            if (isMobile) toggleSidebar();
          }}
          className={`
            flex items-center p-2 mx-1 rounded-md hover:bg-[#243158] hover:text-white
            ${isCollapsed ? 'justify-center' : 'px-3'}
            ${location.pathname === '/logout' ? 'bg-[#243158] text-white' : ''}
          `}
        >
          <LogOut className={`${isCollapsed ? '' : 'mr-2'} h-4 w-4 text-gray-600 ${location.pathname === '/logout' ? 'text-white' : ''}`} />
          {!isCollapsed && <span className="text-xs font-medium">Logout</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;