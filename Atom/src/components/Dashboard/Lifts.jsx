import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import LiftForm from '../Dashboard/Forms/LiftForm';
import { Edit, Pencil, Trash2, RefreshCw, Search, ChevronDown, MoreVertical, Download, Upload, Import } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const Lifts = () => {
  // State for lifts data and loading status
  const [lifts, setLifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLifts, setSelectedLifts] = useState([]);

  // State for filters
  const [filters, setFilters] = useState({
    doorType: 'ALL',
    liftType: 'ALL',
    machineType: 'ALL',
    floorID: 'ALL',
    brand: 'ALL',
    load: 'ALL',
    noOfPassengers: 'ALL',
    model: 'ALL',
  });

  // State for dropdown options
  const [brandOptions, setBrandOptions] = useState([]);
  const [floorOptions, setFloorOptions] = useState([]);
  const [machineTypeOptions, setMachineTypeOptions] = useState([]);
  const [liftTypeOptions, setLiftTypeOptions] = useState([]);
  const [doorTypeOptions, setDoorTypeOptions] = useState([]);
  const [machineBrandOptions, setMachineBrandOptions] = useState([]);
  const [doorBrandOptions, setDoorBrandOptions] = useState([]);
  const [controllerBrandOptions, setControllerBrandOptions] = useState([]);
  const [cabinOptions, setCabinOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLift, setCurrentLift] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error('Please select a CSV file to import.');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${apiBaseUrl}/auth/import-lifts-csv/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Lifts imported successfully.');
      fetchData(); // Refresh the lift data
      document.getElementById('options-dropdown').classList.add('hidden');
    } catch (error) {
      console.error('Error importing lifts:', error);
      toast.error(error.response?.data?.error || 'Failed to import lifts.');
      document.getElementById('options-dropdown').classList.add('hidden');
    }
  };

  // Fetch data with retry logic
  const fetchData = async (retryCount = 3) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      // Fetch lifts data
      const liftsResponse = await axios.get(`${apiBaseUrl}/auth/lift_list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const liftsData = liftsResponse.data.map(lift => ({
        id: lift.id,
        liftCode: lift.lift_code,
        noOfPassengers: lift.no_of_passengers,
        brand: lift.brand_value,
        load: lift.load_kg,
        liftType: lift.lift_type_value,
        machineType: lift.machine_type_value,
        doorType: lift.door_type_value,
        floorID: lift.floor_id_value,
        model: lift.model || 'Standard',
        name: lift.name,
        speed: lift.speed,
        machineBrand: lift.machine_brand_value,
        doorBrand: lift.door_brand_value,
        controllerBrand: lift.controller_brand_value,
        cabin: lift.cabin_value,
        price: lift.price,
      }));

      setLifts(liftsData);
      setSelectedLifts([]);

      // Derive model options from lifts data
      const uniqueModels = [...new Set(liftsData.map(lift => lift.model).filter(model => model))];
      setModelOptions(uniqueModels);

      // Fetch all dropdown options in parallel
      const [
        brands, 
        floors, 
        machineTypes, 
        liftTypes, 
        doorTypes, 
        machineBrands, 
        doorBrands, 
        controllerBrands, 
        cabins
      ] = await Promise.all([
        axios.get(`${apiBaseUrl}/auth/brands/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBaseUrl}/auth/floor-ids/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBaseUrl}/auth/machine-types/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBaseUrl}/auth/lift-types/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBaseUrl}/auth/door-types/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBaseUrl}/auth/machine-brands/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBaseUrl}/auth/door-brands/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBaseUrl}/auth/controller-brands/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiBaseUrl}/auth/cabins/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // Set dropdown options
      setBrandOptions(brands.data.map(item => item.value));
      setFloorOptions(floors.data.map(item => item.value));
      setMachineTypeOptions(machineTypes.data.map(item => item.value));
      setLiftTypeOptions(liftTypes.data.map(item => item.value));
      setDoorTypeOptions(doorTypes.data.map(item => item.value));
      setMachineBrandOptions(machineBrands.data.map(item => item.value));
      setDoorBrandOptions(doorBrands.data.map(item => item.value));
      setControllerBrandOptions(controllerBrands.data.map(item => item.value));
      setCabinOptions(cabins.data.map(item => item.value));

    } catch (error) {
      console.error('Error fetching data:', error);
      if (retryCount > 0) {
        console.log(`Retrying fetchData... (${retryCount} attempts left)`);
        setTimeout(() => fetchData(retryCount - 1), 1000);
      } else {
        toast.error(error.response?.data?.error || 'Failed to fetch lift data.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      doorType: 'ALL',
      liftType: 'ALL',
      machineType: 'ALL',
      floorID: 'ALL',
      brand: 'ALL',
      load: 'ALL',
      noOfPassengers: 'ALL',
      model: 'ALL',
    });
    setCurrentPage(1);
  };

  // Handle lift selection
  const handleSelectLift = (id) => {
    setSelectedLifts(prev => 
      prev.includes(id) 
        ? prev.filter(liftId => liftId !== id)
        : [...prev, id]
    );
  };

  // Handle select all lifts on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLifts(currentLifts.map(lift => lift.id));
    } else {
      setSelectedLifts([]);
    }
  };

  // Handle lift deletion
  const handleDeleteLift = async (id) => {
    if (window.confirm('Are you sure you want to delete this lift?')) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`${apiBaseUrl}/auth/delete_lift/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLifts(prev => prev.filter(lift => lift.id !== id));
        setSelectedLifts(prev => prev.filter(liftId => liftId !== id));
        setCurrentPage(1); // Reset to first page after deletion
        toast.success('Lift deleted successfully.');
      } catch (error) {
        console.error('Error deleting lift:', error.response?.data || error);
        toast.error(error.response?.data?.error || 'Failed to delete lift.');
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedLifts.length === 0) {
      toast.warning('No lifts selected for deletion');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedLifts.length} selected lifts?`)) {
      try {
        const token = localStorage.getItem('access_token');
        await Promise.all(
          selectedLifts.map(id => 
            axios.delete(`${apiBaseUrl}/auth/delete_lift/${id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setLifts(prev => prev.filter(lift => !selectedLifts.includes(lift.id)));
        setSelectedLifts([]);
        toast.success(`${selectedLifts.length} lifts deleted successfully.`);
      } catch (error) {
        console.error('Error deleting lifts:', error);
        toast.error(error.response?.data?.error || 'Failed to delete selected lifts.');
      }
    }
  };

  // Handle export to Excel
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${apiBaseUrl}/auth/export-lifts/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important for handling binary data
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'lifts_export.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Lifts exported successfully.');
      document.getElementById('options-dropdown').classList.add('hidden');
    } catch (error) {
      console.error('Error exporting lifts:', error);
      toast.error(error.response?.data?.error || 'Failed to export lifts.');
      document.getElementById('options-dropdown').classList.add('hidden');
    }
  };

  // Open edit modal with lift data
  const openEditModal = (lift) => {
    setCurrentLift({
      ...lift,
      noOfPassengers: lift.noOfPassengers.replace(' Persons', ''),
    });
    setIsEditModalOpen(true);
  };

  // Filter lifts based on current filters
  const filteredLifts = lifts.filter(lift => 
    Object.entries(filters).every(([key, value]) => {
      if (value === 'ALL') return true;
      if (key === 'load') return lift[key].toString() === value;
      if (key === 'noOfPassengers') return lift[key] === value;
      return lift[key] === value;
    })
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLifts = filteredLifts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLifts.length / itemsPerPage);

  // Dropdown for bulk actions, 3-dot menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      const bulkActions = document.getElementById('bulk-actions-dropdown');
      const options = document.getElementById('options-dropdown');
      
      if (bulkActions && !event.target.closest('#bulk-actions-menu') && !bulkActions.contains(event.target)) {
        bulkActions.classList.add('hidden');
      }
      
      if (options && !event.target.closest('#options-menu') && !options.contains(event.target)) {
        options.classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header and Actions */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Lifts Management</h1>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Bulk Actions Dropdown */}
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-md px-3 md:px-4 py-2 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#243158] focus:ring-offset-2 ${
                  selectedLifts.length > 0
                    ? 'bg-[#243158] text-white hover:bg-[#243158]'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                id="bulk-actions-menu"
                aria-expanded="true"
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('bulk-actions-dropdown').classList.toggle('hidden');
                }}
                disabled={selectedLifts.length === 0}
              >
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* Bulk Actions Dropdown Menu */}
            <div
              id="bulk-actions-dropdown"
              className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="bulk-actions-menu"
            >
              <div className="py-1" role="none">
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => {
                    handleBulkDelete();
                    document.getElementById('bulk-actions-dropdown').classList.add('hidden');
                  }}
                >
                  <Trash2 className="mr-3 h-5 w-5 text-gray-400" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Three Dot Menu Button */}
          <div className="relative inline-block text-left ml-2">
            <div>
              <button
                type="button"
                className="inline-flex items-center rounded-md p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#243158] focus:ring-offset-2"
                id="options-menu"
                aria-expanded="true"
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('options-dropdown').classList.toggle('hidden');
                }}
              >
                <span className="sr-only">Open options</span>
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Options Dropdown Menu */}
            <div
              id="options-dropdown"
              className="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={handleExport}
                >
                  <Download className="mr-1 h-5 w-5 text-gray-400" />
                  Export
                </button>
                <label
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                  role="menuitem"
                >
                  <Upload className="mr-1 h-5 w-5 text-gray-400" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      handleImportCSV(e);
                      document.getElementById('options-dropdown').classList.add('hidden');
                    }}
                  />
                </label>
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  onClick={() => {
                    // Handle lift import with customer
                    document.getElementById('options-dropdown').classList.add('hidden');
                  }}
                >
                  <Import className="mr-1 h-5 w-5 text-gray-400" />
                  Lift Import with Customer
                </button>
              </div>
            </div>
          </div>

          {/* Create New Lift Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#243158] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#111520] transition duration-200 text-sm md:text-base"
          >
            Create New Lift
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-lg mb-4 md:mb-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-9 gap-2 items-end md:w-[1050px]">
          {/* Door Type */}
          <div className="md:col-span-1">
            <select 
              name="doorType" 
              value={filters.doorType} 
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-1 md:p-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]"
            >
              <option value="ALL">All Door Types</option>
              {doorTypeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Lift Type */}
          <div className="md:col-span-1">
            <select 
              name="liftType" 
              value={filters.liftType} 
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-1 md:p-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]"
            >
              <option value="ALL">All Lift Types</option>
              {liftTypeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Machine Type */}
          <div className="md:col-span-1">
            <select 
              name="machineType" 
              value={filters.machineType} 
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-1 md:p-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]"
            >
              <option value="ALL">All Machine Types</option>
              {machineTypeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div className="md:col-span-1">
            <select 
              name="floorID" 
              value={filters.floorID} 
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-1 md:p-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]"
            >
              <option value="ALL">All Floors</option>
              {floorOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div className="md:col-span-1">
            <select 
              name="brand" 
              value={filters.brand} 
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-1 md:p-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]"
            >
              <option value="ALL">All Brands</option>
              {brandOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Load */}
          <div className="md:col-span-1">
            <select 
              name="load" 
              value={filters.load} 
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-1 md:p-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]"
            >
              <option value="ALL">All Loads</option>
              {[...new Set(lifts.map(lift => lift.load.toString()))].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Passengers */}
          <div className="md:col-span-1">
            <select 
              name="noOfPassengers" 
              value={filters.noOfPassengers} 
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-1 md:p-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]"
            >
              <option value="ALL">All Passengers</option>
              {[...new Set(lifts.map(lift => lift.noOfPassengers))].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="md:col-span-1">
            <select 
              name="model" 
              value={filters.model} 
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg p-1 md:p-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#243158]"
            >
              <option value="ALL">All Models</option>
              {modelOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-row space-x-2 md:col-span-1">
            <button
              onClick={resetFilters}
              className="flex-1 bg-gray-200 text-gray-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg hover:bg-gray-300 transition duration-200 text-xs md:text-sm"
            >
              Reset
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className="flex-1 bg-[#243158] text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg hover:bg-[#0f131d] transition duration-200 text-xs md:text-sm flex items-center justify-center"
            >
              <Search className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tablet and Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[768px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                <th className="p-3 lg:p-4 text-left">
                  <input 
                    type="checkbox" 
                    checked={selectedLifts.length > 0 && selectedLifts.length === currentLifts.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                  />
                </th>
                <th className="p-3 lg:p-4 text-left">ID</th>
                <th className="p-3 lg:p-4 text-left">Lift Code</th>
                <th className="p-3 lg:p-4 text-left">Passengers</th>
                <th className="p-3 lg:p-4 text-left">Brand</th>
                <th className="p-3 lg:p-4 text-left">Load</th>
                <th className="p-3 lg:p-4 text-left hidden lg:table-cell">Lift Type</th>
                <th className="p-3 lg:p-4 text-left hidden lg:table-cell">Machine Type</th>
                <th className="p-3 lg:p-4 text-left hidden xl:table-cell">Door Type</th>
                <th className="p-3 lg:p-4 text-left">Floor</th>
                <th className="p-3 lg:p-4 text-left">Model</th>
                <th className="p-3 lg:p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center p-4">
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#243158]"></div>
                    </div>
                  </td>
                </tr>
              ) : currentLifts.length > 0 ? (
                currentLifts.map(lift => (
                  <tr key={lift.id} className="border-t hover:bg-gray-50 transition duration-200">
                    <td className="p-3 lg:p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedLifts.includes(lift.id)}
                        onChange={() => handleSelectLift(lift.id)}
                        className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300"
                      />
                    </td>
                    <td className="p-3 lg:p-4 text-gray-800">{lift.id}</td>
                    <td className="p-3 lg:p-4 text-gray-800 font-medium whitespace-nowrap">{lift.liftCode}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">{lift.noOfPassengers}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">{lift.brand || '-'}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">{lift.load}</td>
                    <td className="p-3 lg:p-4 text-gray-800 hidden lg:table-cell whitespace-nowrap">{lift.liftType || '-'}</td>
                    <td className="p-3 lg:p-4 text-gray-800 hidden lg:table-cell whitespace-nowrap">{lift.machineType || '-'}</td>
                    <td className="p-3 lg:p-4 text-gray-800 hidden xl:table-cell whitespace-nowrap">{lift.doorType || '-'}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">{lift.floorID || '-'}</td>
                    <td className="p-3 lg:p-4 text-gray-800 whitespace-nowrap">{lift.model}</td>
                    <td className="p-3 lg:p-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(lift)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLift(lift.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center p-4 text-gray-500">
                    No lifts found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 md:p-4 text-gray-600 flex flex-col md:flex-row justify-between items-center border-t">
          <span className="text-sm md:text-base mb-2 md:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLifts.length)} of {filteredLifts.length}
            {selectedLifts.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedLifts.length} selected)
              </span>
            )}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 md:px-4 py-1 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200 text-sm md:text-base"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 md:px-4 py-1 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200 text-sm md:text-base"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View - Attractive Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#243158]"></div>
          </div>
        ) : currentLifts.length > 0 ? (
          currentLifts.map(lift => (
            <div key={lift.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selectedLifts.includes(lift.id)}
                    onChange={() => handleSelectLift(lift.id)}
                    className="h-4 w-4 text-[#243158] rounded focus:ring-[#243158] border-gray-300 mr-2"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{lift.liftCode}</h3>
                    <p className="text-sm text-gray-600 truncate">
                      {lift.brand} {lift.model && `• ${lift.model}`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => openEditModal(lift)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    <Edit  className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteLift(lift.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Passengers</span>
                  <span className="font-medium">{lift.noOfPassengers}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Load</span>
                  <span className="font-medium">{lift.load} kg</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Floor</span>
                  <span className="font-medium">{lift.floorID || '-'}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block text-xs">Type</span>
                  <span className="font-medium">{lift.liftType || '-'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No lifts found matching your criteria
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white rounded-lg shadow p-3 text-gray-600 flex flex-col xs:flex-row justify-between items-center">
          <span className="text-sm sm:text-base mb-2 xs:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLifts.length)} of {filteredLifts.length}
            {selectedLifts.length > 0 && (
              <span className="ml-2 text-[#243158]">
                ({selectedLifts.length} selected)
              </span>
            )}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200 text-sm sm:text-base"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200 text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Lift Form Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <LiftForm
          isEdit={isEditModalOpen}
          initialData={currentLift}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setCurrentLift(null);
          }}
          onSubmitSuccess={(message) => {
            fetchData(); // Refresh the data
            toast.success(message || (isEditModalOpen ? 'Lift updated successfully!' : 'Lift created successfully!'), {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }}
          onSubmitError={(error) => {
            toast.error(error || (isEditModalOpen ? 'Failed to update lift' : 'Failed to create lift'), {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }}
          apiBaseUrl={apiBaseUrl}
          dropdownOptions={{
            brandOptions,
            floorOptions,
            machineTypeOptions,
            liftTypeOptions,
            doorTypeOptions,
            machineBrandOptions,
            doorBrandOptions,
            controllerBrandOptions,
            cabinOptions,
            setBrandOptions,
            setFloorOptions,
            setMachineTypeOptions,
            setLiftTypeOptions,
            setDoorTypeOptions,
            setMachineBrandOptions,
            setDoorBrandOptions,
            setControllerBrandOptions,
            setCabinOptions,
          }}
        />
      )}
    </div>
  );
};

export default Lifts;