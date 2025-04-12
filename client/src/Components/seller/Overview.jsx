import React from 'react';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FaBox, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const fadeIn = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Overview = ({ products, orders, revenue, loading }) => {
  const overviewChartData = {
    labels: ['Products', 'Orders', 'Revenue'],
    datasets: [
      {
        label: 'Count',
        data: [products.length, orders.length, revenue],
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
        borderRadius: 4,
      },
    ],
  };

  const statusChartData = {
    labels: ['Enabled', 'Disabled'],
    datasets: [
      {
        data: [
          products.filter((p) => p.status === 'enabled').length,
          products.filter((p) => p.status === 'disabled').length,
        ],
        backgroundColor: ['#10b981', '#ef4444'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Overview Stats', font: { size: 16, weight: '600' } } },
    scales: { y: { beginAtZero: true } },
  };
  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Product Status', font: { size: 16, weight: '600' } } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <FaBox className="text-2xl text-blue-600" />, title: 'Products', value: products.length, bg: 'bg-blue-50' },
            { icon: <FaShoppingCart className="text-2xl text-amber-600" />, title: 'Orders', value: orders.length, bg: 'bg-amber-50' },
            { icon: <FaDollarSign className="text-2xl text-emerald-600" />, title: 'Revenue', value: `₹${revenue.toLocaleString()}`, bg: 'bg-emerald-50' },
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.bg} p-4 rounded-lg flex items-center gap-3 hover:shadow-md transition-all duration-200`}>
              {stat.icon}
              <div>
                <p className="text-xs text-gray-500">{stat.title}</p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <Bar data={overviewChartData} options={chartOptions} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <Doughnut data={statusChartData} options={doughnutOptions} />
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;