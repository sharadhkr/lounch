import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios'; // Shared Axios instance
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  FaUsers,
  FaStore,
  FaBox,
  FaTrash,
  FaSignOutAlt,
  FaList,
  FaEdit,
  FaPlus,
  FaSearch,
  FaCheckSquare,
  FaSquare,
  FaChartBar,
  FaUser,
} from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: null });
  const [categoryIconPreview, setCategoryIconPreview] = useState(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    return () => {
      if (categoryIconPreview) URL.revokeObjectURL(categoryIconPreview);
    };
  }, [categoryIconPreview]);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No admin token found. Please log in.');
        }

        const [sellersRes, productsRes, usersRes, categoriesRes] = await Promise.all([
          axios.get('/api/admin/auth/sellers'),
          axios.get('/api/admin/auth/products'),
          axios.get('/api/admin/auth/users'),
          axios.get('/api/categories'),
        ]);

        setSellers(sellersRes.data.sellers || []);
        setProducts(productsRes.data.products || []);
        setUsers(usersRes.data.users || []);
        setCategories(categoriesRes.data.categories || []);
        setFilteredCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.error('Fetch Overview Error:', error.message, error.response?.data);
        toast.error(error.message || 'Failed to load dashboard data');
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const overviewChartData = {
    labels: ['Sellers', 'Products', 'Users', 'Categories'],
    datasets: [
      {
        label: 'Count',
        data: [sellers.length, products.length, users.length, categories.length],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'],
        borderColor: ['#388E3C', '#1976D2', '#F57C00', '#7B1FA2'],
        borderWidth: 1,
      },
    ],
  };

  const statusChartData = {
    labels: ['Enabled Sellers', 'Disabled Sellers'],
    datasets: [
      {
        data: [
          sellers.filter((s) => s.status === 'enabled').length,
          sellers.filter((s) => s.status === 'disabled').length,
        ],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Dashboard Overview' } },
  };

  const statusChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Seller Status' } },
  };

  const handleToggleSellerStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    try {
      const response = await axios.put(`/api/admin/auth/sellers/${id}`, { status: newStatus });
      toast.success(`Seller ${newStatus} successfully`);
      setSellers(sellers.map((s) => (s._id === id ? { ...s, status: newStatus } : s)));
      console.log('Seller status updated:', response.data);
    } catch (error) {
      console.error('Toggle Seller Status Error:', error.response?.data || error.message);
      toast.error('Failed to update seller status');
    }
  };

  const handleUpdate = async (id, type, updates) => {
    try {
      const response = await axios.put(`/api/admin/auth/${type}s/${id}`, updates);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
      if (type === 'product') {
        setProducts(products.map((p) => (p._id === id ? response.data.product : p)));
      } else if (type === 'user') {
        setUsers(users.map((u) => (u._id === id ? response.data.user : u)));
      }
    } catch (error) {
      console.error(`Update ${type} Error:`, error.response?.data || error.message);
      toast.error(`Failed to update ${type}`);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await axios.delete(`/api/admin/auth/${type}s/${id}`);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      if (type === 'seller') setSellers(sellers.filter((s) => s._id !== id));
      else if (type === 'product') setProducts(products.filter((p) => p._id !== id));
      else if (type === 'user') setUsers(users.filter((u) => u._id !== id));
    } catch (error) {
      console.error(`Delete ${type} Error:`, error.response?.data || error.message);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleCategoryFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'icon') {
      const file = files[0];
      if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          toast.error('Only JPEG, PNG, or JPG files allowed');
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          toast.error('Icon size must be less than 2MB');
          return;
        }
        setCategoryForm((prev) => ({ ...prev, icon: file }));
        if (categoryIconPreview) URL.revokeObjectURL(categoryIconPreview);
        setCategoryIconPreview(URL.createObjectURL(file));
      }
    } else {
      setCategoryForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      toast.error('Category name is required');
      return;
    }
    if (!editingCategory && !categoryForm.icon) {
      toast.error('Category icon is required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description);
      if (categoryForm.icon) formData.append('icon', categoryForm.icon);

      let response;
      if (editingCategory) {
        response = await axios.put(`/api/categories/${editingCategory._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCategories(categories.map((cat) => (cat._id === editingCategory._id ? response.data.category : cat)));
        setFilteredCategories(filteredCategories.map((cat) =>
          cat._id === editingCategory._id ? response.data.category : cat
        ));
        toast.success('Category updated successfully');
      } else {
        response = await axios.post('/api/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCategories([...categories, response.data.category]);
        setFilteredCategories([...filteredCategories, response.data.category]);
        toast.success('Category added successfully');
      }
      setCategoryForm({ name: '', description: '', icon: null });
      setCategoryIconPreview(null);
      setEditingCategory(null);
      setShowCategoryForm(false);
    } catch (error) {
      console.error('Category Submit Error:', error.response?.data || error.message);
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to add category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description || '', icon: null });
    setCategoryIconPreview(category.icon || null);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories(categories.filter((cat) => cat._id !== id));
      setFilteredCategories(filteredCategories.filter((cat) => cat._id !== id));
      setSelectedCategories(selectedCategories.filter((catId) => catId !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Delete Category Error:', error.response?.data || error.message);
      toast.error('Failed to delete category');
    }
  };

  const handleBulkDeleteCategories = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) return;
    try {
      await axios.delete('/api/categories/bulk', { data: { categoryIds: selectedCategories } });
      setCategories(categories.filter((cat) => !selectedCategories.includes(cat._id)));
      setFilteredCategories(filteredCategories.filter((cat) => !selectedCategories.includes(cat._id)));
      setSelectedCategories([]);
      toast.success('Categories deleted successfully');
    } catch (error) {
      console.error('Bulk Delete Categories Error:', error.response?.data || error.message);
      toast.error('Failed to delete categories');
    }
  };

  const handleCategorySearch = async (e) => {
    e.preventDefault();
    if (!categorySearchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/api/categories/search?name=${categorySearchQuery}`);
      setFilteredCategories(response.data.categories || []);
    } catch (error) {
      console.error('Category Search Error:', error.response?.data || error.message);
      toast.error('Failed to search categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategorySelection = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const renderOverview = () => (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid gap-6">
      <div className="bg-blue-50 p-4 sm:p-6 rounded-3xl shadow-lg">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex items-center gap-2 sm:gap-3 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => setActiveSection('sellers')}
          >
            <FaStore className="text-green-500 text-xl sm:text-2xl" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Sellers</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{sellers.length}</p>
            </div>
          </div>
          <div
            className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex items-center gap-2 sm:gap-3 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => setActiveSection('products')}
          >
            <FaBox className="text-blue-500 text-xl sm:text-2xl" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Products</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{products.length}</p>
            </div>
          </div>
          <div
            className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex items-center gap-2 sm:gap-3 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => setActiveSection('users')}
          >
            <FaUsers className="text-orange-500 text-xl sm:text-2xl" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Users</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{users.length}</p>
            </div>
          </div>
          <div
            className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex items-center gap-2 sm:gap-3 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => setActiveSection('categories')}
          >
            <FaList className="text-purple-500 text-xl sm:text-2xl" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Categories</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 p-4 sm:p-6 rounded-3xl shadow-lg">
        <Bar data={overviewChartData} options={chartOptions} />
      </div>
      <div className="bg-blue-50 p-4 sm:p-6 rounded-3xl shadow-lg">
        <Doughnut data={statusChartData} options={statusChartOptions} />
      </div>
    </motion.div>
  );

  const renderSellers = () => (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid gap-4">
      {loading ? (
        <div className="text-center text-gray-600">Loading sellers...</div>
      ) : sellers.length === 0 ? (
        <p className="text-center text-gray-600">No sellers found.</p>
      ) : (
        sellers.map((seller) => (
          <div
            key={seller._id}
            className="bg-blue-50 p-4 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800">
                {seller.name || seller.phoneNumber || 'Unnamed Seller'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">Phone: {seller.phoneNumber || 'N/A'}</p>
              <p className="text-xs sm:text-sm text-gray-600">Email: {seller.email || 'N/A'}</p>
              <p className="text-xs sm:text-sm text-gray-600">Status: {seller.status || 'Unknown'}</p>
            </div>
            <div className="flex gap-2 items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={seller.status === 'enabled'}
                  onChange={() => handleToggleSellerStatus(seller._id, seller.status)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
              <button
                onClick={() => handleDelete(seller._id, 'seller')}
                className="text-red-500 hover:text-red-600"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );

  const renderProducts = () => (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid gap-4">
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-600">No products found.</p>
      ) : (
        products.map((product) => (
          <div
            key={product._id}
            className="bg-blue-50 p-4 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800">{product.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600">Price: ${product.price}</p>
              <p className="text-xs sm:text-sm text-gray-600">Seller: {product.seller?.name || 'Unknown'}</p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() =>
                  handleUpdate(product._id, 'product', {
                    status: product.status === 'approved' ? 'suspended' : 'approved',
                  })
                }
                className="text-blue-500 hover:text-blue-600"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(product._id, 'product')}
                className="text-red-500 hover:text-red-600"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );

  const renderUsers = () => (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid gap-4">
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        users.map((user) => (
          <div
            key={user._id}
            className="bg-blue-50 p-4 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800">{user.name || user.email}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{user.email}</p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() =>
                  handleUpdate(user._id, 'user', {
                    status: user.status === 'approved' ? 'suspended' : 'approved',
                  })
                }
                className="text-blue-500 hover:text-blue-600"
              >
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(user._id, 'user')} className="text-red-500 hover:text-red-600">
                <FaTrash />
              </button>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );

  const renderCategories = () => (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <form onSubmit={handleCategorySearch} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={categorySearchQuery}
            onChange={(e) => setCategorySearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600">
            <FaSearch />
          </button>
        </form>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ name: '', description: '', icon: null });
              setCategoryIconPreview(null);
              setShowCategoryForm(true);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 flex items-center gap-2"
          >
            <FaPlus /> Add Category
          </button>
          <button
            onClick={handleBulkDeleteCategories}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 flex items-center gap-2"
            disabled={selectedCategories.length === 0}
          >
            <FaTrash /> Delete Selected
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : filteredCategories.length === 0 ? (
        <p className="text-center text-gray-600">No categories found.</p>
      ) : (
        filteredCategories.map((category) => (
          <div
            key={category._id}
            className="bg-blue-50 p-4 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center gap-4">
              <button onClick={() => toggleCategorySelection(category._id)}>
                {selectedCategories.includes(category._id) ? (
                  <FaCheckSquare className="text-blue-500" />
                ) : (
                  <FaSquare className="text-gray-400" />
                )}
              </button>
              {category.icon && (
                <img src={category.icon} alt={category.name} className="w-8 h-8 object-contain rounded-full" />
              )}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-800">{category.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handleEditCategory(category)}
                className="text-blue-500 hover:text-blue-600"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteCategory(category._id)}
                className="text-red-500 hover:text-red-600"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <Toaster position="top-center" toastOptions={{ duration: 1500 }} />
      <nav className="p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-10">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-xl w-full py-4 shadow-xl rounded-2xl bg-blue-50 flex items-center justify-center gap-2 sm:text-2xl font-semibold text-gray-700"
          >
            <FaUser /> Admin Dashboard
          </motion.h1>
          <div className="flex flex-wrap drop-shadow-lg justify-center gap-2 sm:gap-3">
            {[
              { name: 'overview', icon: FaChartBar, label: 'Overview' },
              { name: 'sellers', icon: FaStore, label: 'Sellers' },
              { name: 'products', icon: FaBox, label: 'Products' },
              { name: 'users', icon: FaUsers, label: 'Users' },
              { name: 'categories', icon: FaList, label: 'Categories' },
            ].map((item) => (
              <motion.button
                key={item.name}
                onClick={() => setActiveSection(item.name)}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm sm:text-base ${
                  activeSection === item.name ? 'bg-blue-200 text-blue-700' : 'bg-white text-gray-700 hover:bg-blue-100'
                } shadow-sm transition-colors duration-200`}
              >
                <item.icon />
                {item.label}
              </motion.button>
            ))}
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm sm:text-base bg-white text-gray-700 hover:bg-blue-100 shadow-sm transition-colors duration-200"
            >
              <FaSignOutAlt />
              Logout
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-blue-50 flex items-center justify-center p-4 sm:p-6 rounded-2xl shadow-lg mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h2>
        </motion.div>
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'sellers' && renderSellers()}
        {activeSection === 'products' && renderProducts()}
        {activeSection === 'users' && renderUsers()}
        {activeSection === 'categories' && renderCategories()}

        {showCategoryForm && (
          <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-50 p-4 sm:p-6 rounded-3xl shadow-xl w-full max-w-md"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <form onSubmit={handleCategorySubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm sm:text-base">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryFormChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm sm:text-base">Description</label>
                  <textarea
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryFormChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                    Category Icon (JPEG, PNG, JPG, max 2MB)
                  </label>
                  <input
                    type="file"
                    name="icon"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleCategoryFormChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                    required={!editingCategory}
                  />
                  {categoryIconPreview && (
                    <div className="mt-2">
                      <img
                        src={categoryIconPreview}
                        alt="Category icon preview"
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-full"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base"
                  >
                    {editingCategory ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setCategoryIconPreview(null);
                    }}
                    className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;