import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/client';
import { User, Mail, Phone, Lock, MapPin, Plus, Trash2, Camera, Navigation, Home, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

const UserProfile = () => {
  const { user, login } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [locating, setLocating] = useState(false);
  const [addressType, setAddressType] = useState('HOME');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUserById(user.id);
      const data = res.data;
      setProfileData(data);
      setUsername(data.username || '');
      setProfileImage(data.profileImage || '');
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await userService.updateProfile(user.id, { username, profileImage });
      setProfileData(res.data);
      // Sync back to local storage / state
      const updatedUser = { ...user, username: res.data.username, profileImage: res.data.profileImage };
      localStorage.setItem('cartflow_user', JSON.stringify(updatedUser));
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError("Failed to update profile: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        try {
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const geoData = await res.json();
          const addr = geoData.address || {};

          setStreet(addr.road || addr.suburb || addr.neighbourhood || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          setCity(addr.city || addr.town || addr.village || addr.county || '');
          setState(addr.state || '');
          setZipCode(addr.postcode || '');
          setCountry(addr.country || 'India');
        } catch (e) {
          console.warn("Reverse geocoding error:", e);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Location permission denied or unavailable.");
        setLocating(false);
      }
    );
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (addresses.length >= 5) {
      alert("Maximum limit of 5 saved addresses reached!");
      return;
    }

    try {
      const newAddress = { addressType, street, city, state, zipCode, country, latitude, longitude };
      const res = await userService.addAddress(user.id, newAddress);
      setAddresses(res.data.addresses || []);
      setShowAddressModal(false);
      // Reset form
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setLatitude(null);
      setLongitude(null);
    } catch (err) {
      alert("Failed to add address: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!window.confirm("Remove this saved address?")) return;
    try {
      const res = await userService.deleteAddress(user.id, index);
      setAddresses(res.data.addresses || []);
    } catch (err) {
      alert("Failed to delete address: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">My Account & Profile</h1>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center space-x-2 mb-6">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center space-x-2 mb-6">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Avatar Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center h-fit">
          <div className="relative mb-4">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile Avatar"
                className="h-28 w-28 rounded-full object-cover border-4 border-sky-100 shadow-inner"
              />
            ) : (
              <div className="h-28 w-28 rounded-full bg-slate-100 border-4 border-slate-200 flex items-center justify-center text-slate-400">
                <User className="h-14 w-14" />
              </div>
            )}
          </div>
          <h2 className="text-lg font-extrabold text-gray-900">{profileData?.username}</h2>
          <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-3 py-1 rounded-full mt-1 uppercase tracking-wide">
            {profileData?.role}
          </span>
          <p className="text-xs text-gray-400 mt-3">Member since {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>

        {/* Profile Edit Form & Saved Addresses */}
        <div className="md:col-span-2 space-y-8">
          {/* Details Form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Personal Details</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Profile Photo URL</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Email Address - READ ONLY */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Cannot be changed
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={profileData?.email || ''}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-slate-100 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none font-medium"
                  />
                </div>
              </div>

              {/* Phone Number - READ ONLY */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Cannot be changed
                  </span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData?.phoneNumber || ''}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-slate-100 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl hover:bg-sky-700 transition"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Saved Addresses Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Saved Addresses</h2>
                <p className="text-xs text-gray-500">Manage up to 5 delivery locations ({addresses.length}/5 added)</p>
              </div>
              <button
                onClick={() => setShowAddressModal(true)}
                disabled={addresses.length >= 5}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  addresses.length >= 5
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-sky-600 text-white hover:bg-sky-700'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            {addresses.length >= 5 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs font-medium mb-4">
                Maximum limit of 5 saved addresses reached. Delete an existing address to add a new one.
              </div>
            )}

            {addresses.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">No saved addresses yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 flex items-start justify-between">
                    <div className="space-y-1 text-xs">
                      <span className="inline-flex items-center gap-1 font-extrabold text-[11px] uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full mb-1">
                        {addr.addressType === 'HOME' ? <Home className="h-3 w-3" /> : addr.addressType === 'WORK' ? <Briefcase className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {addr.addressType}
                      </span>
                      <p className="font-bold text-gray-900">{addr.street}</p>
                      <p className="text-gray-600">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      <p className="text-gray-400">{addr.country}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Add Delivery Address</h3>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className="flex items-center space-x-1 px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 rounded-lg text-xs font-bold hover:bg-sky-100 transition"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>{locating ? 'Detecting...' : 'Use Current Location'}</span>
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Address Label</label>
                <select
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                >
                  <option value="HOME">🏠 Home</option>
                  <option value="WORK">🏢 Work</option>
                  <option value="OTHER">📍 Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Main St, Apt 4B"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Pincode / Zip Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
