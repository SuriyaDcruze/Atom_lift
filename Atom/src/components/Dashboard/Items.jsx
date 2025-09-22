import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NewItemForm from '../Dashboard/Forms/NewItemForm';
import { MoreVertical, Edit, Trash2, Download, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const Items = () => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const itemsPerPage = 7;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const createAxiosInstance = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in to continue.');
      window.location.href = '/login';
      return null;
    }
    return axios.create({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  };

  const fetchItems = async () => {
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      const response = await axiosInstance.get(`${apiBaseUrl}/auth/item-list/`);
      if (Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setItems([]);
        toast.error('Unexpected data format from server.');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch items. Please check your network or login status.');
    }
  };

  useEffect(() => {
    fetchItems();

    const handleClickOutside = (event) => {
      if (event.target.closest('.group') === null) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFormSubmit = (newItem) => {
    setItems((prev) => {
      if (editingItem) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...newItem, item_number: item.item_number, make_value: newItem.make_value, type_value: newItem.type_value, unit_value: newItem.unit_value }
            : item
        );
      } else {
        return [...prev, { ...newItem, item_number: newItem.item_number || `PART${1000 + newItem.id}` }];
      }
    });
    setShowModal(false);
    setEditingItem(null);
  };

  const handleFormCancel = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete item with ID ${id}?`)) return;

    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      await axiosInstance.delete(`${apiBaseUrl}/auth/delete-item/${id}/`);
      toast.success('Item deleted successfully!');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to delete item.');
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/auth/export-items/`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'items_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Items exported successfully!');
    } catch (error) {
      console.error('Error exporting items:', error);
      toast.error(error.response?.data?.error || 'Failed to export items. Please try again.');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('Please select a CSV file.');
      return;
    }
    if (!file.name.endsWith('.csv')) {
      toast.error('File must be a CSV.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${apiBaseUrl}/auth/import-items-csv/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Items imported successfully!');
      fetchItems();
    } catch (error) {
      console.error('Error importing items:', error);
      toast.error(error.response?.data?.error || 'Failed to import items. Please check the file or try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Items</h1>
        <div className="space-x-4 flex items-center">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-2"
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg block">
                <button
                  onClick={() => { handleExport(); setShowDropdown(false); }}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Download size={16} className="mr-2" /> Export
                </button>
                <label className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                  <Upload size={16} className="mr-2" /> Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => { handleImport(e); setShowDropdown(false); }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-[#243158] text-white px-4 py-2 rounded-lg hover:bg-[#141929] transition duration-200 w-full md:w-auto"
            aria-label="New Item"
          >
            New Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                <th className="p-4 text-left">Part No</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Units</th>
                <th className="p-4 text-left">Sale Price</th>
                <th className="p-4 text-left">Tax Preference</th>
                <th className="p-4 text-left">Tax</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition duration-200">
                  <td className="p-4 text-gray-800">{item.item_number}</td>
                  <td className="p-4 text-gray-800">{item.name}</td>
                  <td className="p-4 text-gray-800">{item.type_value || 'N/A'}</td>
                  <td className="p-4 text-gray-800">{item.unit_value || 'N/A'}</td>
                  <td className="p-4 text-gray-800">{item.sale_price}</td>
                  <td className="p-4 text-gray-800">{item.tax_preference}</td>
                  <td className="p-4 text-gray-800">
                    {item.igst && item.igst !== "0.00" ? `IGST: ${item.igst}` : ""}
                    {item.gst && item.gst !== "0.00" ? (item.igst && item.igst !== "0.00" ? `, GST: ${item.gst}` : `GST: ${item.gst}`) : ""}
                    {(item.igst === "0.00" || !item.igst) && (item.gst === "0.00" || !item.gst) ? "0.00" : ""}
                  </td>
                  <td className="p-4 flex space-x-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      aria-label="Edit"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {currentItems.map((item) => (
            <div key={item.id} className="border-b p-4">
              <div className="text-gray-800 font-semibold">Part No: {item.item_number}</div>
              <div className="text-gray-800">Name: {item.name}</div>
              <div className="text-gray-800">Type: {item.type_value || 'N/A'}</div>
              <div className="text-gray-800">Units: {item.unit_value || 'N/A'}</div>
              <div className="text-gray-800">Sale Price: {item.sale_price}</div>
              <div className="text-gray-800">Tax Preference: {item.tax_preference}</div>
              <div className="text-gray-800">Tax: 
                {item.igst && item.igst !== "0.00" ? `IGST: ${item.igst}` : ""}
                {item.gst && item.gst !== "0.00" ? (item.igst && item.igst !== "0.00" ? `, GST: ${item.gst}` : `GST: ${item.gst}`) : ""}
                {(item.igst === "0.00" || !item.igst) && (item.gst === "0.00" || !item.gst) ? "0.00" : ""}
              </div>
              <div className="p-2 flex space-x-2">
                <button
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Edit"
                  onClick={() => handleEdit(item)}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  aria-label="Delete"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 text-gray-600 flex flex-col md:flex-row justify-between items-center">
          <span>
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, items.length)} of {items.length}
          </span>
          <div className="space-x-2 mt-2 md:mt-0">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200"
              aria-label="Previous Page"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200"
              aria-label="Next Page"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          aria-label="Close modal"
        >
          <div
            className="rounded-lg bg-gray-50 shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <NewItemForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              item={editingItem}
              isEditing={!!editingItem}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;