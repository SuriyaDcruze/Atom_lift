import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const ComplaintForm = ({ isEdit, initialData, onClose, onSubmitSuccess, onSubmitError, apiBaseUrl: propApiBaseUrl = apiBaseUrl }) => {
  const [formData, setFormData] = useState({
    reference: '',
    type: 'Service Request',
    date: new Date().toISOString().split('T')[0],
    customer: '',
    contactPersonName: '',
    contactPersonMobile: '',
    blockWing: '',
    assignTo: '',
    priority: 'Medium',
    subject: '',
    message: '',
  });

  const [customers, setCustomers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState({ customers: true, salesmen: true });
  const [error, setError] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('Please log in to continue.');
          window.location.href = '/login';
          return;
        }

        console.log('Fetching data with token:', token.substring(0, 10) + '...');

        // Fetch customers
        const customerResponse = await axios.get(`${propApiBaseUrl}/sales/customer-list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Customers response:', customerResponse.data);
        setCustomers(customerResponse.data || []);
        setOptionsLoading((prev) => ({ ...prev, customers: false }));

        // Fetch salesmen (CustomUser with role='SALESMAN')
        const usersResponse = await axios.get(`${propApiBaseUrl}/auth/list-users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Users response:', usersResponse.data);
        const allUsers = usersResponse.data || [];
        const filteredSalesmen = allUsers.filter(user => user.role === 'SALESMAN');
        setSalesmen(filteredSalesmen);
        setOptionsLoading((prev) => ({ ...prev, salesmen: false }));

        // Fetch complaints to generate reference ID (only for create mode)
        if (!isEdit) {
          const complaintResponse = await axios.get(`${propApiBaseUrl}/auth/complaint-list/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Complaints response:', complaintResponse.data);
          const complaints = complaintResponse.data || [];
          let newRefId = 'CMP1001';
          if (complaints.length > 0) {
            const lastComplaint = complaints[complaints.length - 1];
            const lastId = parseInt(lastComplaint.reference.replace('CMP', '')) || 1000;
            newRefId = `CMP${String(lastId + 1)}`;
          }
          setFormData((prev) => ({
            ...prev,
            reference: newRefId,
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error.response || error);
        const errorMsg = error.response?.data?.error || 'Failed to fetch data.';
        toast.error(errorMsg);
        setError(errorMsg);
        setOptionsLoading((prev) => ({ ...prev, customers: false, salesmen: false }));
      }
    };

    fetchData();
  }, [isEdit, propApiBaseUrl]);

  // Filter customers based on search input
  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter(customer =>
        customer.site_name.toLowerCase().includes(customerSearch.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearch, customers]);

  useEffect(() => {
    if (!optionsLoading.customers && !optionsLoading.salesmen && isEdit && initialData) {
      const selectedCustomer = customers.find(c => c.site_name === initialData.customer) || {};
      const selectedSalesman = salesmen.find(s => s.username === initialData.assignedTo) || {};

      setFormData({
        reference: initialData.reference || '',
        type: initialData.type || 'Service Request',
        date: initialData.created ? new Date(initialData.created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        customer: selectedCustomer.site_name || '',
        contactPersonName: initialData.createdBy || selectedCustomer.contact_person_name || '',
        contactPersonMobile: initialData.contact_person_mobile || selectedCustomer.phone || '',
        blockWing: initialData.block_wing || selectedCustomer.site_address || '',
        assignTo: selectedSalesman.id || '',
        priority: initialData.status || 'Medium',
        subject: initialData.subject || '',
        message: initialData.message || '',
      });
      
      // Set customer search value for the input field
      setCustomerSearch(selectedCustomer.site_name || '');
    }
  }, [isEdit, initialData, customers, salesmen, optionsLoading.customers, optionsLoading.salesmen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    setShowCustomerDropdown(true);
    
    // Update the customer field in form data
    setFormData((prev) => ({ ...prev, customer: value }));
  };

  const handleCustomerSelect = (customer) => {
    setCustomerSearch(customer.site_name);
    setFormData((prev) => ({
      ...prev,
      customer: customer.site_name,
      contactPersonName: customer.contact_person_name || '',
      contactPersonMobile: customer.phone || '',
      blockWing: customer.site_address || '',
    }));
    setShowCustomerDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please log in to continue.');
        window.location.href = '/login';
        return;
      }

      // Find the selected customer by name
      const selectedCustomer = customers.find(c => c.site_name === formData.customer);
      
      const submitData = {
        type: formData.type,
        date: formData.date,
        customer: selectedCustomer ? selectedCustomer.id : null,
        contact_person_name: formData.contactPersonName,
        contact_person_mobile: formData.contactPersonMobile,
        block_wing: formData.blockWing,
        assign_to: formData.assignTo ? parseInt(formData.assignTo) : null,
        priority: formData.priority,
        subject: formData.subject,
        message: formData.message,
      };

      console.log('Submitting data:', submitData);

      let response;
      if (isEdit && initialData?.id) {
        response = await axios.put(`${propApiBaseUrl}/auth/edit-complaint/${initialData.id}/`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Complaint updated successfully.');
      } else {
        response = await axios.post(`${propApiBaseUrl}/auth/add-complaint/`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Complaint created successfully.');
      }

      // Pass the response data including qr_code_url to parent
      onSubmitSuccess?.({ ...response.data, qr_code_url: response.data.qr_code_url });
      onClose();
    } catch (error) {
      console.error('Error submitting complaint:', error.response || error);
      const errorMsg = error.response?.data?.error || error.response?.data?.non_field_errors?.[0] || 'Failed to submit complaint.';
      toast.error(errorMsg);
      onSubmitError?.(error);
    } finally {
      setLoading(false);
    }
  };

  if (optionsLoading.customers || optionsLoading.salesmen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 text-center text-red-500">
          <p>Error: {error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] px-6 py-4 text-white flex justify-between items-center">
            <h3 className="text-xl font-semibold">{isEdit ? 'Edit Complaint' : 'New Complaint'}</h3>
            <button type="button" onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    REFERENCE ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    readOnly
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-700"
                  />
                </div>
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TYPE <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="Site Inspection">Site Inspection</option>
                    <option value="Spec Checking">Spec Checking</option>
                    <option value="Break Down Calls">Break Down Calls</option>
                    <option value="Service Request">Service Request</option>
                    <option value="New Installation">New Installation</option>
                  </select>
                </div>
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DATE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                {/* Customer */}
                <div className="form-group relative">
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
                {/* Contact Person Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CONTACT PERSON NAME
                  </label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {/* Contact Person Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CONTACT PERSON MOBILE
                  </label>
                  <input
                    type="tel"
                    name="contactPersonMobile"
                    value={formData.contactPersonMobile}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Block/Wing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BLOCK/WING
                  </label>
                  <input
                    type="text"
                    name="blockWing"
                    value={formData.blockWing}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {/* Assign To (Salesman) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ASSIGN TO (SALESMAN)
                  </label>
                  <select
                    name="assignTo"
                    value={formData.assignTo}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Salesman</option>
                    {salesmen.map((salesman) => (
                      <option key={salesman.id} value={salesman.id}>
                        {salesman.username}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PRIORITY <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SUBJECT
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {/* Message */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MESSAGE
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="3"
                    placeholder="Describe the issue..."
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
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#2D3A6B] to-[#243158] rounded-lg text-white font-medium hover:from-[#213066] hover:to-[#182755] transition-all duration-200 shadow-md"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Complaint' : 'Create Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;