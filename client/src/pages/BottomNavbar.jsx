import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, ShoppingCart, Heart } from 'lucide-react';
import logo from '../assets/logo.png';
import AIAssistantModal from '../components/AIAssistantModall';

const tabs = [
  { path: '/', icon: <Home />, label: 'Home' },
  { path: '/cart', icon: <ShoppingCart />, label: 'Cart' },
  { path: '/wishlist', icon: <Heart />, label: 'Wishlist' },
  { path: '/dashboard', icon: <User />, label: 'Profile' },
];

const aiTab = {
  icon: <img src={logo} alt="AI" className="w-8 h-8 object-cover" />,
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
    setActiveIndex(2); // Set AI tab active
  };

  return (
    <>
      <div className="fixed bottom-4 left-0 w-full flex justify-center z-50 px-4">
        <div className="relative w-[380px] max-w-md h-20 bg-green-50/80 backdrop-blur-md rounded-4xl shadow-2xl px-4 flex justify-between items-center overflow-visible border border-green-200">
          {tabs.slice(0, 2).map((tab, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={tab.path}
                onClick={() => handleNavigate(tab.path)}
                className="relative w-16 h-full flex flex-col items-center justify-end mb-3 cursor-pointer group transition-all duration-300"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate(tab.path)}
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
                  className={`text-xs mt-0 font-medium transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-80'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            );
          })}

          {/* AI Tab */}
          <div
            onClick={handleAIClick}
            className="relative w-16 mt-5 h-full flex flex-col items-center justify-end cursor-pointer group transition-all duration-300"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleAIClick()}
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
              className={`text-xs mt-0 font-medium transition-all duration-300 ${
                activeIndex === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-80'
              }`}
            >
              {aiTab.label}
            </span>
          </div>

          {tabs.slice(2).map((tab, index) => {
            const adjustedIndex = index + 3;
            const isActive = adjustedIndex === activeIndex;

            return (
              <div
                key={tab.path}
                onClick={() => handleNavigate(tab.path)}
                className="relative w-16 h-full flex flex-col items-center justify-end mb-3 cursor-pointer group transition-all duration-300"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate(tab.path)}
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
                  className={`text-xs mt-0 font-medium transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-80'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </>
  );
};

export default React.memo(BottomNavbar);
