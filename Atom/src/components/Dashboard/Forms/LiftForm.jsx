import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Edit, Trash2 } from 'lucide-react';

const LiftForm = ({
  isEdit = false,
  initialData = {},
  onClose,
  onSubmitSuccess,
  apiBaseUrl,
  dropdownOptions = {},
}) => {
  // Form state
  const [newLift, setNewLift] = useState({
    liftCode: '',
    noOfPassengers: '',
    brand: '',
    load: '',
    liftType: '',
    machineType: '',
    doorType: '',
    floorID: '',
    name: '',
    model: '',
    speed: '',
    machineBrand: '',
    doorBrand: '',
    controllerBrand: '',
    cabin: '',
    price: '',
    ...initialData,
  });

  // State for existing options
  const [existingOptions, setExistingOptions] = useState({
    brand: [],
    floorID: [],
    machineType: [],
    liftType: [],
    doorType: [],
    machineBrand: [],
    doorBrand: [],
    controllerBrand: [],
    cabin: [],
  });

  // Modal state for adding/editing/deleting dropdown options
  const [modalState, setModalState] = useState({
    brand: { isOpen: false, value: '', isEditing: false, editId: null },
    floorID: { isOpen: false, value: '', isEditing: false, editId: null },
    machineType: { isOpen: false, value: '', isEditing: false, editId: null },
    liftType: { isOpen: false, value: '', isEditing: false, editId: null },
    doorType: { isOpen: false, value: '', isEditing: false, editId: null },
    machineBrand: { isOpen: false, value: '', isEditing: false, editId: null },
    doorBrand: { isOpen: false, value: '', isEditing: false, editId: null },
    controllerBrand: { isOpen: false, value: '', isEditing: false, editId: null },
    cabin: { isOpen: false, value: '', isEditing: false, editId: null },
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

  // Fetch existing options
  const fetchOptions = async (field, retryCount = 2) => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const endpoints = {
        brand: 'brands',
        floorID: 'floor-ids',
        machineType: 'machine-types',
        liftType: 'lift-types',
        doorType: 'door-types',
        machineBrand: 'machine-brands',
        doorBrand: 'door-brands',
        controllerBrand: 'controller-brands',
        cabin: 'cabins',
      };
      const endpoint = endpoints[field];
      const response = await axiosInstance.get(`${apiBaseUrl}/auth/${endpoint}/`);
      setExistingOptions((prev) => ({
        ...prev,
        [field]: response.data,
      }));
      dropdownOptions[`set${field.charAt(0).toUpperCase() + field.slice(1)}Options`]?.(
        response.data.map(item => item.value)
      );
    } catch (error) {
      console.error(`Error fetching ${field}:`, error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else if (retryCount > 0 && error.code === 'ERR_NETWORK') {
        console.log(`Retrying fetchOptions for ${field}... (${retryCount} attempts left)`);
        setTimeout(() => fetchOptions(field, retryCount - 1), 2000);
      } else {
        toast.error(`Failed to fetch ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`);
      }
    }
  };

  // Fetch options on component mount
  useEffect(() => {
    const fields = ['brand', 'floorID', 'machineType', 'liftType', 'doorType', 'machineBrand', 'doorBrand', 'controllerBrand', 'cabin'];
    fields.forEach(field => fetchOptions(field));
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLift((prev) => {
      const updatedLift = { ...prev, [name]: value };
      // Automatically calculate load when noOfPassengers changes
      if (name === 'noOfPassengers' && value) {
        const passengers = parseInt(value, 10);
        if (!isNaN(passengers) && passengers > 0) {
          updatedLift.load = (passengers * 68).toString();
        } else {
          updatedLift.load = '';
        }
      }
      return updatedLift;
    });
  };

  // Open modal to add/edit dropdown option
  const openAddModal = (field, isEditing = false, editId = null, editValue = '') => {
    setModalState((prev) => ({
      ...prev,
      [field]: { isOpen: true, value: editValue, isEditing, editId },
    }));
  };

  // Close modal
  const closeAddModal = (field) => {
    setModalState((prev) => ({
      ...prev,
      [field]: { isOpen: false, value: '', isEditing: false, editId: null },
    }));
  };

  // Handle adding or editing dropdown option
  const handleAddOption = async (field) => {
    const value = modalState[field].value.trim();
    if (!value) {
      toast.error(`Please enter a ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`);
      return;
    }

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const apiEndpoints = {
        brand: 'edit-brand',
        floorID: 'edit-floor-id',
        machineType: 'edit-machine-type',
        liftType: 'edit-lift-type',
        doorType: 'edit-door-type',
        machineBrand: 'edit-machine-brand',
        doorBrand: 'edit-door-brand',
        controllerBrand: 'edit-controller-brand',
        cabin: 'edit-cabin',
      };
      const addEndpoints = {
        brand: 'add-brand',
        floorID: 'add-floor-id',
        machineType: 'add-machine-type',
        liftType: 'add-lift-type',
        doorType: 'add-door-type',
        machineBrand: 'add-machine-brand',
        doorBrand: 'add-door-brand',
        controllerBrand: 'add-controller-brand',
        cabin: 'add-cabin',
      };
      const isEditing = modalState[field].isEditing;
      const editId = modalState[field].editId;

      if (isEditing) {
        await axiosInstance.put(
          `${apiBaseUrl}/auth/${apiEndpoints[field]}/${editId}/`,
          { value }
        );
        toast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} updated successfully.`);
      } else {
        await axiosInstance.post(
          `${apiBaseUrl}/auth/${addEndpoints[field]}/`,
          { value }
        );
        setNewLift((prev) => ({ ...prev, [field]: value }));
        toast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} added successfully.`);
      }

      fetchOptions(field);
      closeAddModal(field);
      onSubmitSuccess();
    } catch (error) {
      console.error(`Error ${isEditing ? 'editing' : 'adding'} ${field}:`, error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        const errorMsg = error.response?.data?.value?.[0] || error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'add'} ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`;
        toast.error(errorMsg);
      }
    }
  };

  // Handle deleting dropdown option
  const handleDeleteOption = async (field, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}?`)) {
      return;
    }

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const deleteEndpoints = {
        brand: 'delete-brand',
        floorID: 'delete-floor-id',
        machineType: 'delete-machine-type',
        liftType: 'delete-lift-type',
        doorType: 'delete-door-type',
        machineBrand: 'delete-machine-brand',
        doorBrand: 'delete-door-brand',
        controllerBrand: 'delete-controller-brand',
        cabin: 'delete-cabin',
      };
      await axiosInstance.delete(`${apiBaseUrl}/auth/${deleteEndpoints[field]}/${id}/`);
      toast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} deleted successfully.`);
      fetchOptions(field);
    } catch (error) {
      console.error(`Error deleting ${field}:`, error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(
          error.response?.data?.error ||
          `Failed to delete ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`
        );
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const requiredFields = ['liftCode', 'noOfPassengers', 'brand', 'load', 'floorID', 'cabin'];
    const isValid = requiredFields.every((field) => newLift[field]);
    
    if (!isValid) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const [
        brands, 
        floors, 
        liftTypes, 
        machineTypes, 
        machineBrands, 
        doorTypes, 
        doorBrands, 
        controllerBrands, 
        cabins
      ] = await Promise.all([
        axiosInstance.get(`${apiBaseUrl}/auth/brands/`),
        axiosInstance.get(`${apiBaseUrl}/auth/floor-ids/`),
        axiosInstance.get(`${apiBaseUrl}/auth/lift-types/`),
        axiosInstance.get(`${apiBaseUrl}/auth/machine-types/`),
        axiosInstance.get(`${apiBaseUrl}/auth/machine-brands/`),
        axiosInstance.get(`${apiBaseUrl}/auth/door-types/`),
        axiosInstance.get(`${apiBaseUrl}/auth/door-brands/`),
        axiosInstance.get(`${apiBaseUrl}/auth/controller-brands/`),
        axiosInstance.get(`${apiBaseUrl}/auth/cabins/`),
      ]);

      // Prepare lift data for API
      const liftData = {
        lift_code: newLift.liftCode,
        name: newLift.name,
        price: parseFloat(newLift.price) || 0.00,
        model: newLift.model || 'Standard',
        no_of_passengers: `${newLift.noOfPassengers} Persons`,
        load_kg: newLift.load,
        speed: newLift.speed,
        floor_id: floors.data.find(f => f.value === newLift.floorID)?.id,
        brand: brands.data.find(b => b.value === newLift.brand)?.id,
        lift_type: liftTypes.data.find(l => l.value === newLift.liftType)?.id || null,
        machine_type: machineTypes.data.find(m => m.value === newLift.machineType)?.id || null,
        machine_brand: machineBrands.data.find(m => m.value === newLift.machineBrand)?.id || null,
        door_type: doorTypes.data.find(d => d.value === newLift.doorType)?.id || null,
        door_brand: doorBrands.data.find(d => d.value === newLift.doorBrand)?.id || null,
        controller_brand: controllerBrands.data.find(c => c.value === newLift.controllerBrand)?.id || null,
        cabin: cabins.data.find(c => c.value === newLift.cabin)?.id,
      };

      // Make API call based on edit or create mode
      if (isEdit) {
        await axiosInstance.put(
          `${apiBaseUrl}/auth/edit_lift/${initialData.id}/`, 
          liftData
        );
        toast.success('Lift updated successfully.');
      } else {
        await axiosInstance.post(
          `${apiBaseUrl}/auth/add_lift/`, 
          liftData
        );
        toast.success('Lift created successfully.');
      }

      // Notify parent component of successful submission
      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${isEdit ? 'editing' : 'creating'} lift:`, error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(
          error.response?.data?.error || 
          `Failed to ${isEdit ? 'update' : 'create'} lift.`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Main Form Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2D3A6B] to-[#243158] p-6">
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Lift' : 'Create New Lift'}
          </h2>
          <p className="text-white">
            Fill in all required fields (*) to {isEdit ? 'update' : 'add'} a lift
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Essential Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Essential Information
              </h3>

              {/* Lift Code */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lift Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="liftCode"
                  value={newLift.liftCode}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newLift.name}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>

              {/* Floor ID */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor ID <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select
                    name="floorID"
                    value={newLift.floorID}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                    required
                  >
                    <option value="">Select Floor</option>
                    {dropdownOptions.floorOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openAddModal('floorID')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 transition-all text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Brand */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select
                    name="brand"
                    value={newLift.brand}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                    required
                  >
                    <option value="">Select Brand</option>
                    {dropdownOptions.brandOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openAddModal('brand')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 transition-all text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Number of Passengers */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Passengers <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="noOfPassengers"
                  value={newLift.noOfPassengers}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Load (KG) */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Load (KG) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="load"
                  value={newLift.load}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                  readOnly
                />
              </div>
            </div>

            {/* Right Column - Technical Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Technical Specifications
              </h3>

              {/* Model */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={newLift.model}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Enter model name"
                />
              </div>

              {/* Speed */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed
                </label>
                <input
                  type="text"
                  name="speed"
                  value={newLift.speed}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="e.g. 1.0 m/s"
                />
              </div>

              {/* Machine Type */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Type
                </label>
                <div className="flex">
                  <select
                    name="machineType"
                    value={newLift.machineType}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                  >
                    <option value="">Select Type</option>
                    {dropdownOptions.machineTypeOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openAddModal('machineType')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 transition-all text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Machine Brand */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Brand
                </label>
                <div className="flex">
                  <select
                    name="machineBrand"
                    value={newLift.machineBrand}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                  >
                    <option value="">Select Brand</option>
                    {dropdownOptions.machineBrandOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openAddModal('machineBrand')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 transition-all text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Lift Type */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lift Type
                </label>
                <div className="flex">
                  <select
                    name="liftType"
                    value={newLift.liftType}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                  >
                    <option value="">Select Type</option>
                    {dropdownOptions.liftTypeOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openAddModal('liftType')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 transition-all text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Door Type */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Door Type
                </label>
                <div className="flex">
                  <select
                    name="doorType"
                    value={newLift.doorType}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                  >
                    <option value="">Select Type</option>
                    {dropdownOptions.doorTypeOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openAddModal('doorType')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 transition-all text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Door Brand */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Door Brand
                </label>
                <div className="flex">
                  <select
                    name="doorBrand"
                    value={newLift.doorBrand}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                  >
                    <option value="">Select Brand</option>
                    {dropdownOptions.doorBrandOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openAddModal('doorBrand')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 transition-all text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Controller Brand */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Controller Brand
                </label>
                <div className="flex">
                  <select
                    name="controllerBrand"
                    value={newLift.controllerBrand}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                  >
                    <option value="">Select Brand</option>
                    {dropdownOptions.controllerBrandOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openAddModal('controllerBrand')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 transition-all text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cabin */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cabin <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select
                    name="cabin"
                    value={newLift.cabin}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                    required
                  >
                    <option value="">Select Cabin</option>
                    {dropdownOptions.cabinOptions?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openAddModal('cabin')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 rounded-r-lg border border-l-0 border-gray-300 hover:from-blue-600 hover:to-blue-700 transition-all text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={newLift.price}
                    onChange={handleInputChange}
                    className="block w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>
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
            className="px-6 py-2.5 bg-gradient-to-r from-[#2D3A6B] to-[#243158] rounded-lg text-white font-medium hover:from-[#213066] hover:to-[#182755] transition-all duration-200 shadow-md"
          >
            {isEdit ? 'Update Lift' : 'Create Lift'}
          </button>
        </div>
      </div>

      {/* Secondary Modals for Adding/Editing/Deleting Options */}
      {Object.entries(modalState).map(([field, { isOpen, value, isEditing, editId }]) => (
        isOpen && (
          <div key={field} className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {isEditing ? `Edit ${field.replace(/([A-Z])/g, ' $1').trim()}` : `Add New ${field.replace(/([A-Z])/g, ' $1').trim()}`}
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
              />
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Existing {field.replace(/([A-Z])/g, ' $1').trim()}s</h4>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
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
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddOption(field)}
                  disabled={!value.trim()}
                  className={`px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-medium transition-all duration-200 ${!value.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-700'}`}
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

export default LiftForm;