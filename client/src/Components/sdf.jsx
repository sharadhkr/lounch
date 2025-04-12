import React, { useState, useEffect, useCallback } from 'react';
import { IoHeartOutline, IoHeart, IoCartOutline, IoCart } from 'react-icons/io5';
import toast from 'react-hot-toast';
import axios from '../axios';
import placeholderImage from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product = {} }) => {
  const [isWishlisted, setIsWishlisted] = useState(null); // null = loading, true = in wishlist, false = not in wishlist
  const [isInCart, setIsInCart] = useState(null); // null = loading, true = in cart, false = not in cart
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const {
    name = 'Dried Apricots',
    price = 5.99,
    image = placeholderImage,
    discount = null,
    _id,
  } = product;

  // Fetch wishlist and cart status
  const checkWishlistAndCart = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsWishlisted(false);
      setIsInCart(false);
      setLoading(false);
      return;
    }

    try {
      const [wishlistRes, cartRes] = await Promise.all([
        axios.get('/api/user/auth/wishlist', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/user/auth/cart', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // Map wishlist and cart items to their product IDs
      const wishlist = wishlistRes.data.wishlist.map((item) => item.productId.toString());
      const cartItems = cartRes.data.cart.map((item) => item.productId.toString());

      // Check if this product's _id is in the wishlist or cart
      setIsWishlisted(wishlist.includes(_id));
      setIsInCart(cartItems.includes(_id));
    } catch (error) {
      console.error('Error fetching wishlist/cart:', error);
      toast.error('Failed to load status');
      // Default to false if fetch fails
      setIsWishlisted(false);
      setIsInCart(false);
    } finally {
      setLoading(false);
    }
  }, [_id]);

  // Run the check on mount or when _id changes
  useEffect(() => {
    if (_id) {
      checkWishlistAndCart();
    }
  }, [checkWishlistAndCart, _id]);

  // Toggle wishlist status
  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.put(
        `/api/user/auth/wishlist/${_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedWishlist = response.data.wishlist.map((item) => item.productId.toString());
      const newWishlistStatus = updatedWishlist.includes(_id);
      setIsWishlisted(newWishlistStatus);

      toast.success(newWishlistStatus ? 'Added to Wishlist' : 'Removed from Wishlist', {
        duration: 1500,
        style: {
          background: '#f3f4f6',
          color: newWishlistStatus ? '#eab308' : '#ef4444',
          borderRadius: '12px',
          padding: '6px 12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          fontSize: '13px',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Wishlist update failed');
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        '/api/user/auth/cart',
        { productId: _id, quantity: 1, price, name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsInCart(true);
      toast.success('Added to Cart', {
        duration: 1500,
        style: {
          background: '#f3f4f6',
          color: '#10b981',
          borderRadius: '12px',
          padding: '6px 12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          fontSize: '13px',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleGoToCart = () => navigate('/cart');

  if (!_id) {
    return (
      <div className="w-40 h-72 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-500">
        Invalid Product
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}
      transition={{ duration: 0.3 }}
      className="w-40 h-72 bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-lg overflow-hidden border border-gray-200/50 flex flex-col"
      aria-label={`Product: ${name}`}
    >
      <div className="relative w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-115"
          onError={(e) => (e.target.src = placeholderImage)}
          loading="lazy"
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
            -{discount}%
          </span>
        )}
      </div>

      <div className="p-3 flex-grow">
        <h3 className="text-sm font-semibold text-gray-800 truncate tracking-tight" title={name}>
          {name}
        </h3>
        <p className="text-lg font-extrabold text-emerald-700 mt-1">${price.toFixed(2)}</p>
      </div>

      <div className="p-3 pt-0 flex justify-between items-center flex-shrink-0">
        {!loading && isWishlisted !== null ? (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className={`p-1.5 rounded-full bg-gray-100/80 transition-colors duration-200 ${
              isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-gray-700'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isWishlisted ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
          </motion.button>
        ) : (
          <div className="w-6 h-6 animate-pulse bg-gray-200 rounded-full" />
        )}

        {!loading && isInCart !== null ? (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={isInCart ? handleGoToCart : handleAddToCart}
            className={`flex items-center gap-1 ${
              isInCart
                ? 'bg-gray-700 hover:bg-gray-800 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            } text-xs font-semibold py-1 px-2.5 rounded-full transition-all duration-300 shadow-md`}
            title={isInCart ? 'Go to Cart' : 'Add to Cart'}
            aria-label={isInCart ? 'Go to Cart' : 'Add to Cart'}
          >
            {isInCart ? <IoCart size={14} /> : <IoCartOutline size={14} />}
          </motion.button>
        ) : (
          <div className="w-16 h-6 animate-pulse bg-gray-200 rounded-full" />
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;