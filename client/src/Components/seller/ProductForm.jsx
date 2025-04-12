import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../selleraxios';
import toast from 'react-hot-toast';
import { FaUpload, FaTimes } from 'react-icons/fa';

const ProductForm = ({ editingProduct, setProducts, categories, onClose }) => {
  const [productForm, setProductForm] = useState({
    name: editingProduct?.name || '',
    category: editingProduct?.category._id || '',
    quantity: editingProduct?.quantity || '',
    price: editingProduct?.price || '',
    description: editingProduct?.description || '',
    images: [],
    sizes: editingProduct?.sizes || [],
    colors: editingProduct?.colors || [],
    material: editingProduct?.material || '',
    gender: editingProduct?.gender || '',
    brand: editingProduct?.brand || '',
    fit: editingProduct?.fit || '',
    careInstructions: editingProduct?.careInstructions || '',
    isReturnable: editingProduct?.isReturnable || false,
    returnPeriod: editingProduct?.returnPeriod || 0,
    dimensions: editingProduct?.dimensions || { chest: '', length: '', sleeve: '' },
    weight: editingProduct?.weight || '',
    isCashOnDeliveryAvailable: editingProduct?.isCashOnDeliveryAvailable || false,
    onlinePaymentPercentage: editingProduct?.onlinePaymentPercentage || 100,
  });
  const [imagePreviews, setImagePreviews] = useState(editingProduct?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const productImageInputRef = useRef(null);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => typeof preview === 'string' || URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('dimensions.')) {
      const dimField = name.split('.')[1];
      setProductForm((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimField]: value },
      }));
    } else {
      setProductForm((prev) => {
        let newState = { ...prev, [name]: type === 'checkbox' ? checked : value };
        // If COD is unchecked, force onlinePaymentPercentage to 100
        if (name === 'isCashOnDeliveryAvailable' && !checked) {
          newState.onlinePaymentPercentage = 100;
        }
        return newState;
      });
    }
  };

  const handleMultiSelectChange = (e, field) => {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    setProductForm((prev) => ({ ...prev, [field]: options }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.some((file) => !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type))) {
      toast.error('Only JPEG, PNG, or JPG files allowed');
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    const updatedImages = [...productForm.images, ...files];
    setProductForm((prev) => ({ ...prev, images: updatedImages }));
    setImagePreviews(updatedImages.map((f) => (typeof f === 'string' ? f : URL.createObjectURL(f))));
  };

  const removeImage = (index) => {
    const updatedImages = productForm.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setProductForm((prev) => ({ ...prev, images: updatedImages }));
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const requiredFields = [
      'name', 'category', 'quantity', 'price', 'description', 'sizes', 'colors',
      'material', 'gender', 'brand', 'fit', 'careInstructions',
    ];
    if (requiredFields.some((field) => !productForm[field] || (Array.isArray(productForm[field]) && productForm[field].length === 0))) {
      toast.error('All required fields must be filled');
      return;
    }
    if (productForm.isReturnable && (!productForm.returnPeriod || productForm.returnPeriod <= 0)) {
      toast.error('Return period must be greater than 0');
      return;
    }
    if (!editingProduct && productForm.images.length === 0) {
      toast.error('At least one image is required');
      return;
    }
    if (productForm.isCashOnDeliveryAvailable && (productForm.onlinePaymentPercentage < 0 || productForm.onlinePaymentPercentage > 100)) {
      toast.error('Online payment percentage must be between 0 and 100');
      return;
    }
    if (!productForm.isCashOnDeliveryAvailable && productForm.onlinePaymentPercentage !== 100) {
      toast.error('Online payment percentage must be 100 if COD is not available');
      return;
    }

    const formData = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (key === 'images') value.forEach((file) => formData.append('images', file));
      else if (key === 'sizes' || key === 'colors') formData.append(key, JSON.stringify(value));
      else if (key === 'dimensions') formData.append(key, JSON.stringify(value));
      else formData.append(key, value);
    });

    try {
      setIsSubmitting(true);
      const url = editingProduct ? `/api/seller/auth/products/${editingProduct._id}` : '/api/seller/auth/products';
      const method = editingProduct ? 'put' : 'post';
      const response = await axios[method](url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      setProducts((prev) =>
        editingProduct
          ? prev.map((p) => (p._id === editingProduct._id ? response.data.data.product : p))
          : [...prev, response.data.data.product]
      );
      toast.success(editingProduct ? 'Product updated successfully' : 'Product added successfully');
      onClose();
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={productForm.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={productForm.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={productForm.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={productForm.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={productForm.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
            <select
              multiple
              name="sizes"
              value={productForm.sizes}
              onChange={(e) => handleMultiSelectChange(e, 'sizes')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            >
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Custom'].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colors</label>
            <select
              multiple
              name="colors"
              value={productForm.colors}
              onChange={(e) => handleMultiSelectChange(e, 'colors')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            >
              {['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Gray', 'Other'].map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <select
              name="material"
              value={productForm.material}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            >
              <option value="">Select Material</option>
              {['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather', 'Rayon', 'Nylon', 'Spandex', 'Blend', 'Other'].map((mat) => (
                <option key={mat} value={mat}>{mat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={productForm.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            >
              <option value="">Select Gender</option>
              {['Men', 'Women', 'Unisex', 'Kids'].map((gen) => (
                <option key={gen} value={gen}>{gen}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={productForm.brand}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fit</label>
            <select
              name="fit"
              value={productForm.fit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              required
            >
              <option value="">Select Fit</option>
              {['Regular', 'Slim', 'Loose', 'Tailored', 'Oversized', 'Athletic'].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
            <textarea
              name="careInstructions"
              value={productForm.careInstructions}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              rows="2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            <button
              type="button"
              onClick={() => productImageInputRef.current.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"
            >
              <FaUpload /> Upload Images
            </button>
            <input
              type="file"
              ref={productImageInputRef}
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${idx}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chest (in)</label>
              <input
                type="number"
                name="dimensions.chest"
                value={productForm.dimensions.chest}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Length (in)</label>
              <input
                type="number"
                name="dimensions.length"
                value={productForm.dimensions.length}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sleeve (in)</label>
            <input
              type="number"
              name="dimensions.sleeve"
              value={productForm.dimensions.sleeve}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (g)</label>
            <input
              type="number"
              name="weight"
              value={productForm.weight}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              min="0"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isReturnable"
              checked={productForm.isReturnable}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-300"
            />
            <label className="text-sm font-medium text-gray-700">Returnable</label>
          </div>
          {productForm.isReturnable && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Period (days)</label>
              <input
                type="number"
                name="returnPeriod"
                value={productForm.returnPeriod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
                min="1"
                max="30"
                required
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isCashOnDeliveryAvailable"
              checked={productForm.isCashOnDeliveryAvailable}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-300"
            />
            <label className="text-sm font-medium text-gray-700">Cash on Delivery Available</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Online Payment Percentage (%)</label>
            <input
              type="number"
              name="onlinePaymentPercentage"
              value={productForm.onlinePaymentPercentage}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
              min="0"
              max="100"
              step="1"
              disabled={!productForm.isCashOnDeliveryAvailable}
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {editingProduct ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
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

export default ProductForm;