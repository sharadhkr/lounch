import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from '../selleraxios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import ProductForm from './ProductForm';

const fadeIn = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Products = ({ products, setProducts, categories, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => { 
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/seller/auth/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleProductStatus = async (id, currentStatus) => {
    try {
      const response = await axios.put(`/api/seller/auth/products/${id}/toggle-status`);
      setProducts(products.map((p) => (p._id === id ? response.data.data.product : p)));
      toast.success(`Product ${response.data.data.product.status} successfully`);
    } catch (error) {
      toast.error('Failed to toggle product status');
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"
        >
          <FaPlus /> Add Product
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 animate-pulse">Loading...</div>
      ) : (
        products
          .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((product) => (
            <div
              key={product._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500">₹{product.price} | Qty: {product.quantity}</p>
                  <p className="text-sm text-gray-500">
                    {product.category.name} | Sizes: {product.sizes.join(', ')} | Colors: {product.colors.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">Brand: {product.brand} | <span className={product.status === 'enabled' ? 'text-emerald-500' : 'text-red-500'}>{product.status}</span></p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditProduct(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200">
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleToggleProductStatus(product._id, product.status)}
                  className={`px-4 py-1 text-sm rounded-full text-white shadow-sm transition-all duration-200 ${
                    product.status === 'enabled' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {product.status === 'enabled' ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDeleteProduct(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-200">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
      )}
      {showProductForm && (
        <ProductForm
          editingProduct={editingProduct}
          setProducts={setProducts}
          categories={categories}
          onClose={() => setShowProductForm(false)}
        />
      )}
    </motion.div>
  );
};

export default Products;