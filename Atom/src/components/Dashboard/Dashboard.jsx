import { useState, useEffect, useMemo } from 'react';
import { User, DollarSign, AlertTriangle, FileText, Wrench } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import ComplaintIcon from "../../assets/ComplaintIcon.jpeg"
import IncomeIcon from "../../assets/IncomeIcon.jpeg"
import Invoice from "../../assets/Invoice.jpeg"
import UserIcon from "../../assets/UserIcon.jpeg"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [amcData, setAmcData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [complaintData, setComplaintData] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from where you store it (localStorage, cookies, etc.)
  const getAuthToken = () => {
    return localStorage.getItem('access_token'); // Updated to match the stored key
  };

  const fetchWithAuth = async (url) => {
    const token = getAuthToken();
    if (!token) {
      console.warn('No authentication token found, redirecting to login...');
      window.location.href = '/login'; // Redirect to login page
      return [];
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [amcRes, customerRes, complaintRes, invoiceRes] = await Promise.all([
          fetchWithAuth(`${import.meta.env.VITE_BASE_API}/amc/amc-list/`).catch(e => {
            console.error('Error fetching AMC data:', e);
            setError(prev => prev ? `${prev}, AMC data failed` : 'AMC data failed');
            return [];
          }),
          fetchWithAuth(`${import.meta.env.VITE_BASE_API}/sales/customer-list/`).catch(e => {
            console.error('Error fetching customer data:', e);
            setError(prev => prev ? `${prev}, Customer data failed` : 'Customer data failed');
            return [];
          }),
          fetchWithAuth(`${import.meta.env.VITE_BASE_API}/auth/complaint-list/`).catch(e => {
            console.error('Error fetching complaint data:', e);
            setError(prev => prev ? `${prev}, Complaint data failed` : 'Complaint data failed');
            return [];
          }),
          fetchWithAuth(`${import.meta.env.VITE_BASE_API}/sales/invoice-list/`).catch(e => {
            console.error('Error fetching invoice data:', e);
            setError(prev => prev ? `${prev}, Invoice data failed` : 'Invoice data failed');
            return [];
          }),
        ]);

        setAmcData(Array.isArray(amcRes) ? amcRes : []);
        setCustomerData(Array.isArray(customerRes) ? customerRes : []);
        setComplaintData(Array.isArray(complaintRes) ? complaintRes : []);
        setInvoiceData(Array.isArray(invoiceRes) ? invoiceRes : []);

        // Set selectedMonth to the month of the latest complaint
        if (Array.isArray(complaintRes) && complaintRes.length > 0) {
          const latestComplaint = complaintRes.reduce((latest, current) =>
            new Date(current.date) > new Date(latest.date) ? current : latest
          );
          setSelectedMonth(
            new Date(latestComplaint.date).toLocaleString('default', { month: 'long' })
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load some or all dashboard data. Please check your authentication and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from API data with safe defaults
  const calculateStats = () => {
    const safeAmcData = Array.isArray(amcData) ? amcData : [];
    const safeCustomerData = Array.isArray(customerData) ? customerData : [];
    const safeComplaintData = Array.isArray(complaintData) ? complaintData : [];
    const safeInvoiceData = Array.isArray(invoiceData) ? invoiceData : [];
    
    const amcDue = safeAmcData.filter(amc => amc.status === "Pending").length;
    const income = 10293; // Mock data
    const totalComplaints = safeComplaintData.length;
    const closedComplaints = safeComplaintData.filter(c => c.solution).length;
    const openComplaints = totalComplaints - closedComplaints;
    const totalInvoices = safeInvoiceData.length;
    const openInvoices = safeInvoiceData.filter(inv => inv.status === "open").length;
    const customerCount = safeCustomerData.length;
    const complaintCount = safeComplaintData.length;

    return {
      firstRow: [
        { 
          title: 'AMC Due', 
          value: amcDue, 
          change: '8.5% Up', 
          trend: 'up', 
          icon:  <img src={UserIcon} className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#6B46C1' }} alt="User Icon" />,
        },
        { 
          title: 'Income', 
          value: income, 
          change: '1.3% Up', 
          trend: 'up', 
          icon: <img src={IncomeIcon} className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#D69E2E' }} alt="Income Icon" />
        },
        { 
          title: 'Open Complaints', 
          value: `${openComplaints}/${totalComplaints}`, 
          change: '4.3% Down', 
          trend: 'down', 
          icon: <img src={ComplaintIcon} className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#48BB78' }} alt="Complaint Icon" />,
        },
        { 
          title: 'Open Invoice', 
          value: `${openInvoices}/${totalInvoices}`, 
          change: '1.8% Up', 
          trend: 'up', 
          icon: <img src={Invoice} className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#F6AD55' }} alt="Invoice Icon" />
        }
      ],
      secondRow: [
        { 
          title: 'Customer', 
          value: customerCount, 
          change: '8.5% Up', 
          trend: 'up', 
          icon: <img src={UserIcon} className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#6B46C1' }} alt="User Icon" />
        },
        { 
          title: 'Complaint', 
          value: complaintCount, 
          change: '1.3% Up', 
          trend: 'up', 
          icon:  <img src={IncomeIcon} className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#D69E2E' }} alt="Income Icon" />
        }
      ]
    };
  };

  const stats = useMemo(() => calculateStats(), [amcData, customerData, complaintData, invoiceData]);

  const graphData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Income',
        data: [50, 75, 60, 80, 65, 90, 70],
        borderColor: 'rgb(0, 149, 255)',
        backgroundColor: 'rgba(0, 149, 255, 0.2)',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(0, 149, 255)',
      },
      {
        label: 'Services',
        data: [60, 80, 70, 85, 75, 95, 80],
        borderColor: 'rgb(0, 255, 149)',
        backgroundColor: 'rgba(0, 255, 149, 0.2)',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(0, 255, 149)',
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 10, // Smaller font size for mobile
          },
        },
      },
      title: { display: false },
      tooltip: {
        bodyFont: {
          size: 10, // Smaller tooltip font for mobile
        },
      },
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: {
          font: {
            size: 10, // Smaller font size for mobile
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { 
          stepSize: 25,
          font: {
            size: 10, // Smaller font size for mobile
          },
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
    },
  };

  if (loading) {
    return (
      <div className="p-2 sm:p-6 flex justify-center items-center bg-gray-50 min-h-screen">
        <div className="text-base sm:text-lg font-medium text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 sm:p-6 flex justify-center items-center bg-gray-50 min-h-screen">
        <div className="text-base sm:text-lg font-medium text-red-500">{error}</div>
      </div>
    );
  }

  const months = [...new Set(complaintData.map(complaint => 
    new Date(complaint.date).toLocaleString('default', { month: 'long' })
  ))];
  const filteredComplaints = complaintData.filter(complaint => 
    new Date(complaint.date).toLocaleString('default', { month: 'long' }) === selectedMonth
  );

  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Dashboard</h1>

      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.firstRow.map((stat, index) => (
          <div key={index} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 relative">
            {/* Icon positioned in top-right corner */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
              {stat.icon}
            </div>
            <div className="pr-8 sm:pr-10">
              <h3 className="text-gray-500 font-medium text-xs sm:text-sm">{stat.title}</h3>
              <div className="text-lg sm:text-xl font-bold my-1">{stat.value}</div>
              <div className={`text-[10px] sm:text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} {stat.trend === 'up' ? '↑' : '↓'} from yesterday
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Second and Third Rows Combined */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Left side - Customer and Complaint cards (2 columns) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          {stats.secondRow.map((stat, index) => (
            <div key={index} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 relative">
              {/* Icon positioned in top-right corner */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                {stat.icon}
              </div>
              <div className="pr-8 sm:pr-10">
                <h3 className="text-gray-500 font-medium text-xs sm:text-sm">{stat.title}</h3>
                <div className="text-lg sm:text-xl font-bold my-1">{stat.value}</div>
                <div className={`text-[10px] sm:text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} {stat.trend === 'up' ? '↑' : '↓'} from past week
                </div>
              </div>
            </div>
          ))}
          
          {/* Chart placed below Customer and Complaint cards */}
          <div className="sm:col-span-2 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium text-xs sm:text-sm mb-3">Weekly Performance</h3>
            <div className="h-48 sm:h-64">
              <Line data={graphData} options={graphOptions} />
            </div>
          </div>
        </div>

        {/* Right side - Extended AMC Renew card (2 columns spanning full height) */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col justify-center">
            <div className="flex items-start space-x-4 sm:space-x-6 mb-6">
              <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 flex-shrink-0 mt-2" />
              <div className="flex-1">
                <h3 className="text-gray-500 font-medium text-sm sm:text-base mb-3">AMC Renew in Progress</h3>
                <div className="text-2xl sm:text-3xl font-bold mb-3">
                  {amcData.filter(amc => amc.status === "Pending").length} AMCs pending renewal
                </div>
                <div className="text-sm sm:text-base text-gray-600 mb-2">
                  Review and process pending renewals to maintain service continuity
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Section */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
          <h3 className="text-gray-500 font-medium text-xs sm:text-sm">New Complaints</h3>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 mt-2 sm:mt-0 w-full sm:w-auto text-sm"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] sm:min-w-0">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 sm:p-2 text-[10px] sm:text-xs">Print</th>
                <th className="p-1 sm:p-2 text-[10px] sm:text-xs">Subject</th>
                <th className="p-1 sm:p-2 text-[10px] sm:text-xs">Assigned to</th>
                <th className="p-1 sm:p-2 text-[10px] sm:text-xs">Status</th>
                <th className="p-1 sm:p-2 text-[10px] sm:text-xs">Created</th>
                <th className="p-1 sm:p-2 text-[10px] sm:text-xs">Solution</th>
                <th className="p-1 sm:p-2 text-[10px] sm:text-xs">Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="border-t">
                  <td className="p-1 sm:p-2"></td>
                  <td className="p-1 sm:p-2 text-xs sm:text-sm">{complaint.subject}</td>
                  <td className="p-1 sm:p-2 text-xs sm:text-sm">{complaint.assign_to_name}</td>
                  <td className="p-1 sm:p-2">
                    <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs ${
                      complaint.solution ? 'text-green-500 bg-green-100' : 'text-yellow-500 bg-yellow-100'
                    }`}>
                      {complaint.solution ? 'Closed' : 'Open'}
                    </span>
                  </td>
                  <td className="p-1 sm:p-2 text-xs sm:text-sm">{new Date(complaint.date).toLocaleString()}</td>
                  <td className="p-1 sm:p-2 text-xs sm:text-sm">{complaint.solution || '-'}</td>
                  <td className="p-1 sm:p-2 text-xs sm:text-sm">{complaint.technician_remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;