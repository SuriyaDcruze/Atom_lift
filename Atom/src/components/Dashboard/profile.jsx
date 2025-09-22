import { useState, useEffect } from 'react';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const Profile = () => {
  const [user, setUser] = useState({ 
    username: 'Guest', 
    email: '', 
    phone: '', 
    photo: null 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({ 
    username: 'Guest', 
    email: '', 
    phone: '', 
    photo: null 
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.get(`${apiBaseUrl}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const data = response.data;
        console.log('Fetched profile data:', data);
        setUser(data);
        setEditValues(data);
        if (data.photo) {
          setPhotoPreview(data.photo);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditValues(user);
      setSelectedFile(null);
      setPhotoPreview(user.photo ? user.photo : null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    } else {
      setSelectedFile(null);
      setPhotoPreview(user.photo ? user.photo : null);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const formData = new FormData();
    formData.append('username', editValues.username);
    formData.append('email', editValues.email);
    formData.append('phone', editValues.phone);
    if (selectedFile) {
      formData.append('photo', selectedFile);
    }

    try {
      const response = await axios.put(
        `${apiBaseUrl}/auth/update-profile/`, 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        await fetchProfile();
        setIsEditing(false);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error saving profile:', error.response?.data || error.message);
      alert('Failed to update profile. Please try again.');
    }
  };

  const renderProfilePicture = () => {
    const photoUrl = isEditing ? photoPreview : user.photo;

    if (photoUrl) {
      return (
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => setShowFullScreen(true)}
          >
            <img
              src={photoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
                setPhotoPreview(null);
              }}
            />
          </div>
          {isHovering && (
            <div className="absolute -top-10 -left-10 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-md pointer-events-none transition-opacity duration-300">
              Click to enlarge
            </div>
          )}
        </div>
      );
    } else {
      const initial = (user.username || 'G').charAt(0).toUpperCase();
      return (
        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-medium border-2 border-blue-500">
          {initial}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {showFullScreen && user.photo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowFullScreen(false)}
        >
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={user.photo}
              alt="Profile Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white text-3xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => setShowFullScreen(false)}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-center mb-4">
          {renderProfilePicture()}
        </div>
        <div className="text-center">
          {!isEditing ? (
            <>
              <h2 className="text-xl font-medium text-gray-800">{user.username}</h2>
              <p className="text-sm text-gray-500">{user.email || 'No email provided'}</p>
              <p className="text-sm text-gray-500">{user.phone || 'No phone provided'}</p>
            </>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                name="username"
                value={editValues.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
              />
              <input
                type="email"
                name="email"
                value={editValues.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
              />
              <input
                type="text"
                name="phone"
                value={editValues.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone Number"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
              >
                Save
              </button>
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;