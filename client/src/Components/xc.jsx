import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="w-full max-w-md h-24 bg-white rounded-3xl shadow-md flex animate-pulse">
      <div className="w-24 h-full bg-gray-200 rounded-l-3xl"></div>
      <div className="flex-grow p-3 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-6 h-4 bg-gray-200 rounded"></div>
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;