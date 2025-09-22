import React, { useState, useEffect } from 'react';
import { Search, Calendar, Trash2 } from 'lucide-react';
import PaymentReceivedForm from '../Dashboard/Forms/PaymentReceivedForm';
import axios from 'axios';

const PaymentReceived = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customer, setCustomer] = useState('ALL');
  const [paymentMode, setPaymentMode] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const createAxiosInstance = (isBlob = false) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Authentication token not found');
      setError('Authentication token not found. Please log in.');
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
      ...(isBlob && { responseType: 'blob' }), // Only for file downloads
    });
  };

  const fetchPayments = async (retryCount = 2) => {
    setLoading(true);
    setError(null);
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BASE_API}/sales/payment-received-list/`);
      console.log('API Response:', response.data); // Debug log
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format received from API');
      }
      const mappedPayments = response.data.map(payment => ({
        id: payment.id || '',
        date: payment.date || '',
        paymentNumber: payment.payment_number || '',
        siteName: payment.site_name || '',
        customerName: payment.customer_name || 'Unknown',
        invoiceNumber: payment.invoice_reference || '',
        mode: payment.payment_type || '',
        amount: `INR ${parseFloat(payment.amount || 0).toFixed(2)}`,
        unusedAmount: payment.unused_amount ? `INR ${parseFloat(payment.unused_amount).toFixed(2)}` : '-'
      }));
      setPayments(mappedPayments);
      console.log('Mapped Payments:', mappedPayments); // Debug log
    } catch (error) {
      console.error('Error fetching payments:', error.response ? error.response : error);
      const message = error.response?.status === 401
        ? 'Session expired. Please log in again.'
        : error.code === 'ERR_NETWORK'
          ? `Network error. Retrying... (${retryCount} attempts left)`
          : 'Failed to fetch payments. Check server or API endpoint.';
      setError(message);
      if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        setTimeout(() => fetchPayments(retryCount - 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await axiosInstance.delete(`${import.meta.env.VITE_BASE_API}/sales/delete-payment-received/${paymentId}/`);
        setPayments((prev) => prev.filter((payment) => payment.id !== paymentId));
        console.log('Payment deleted successfully');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert(error.response?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to delete payment.');
      }
    }
  };

  const handleExport = async () => {
    const axiosInstance = createAxiosInstance(true); // Use blob response type
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BASE_API}/sales/export-payments-received-to-excel/`);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments_received_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Export successful');
    } catch (error) {
      console.error('Error exporting payments:', error);
      alert(error.response?.status === 401
        ? 'Session expired. Please log in again.'
        : 'Failed to export payments.');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log({ startDate, endDate, customer, paymentMode });
    // Implement client-side filtering for now, as API doesn't support query params
    let filteredPayments = [...payments];
    if (startDate) {
      filteredPayments = filteredPayments.filter(payment => new Date(payment.date) >= new Date(startDate));
    }
    if (endDate) {
      filteredPayments = filteredPayments.filter(payment => new Date(payment.date) <= new Date(endDate));
    }
    if (customer !== 'ALL') {
      filteredPayments = filteredPayments.filter(payment => payment.customerName === customer);
    }
    if (paymentMode !== 'ALL') {
      filteredPayments = filteredPayments.filter(payment => payment.mode === paymentMode);
    }
    setPayments(filteredPayments);
  };

  const handlePaymentAdded = (newPayment) => {
    setPayments((prev) => [...prev, {
      id: newPayment.id || '',
      date: newPayment.date || '',
      paymentNumber: newPayment.payment_number || newPayment.paymentNumber || '',
      siteName: newPayment.site_name || newPayment.siteName || '',
      customerName: newPayment.customer_name || newPayment.customerName || 'Unknown',
      invoiceNumber: newPayment.invoice_reference || newPayment.invoiceNumber || '',
      mode: newPayment.payment_type || newPayment.mode || '',
      amount: `INR ${parseFloat(newPayment.amount || 0).toFixed(2)}`,
      unusedAmount: newPayment.unused_amount ? `INR ${parseFloat(newPayment.unused_amount).toFixed(2)}` : '-'
    }]);
    setIsFormOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Payment Received</h1>
        
        <div className="flex flex-col sm:flex-row justify-end mb-4 md:mb-6 gap-2">
          <button
            onClick={handleExport}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm sm:text-base w-full sm:w-auto hover:bg-gray-300 transition-colors"
          >
            Export
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-[#243158] text-white px-4 py-2 rounded text-sm sm:text-base w-full sm:w-auto hover:bg-[#1e2a44] transition-colors"
          >
            + Add Payment
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 md:mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              >
                <option value="ALL">ALL</option>
                <option value="Customer1">Customer 1</option>
                <option value="Customer2">Customer 2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              >
                <option value="ALL">ALL</option>
                <option value="CASH">CASH</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#243158] text-white py-2 px-4 rounded w-full sm:w-auto text-xs sm:text-sm font-medium hover:bg-[#1e2a44] transition-colors"
            >
              <Search className="h-4 w-4 inline mr-2" />
              Search
            </button>
          </form>
        </div>
        
        {loading && <div className="text-center text-gray-500 text-sm sm:text-base">Loading...</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 sm:p-4 rounded mb-4 text-sm sm:text-base">{error}</div>}
        
        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-8 bg-gray-100 p-3 text-xs sm:text-sm font-semibold text-gray-700 border-b border-gray-200">
            <div className="p-2 text-center">Date</div>
            <div className="p-2 text-center">Payment No.</div>
            <div className="p-2 text-left">Site / Customer</div>
            <div className="p-2 text-center">Invoice No.</div>
            <div className="p-2 text-center">Mode</div>
            <div className="p-2 text-right">Amount</div>
            <div className="p-2 text-right">Unused Amount</div>
            <div className="p-2 text-center">Action</div>
          </div>
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <div key={index} className="grid grid-cols-8 p-3 border-b border-gray-200 text-xs sm:text-sm text-gray-800 hover:bg-gray-50 transition-colors">
                <div className="p-2 text-center">{formatDate(payment.date)}</div>
                <div className="p-2 text-center">{payment.paymentNumber}</div>
                <div className="p-2 text-left flex flex-col">
                  <span className="truncate">{payment.siteName}</span>
                  <span className="text-xs text-gray-500 truncate">{payment.customerName}</span>
                </div>
                <div className="p-2 text-center">{payment.invoiceNumber}</div>
                <div className="p-2 text-center">{payment.mode}</div>
                <div className="p-2 text-right">{payment.amount}</div>
                <div className="p-2 text-right">{payment.unusedAmount}</div>
                <div className="p-2 text-center">
                  <button
                    onClick={() => handleDeletePayment(payment.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
              No payments found.
            </div>
          )}
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span>{formatDate(payment.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment No.:</span>
                    <span>{payment.paymentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Site / Customer:</span>
                    <div className="text-right">
                      <span className="block truncate">{payment.siteName}</span>
                      <span className="text-xs text-gray-500">{payment.customerName}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice No.:</span>
                    <span>{payment.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mode:</span>
                    <span>{payment.mode}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium">{payment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unused Amount:</span>
                    <span>{payment.unusedAmount}</span>
                  </div>
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete payment"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 text-sm sm:text-base">
              No payments found.
            </div>
          )}
        </div>
        
        <div className="text-xs sm:text-sm text-gray-500 mt-4 text-center">
          Showing {payments.length} of {payments.length} payments
        </div>

        <PaymentReceivedForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onPaymentAdded={handlePaymentAdded}
        />
      </div>
    </div>
  );
};

export default PaymentReceived;