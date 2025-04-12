import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, ShoppingCart, Heart, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';
import { userLogout } from '../utils/authUtils'; // Ensure this exists
import { motion } from 'framer-motion';

// Fallback for AIAssistantModal if missing
const FallbackAIAssistantModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
        <p className="text-sm text-gray-600 mt-2">AI feature not yet implemented.</p>
        <button
          onClick={onClose}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Try importing AIAssistantModal, fallback if unavailable
let AIAssistantModal;
try {
  AIAssistantModal = require('./AIAssistantModal').default;
} catch {
  AIAssistantModal = FallbackAIAssistantModal;
}

const tabs = [
  { path: '/', icon: <Home size={20} />, label: 'Home' },
  { path: '/cart', icon: <ShoppingCart size={20} />, label: 'Cart' },
  { path: '/wishlist', icon: <Heart size={20} />, label: 'Wishlist' },
  { path: '/dashboard', icon: <User size={20} />, label: 'Profile' },
];

const aiTab = {
  icon: <img src={logo} alt="AI" className="w-8 h-8 object-cover rounded-full" />,
  label: 'AI',
};

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const currentIndex = tabs.findIndex((tab) => tab.path === location.pathname);
    setActiveIndex(currentIndex >= 2 ? currentIndex + 1 : currentIndex);
  }, [location.pathname]);

  const handleNavigate = (path) => {
    const protectedRoutes = ['/cart', '/wishlist', '/dashboard'];
    const token = localStorage.getItem('token');

    if (protectedRoutes.includes(path) && !token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleAIClick = () => {
    setIsAIModalOpen(true);
    setActiveIndex(2);
  };

  const handleLogout = () => {
    userLogout(navigate);
  };

  return (
    <>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-0 w-full flex justify-center z-50 px-4"
      >
        <div className="relative w-[380px] max-w-md h-20 bg-green-50/80 backdrop-blur-md rounded-3xl shadow-xl px-4 flex justify-between items-center border border-green-200">
          {/* Regular Tabs (before AI) */}
          {tabs.slice(0, 2).map((tab, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={tab.path}
                onClick={() => handleNavigate(tab.path)}
                className="relative w-16 h-full flex flex-col items-center justify-end mb-3 cursor-pointer group transition-all duration-300"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate(tab.path)}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`relative z-10 p-2 rounded-full transition-all duration-300 transform ${
                    isActive
                      ? 'bg-green-100 text-green-700 scale-110 translate-y-[-8px] shadow-md'
                      : 'text-gray-500 hover:text-green-700 hover:bg-green-100'
                  }`}
                >
                  {tab.icon}
                </div>
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-80'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
            );
          })}

          {/* AI Tab */}
          <motion.div
            onClick={handleAIClick}
            className="relative w-16 mt-5 h-full flex flex-col items-center justify-end cursor-pointer group transition-all duration-300"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleAIClick()}
            whileHover={{ scale: 1.1 }}
          >
            <div
              className={`relative z-10 p-3 rounded-full transition-all duration-300 transform ${
                activeIndex === 2
                  ? 'bg-green-200 text-green-700 scale-125 translate-y-[-16px] shadow-lg border-2 border-green-300'
                  : 'text-gray-500 hover:text-green-700 hover:bg-green-200 scale-110 translate-y-[-8px]'
              }`}
            >
              {aiTab.icon}
            </div>
            <span
              className={`text-xs font-medium transition-all duration-300 ${
                activeIndex === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-80'
              }`}
            >
              {aiTab.label}
            </span>
          </motion.div>

          {/* Regular Tabs (after AI) */}
          {tabs.slice(2).map((tab, index) => {
            const adjustedIndex = index + 3;
            const isActive = adjustedIndex === activeIndex;

            return (
              <motion.div
                key={tab.path}
                onClick={() => handleNavigate(tab.path)}
                className="relative w-16 h-full flex flex-col items-center justify-end mb-3 cursor-pointer group transition-all duration-300"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate(tab.path)}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`relative z-10 p-2 rounded-full transition-all duration-300 transform ${
                    isActive
                      ? 'bg-green-100 text-green-700 scale-110 translate-y-[-8px] shadow-md'
                      : 'text-gray-500 hover:text-green-700 hover:bg-green-100'
                  }`}
                >
                  {tab.icon}
                </div>
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-80'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
            );
          })}

          {/* Logout Tab */}
          <motion.div
            onClick={handleLogout}
            className="relative w-16 h-full flex flex-col items-center justify-end mb-3 cursor-pointer group transition-all duration-300"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
            whileHover={{ scale: 1.05 }}
          >
            <div
              className="relative z-10 p-2 rounded-full transition-all duration-300 transform text-gray-500 hover:text-green-700 hover:bg-green-100"
            >
              <LogOut size={20} />
            </div>
            <span
              className="text-xs font-medium transition-all duration-300 opacity-0 -translate-y-2 group-hover:opacity-80"
            >
              Logout
            </span>
          </motion.div>
        </div>
      </motion.div>

      <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </>
  );
};

export default React.memo(BottomNavbar);