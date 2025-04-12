import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from '../selleraxios';
import Overview from '../components/seller/Overview';
import Products from '../components/seller/Products';
import Orders from '../components/seller/Orders';
import NavBar from '../components/seller/NavBar';
import Profile from '../components/seller/Profile';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [seller, setSeller] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No seller token found. Please log in.');

        const [productsRes, ordersRes, revenueRes, profileRes, categoriesRes] = await Promise.all([
          axios.get('/api/seller/auth/products'),
          axios.get('/api/seller/auth/orders'),
          axios.get('/api/seller/auth/revenue'),
          axios.get('/api/seller/auth/profile'),
          axios.get('/api/seller/auth/categories'),
        ]);

        setProducts(productsRes.data.data.products || []);
        setOrders(ordersRes.data.data.orders || []);
        setRevenue(revenueRes.data.data.revenue || 0);
        setSeller(profileRes.data.data.seller || null);
        setCategories(categoriesRes.data.data.categories || []);
      } catch (error) {
        toast.error(error.message || 'Failed to load dashboard data');
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/seller/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/seller/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <Toaster position="top-center" toastOptions={{ duration: 1500 }} />
      <NavBar activeSection={activeSection} setActiveSection={setActiveSection} handleLogout={handleLogout} />
      <main className="max-w-7xl mx-auto p-6">
        {activeSection === 'overview' && (
          <Overview products={products} orders={orders} revenue={revenue} loading={loading} />
        )}
        {activeSection === 'products' && (
          <Products
            products={products}
            setProducts={setProducts}
            categories={categories}
            loading={loading}
          />
        )}
        {activeSection === 'orders' && (
          <Orders orders={orders} setOrders={setOrders} loading={loading} />
        )}
        {activeSection === 'profile' && (
          <Profile seller={seller} setSeller={setSeller} loading={loading} />
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;