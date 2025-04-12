import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../selleraxios';
import toast from 'react-hot-toast';
import { FaUpload, FaTimes } from 'react-icons/fa';

const ProfileForm = ({ seller, setSeller, onClose }) => {
  const [profileForm, setProfileForm] = useState({
    name: seller?.name || '',
    shopName: seller?.shopName || '',
    phoneNumber: seller?.phoneNumber || '',
    address: seller?.address || '',
    profilePicture: null,
    paymentId: seller?.paymentId || '',
    aadharId: seller?.aadharId || '',
    bankAccount: {
      accountNumber: seller?.paymentDetails?.bankAccount?.accountNumber || '',
      ifscCode: seller?.paymentDetails?.bankAccount?.ifscCode || '',
      accountHolderName: seller?.paymentDetails?.bankAccount?.accountHolderName || '',
    },
    upiId: seller?.paymentDetails?.upiId || '',
    razorpayAccountId: seller?.paymentDetails?.razorpayAccountId || '',
  });
  const [profileImagePreview, setProfileImagePreview] = useState(seller?.profilePicture || '');
  const profileImageInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (profileImagePreview && !seller?.profilePicture) URL.revokeObjectURL(profileImagePreview);
    };
  }, [profileImagePreview, seller]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bankAccount.')) {
      const field = name.split('.')[1];
      setProfileForm((prev) => ({
        ...prev,
        bankAccount: { ...prev.bankAccount, [field]: value },
      }));
    } else {
      setProfileForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPEG, PNG, or JPG files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setProfileForm((prev) => ({ ...prev, profilePicture: file }));
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setProfileForm((prev) => ({ ...prev, profilePicture: null }));
    setProfileImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, shopName, phoneNumber, address } = profileForm;
    if (!name || !shopName || !phoneNumber || !address) {
      toast.error('All required fields must be filled');
      return;
    }

    const formData = new FormData();
    Object.entries(profileForm).forEach(([key, value]) => {
      if (key === 'profilePicture' && value) {
        formData.append(key, value);
      } else if (key === 'bankAccount') {
        if (value.accountNumber || value.ifscCode || value.accountHolderName) {
          formData.append('bankAccount', JSON.stringify(value));
        }
      } else if (value) {
        formData.append(key, value);
      }
    });

    try {
      const response = await axios.put('/api/seller/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSeller(response.data.data.seller);
      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input
              type="text"
              name="shopName"
              value={profileForm.shopName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={profileForm.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={profileForm.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID (Legacy)</label>
            <input
              type="text"
              name="paymentId"
              value={profileForm.paymentId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              placeholder="e.g., UPI ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar ID</label>
            <input
              type="text"
              name="aadharId"
              value={profileForm.aadharId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              placeholder="12-digit Aadhar number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
            <input
              type="text"
              name="bankAccount.accountNumber"
              value={profileForm.bankAccount.accountNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              placeholder="9-18 digit account number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
            <input
              type="text"
              name="bankAccount.ifscCode"
              value={profileForm.bankAccount.ifscCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              placeholder="e.g., SBIN0001234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
            <input
              type="text"
              name="bankAccount.accountHolderName"
              value={profileForm.bankAccount.accountHolderName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Full name as per bank"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
            <input
              type="text"
              name="upiId"
              value={profileForm.upiId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              placeholder="e.g., name@upi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Account ID</label>
            <input
              type="text"
              name="razorpayAccountId"
              value={profileForm.razorpayAccountId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              placeholder="For Razorpay payouts"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <button
              type="button"
              onClick={() => profileImageInputRef.current.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"
            >
              <FaUpload /> Upload Picture
            </button>
            <input
              type="file"
              ref={profileImageInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {profileImagePreview && (
              <div className="mt-4 relative group w-24 h-24">
                <img
                  src={profileImagePreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileForm;