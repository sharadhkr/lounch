const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Seller = require('../models/sellerModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const adminLoggedin = require('../middleware/adminLoggedin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/admin/create', async (req, res) => {
  try {
    const { phoneNumber, email, name, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
    }

    const existingAdmin = await Admin.findOne({ phoneNumber });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({ phoneNumber, email, name, password });
    await admin.save();

    res.status(201).json({ message: 'Admin created successfully', admin });
  } catch (error) {
    console.error('Admin creation failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
    }

    const admin = await Admin.findOne({ phoneNumber });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, phoneNumber: admin.phoneNumber, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Logged in successfully',
      admin: { id: admin._id, phoneNumber: admin.phoneNumber, role: 'admin' },
      token,
    });
  } catch (error) {
    console.error('Admin login failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify-token', adminLoggedin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      message: 'Token is valid',
      admin: { id: admin._id, phoneNumber: admin.phoneNumber, role: 'admin' },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

router.get('/sellers', adminLoggedin, async (req, res) => {
  try {
    const sellers = await Seller.find({});
    res.status(200).json({ sellers });
  } catch (error) {
    console.error('Failed to fetch sellers:', error);
    res.status(500).json({ message: 'Failed to fetch sellers' });
  }
});

router.put('/sellers/:id', adminLoggedin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const seller = await Seller.findByIdAndUpdate(id, updates, { new: true });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.status(200).json({ seller });
  } catch (error) {
    console.error('Failed to update seller:', error);
    res.status(500).json({ message: 'Failed to update seller' });
  }
});

router.delete('/sellers/:id', adminLoggedin, async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findByIdAndDelete(id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.status(200).json({ message: 'Seller deleted successfully' });
  } catch (error) {
    console.error('Failed to delete seller:', error);
    res.status(500).json({ message: 'Failed to delete seller' });
  }
});

router.get('/products', adminLoggedin, async (req, res) => {
  try {
    const products = await Product.find({}).populate('sellerId', 'name');
    res.status(200).json({ products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.put('/products/:id', adminLoggedin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ product });
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/products/:id', adminLoggedin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

router.get('/users', adminLoggedin, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});
router.put('/sellers/:id', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    seller.status = req.body.status; // Expects 'enabled' or 'disabled'
    await seller.save();
    res.json({ seller });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update seller' });
  }
});
router.put('/users/:id', adminLoggedin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

router.delete('/users/:id', adminLoggedin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});



module.exports = router;