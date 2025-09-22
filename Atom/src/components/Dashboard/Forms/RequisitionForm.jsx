import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const RequisitionForm = ({
  isEdit = false,
  initialData = {},
  onClose,
  onSubmitSuccess,
  apiBaseUrl,
  dropdownOptions = {},
}) => {
  // Map initial amcId to amcname or fallback to reference_id
  const getInitialAmcName = (amcId, options) => {
    if (!amcId) return '';
    const selectedAmc = options.find(option => option.id === amcId);
    return selectedAmc ? selectedAmc.value : '';
  };

  // Form state
  const [requisition, setRequisition] = useState(() => {
    const initialAmcName = getInitialAmcName(initialData.amcId, []);
    return {
      date: new Date().toISOString().split('T')[0], // Default to today's date
      item: initialData.item || '',
      qty: initialData.qty || '',
      site: initialData.site || '',
      amcId: initialAmcName, // Use amcname or fallback for display
      service: initialData.service || '',
      employee: initialData.employee || '',
      ...initialData,
    };
  });

  // State for existing dropdown options
  const [existingOptions, setExistingOptions] = useState({
    item: [],
    amcId: [],
    employee: [],
    site: [],
  });

  // Centralized Axios instance with Bearer token
  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      window.location.href = '/login';
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // Fetch existing dropdown options
  const fetchOptions = async (field, retryCount = 2) => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const endpoints = {
        item: 'auth/item-list/',
        amcId: 'amc/amc-list/',
        employee: 'auth/employees/',
        site: 'sales/customer-list/',
      };
      const endpoint = endpoints[field];
      const response = await axiosInstance.get(`${apiBaseUrl}/${endpoint}`);

      // Log API response for debugging
      console.log(`Fetched ${field} options raw response:`, response.data);

      // Map API response to dropdown options
      let mappedOptions = [];
      if (field === 'item') {
        mappedOptions = response.data.map(item => ({
          id: item.id,
          value: item.name,
          item_number: item.item_number,
          name: item.name
        }));
      } else if (field === 'amcId') {
        if (!Array.isArray(response.data)) {
          console.error('Unexpected AMC data format:', response.data);
          mappedOptions = [];
        } else {
          mappedOptions = response.data.map(amc => {
            console.log('Mapping AMC:', amc); // Debug individual AMC objects
            return {
              id: amc.id,
              value: amc.amcname || amc.reference_id || 'Unnamed AMC', // Fallback to reference_id
              amcname: amc.amcname || amc.reference_id || 'Unnamed AMC' // Store for submission
            };
          });
        }
      } else if (field === 'employee') {
        mappedOptions = response.data.map(emp => ({
          id: emp.id,
          value: emp.name,
        }));
      } else if (field === 'site') {
        mappedOptions = response.data.map(customer => ({
          id: customer.id,
          value: customer.site_name,
          reference_id: customer.reference_id,
          site_name: customer.site_name
        }));
      }

      // Log mapped options for debugging
      console.log(`Mapped ${field} options:`, mappedOptions);

      setExistingOptions((prev) => {
        const updatedOptions = {
          ...prev,
          [field]: mappedOptions,
        };
        // Update amcId in requisition state if initialData has an amcId
        if (field === 'amcId' && initialData.amcId) {
          const amcName = getInitialAmcName(initialData.amcId, mappedOptions);
          setRequisition(prevState => ({
            ...prevState,
            amcId: amcName,
          }));
        }
        return updatedOptions;
      });

      // Update dropdownOptions if setter exists
      const optionKey = {
        item: 'itemOptions',
        amcId: 'amcIdOptions',
        employee: 'employeeOptions',
        site: 'siteOptions',
      }[field];
      if (dropdownOptions[`set${optionKey.charAt(0).toUpperCase() + optionKey.slice(1)}`]) {
        dropdownOptions[`set${optionKey.charAt(0).toUpperCase() + optionKey.slice(1)}`](
          mappedOptions.map(item => item.value)
        );
      } else {
        console.warn(`Setter for ${optionKey} not provided in dropdownOptions`);
      }
    } catch (error) {
      console.error(`Error fetching ${field}:`, error.response ? error.response.data : error.message);
      if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        setTimeout(() => fetchOptions(field, retryCount - 1), 2000);
      } else {
        toast.error(`Failed to fetch ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}. Check console for details.`);
      }
    }
  };

  // Fetch options on component mount
  useEffect(() => {
    const fields = ['item', 'amcId', 'employee', 'site'];
    fields.forEach(field => fetchOptions(field));
  }, []);

  // Log existingOptions for debugging
  useEffect(() => {
    console.log('Updated existingOptions:', existingOptions);
  }, [existingOptions]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequisition((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    const requiredFields = ['item', 'qty', 'site', 'employee', 'date'];
    const isValid = requiredFields.every((field) => requisition[field]?.trim());

    if (!isValid) {
      toast.error('Please fill in all required fields (*).');
      return;
    }

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const selectedItem = existingOptions.item.find((item) => item.value === requisition.item);
      const selectedEmployee = existingOptions.employee.find((emp) => emp.value === requisition.employee);
      const selectedSite = existingOptions.site.find((site) => site.value === requisition.site);
      const selectedAmc = existingOptions.amcId.find((amc) => amc.value === requisition.amcId);

      if (!selectedItem) {
        toast.error('Selected item is invalid. Please select an existing item.');
        return;
      }
      if (!selectedEmployee) {
        toast.error('Selected employee is invalid. Please select an existing employee.');
        return;
      }
      if (!selectedSite) {
        toast.error('Selected site is invalid. Please select an existing site.');
        return;
      }
      if (selectedAmc && !selectedAmc.amcname) {
        toast.error('Selected AMC has no valid name. Please select a valid AMC or update backend data.');
        return;
      }

      // Create the payload with the correct structure - IDs and amcname
      const requisitionData = {
        date: requisition.date,
        item_id: selectedItem.id,
        qty: parseInt(requisition.qty, 10),
        site_id: selectedSite.id,
        amc_pk: selectedAmc ? selectedAmc.id : null, // Use id for submission
        amcname: selectedAmc ? selectedAmc.amcname : null, // Include amcname
        service: requisition.service || '',
        employee_id: selectedEmployee.id,
        // status and approve_for are omitted as they will use model defaults
      };

      console.log('Submitting requisition payload:', requisitionData);

      let response;
      if (isEdit) {
        response = await axiosInstance.put(
          `${apiBaseUrl}/inventory/edit-requisition/${initialData.id}/`,
          requisitionData
        );
        toast.success('Requisition updated successfully.');
      } else {
        response = await axiosInstance.post(
          `${apiBaseUrl}/inventory/add-requisition/`,
          requisitionData
        );
        toast.success('Requisition created successfully.');
      }

      // Log the API response for debugging
      console.log('API response after submission:', response.data);

      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${isEdit ? 'editing' : 'creating'} requisition:`, error);
      const errorMsg = error.response?.data?.non_field_errors?.[0] ||
        Object.entries(error.response?.data || {})
          .map(([key, value]) => {
            if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
            if (typeof value === 'object' && value !== null) {
              // Handle nested object errors
              const nestedErrors = Object.entries(value)
                .map(([nestedKey, nestedValue]) => `${nestedKey}: ${nestedValue}`)
                .join(', ');
              return `${key}: {${nestedErrors}}`;
            }
            return `${key}: ${value}`;
          })
          .join('; ') ||
        `Failed to ${isEdit ? 'update' : 'create'} requisition.`;
      toast.error(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Main Form Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] p-6">
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Requisition' : 'Create New Requisition'}
          </h2>
          <p className="text-white">
            Fill in all required fields (*) to {isEdit ? 'update' : 'add'} a requisition
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Date */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={requisition.date}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243158] focus:border-[#243158] transition-all duration-200"
                required
              />
            </div>

            {/* Item */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item <span className="text-red-500">*</span>
              </label>
              <select
                name="item"
                value={requisition.item}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243158] focus:border-[#243158] transition-all duration-200 appearance-none bg-white"
                required
              >
                <option value="">Select Item</option>
                {existingOptions.item.length > 0 ? (
                  existingOptions.item.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.value}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading...</option>
                )}
              </select>
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="qty"
                value={requisition.qty}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243158] focus:border-[#243158] transition-all duration-200"
                required
              />
            </div>

            {/* Site */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site <span className="text-red-500">*</span>
              </label>
              <select
                name="site"
                value={requisition.site}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243158] focus:border-[#243158] transition-all duration-200 appearance-none bg-white"
                required
              >
                <option value="">Select Site</option>
                {existingOptions.site.length > 0 ? (
                  existingOptions.site.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.value}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading...</option>
                )}
              </select>
            </div>

            {/* AMC ID */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AMC Name
              </label>
              <select
                name="amcId"
                value={requisition.amcId}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243158] focus:border-[#243158] transition-all duration-200 appearance-none bg-white"
              >
                <option value="">Select AMC Name</option>
                {existingOptions.amcId.length > 0 ? (
                  existingOptions.amcId.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.value} {/* Display amcname or reference_id */}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading...</option>
                )}
              </select>
            </div>

            {/* Service */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <input
                type="text"
                name="service"
                value={requisition.service}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243158] focus:border-[#243158] transition-all duration-200"
                placeholder="Enter service description"
              />
            </div>

            {/* Employee */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employee"
                value={requisition.employee}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243158] focus:border-[#243158] transition-all duration-200 appearance-none bg-white"
                required
              >
                <option value="">Select Employee</option>
                {existingOptions.employee.length > 0 ? (
                  existingOptions.employee.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.value}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading...</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!requisition.item || !requisition.qty || !requisition.site || !requisition.employee || !requisition.date}
            className={`px-6 py-2.5 bg-gradient-to-r from-[#2D3A6B] to-[#243158] rounded-lg text-white font-medium transition-all duration-200 shadow-md ${
              !requisition.item || !requisition.qty || !requisition.site || !requisition.employee || !requisition.date
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-[#213066] hover:to-[#182755]'
            }`}
          >
            {isEdit ? 'Update Requisition' : 'Create Requisition'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequisitionForm;