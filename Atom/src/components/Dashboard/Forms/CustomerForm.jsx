import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ErrorToast from '../messages/ErrorToast';
import SuccessToast from '../messages/SuccessToast';

const CustomerForm = ({
  isEdit = false,
  initialData = {},
  onClose,
  onSubmitSuccess,
  apiBaseUrl,
  dropdownOptions = {},
}) => {
  const navigate = useNavigate(); // NEW: Initialize navigate hook
  const [formData, setFormData] = useState({
    siteId: '',
    jobNo: '',
    siteName: '',
    siteAddress: '',
    email: '',
    phone: '',
    mobile: '',
    sameAsSiteAddress: false,
    officeAddress: '',
    contactPersonName: '',
    designation: '',
    pinCode: '',
    state: '',
    city: '',
    sector: '',
    routes: '',
    branch: '',
    gstNumber: '',
    panNumber: '',
    handoverDate: '',
    billingName: '',
    generateCustomerLicense: false,
  });

  const [existingOptions, setExistingOptions] = useState({
    state: [],
    routes: [],
    branch: [],
    sector: [
      { id: 1, value: 'government', label: 'Government' },
      { id: 2, value: 'private', label: 'Private' },
    ],
  });

  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [modalState, setModalState] = useState({
    state: { isOpen: false, value: '', isEditing: false, editId: null },
    routes: { isOpen: false, value: '', isEditing: false, editId: null },
    branch: { isOpen: false, value: '', isEditing: false, editId: null },
  });

  const [addingOptions, setAddingOptions] = useState({
    state: false,
    routes: false,
    branch: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const [alertMessage, setAlertMessage] = useState({
    show: false,
    type: '', // 'success' or 'error'
    message: '',
    description: ''
  });

  const showSuccessMessage = (message, description = '') => {
    setAlertMessage({
      show: true,
      type: 'success',
      message,
      description
    });
  };

  const showErrorMessage = (message, description = '') => {
    setAlertMessage({
      show: true,
      type: 'error',
      message,
      description
    });
  };

  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found in localStorage');
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
        state: '/sales/province-states',
        routes: '/sales/routes',
        branch: '/sales/branches',
      };
      const endpoint = endpoints[field];
      const response = await axiosInstance.get(`${apiBaseUrl}${endpoint}`);
      console.log(`Fetched ${field} options:`, response.data);

      let normalizedData;
      normalizedData = response.data.map((item) => ({
        id: item.id || item,
        value: item.value || item,
        label: item.value || item,
      }));

      setExistingOptions((prev) => ({
        ...prev,
        [field]: normalizedData,
      }));

      const capitalField = field.charAt(0).toUpperCase() + field.slice(1);
      if (dropdownOptions[`set${capitalField}Options`]) {
        dropdownOptions[`set${capitalField}Options`](normalizedData.map((item) => item.value));
        console.log(`Updated dropdownOptions.${field}Options:`, normalizedData.map((item) => item.value));
      } else {
        console.warn(`dropdownOptions.set${capitalField}Options is not defined`);
      }
    } catch (error) {
      console.error(`Error fetching ${field}:`, error);
      if (error.response?.status === 401) {
        showErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        console.log(`Retrying fetchOptions for ${field}... (${retryCount} attempts left)`);
        setTimeout(() => fetchOptions(field, retryCount - 1), 2000);
      } else {
        showErrorMessage(`Failed to fetch ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} options.`);
        setExistingOptions((prev) => ({ ...prev, [field]: [] }));
      }
    }
  };

  const transformInitialData = (data, options) => {
    const transformed = { ...data };

    const fieldIdMap = {
      state: 'province_state',
      routes: 'routes',
      branch: 'branch',
      sector: 'sector',
    };

    ['state', 'routes', 'branch', 'sector'].forEach((field) => {
      const idKey = fieldIdMap[field];
      if (data[idKey] && options[field]) {
        const option = options[field].find((opt) => opt.id === data[idKey] || opt.value === data[idKey]);
        transformed[field] = option ? (option.label || option.value) : '';
      } else {
        transformed[field] = data[field] || data[idKey] || '';
      }
    });

    // Handle siteName and jobNo
    transformed.siteName = data.site_name || '';
    transformed.jobNo = data.job_no || '';
    if (transformed.siteName.includes(' - ')) {
      const parts = transformed.siteName.split(' - ');
      transformed.siteName = parts.slice(0, -1).join(' - ') + ' - ' + parts[parts.length - 1];
      if (!transformed.jobNo) transformed.jobNo = parts[parts.length - 1];
    } else if (transformed.jobNo) {
      transformed.siteName += ` - ${transformed.jobNo}`;
    }

    console.log('Transformed initialData:', transformed);
    return transformed;
  };

  useEffect(() => {
    const fields = ['state', 'routes', 'branch'];
    Promise.all(fields.map((field) => fetchOptions(field)))
      .then(() => {
        if (isEdit && Object.keys(initialData).length > 0) {
          const transformedData = transformInitialData(initialData, existingOptions);
          setFormData((prev) => ({ ...prev, ...transformedData }));
        }
        setOptionsLoaded(true);
        console.log('Options loaded');
      })
      .catch((error) => {
        console.error('Error fetching all options:', error);
        setOptionsLoaded(true);
        setExistingOptions((prev) => ({
          ...prev,
          state: [],
          routes: [],
          branch: [],
        }));
      });
  }, [initialData, apiBaseUrl]);

  useEffect(() => {
    if (optionsLoaded) {
      ['state', 'routes', 'branch'].forEach((field) => {
        if (formData[field] && existingOptions[field].length > 0) {
          const isValid = existingOptions[field].some((opt) => opt.value === formData[field]);
          if (!isValid) {
            console.warn(`Invalid ${field} selected: ${formData[field]}. Resetting to empty.`);
            setFormData((prev) => ({ ...prev, [field]: '' }));
            showErrorMessage(`Selected ${field} is invalid. Please choose a valid ${field} from the dropdown.`);
          }
        }
      });
    }
  }, [formData.state, formData.routes, formData.branch, existingOptions, optionsLoaded]);

  useEffect(() => {
    console.log('dropdownOptions:', dropdownOptions);
  }, [dropdownOptions]);

  useEffect(() => {
    console.log('Current formData:', formData);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      
      // Validate phone and mobile fields to only allow 10 digits
      if (name === 'phone' || name === 'mobile') {
        // Remove any non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        // Limit to 10 digits
        updatedData[name] = digitsOnly.slice(0, 10);
      }
      
      if (name === 'siteName' && formData.jobNo && value && !value.includes(` - ${formData.jobNo}`)) {
        updatedData.siteName = `${value} - ${formData.jobNo}`;
      }
      if (name === 'jobNo' && formData.siteName) {
        const baseSiteName = formData.siteName.split(' - ')[0];
        updatedData.siteName = `${baseSiteName} - ${value}`;
      }
      if (name === 'sameAsSiteAddress' && checked) {
        updatedData.officeAddress = prev.siteAddress;
      }
      return updatedData;
    });
  };



  const openAddModal = (field, isEditing = false, editId = null, editValue = '') => {
    setModalState((prev) => ({
      ...prev,
      [field]: { isOpen: true, value: editValue, isEditing, editId },
    }));
  };

  const closeAddModal = (field) => {
    setModalState((prev) => ({
      ...prev,
      [field]: { isOpen: false, value: '', isEditing: false, editId: null },
    }));
    setAddingOptions((prev) => ({ ...prev, [field]: false }));
  };

  const handleAddOption = async (field) => {
    if (addingOptions[field]) return;

    const value = modalState[field].value.trim();
    if (!value) {
      showErrorMessage(`Please enter a ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`);
      return;
    }

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      setAddingOptions((prev) => ({ ...prev, [field]: true }));
      const apiEndpoints = {
        state: 'edit-province-state',
        routes: 'edit-route',
        branch: 'edit-branch',
      };
      const addEndpoints = {
        state: 'add-province-state',
        routes: 'add-route',
        branch: 'add-branch',
      };
      const isEditing = modalState[field].isEditing;
      const editId = modalState[field].editId;
      const capitalField = field.charAt(0).toUpperCase() + field.slice(1);
      const setter = dropdownOptions[`set${capitalField}Options`];

      if (isEditing) {
        const oldValue = existingOptions[field].find((item) => item.id === editId)?.value;
        await axiosInstance.put(
          `${apiBaseUrl}/sales/${apiEndpoints[field]}/${editId}/`,
          { value }
        );
        const updatedOptions = existingOptions[field].map((item) =>
          item.id === editId ? { ...item, value } : item
        );
        setExistingOptions((prev) => {
          const newOptions = { ...prev, [field]: updatedOptions };
          console.log(`Updated existingOptions.${field} after edit:`, newOptions[field]);
          return newOptions;
        });
        if (setter) {
          setter(updatedOptions.map((o) => o.value));
          console.log(`Updated dropdownOptions.${field}Options after edit:`, updatedOptions.map((o) => o.value));
        }
        if (formData[field] === oldValue) {
          setFormData((prev) => ({ ...prev, [field]: value }));
        }
        showSuccessMessage(`${field.replace(/([A-Z])/g, ' $1').trim()} updated successfully.`);
      } else {
        const response = await axiosInstance.post(
          `${apiBaseUrl}/sales/${addEndpoints[field]}/`,
          { value }
        );
        const newOption = response.data;
        const updatedOptions = [...existingOptions[field], newOption];
        setExistingOptions((prev) => {
          const newOptions = { ...prev, [field]: updatedOptions };
          console.log(`Updated existingOptions.${field} after add:`, newOptions[field]);
          return newOptions;
        });
        if (setter) {
          setter(updatedOptions.map((o) => o.value));
          console.log(`Updated dropdownOptions.${field}Options after add:`, updatedOptions.map((o) => o.value));
        }
        setFormData((prev) => ({ ...prev, [field]: newOption.value }));
        showSuccessMessage(`${field.replace(/([A-Z])/g, ' $1').trim()} added successfully.`);
      }

      await fetchOptions(field);
      closeAddModal(field);
    } catch (error) {
      console.error(`Error ${isEditing ? 'editing' : 'adding'} ${field}:`, error);
      if (error.response?.status === 401) {
        showErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        const errorMsg =
          error.response?.data?.value?.[0] ||
          error.response?.data?.error ||
          `Failed to ${isEditing ? 'update' : 'add'} ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`;
        showErrorMessage(errorMsg);
      }
    } finally {
      setAddingOptions((prev) => ({ ...prev, [field]: false }));
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
        state: 'delete-province-state',
        routes: 'delete-route',
        branch: 'delete-branch',
      };
      await axiosInstance.delete(`${apiBaseUrl}/sales/${deleteEndpoints[field]}/${id}/`);
      const deletedValue = existingOptions[field].find((item) => item.id === id)?.value;
      const updatedOptions = existingOptions[field].filter((item) => item.id !== id);
      setExistingOptions((prev) => {
        const newOptions = { ...prev, [field]: updatedOptions };
        console.log(`Updated existingOptions.${field} after delete:`, newOptions[field]);
        return newOptions;
      });
      const capitalField = field.charAt(0).toUpperCase() + field.slice(1);
      const setter = dropdownOptions[`set${capitalField}Options`];
      if (setter) {
        setter(updatedOptions.map((o) => o.value));
        console.log(`Updated dropdownOptions.${field}Options after delete:`, updatedOptions.map((o) => o.value));
      }
      if (formData[field] === deletedValue) {
        setFormData((prev) => ({ ...prev, [field]: '' }));
      }
      showSuccessMessage(`${field.replace(/([A-Z])/g, ' $1').trim()} deleted successfully.`);
      await fetchOptions(field);
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

  const resetForm = () => { // NEW: Function to reset form data
    setFormData({
      siteId: '',
      jobNo: '',
      siteName: '',
      siteAddress: '',
      email: '',
      phone: '',
      mobile: '',
      sameAsSiteAddress: false,
      officeAddress: '',
      contactPersonName: '',
      designation: '',
      pinCode: '',
      state: formData.state, // Preserve dropdowns
      city: '',
      sector: '',
      routes: formData.routes,
      branch: formData.branch,
      gstNumber: '',
      panNumber: '',
      handoverDate: '',
      billingName: '',
      generateCustomerLicense: false,
    });
  };

  const handleSubmit = async () => {
    const now = Date.now();
    if (isSubmitting || (now - lastSubmitTime < 500)) {
      console.log('Submission throttled or already in progress, ignoring.');
      return;
    }

    console.log('handleSubmit called, isEdit:', isEdit, 'formData:', formData);

    if (!formData.siteId) {
      showErrorMessage('Site ID is required.');
      console.log('Validation failed: Site ID is empty');
      return;
    }
    if (!formData.siteName) {
      showErrorMessage('Site Name is required.');
      console.log('Validation failed: Site Name is empty');
      return;
    }
    if (!formData.mobile) {
      showErrorMessage('Mobile number is required for SMS notifications.');
      console.log('Validation failed: Mobile number is empty');
      return;
    }
    if (formData.mobile && formData.mobile.length !== 10) {
      showErrorMessage('Mobile number must be exactly 10 digits.');
      console.log('Validation failed: Mobile number is not 10 digits');
      return;
    }
    if (formData.phone && formData.phone.length !== 10) {
      showErrorMessage('Phone number must be exactly 10 digits.');
      console.log('Validation failed: Phone number is not 10 digits');
      return;
    }
    // State is now optional - no validation required
    // Routes and branch are now optional - no validation required

    // Sector is now optional - only validate if provided
    const validSectors = ['government', 'private'];
    if (formData.sector && !validSectors.includes(formData.sector)) {
      showErrorMessage('Please select a valid sector from the dropdown.');
      console.log('Validation failed: Invalid sector value:', formData.sector);
      return;
    }

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) {
      console.log('Validation failed: No Axios instance created');
      return;
    }

    try {
      setIsSubmitting(true);
      setLastSubmitTime(now);

      const customerData = {
        site_id: formData.siteId,
        job_no: formData.jobNo || '',
        site_name: formData.siteName,
        site_address: formData.siteAddress || '',
        email: formData.email || '',
        phone: formData.phone || '',
        mobile: formData.mobile || '',
        office_address: formData.officeAddress || '',
        contact_person_name: formData.contactPersonName || '',
        designation: formData.designation || '',
        pin_code: formData.pinCode || '',
        province_state: formData.state ? (existingOptions.state.find((s) => s.value === formData.state)?.id || null) : null,
        city: formData.city || '',
        sector: formData.sector || null,
        routes: formData.routes ? (existingOptions.routes.find((r) => r.value === formData.routes)?.id || null) : null,
        branch: formData.branch ? (existingOptions.branch.find((b) => b.value === formData.branch)?.id || null) : null,
        gst_number: formData.gstNumber || '',
        pan_number: formData.panNumber || '',
        handover_date: formData.handoverDate || null,
        billing_name: formData.billingName || '',
        generate_customer_license: formData.generateCustomerLicense,
      };

      let response;
      if (isEdit) {
        console.log('Calling PUT /sales/edit-customer/', initialData.id);
        response = await axiosInstance.put(
          `${apiBaseUrl}/sales/edit-customer/${initialData.id}/`,
          customerData
        );
        showSuccessMessage('Customer updated successfully.');
      } else {
        console.log('Calling POST /sales/add-customer/');
        response = await axiosInstance.post(
          `${apiBaseUrl}/sales/add-customer/`,
          customerData
        );
        showSuccessMessage('Customer created successfully.');

        // NEW: Ask if user wants to create an AMC
        const createAMC = window.confirm('Do you want to create an AMC for this customer?');
        const updatedCustomer = { ...customerData, id: response.data.id };

        if (createAMC) {
          // Navigate to /dashboard/amc with customer ID
          console.log('Navigating to AMC form with customerId:', response.data.reference_id);
          navigate(`/dashboard/amc?customerId=${response.data.reference_id}`);
          await onSubmitSuccess(updatedCustomer);
          await Promise.all(['state', 'routes', 'branch'].map((field) => fetchOptions(field)));
          onClose();
        } else {
          // Reset form and stay on page
          console.log('User chose not to create AMC, resetting form');
          await onSubmitSuccess(updatedCustomer);
          await Promise.all(['state', 'routes', 'branch'].map((field) => fetchOptions(field)));
          resetForm();
          // Do not call onClose to keep the modal open
        }
      }

    } catch (error) {
      console.error(`Error ${isEdit ? 'editing' : 'creating'} customer:`, error);
      if (error.response?.status === 401) {
        showErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        const errorMsg =
          error.response?.data?.error ||
          Object.entries(error.response?.data || {})
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ') ||
          `Failed to ${isEdit ? 'update' : 'create'} customer.`;
        showErrorMessage(errorMsg);
        console.log('Submission error details:', error.response?.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (name, label, type = 'text', required = false) => (
    <div className="form-group mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleInputChange}
        className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
        required={required}
        disabled={addingOptions[name]}
      />
    </div>
  );

  const renderTextarea = (name, label, rows = 3) => (
    <div className="form-group mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        name={name}
        value={formData[name] || ''}
        onChange={handleInputChange}
        rows={rows}
        className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
        disabled={addingOptions[name] || (name === 'officeAddress' && formData.sameAsSiteAddress)}
      />
    </div>
  );

  const renderSelectWithAdd = (name, label, required = false, showAddButton = true) => {
    const selectOptions =
      name === 'sector'
        ? existingOptions.sector
        : (existingOptions[name] || []);
    console.log(`Rendering ${name} dropdown, selectOptions:`, selectOptions, `formData.${name}:`, formData[name], `optionsLoaded:`, optionsLoaded);
    return (
      <div className="form-group mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex">
          <select
            name={name}
            value={formData[name] || ''}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none bg-white"
            disabled={addingOptions[name] || !optionsLoaded}
            required={required}
          >
            <option value="">{optionsLoaded ? `Select ${label}` : 'Loading...'}</option>
            {selectOptions.length > 0 ? (
              selectOptions.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label || option.value;
                return (
                  <option key={`${name}-${optionValue}-${index}`} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })
            ) : (
              <option value="" disabled>No options available</option>
            )}
          </select>
          {showAddButton && name !== 'sector' && (
            <button
              type="button"
              onClick={() => openAddModal(name)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 text-white transition-all"
              disabled={addingOptions[name] || !optionsLoaded}
            >
              +
            </button>
          )}
        </div>
        {selectOptions.length === 0 && required && (
          <p className="text-sm text-red-500 mt-1">
            No {label.toLowerCase()} options available. Please add one using the "+" button.
          </p>
        )}
      </div>
    );
  };

  const renderCheckbox = (name, label) => (
    <div className="form-group mb-4 flex items-center">
      <input
        type="checkbox"
        name={name}
        checked={formData[name] || false}
        onChange={handleInputChange}
        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
        disabled={addingOptions[name]}
      />
      <label className="ml-2 block text-sm text-gray-700">{label}</label>
    </div>
  );

  return (
    <>
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
      
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] p-6">
            <h2 className="text-2xl font-bold text-white">
              {isEdit ? 'Edit Customer' : 'Create New Customer'}
            </h2>
            <p className="text-white">
              {isEdit ? 'Update customer details' : 'Fill in all required fields (*) to add a customer'}
            </p>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {optionsLoaded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Basic Information
                  </h3>
                  {renderInput('siteId', 'SITE ID', 'text', true)}
                  {renderInput('siteName', 'SITE NAME', 'text', true)}
                  {renderInput('jobNo', 'JOB NO')}
                  {renderTextarea('siteAddress', 'SITE ADDRESS')}
                  {renderTextarea('officeAddress', 'OFFICE ADDRESS')}
                  {renderCheckbox('sameAsSiteAddress', 'Same as Site Address')}
                  {renderInput('contactPersonName', 'CONTACT PERSON NAME')}
                  {renderInput('designation', 'DESIGNATION')}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Contact & Location
                  </h3>
                  {renderInput('email', 'EMAIL', 'email')}
                  {renderInput('phone', 'PHONE', 'tel')}
                  {renderInput('mobile', 'MOBILE (SMS NOTIFICATION)', 'tel', true)}
                  {renderInput('pinCode', 'PIN CODE')}
                  {renderSelectWithAdd('state', 'STATE', false)}
                  {renderInput('city', 'CITY')}
                  {renderSelectWithAdd('sector', 'SECTOR', false, false)}
                  {renderSelectWithAdd('routes', 'ROUTE', false)}
                  {renderSelectWithAdd('branch', 'BRANCH', false)}
                  {renderInput('gstNumber', 'GST NUMBER')}
                  {renderInput('panNumber', 'PAN NUMBER')}
                  {renderInput('handoverDate', 'HANDOVER DATE', 'date')}
                  {renderInput('billingName', 'BILLING NAME')}
                  {renderCheckbox('generateCustomerLicense', 'Generate Customer License')}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-40">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-2 text-gray-600">Loading options...</span>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all"
              disabled={Object.values(addingOptions).some((v) => v)}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const now = Date.now();
                if (!isSubmitting && (now - lastSubmitTime >= 500)) {
                  handleSubmit();
                } else {
                  console.log('Submission throttled or already in progress, ignoring.');
                }
              }}
              className={`px-6 py-2.5 bg-gradient-to-r from-[#2D3A6B] to-[#243158] rounded-lg text-white font-medium hover:from-[#213066] hover:to-[#182755] transition-all shadow-md ${
                Object.values(addingOptions).some((v) => v) || !optionsLoaded || isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={Object.values(addingOptions).some((v) => v) || !optionsLoaded || isSubmitting}
            >
              {Object.values(addingOptions).some((v) => v) || isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEdit ? 'Update Customer' : 'Create Customer'
              )}
            </button>
          </div>
        </div>
      </div>
      {Object.entries(modalState).map(([field, { isOpen, value, isEditing, editId }]) =>
        isOpen ? (
          <div key={`modal-${field}`} className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {isEditing
                  ? `Edit ${field.replace(/([A-Z])/g, ' $1').trim()}`
                  : `Add New ${field.replace(/([A-Z])/g, ' $1').trim()}`}
              </h3>
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  setModalState((prev) => ({
                    ...prev,
                    [field]: { ...prev[field], value: e.target.value },
                  }))
                }
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 mb-4"
                placeholder={`Enter new ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`}
                disabled={addingOptions[field]}
              />
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Existing {field.replace(/([A-Z])/g, ' $1').trim()}s
                </h4>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 rounded-t-xl">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {existingOptions[field].length > 0 ? (
                        existingOptions[field].map((option) => (
                          <tr key={option.id} className="border-t">
                            <td className="p-2">{option.value}</td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => openAddModal(field, true, option.id, option.value)}
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
                          <td colSpan="2" className="p-2 text-center text-gray-500">
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
                  disabled={addingOptions[field]}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddOption(field)}
                  disabled={!value.trim() || addingOptions[field]}
                  className={`px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-medium transition-all duration-200 ${
                    !value.trim() || addingOptions[field]
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  {isEditing
                    ? `Update ${field.replace(/([A-Z])/g, ' $1').trim()}`
                    : `Add ${field.replace(/([A-Z])/g, ' $1').trim()}`}
                </button>
              </div>
            </div>
          </div>
        ) : null
      )}
    </>
  );
};

export default CustomerForm;
