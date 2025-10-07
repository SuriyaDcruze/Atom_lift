import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChequeTransactionHistory = () => {
  const [chequeTransactions, setChequeTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('payment_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data structure for cheque transactions
  const mockChequeTransactions = [
    // Empty array to show "No data available in table" message
    // Uncomment below to add sample data for testing
    // {
    //   id: 1,
    //   invoice_id: 'INV-001',
    //   amc_id: 'AMC-001',
    //   site_id: 'SITE-001',
    //   site_name: 'Sample Site 1',
    //   amc_type: 'Annual',
    //   amc_value: 50000,
    //   payment_id: 'PAY-001',
    //   type: 'Cheque',
    //   status: 'Completed',
    //   payment_date: '2024-01-15',
    //   payment_value: 50000
    // },
    // {
    //   id: 2,
    //   invoice_id: 'INV-002',
    //   amc_id: 'AMC-002',
    //   site_id: 'SITE-002',
    //   site_name: 'Sample Site 2',
    //   amc_type: 'Monthly',
    //   amc_value: 5000,
    //   payment_id: 'PAY-002',
    //   type: 'Cheque',
    //   status: 'Pending',
    //   payment_date: '2024-01-14',
    //   payment_value: 5000
    // }
  ];

  useEffect(() => {
    fetchChequeTransactions();
  }, []);

  const fetchChequeTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please log in to continue.');
        return;
      }

      // For now, using mock data. Replace with actual API call
      // const response = await axios.get(`${import.meta.env.VITE_BASE_API}/cheque-transactions/`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setChequeTransactions(response.data || []);
      
      setChequeTransactions(mockChequeTransactions);
    } catch (error) {
      console.error('Error fetching cheque transactions:', error);
      toast.error('Failed to fetch cheque transaction history.');
      setChequeTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality will be implemented here
    console.log('Searching for:', searchTerm);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const filteredTransactions = chequeTransactions.filter(transaction =>
    transaction.invoice_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amc_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.site_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex items-center justify-end">
          <label htmlFor="search" className="text-sm font-medium text-gray-700 mr-2">
            SEARCH:
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search cheque transactions..."
            />
            <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('invoice_id')}
              >
                <div className="flex items-center">
                  Invoice ID (INV)
                  {getSortIcon('invoice_id')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('amc_id')}
              >
                <div className="flex items-center">
                  AMC ID (AMC)
                  {getSortIcon('amc_id')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('site_id')}
              >
                <div className="flex items-center">
                  Site ID
                  {getSortIcon('site_id')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('site_name')}
              >
                <div className="flex items-center">
                  Site Name
                  {getSortIcon('site_name')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('amc_type')}
              >
                <div className="flex items-center">
                  AMC TYPE
                  {getSortIcon('amc_type')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('amc_value')}
              >
                <div className="flex items-center">
                  AMC Value
                  {getSortIcon('amc_value')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-blue-600 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('payment_id')}
              >
                <div className="flex items-center">
                  Payment ID
                  {getSortIcon('payment_id')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center">
                  Type
                  {getSortIcon('type')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('payment_date')}
              >
                <div className="flex items-center">
                  Payment Date
                  {getSortIcon('payment_date')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('payment_value')}
              >
                <div className="flex items-center">
                  Payment Value
                  {getSortIcon('payment_value')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                  Loading cheque transactions...
                </td>
              </tr>
            ) : currentTransactions.length === 0 ? (
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                  No data available in table
                </td>
              </tr>
            ) : (
              currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.invoice_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.amc_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.site_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.site_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.amc_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{transaction.amc_value?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-blue-600 font-medium">{transaction.payment_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.type}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : transaction.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.payment_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{transaction.payment_value?.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedTransactions.length)} of {sortedTransactions.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChequeTransactionHistory;
