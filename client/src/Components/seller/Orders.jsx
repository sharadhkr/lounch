import React from 'react';
import { motion } from 'framer-motion';
import axios from '../selleraxios';
import toast from 'react-hot-toast';

const fadeIn = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Orders = ({ orders, setOrders, loading }) => {
  const statusOptions = [
    'order confirmed',
    'processing',
    'shipped',
    'out for delivery',
    'delivered',
    'cancelled',
    'returned',
  ];

  const getNextStatus = (currentStatus) => {
    const currentIndex = statusOptions.indexOf(currentStatus);
    if (currentIndex === -1 || currentStatus === 'cancelled' || currentStatus === 'returned') {
      return currentStatus; // No change for invalid, cancelled, or returned
    }
    return statusOptions[Math.min(currentIndex + 1, statusOptions.length - 3)]; // Exclude cancelled/returned
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'order confirmed':
        return 'text-blue-500';
      case 'processing':
        return 'text-indigo-500';
      case 'shipped':
        return 'text-purple-500';
      case 'out for delivery':
        return 'text-orange-500';
      case 'delivered':
        return 'text-emerald-500';
      case 'cancelled':
        return 'text-red-500';
      case 'returned':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleUpdateOrderStatus = async (id, currentStatus) => {
    const newStatus = getNextStatus(currentStatus);
    if (newStatus === currentStatus) {
      toast.error('No further status updates available');
      return;
    }

    try {
      const response = await axios.put(`/api/seller/auth/orders/${id}`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === id ? response.data.data.order : o)));
      toast.success(`Order updated to "${newStatus}"`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
      {loading ? (
        <div className="text-center text-gray-500 animate-pulse">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders found</div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Order #{order.orderId.slice(-6)}</h3>
                <p className="text-sm text-gray-500">
                  Total: ₹{order.total.toFixed(2)} |{' '}
                  <span className={getStatusColor(order.status)}>{order.status}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Payment: {order.paymentMethod} (
                  {order.onlineAmount > 0 && `Online: ₹${order.onlineAmount.toFixed(2)}`}
                  {order.onlineAmount > 0 && order.codAmount > 0 && ' + '}
                  {order.codAmount > 0 && `COD: ₹${order.codAmount.toFixed(2)}`})
                </p>
                <p className="text-sm text-gray-500">Shipping: ₹{order.shipping.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Items: {order.items.length}</p>
                <p className="text-sm text-gray-500">
                  Payment Status:{' '}
                  <span
                    className={
                      order.paymentStatus === 'completed'
                        ? 'text-emerald-500'
                        : order.paymentStatus === 'pending'
                        ? 'text-amber-500'
                        : 'text-red-500'
                    }
                  >
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleUpdateOrderStatus(order._id, order.status)}
                className={`px-4 py-1 text-sm rounded-full text-white shadow-sm transition-all duration-200 ${
                  order.status === 'delivered' || order.status === 'cancelled' || order.status === 'returned'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={order.status === 'delivered' || order.status === 'cancelled' || order.status === 'returned'}
              >
                {order.status === 'delivered'
                  ? 'Delivered'
                  : order.status === 'cancelled'
                  ? 'Cancelled'
                  : order.status === 'returned'
                  ? 'Returned'
                  : `Mark as ${getNextStatus(order.status)}`}
              </button>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700">Items:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} (Qty: {item.quantity}, Size: {item.size}, Color: {item.color}, ₹{item.price.toFixed(2)})
                    {item.onlineAmount > 0 && ` [Online: ₹${item.onlineAmount.toFixed(2)}]`}
                    {item.codAmount > 0 && ` [COD: ₹${item.codAmount.toFixed(2)}]`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
};

export default Orders;