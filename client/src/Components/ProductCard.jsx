import React, { useState, useEffect } from 'react';
import { IoHeartOutline, IoHeart, IoCartOutline, IoCart } from 'react-icons/io5';
import toast from 'react-hot-toast';
import axios from '../useraxios';
import placeholderImage from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animation Variants
const cardVariants = {
  hover: { scale: 1.05, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' },
  tap: { scale: 0.95 },
};

const buttonVariants = {
  hover: { scale: 1.15 },
  tap: { scale: 0.9 },
};

const ProductCard = ({ product = {} }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const {
    name = 'Dried Apricots',
    price = 5.99,
    image = [],
    discount = null,
    _id,
  } = product;

  const displayImage = Array.isArray(image) && image.length > 0 ? image[0] : placeholderImage;

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const [wishlistResponse, cartResponse] = await Promise.all([
          axios.get('/api/user/auth/wishlist', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/user/auth/cart', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const wishlist = wishlistResponse.data.wishlist || [];
        const wishlistIds = wishlist.map((item) =>
          item.productId?._id?.toString() || item.productId.toString()
        );
        setIsWishlisted(wishlistIds.includes(_id));

        const cart = cartResponse.data.cart || [];
        const cartIds = cart.map((item) =>
          item.productId?._id?.toString() || item.productId.toString()
        );
        setIsInCart(cartIds.includes(_id));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [_id]);

  const stopPropagation = (e) => e.stopPropagation();

  const handleToggleWishlist = async (e) => {
    stopPropagation(e);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to update wishlist');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `/api/user/auth/wishlist/${_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsWishlisted((prev) => !prev);
      toast.success(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist', {
        duration: 1500,
        style: {
          background: '#f3f4f6',
          color: isWishlisted ? '#ef4444' : '#eab308',
          borderRadius: '12px',
          padding: '8px 16px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error(error.response?.data?.message || 'Wishlist update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartClick = async (e) => {
    stopPropagation(e);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }

    if (isInCart) {
      navigate('/cart');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/user/auth/products/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedProduct = response.data.product;
      if (!fetchedProduct || !fetchedProduct.sizes || !fetchedProduct.colors) {
        throw new Error('Product details incomplete');
      }
      setProductDetails(fetchedProduct);
      setSelectedSize(fetchedProduct.sizes[0] || ''); // Default to first size
      setSelectedColor(fetchedProduct.colors[0] || ''); // Default to first color
      setShowPopup(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select a size and color');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productId: _id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      };
      console.log('Sending to cart:', payload); // Debug log
      const response = await axios.post('/api/user/auth/cart', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsInCart(true);
      setShowPopup(false);
      toast.success('Added to Cart', {
        duration: 1500,
        style: {
          background: '#f3f4f6',
          color: '#10b981',
          borderRadius: '12px',
          padding: '8px 16px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${_id}`);
  };

  if (!_id) {
    return (
      <div className="w-40 bg-gray-100 rounded-3xl p-4 flex items-center justify-center text-gray-500 text-sm">
        Invalid Product
      </div>
    );
  }

  return (
    <>
      <motion.div
        onClick={handleProductClick}
        variants={cardVariants}
        whileHover="hover"
        whileTap="tap"
        className="w-40 bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200 flex flex-col cursor-pointer"
        aria-label={`Product: ${name}`}
      >
        <div className="relative w-full h-40 bg-gray-100 flex-shrink-0">
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => (e.target.src = placeholderImage)}
            loading="lazy"
          />
          {discount && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        <div className="px-3 pt-2 flex-grow">
          <h3 className="text-sm font-semibold text-gray-800 truncate tracking-tight" title={name}>
            {name}
          </h3>
          <p className="text-base font-bold text-blue-600">₹{price.toFixed(2)}</p>
        </div>

        <div className="p-3 pt-0 flex justify-between items-center flex-shrink-0">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleToggleWishlist}
            className={`p-1.5 rounded-full bg-gray-100 shadow-sm transition-colors duration-200 ${
              isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-gray-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            disabled={loading}
          >
            {isWishlisted ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleAddToCartClick}
            className={`flex items-center gap-1 ${
              isInCart
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } text-xs font-semibold py-1 px-3 rounded-full shadow-sm transition-all duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={isInCart ? 'Go to Cart' : 'Add to Cart'}
            aria-label={isInCart ? 'Go to Cart' : 'Add to Cart'}
            disabled={loading}
          >
            {isInCart ? <IoCart size={14} /> : <IoCartOutline size={14} />}
            <span>{isInCart ? 'In Cart' : 'Add'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Popup Modal */}
      {showPopup && productDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-lg p-6 w-80 shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-4">Add {productDetails.name || name} to Cart</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max={productDetails.quantity || 10}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(productDetails.quantity || 10, parseInt(e.target.value) || 1)))
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {productDetails.quantity || 'N/A'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a size</option>
                {productDetails.sizes?.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a color</option>
                {productDetails.colors?.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className={`px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 ${
                  loading || !selectedSize || !selectedColor ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading || !selectedSize || !selectedColor}
              >
                {loading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ProductCard;