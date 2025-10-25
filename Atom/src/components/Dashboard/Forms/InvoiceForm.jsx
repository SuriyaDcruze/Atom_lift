import { useState, useEffect } from 'react';
import axios from 'axios';
import ErrorToast from '../messages/ErrorToast';
import SuccessToast from '../messages/SuccessToast';

const InvoiceForm = ({
  onClose,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState({
    reference_id: '',
    customer: '',
    amc: '',
    start_date: '',
    due_date: '',
    discount: '',
    payment_term: '',
    note: '',
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [amcList, setAmcList] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const [alertMessage, setAlertMessage] = useState({
    show: false,
    type: '', // 'success' or 'error'
    message: '',
    description: ''
  });

  // Helper functions for showing alert messages
  const showSuccessMessage = (message, description = '', autoHide = true) => {
    setAlertMessage({
      show: true,
      type: 'success',
      message,
      description
    });
    // Auto-hide after 3 seconds only if autoHide is true
    if (autoHide) {
      setTimeout(() => {
        setAlertMessage(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  const showErrorMessage = (message, description = '') => {
    setAlertMessage({
      show: true,
      type: 'error',
      message,
      description
    });
    // Auto-hide after 5 seconds for errors
    setTimeout(() => {
      setAlertMessage(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Filter customers based on search input
  useEffect(() => {
    if (customerSearch) {
      const filtered = customerList.filter(customer =>
        customer.site_name.toLowerCase().includes(customerSearch.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customerList);
    }
  }, [customerSearch, customerList]);

  // Sync customer search with form data when form is loaded with existing data
  useEffect(() => {
    if (formData.customer && !customerSearch) {
      // Find customer by ID and set the search value to the customer name
      const selectedCustomer = customerList.find(c => c.id === formData.customer);
      if (selectedCustomer) {
        setCustomerSearch(selectedCustomer.site_name);
      }
    }
  }, [formData.customer, customerSearch, customerList]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        showErrorMessage('Please log in to continue.');
        window.location.href = '/login';
        return;
      }
      try {
        // Fetch customers
        const customerRes = await axios.get(
          `${import.meta.env.VITE_BASE_API}/sales/customer-list/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomerList(customerRes.data || []);
      } catch (err) {
        showErrorMessage('Failed to fetch customer list.');
      }
      try {
        // Fetch AMC list
        const amcRes = await axios.get(
          `${import.meta.env.VITE_BASE_API}/amc/amc-list/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAmcList(amcRes.data || []);
      } catch (err) {
        showErrorMessage('Failed to fetch AMC list.');
      }
      try {
        // Fetch last invoice to generate reference_id
        const invoiceRes = await axios.get(
          `${import.meta.env.VITE_BASE_API}/sales/invoice-list/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const invoices = invoiceRes.data || [];
        let newRefId = 'INV001';
        if (invoices.length > 0) {
          const lastInvoice = invoices[invoices.length - 1];
          const lastId = parseInt(lastInvoice.reference_id.replace('INV', '')) || 0;
          newRefId = `INV${String(lastId + 1).padStart(3, '0')}`;
        }
        setFormData((prev) => ({
          ...prev,
          reference_id: newRefId,
        }));
      } catch (err) {
        showErrorMessage('Failed to fetch invoice list for reference ID.');
      }
    };
    fetchDropdowns();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    setShowCustomerDropdown(true);
    
    // Find the customer by name and set the ID
    const selectedCustomer = customerList.find(c => c.site_name === value);
    setFormData(prev => ({ ...prev, customer: selectedCustomer ? selectedCustomer.id : value }));
  };

  const handleCustomerSelect = (customer) => {
    setCustomerSearch(customer.site_name);
    setFormData(prev => ({
      ...prev,
      customer: customer.id
    }));
    setShowCustomerDropdown(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reference_id || !formData.customer || !formData.amc || !formData.start_date || !formData.due_date) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      setIsSubmitting(false);
      window.location.href = '/login';
      return;
    }
    try {
      const payload = new FormData();
      payload.append('reference_id', formData.reference_id);
      payload.append('customer', formData.customer);
      payload.append('amc', formData.amc);
      payload.append('start_date', formData.start_date);
      payload.append('due_date', formData.due_date);
      if (formData.discount) payload.append('discount', formData.discount);
      if (formData.payment_term) payload.append('payment_term', formData.payment_term);
      if (file) payload.append('uploads_files', file);
      if (formData.note) payload.append('note', formData.note);

      await axios.post(
        `${import.meta.env.VITE_BASE_API}/sales/add-invoice/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Invoice created successfully.');
      if (onSubmitSuccess) onSubmitSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
        'Failed to create invoice.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Fixed positioned messages in right bottom corner */}
      {alertMessage.show && (
        <div className="fixed bottom-4 right-4 z-[60] max-w-sm animate-in slide-in-from-right-2 duration-300">
          {alertMessage.type === 'success' ? (
            <SuccessToast 
              message={alertMessage.message} 
              description={alertMessage.description}
              autoClose={3000}
              onClose={() => setAlertMessage(prev => ({ ...prev, show: false }))}
            />
          ) : (
            <ErrorToast 
              message={alertMessage.message} 
              description={alertMessage.description}
              autoClose={5000}
              onClose={() => setAlertMessage(prev => ({ ...prev, show: false }))}
            />
          )}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] p-6">
          <h2 className="text-2xl font-bold text-white">
            Create New Invoice
          </h2>
          <p className="text-white">
            Fill in all required fields (<span className="text-red-300">*</span>)
          </p>
        </div>
        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Invoice Details
                </h3>
                {/* Reference ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    REFERENCE ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="reference_id"
                    value={formData.reference_id}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    readOnly
                  />
                </div>
                {/* Customer */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CUSTOMER <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer"
                    value={customerSearch}
                    onChange={handleCustomerSearch}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="Search customer..."
                    required
                  />
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{customer.site_name}</div>
                          {customer.contact_person_name && (
                            <div className="text-sm text-gray-500">{customer.contact_person_name}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* AMC */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AMC <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="amc"
                    value={formData.amc}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    required
                  >
                    <option value="">Select AMC</option>
                    {amcList.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.amc_type_name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    START DATE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DUE DATE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
              </div>
              {/* Right Column */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Payment & Attachments
                </h3>
                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DISCOUNT
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                {/* Payment Term */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAYMENT TERM
                  </label>
                  <select
                    name="payment_term"
                    value={formData.payment_term}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Payment Term</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="neft">NEFT</option>
                  </select>
                </div>
                {/* Uploads Files */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPLOADS FILES
                  </label>
                  <input
                    type="file"
                    name="uploads_files"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  />
                </div>
                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NOTE
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#2D3A6B] to-[#243158] rounded-lg text-white font-medium hover:from-[#213066] hover:to-[#182755] transition-all duration-200 shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;