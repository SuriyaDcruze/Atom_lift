import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ErrorToast from '../messages/ErrorToast';
import SuccessToast from '../messages/SuccessToast';

const AMCForm = ({
  isEdit = false,
  initialData = {},
  onClose,
  onSubmitSuccess,
  apiBaseUrl,
  dropdownOptions = {},
}) => {
  const location = useLocation();
  
  // Check if form is opened via navigation (with customerId parameter)
  const isNavigationMode = () => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.has('customerId');
  };
  
  const [newAMC, setNewAMC] = useState({
    customer: '',
    referenceId: '',
    amc_name: '',
    invoiceFrequency: '',
    amcType: '',
    startDate: '',
    endDate: '',
    equipmentNo: '',
    latitude: '',
    notes: '',
    isGenerateContractNow: false,
    noOfServices: '',
    amcServiceItem: '',
    price: '',
    no_of_lifts: '',
    gst_percentage: '',
    total: '',
    total_amount_paid: '0',
    ...initialData,
  });

  const [existingAmcTypes, setExistingAmcTypes] = useState([]);
  const [amcServiceItems, setAmcServiceItems] = useState([]);
  const [customers, setCustomers] = useState([]); // New state for customers

  const [modalState, setModalState] = useState({
    amcType: { isOpen: false, value: '', price: '', isEditing: false, editId: null },
  });

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

  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      showErrorMessage('Please log in to continue.');
      window.location.href = '/login';
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchOptions = async (field, retryCount = 2) => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const endpoints = {
        amcType: 'amc/amc-types',
        amcServiceItem: 'auth/item-list',
        customer: 'sales/customer-list', // Added customer endpoint
      };
      const endpoint = endpoints[field];
      const response = await axiosInstance.get(`${apiBaseUrl}/${endpoint}/`);
      if (field === 'amcType') {
        setExistingAmcTypes(response.data);
      } else if (field === 'amcServiceItem') {
        setAmcServiceItems(response.data);
      } else if (field === 'customer') {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error(`Error fetching ${field}:`, error);
      if (error.response?.status === 401) {
        showErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        setTimeout(() => fetchOptions(field, retryCount - 1), 2000);
      } else {
        showErrorMessage(`Failed to fetch ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`);
      }
    }
  };

  useEffect(() => {
    fetchOptions('amcType');
    fetchOptions('amcServiceItem');
    fetchOptions('customer'); // Fetch customers on mount
  }, []);

  // Handle customerId parameter for auto-population
  useEffect(() => {
    console.log('AMC Form - Checking navigation mode:', isNavigationMode());
    console.log('AMC Form - Location search:', location.search);
    
    if (isNavigationMode()) {
      const queryParams = new URLSearchParams(location.search);
      const customerId = queryParams.get('customerId');
      console.log('AMC Form - Customer ID from URL:', customerId);
      
      if (customerId) {
        console.log('AMC Form - Fetching customer details for ID:', customerId);
        fetchCustomerDetails(customerId);
      }
    }
  }, [location.search, customers]);

  useEffect(() => {
    const price = parseFloat(newAMC.price) || 0;
    const lifts = parseInt(newAMC.no_of_lifts) || 0;
    const gst = parseFloat(newAMC.gst_percentage) || 0;
    
    const calculatedTotal = price * lifts * (1 + gst / 100);
    
    setNewAMC(prev => ({ 
      ...prev, 
      total: calculatedTotal.toFixed(2)
    }));
  }, [newAMC.price, newAMC.no_of_lifts, newAMC.gst_percentage]);

  useEffect(() => {
    if (!isEdit && !newAMC.referenceId) {
      fetchNextReferenceId();
    }
  }, [isEdit, newAMC.referenceId]);

  const fetchNextReferenceId = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/amc/amc-list/`);
      const amcs = response.data;
      let nextId = 'AMC01';
      if (amcs.length > 0) {
        const numbers = amcs.map(amc => parseInt(amc.reference_id.replace('AMC', '')) || 0);
        const maxNum = Math.max(...numbers);
        nextId = `AMC${(maxNum + 1).toString().padStart(2, '0')}`;
      }
      setNewAMC(prev => ({ ...prev, referenceId: nextId }));
    } catch (error) {
      console.error('Error fetching next reference ID:', error);
      if (error.response?.status === 401) {
        showErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        showErrorMessage('Failed to generate reference ID. Please try again.');
      }
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    console.log('fetchCustomerDetails called with customerId:', customerId);
    console.log('Available customers:', customers);
    
    // Wait for customers to be loaded if not already loaded
    if (customers.length === 0) {
      console.log('Customers not loaded yet, waiting...');
      setTimeout(() => fetchCustomerDetails(customerId), 1000);
      return;
    }

    try {
      // Find customer by reference_id in the customers list
      const customerData = customers.find(customer => 
        customer.reference_id === customerId || 
        customer.id === customerId ||
        customer.site_id === customerId
      );
      
      console.log('Found customer data:', customerData);
      
      if (customerData) {
        // Auto-populate customer field
        setNewAMC(prev => ({
          ...prev,
          customer: customerData.site_name || '',
          equipmentNo: customerData.job_no || '', // Auto-populate equipment number with job number
        }));
        
        showSuccessMessage('Customer details loaded successfully.');
      } else {
        console.log('Customer not found with ID:', customerId);
        showErrorMessage(`Customer with ID ${customerId} not found.`);
      }
    } catch (error) {
      console.error('Error processing customer details:', error);
      showErrorMessage(`Failed to load customer details. Error: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setNewAMC((prev) => ({ ...prev, [name]: checked }));
    } else {
      setNewAMC((prev) => {
        const updatedAMC = { ...prev, [name]: value };
        
        // Auto-calculate end date when start date is selected
        if (name === 'startDate' && value) {
          const startDate = new Date(value);
          const endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
          
          // Format the date as YYYY-MM-DD for the input field
          const formattedEndDate = endDate.toISOString().split('T')[0];
          updatedAMC.endDate = formattedEndDate;
        }

        // Auto-fill equipment number from selected customer's job number
        if (name === 'customer') {
          const selectedCustomer = customers.find(c => c.site_name === value);
          updatedAMC.equipmentNo = selectedCustomer?.job_no || '';
        }
        
        return updatedAMC;
      });
    }
  };

  const openAddModal = (field, isEditing = false, editId = null, editValue = '', editPrice = '') => {
    setModalState((prev) => ({
      ...prev,
      [field]: { isOpen: true, value: editValue, price: editPrice, isEditing, editId },
    }));
  };

  const closeAddModal = (field) => {
    setModalState((prev) => ({
      ...prev,
      [field]: { isOpen: false, value: '', price: '', isEditing: false, editId: null },
    }));
  };

  const handleAddOption = async (field) => {
    const value = modalState[field].value.trim();
    const price = modalState[field].price.trim();
    if (!value) {
      showErrorMessage(`Please enter a ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`);
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      showErrorMessage('Please enter a valid price.');
      return;
    }

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const apiEndpoints = {
        amcType: 'amc-types/edit',
      };
      const addEndpoints = {
        amcType: 'amc-types/add',
      };
      const isEditing = modalState[field].isEditing;
      const editId = modalState[field].editId;

      if (isEditing) {
        await axiosInstance.put(
          `${apiBaseUrl}/amc/${apiEndpoints[field]}/${editId}/`,
          { name: value, price: parseFloat(price) }
        );
        showSuccessMessage(`${field.replace(/([A-Z])/g, ' $1').trim()} updated successfully.`);
      } else {
        await axiosInstance.post(
          `${apiBaseUrl}/amc/${addEndpoints[field]}/`,
          { name: value, price: parseFloat(price) }
        );
        setNewAMC((prev) => ({ ...prev, [field]: value }));
        showSuccessMessage(`${field.replace(/([A-Z])/g, ' $1').trim()} added successfully.`);
      }

      fetchOptions(field);
      closeAddModal(field);
      onSubmitSuccess();
    } catch (error) {
      console.error(`Error ${isEditing ? 'editing' : 'adding'} ${field}:`, error);
      if (error.response?.status === 401) {
        showErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        const errorMsg = error.response?.data?.name?.[0] || error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'add'} ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`;
        showErrorMessage(errorMsg);
      }
    }
  };

  const handleDeleteOption = async (field, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}?`)) {
      return;
    }

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const deleteEndpoints = {
        amcType: 'amc-types/delete',
      };
      await axiosInstance.delete(`${apiBaseUrl}/amc/${deleteEndpoints[field]}/${id}/`);
      showSuccessMessage(`${field.replace(/([A-Z])/g, ' $1').trim()} deleted successfully.`);
      fetchOptions(field);
    } catch (error) {
      console.error(`Error deleting ${field}:`, error);
      if (error.response?.status === 401) {
        showErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        showErrorMessage(
          error.response?.data?.error ||
            `Failed to delete ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`
        );
      }
    }
  };

  const handleSubmit = async () => {
    const requiredFields = ['customer', 'referenceId', 'startDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !newAMC[field]);

    if (missingFields.length > 0) {
      showErrorMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (newAMC.isGenerateContractNow && !newAMC.amcServiceItem) {
      showErrorMessage('Please select an AMC Service Item when generating contract');
      return;
    }

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const selectedCustomer = customers.find(c => c.site_name === newAMC.customer);
      
      if (!selectedCustomer) {
        showErrorMessage('Selected customer not found');
        return;
      }

      const formData = new FormData();
      formData.append('customer', selectedCustomer.id);
      formData.append('reference_id', newAMC.referenceId);
      formData.append('amcname', newAMC.amc_name || '');
      formData.append('invoice_frequency', newAMC.invoiceFrequency || 'annually');
      
      if (newAMC.amcType) {
        const amcTypesResponse = await axiosInstance.get(`${apiBaseUrl}/amc/amc-types/`);
        const selectedAmcType = amcTypesResponse.data.find(t => t.name === newAMC.amcType);
        if (selectedAmcType) {
          formData.append('amc_type', selectedAmcType.id);
        } else {
          throw new Error('Selected AMC Type not found');
        }
      }
      
      
      formData.append('start_date', newAMC.startDate);
      formData.append('end_date', newAMC.endDate);
      formData.append('equipment_no', newAMC.equipmentNo || '');
      formData.append('latitude', newAMC.latitude || '');
      formData.append('notes', newAMC.notes || '');
      formData.append('is_generate_contract', newAMC.isGenerateContractNow);
      formData.append('no_of_services', newAMC.noOfServices || '12');
      if (newAMC.amcServiceItem) {
        formData.append('amc_service_item', newAMC.amcServiceItem);
      }
      formData.append('price', newAMC.price || '0');
      formData.append('no_of_lifts', newAMC.no_of_lifts || '0');
      formData.append('gst_percentage', newAMC.gst_percentage || '0');
      formData.append('total', newAMC.total || '0');
      formData.append('total_amount_paid', newAMC.total_amount_paid || '0');

      const endpoint = isEdit ? `/amc/amc-update/${initialData.id}/` : '/amc/amc-add/';
      const method = isEdit ? axiosInstance.put : axiosInstance.post;
      const response = await method(`${apiBaseUrl}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSubmitSuccess(response.data.message);
      onClose();
    } catch (error) {
      console.error('Error submitting AMC:', error.response ? error.response.data : error.message);
      if (error.response?.status === 401) {
        showErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else if (error.response?.status === 500) {
        showErrorMessage('Server error occurred. Please check the console for details or contact support.');
      } else {
        const errorDetails = error.response?.data || { error: 'An unknown error occurred' };
        Object.entries(errorDetails).forEach(([key, value]) => {
          showErrorMessage(`${key}: ${Array.isArray(value) ? value[0] : value}`);
        });
      }
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
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">{isEdit ? 'Edit AMC' : 'Create AMC'}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Lift Information Message - Only show during navigation */}
              {isNavigationMode() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Add Lift to customer </strong>
                      <button 
                        onClick={() => {
                          // Navigate to lift form or open lift modal
                          window.open('/dashboard/customers', '_blank');
                        }}
                        className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-semibold"
                      >
                        here
                      </button>
                      <strong>, if you have added Lifts, click to refresh</strong>
                    </p>
                  </div>
                </div>
              </div>
              )}
              
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <select
                  name="customer"
                  value={newAMC.customer}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.site_name}>
                      {customer.site_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference ID *
                </label>
                <input
                  type="text"
                  name="referenceId"
                  value={newAMC.referenceId}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-100"
                  required
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AMC Pack Name
                </label>
                <input
                  type="text"
                  name="amc_name"
                  value={newAMC.amc_name}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Frequency
                </label>
                <select
                  name="invoiceFrequency"
                  value={newAMC.invoiceFrequency}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select Frequency</option>
                  <option value="annually">Annually</option>
                  <option value="semi_annually">Semi Annually</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                  <option value="per service">Per service</option>
                 
                </select>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AMC Type
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    name="amcType"
                    value={newAMC.amcType}
                    onChange={handleInputChange}
                    className="block flex-grow px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                  >
                    <option value="">Select AMC Type</option>
                    {existingAmcTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => openAddModal('amcType')}
                    className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={newAMC.startDate}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={newAMC.endDate}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment No
                </label>
                <input
                  type="text"
                  name="equipmentNo"
                  value={newAMC.equipmentNo}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={newAMC.latitude}
                  onChange={handleInputChange}
                  step="any"
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Enter latitude coordinate"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={newAMC.notes}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No of Services
                </label>
                <input
                  type="number"
                  name="noOfServices"
                  value={newAMC.noOfServices}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>
              <div className="form-group">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isGenerateContractNow"
                    checked={newAMC.isGenerateContractNow}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Generate Contract Now
                  </span>
                </label>
              </div>

              {newAMC.isGenerateContractNow && (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select AMC Service Item
                    </label>
                    <select
                      name="amcServiceItem"
                      value={newAMC.amcServiceItem}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                    >
                      <option value="">Select Item</option>
                      {amcServiceItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newAMC.price}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No of Lifts
                    </label>
                    <input
                      type="number"
                      name="no_of_lifts"
                      value={newAMC.no_of_lifts}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      % GST
                    </label>
                    <input
                      type="number"
                      name="gst_percentage"
                      value={newAMC.gst_percentage}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <input
                      type="number"
                      name="total"
                      value={newAMC.total}
                      readOnly
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount Paid
                    </label>
                    <input
                      type="number"
                      name="total_amount_paid"
                      value={newAMC.total_amount_paid}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-[#2D3A6B] to-[#243158] rounded-lg text-white font-medium hover:from-[#213066] hover:to-[#182755] transition-all duration-200 shadow-md"
          >
            {isEdit ? 'Update AMC' : 'Create AMC'}
          </button>
        </div>
      </div>

      {Object.entries(modalState).map(([field, { isOpen, value, isEditing, editId }]) => (
        isOpen && (
          <div key={field} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {isEditing ? `Edit ${field.replace(/([A-Z])/g, ' $1').trim()}` : `Add New ${field.replace(/([A-Z])/g, ' $1').trim()}`}
              </h3>
              <div className="space-y-4 mb-4">
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    setModalState((prev) => ({
                      ...prev,
                      [field]: { ...prev[field], value: e.target.value },
                    }))
                  }
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder={`Enter new ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`}
                />
                <input
                  type="number"
                  value={modalState[field].price}
                  onChange={(e) =>
                    setModalState((prev) => ({
                      ...prev,
                      [field]: { ...prev[field], price: e.target.value },
                    }))
                  }
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Existing {field.replace(/([A-Z])/g, ' $1').trim()}s</h4>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Price</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {existingAmcTypes.length > 0 ? (
                        existingAmcTypes.map((option) => (
                          <tr key={option.id} className="border-t">
                            <td className="p-2">{option.name}</td>
                            <td className="p-2">₹{option.price || '0.00'}</td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => openAddModal(field, true, option.id, option.name, option.price)}
                                className="text-blue-500 hover:text-blue-700 mr-2"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOption(field, option.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-2 text-center text-gray-500">
                            No {field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}s found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => closeAddModal(field)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddOption(field)}
                  disabled={!value.trim() || !modalState[field].price.trim()}
                  className={`px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-medium transition-all duration-200 ${!value.trim() || !modalState[field].price.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-700'}`}
                >
                  {isEditing ? `Update ${field.replace(/([A-Z])/g, ' $1').trim()}` : `Add ${field.replace(/([A-Z])/g, ' $1').trim()}`}
                </button>
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default AMCForm;