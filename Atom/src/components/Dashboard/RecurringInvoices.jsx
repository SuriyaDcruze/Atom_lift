import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Calendar, Search } from 'lucide-react';
import RecurringInvoiceForm from '../Dashboard/Forms/RecurringInvoiceForm';
import axios from 'axios';

const RecurringInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recurringInvoices, setRecurringInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Centralized Axios instance with Bearer token
  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Authentication token not found in localStorage');
      setError('Authentication token not found. Please log in.');
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // Fetch recurring invoices
  const fetchRecurringInvoices = async (retryCount = 2) => {
    setLoading(true);
    setError(null);
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BASE_API}/sales/recurring-invoice-list/`);
      console.log('API Response:', response.data); // Debug log
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format received from API');
      }
      const mappedInvoices = response.data.map(invoice => ({
        id: invoice.id || '',
        customerName: invoice.customer_name || 'Unknown',
        profileName: invoice.profile_name || '',
        frequency: invoice.frequency_display || invoice.repeat_every || 'Unknown',
        lastInvoiceDate: invoice.start_date || '',
        nextInvoiceDate: invoice.next_invoice_date || invoice.start_date || '',
        status: (invoice.status || 'UNKNOWN').toUpperCase(),
        amount: `INR ${parseFloat(invoice.amount || 0).toFixed(2)}`,
      }));
      setRecurringInvoices(mappedInvoices);
      console.log('Mapped Invoices:', mappedInvoices); // Debug log
    } catch (error) {
      console.error('Error fetching recurring invoices:', error.response ? error.response : error);
      const message = error.response?.status === 401 
        ? 'Session expired. Please log in again.' 
        : error.code === 'ERR_NETWORK' 
          ? `Network error. Retrying... (${retryCount} attempts left)` 
          : 'Failed to fetch recurring invoices. Check server or API endpoint.';
      setError(message);
      if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        setTimeout(() => fetchRecurringInvoices(retryCount - 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered, fetching invoices...');
    fetchRecurringInvoices();
  }, []);

  const handleSuccess = () => {
    fetchRecurringInvoices();
    setIsFormOpen(false);
    setSelectedInvoice(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring invoice?')) {
      const axiosInstance = createAxiosInstance();
      if (!axiosInstance) return;

      try {
        await axiosInstance.delete(`${import.meta.env.VITE_BASE_API}/sales/delete-recurring-invoice/${id}/`);
        fetchRecurringInvoices();
      } catch (error) {
        console.error('Error deleting recurring invoice:', error);
        alert('Failed to delete recurring invoice.');
      }
    }
  };

  const handleGenerate = async (id, nextInvoiceDate, status) => {
    if (new Date(nextInvoiceDate) > new Date() || status !== 'ACTIVE') {
      alert('This invoice is not due yet or is not active.');
      return;
    }
    if (window.confirm('Generate invoice from this recurring template?')) {
      const axiosInstance = createAxiosInstance();
      if (!axiosInstance) return;

      try {
        const response = await axiosInstance.post(`${import.meta.env.VITE_BASE_API}/sales/generate_invoice_from_recurring/${id}/`);
        alert(response.data.message);
        fetchRecurringInvoices();
      } catch (error) {
        console.error('Error generating invoice:', error);
        alert('Failed to generate invoice.');
      }
    }
  };

  const handleExport = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BASE_API}/sales/export-recurring-invoices-to-excel/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recurring_invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting recurring invoices:', error);
      alert('Failed to export recurring invoices.');
    }
  };

  const filteredInvoices = recurringInvoices.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.profileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
    UNKNOWN: 'bg-gray-100 text-gray-800',
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">Recurring Invoices</h1>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          
          <div className="flex flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-gray-300 transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => { setSelectedInvoice(null); setIsFormOpen(true); }}
              className="flex-1 sm:flex-none bg-[#243158] text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base flex items-center justify-center hover:bg-[#1e2a44] transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" /> Create
            </button>
          </div>
        </div>
        
        {loading && <div className="text-center text-gray-500 text-sm sm:text-base">Loading...</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 sm:p-4 rounded mb-3 sm:mb-4 md:mb-4"> {error}</div>}
        
        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <div className="min-w-[800px] grid grid-cols-7 bg-gray-100 p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-gray-700 uppercase tracking-wider">
            <div className="text-left">Customer</div>
            <div className="text-left">Profile</div>
            <div className="text-center">Frequency</div>
            <div className="text-center">Last Invoice</div>
            <div className="text-center">Next Invoice</div>
            <div className="text-center">Status</div>
            <div className="text-right">Amount / Actions</div>
          </div>
          
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => {
              const isDue = new Date(invoice.nextInvoiceDate) <= new Date() && invoice.status === 'ACTIVE';
              return (
                <div key={invoice.id} className="min-w-[800px] grid grid-cols-7 p-2 sm:p-3 md:p-4 border-t border-gray-200 text-sm text-gray-800 hover:bg-gray-50 transition-colors">
                  <div className="text-left font-medium truncate" title={invoice.customerName}>
                    {invoice.customerName}
                  </div>
                  <div className="text-left truncate" title={invoice.profileName}>
                    {invoice.profileName}
                  </div>
                  <div className="text-center">{invoice.frequency}</div>
                  <div className="text-center">{formatDate(invoice.lastInvoiceDate)}</div>
                  <div className="text-center font-medium text-blue-600">
                    {formatDate(invoice.nextInvoiceDate)}
                  </div>
                  <div className="text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${statusColors[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="text-right flex items-center justify-end space-x-2">
                    <span className="font-medium">{invoice.amount}</span>
                    <button
                      onClick={() => { setSelectedInvoice({ id: invoice.id }); setIsFormOpen(true); }}
                      className="text-gray-400 hover:text-blue-600 p-1"
                      title="Edit invoice"
                      aria-label="Edit invoice"
                    >
                      <Pencil className="h-4 sm:h-5 w-4 sm:w-5" />
                    </button>
                    {isDue && (
                      <button
                        onClick={() => handleGenerate(invoice.id, invoice.nextInvoiceDate, invoice.status)}
                        className="text-gray-400 hover:text-green-600 p-1"
                        title="Generate invoice"
                        aria-label="Generate invoice"
                      >
                        <Calendar className="h-4 sm:h-5 w-4 sm:w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete invoice"
                      aria-label="Delete invoice"
                    >
                      <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 sm:p-6 md:p-8 text-center text-gray-500 text-sm sm:text-base">
              No recurring invoices found.
            </div>
          )}
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden space-y-2 sm:space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => {
              const isDue = new Date(invoice.nextInvoiceDate) <= new Date() && invoice.status === 'ACTIVE';
              return (
                <div key={invoice.id} className="bg-white rounded-lg shadow p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base" title={invoice.customerName}>
                      {invoice.customerName}
                    </h3>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${statusColors[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                      {invoice.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profile:</span>
                      <span className="font-medium truncate">{invoice.profileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Frequency:</span>
                      <span>{invoice.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Invoice:</span>
                      <span>{formatDate(invoice.lastInvoiceDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next Invoice:</span>
                      <span className="font-medium text-blue-600">{formatDate(invoice.nextInvoiceDate)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-medium">{invoice.amount}</span>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2 sm:pt-3">
                      <button
                        onClick={() => { setSelectedInvoice({ id: invoice.id }); setIsFormOpen(true); }}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Edit invoice"
                        aria-label="Edit invoice"
                      >
                        <Pencil className="h-5 sm:h-6 w-5 sm:w-6" />
                      </button>
                      {isDue && (
                        <button
                          onClick={() => handleGenerate(invoice.id, invoice.nextInvoiceDate, invoice.status)}
                          className="text-gray-400 hover:text-green-600 p-1"
                          title="Generate invoice"
                          aria-label="Generate invoice"
                        >
                          <Calendar className="h-5 sm:h-6 w-5 sm:w-6" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Delete invoice"
                        aria-label="Delete invoice"
                      >
                        <Trash2 className="h-5 sm:h-6 w-5 sm:w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
              No recurring invoices found.
            </div>
          )}
        </div>
        
        <div className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 text-center">
          Showing {filteredInvoices.length} of {recurringInvoices.length} invoices
        </div>

        <RecurringInvoiceForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setSelectedInvoice(null); }}
          onSuccess={handleSuccess}
          isEdit={!!selectedInvoice}
          initialData={selectedInvoice || {}}
        />
      </div>
    </div>
  );
};

export default RecurringInvoices;