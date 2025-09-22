import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const PaymentReceivedForm = ({ isOpen, onClose, onPaymentAdded }) => {
  const [formData, setFormData] = useState({
    date: '',
    paymentNumber: '',
    siteName: '',
    customer: '',
    invoiceNumber: '',
    mode: 'CASH',
    amount: '',
    unusedAmount: ''
  });
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication token not found');
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchData = async (endpoint, setter, retryCount = 2) => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_BASE_API}/${endpoint}/`);
      if (!response.data) throw new Error('No data received');
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        console.log(`Retrying fetch for ${endpoint}... (${retryCount} attempts left)`);
        setTimeout(() => fetchData(endpoint, setter, retryCount - 1), 2000);
      } else {
        setError(`Failed to fetch ${endpoint.replace(/[-]/g, ' ').trim()}.`);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData('sales/customer-list', setCustomers);
      fetchData('sales/invoice-list', setInvoices);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
      if (name === 'customer' && value) {
        const selectedCustomer = customers.find((cust) => cust.id === parseInt(value));
        if (selectedCustomer) {
          updatedFormData.siteName = selectedCustomer.site_name || '';
        }
        updatedFormData.invoiceNumber = '';
      }
      return updatedFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.customer) {
      setError('Please select a customer.');
      setIsSubmitting(false);
      return;
    }

    try {
      const axiosInstance = createAxiosInstance();
      if (!axiosInstance) throw new Error('Authentication failed');

      const selectedInvoiceId = formData.invoiceNumber 
        ? invoices.find(inv => inv.reference_id === formData.invoiceNumber)?.id 
        : null;

      const payload = {
        customer: parseInt(formData.customer),
        invoice: selectedInvoiceId ? parseInt(selectedInvoiceId) : null,
        amount: parseFloat(formData.amount) || 0,
        date: formData.date,
        payment_type: formData.mode === 'CASH' ? 'cash' : 'bank_transfer',
        tax_deducted: 'no'
      };
      console.log('Sending payload:', payload); // Debug payload

      const response = await axiosInstance.post(`${import.meta.env.VITE_BASE_API}/sales/add-payment-received/`, payload);

      if (!response.data || !response.data.id) {
        throw new Error(response.data?.error || 'Failed to add payment');
      }

      const result = response.data;
      if (typeof onPaymentAdded === 'function') {
        onPaymentAdded(result);
      } else {
        console.warn('onPaymentAdded is not a function. Please ensure it is passed correctly.');
      }
      onClose();
      setFormData({
        date: '',
        paymentNumber: '',
        siteName: '',
        customer: '',
        invoiceNumber: '',
        mode: 'CASH',
        amount: '',
        unusedAmount: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to submit payment');
      console.error('Submission error:', err.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Payment Received</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Number</label>
              <input
                type="text"
                name="paymentNumber"
                value={formData.paymentNumber}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.billing_name} (ID: {customer.reference_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <select
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Invoice</option>
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.reference_id}>
                    {invoice.reference_id} (Due: {invoice.due_date})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CASH">CASH</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unused Amount (INR)</label>
              <input
                type="number"
                name="unusedAmount"
                value={formData.unusedAmount}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-[#243158] text-white px-4 py-2 rounded ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentReceivedForm;