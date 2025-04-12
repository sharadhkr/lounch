import React, { useState } from 'react';
import { FaStore, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';

const NavBar = ({ activeSection, setActiveSection, handleLogout }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <nav className="bg-white p-4 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FaStore /> Seller Dashboard
        </h1>
        <div className="sm:hidden">
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="text-gray-600 focus:outline-none"
          >
            <FaChevronDown className={`transition-transform duration-200 ${isNavOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div
          className={`sm:flex items-center gap-4 ${isNavOpen ? 'block' : 'hidden'} absolute sm:static top-16 left-0 right-0 bg-white sm:bg-transparent shadow-sm sm:shadow-none p-4 sm:p-0`}
        >
          {['overview', 'products', 'orders', 'profile'].map((section) => (
            <button
              key={section}
              onClick={() => {
                setActiveSection(section);
                setIsNavOpen(false);
              }}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeSection === section ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;