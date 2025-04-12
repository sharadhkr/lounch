const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  dateOfBirth: { type: Date, default: null },
  recentSearches: { type: [String], default: [] },
  addresses: [{
    street: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    postalCode: { type: String, trim: true, required: true },
    country: { type: String, trim: true, default: 'India' },
  }],
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user',
    required: true,
  },
  lastLogin: { type: Date, default: null },
  farmName: { type: String, trim: true },
  farmLocation: { type: String, trim: true },
  harvestDates: [{ crop: { type: String }, date: { type: Date } }],
  yieldData: [{ crop: { type: String }, yield: { type: Number, min: 0 }, year: { type: Number } }],
  productsOffered: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, min: 0 },
    price: { type: Number, min: 0 },
  }],
  wishlist: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now },
  }],
  cart: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      default: 1, 
      min: 1 
    },
    addedAt: { 
      type: Date, 
      default: Date.now 
    },
    size: { 
      type: String, 
      required: true, 
      trim: true 
    },
    color: { 
      type: String, 
      required: true, 
      trim: true 
    },
  }],
  savedForLater: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      default: 1, 
      min: 1 
    },
    addedAt: { 
      type: Date, 
      default: Date.now 
    },
    size: { 
      type: String, 
      required: true, 
      trim: true 
    },
    color: { 
      type: String, 
      required: true, 
      trim: true 
    },
  }],
  profilePicture: { type: String, trim: true },
  bio: { type: String, trim: true, maxlength: [500, 'Bio cannot exceed 500 characters'] },
  preferences: {
    notifications: { type: Boolean, default: true },
    preferredCategories: [{ type: String }],
  },
  paymentDetails: {
    bankAccount: {
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
    },
    upiId: { type: String, trim: true },
    razorpayAccountId: { type: String, trim: true },
  },
}, { timestamps: true });

// Pre-save hook to update `updatedAt` and log cart/savedForLater for debugging
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  console.log('Cart before save:', this.cart);
  console.log('Saved for later before save:', this.savedForLater);
  next();
});

// Methods
userSchema.methods.generateVerificationToken = function () {
  // Consider using `crypto` for a more secure token
  this.verificationToken = require('crypto').randomBytes(32).toString('hex');
  return this.verificationToken;
};

userSchema.methods.checkPassword = function (enteredPassword) {
  // Placeholder; replace with bcrypt.compare in production
  return enteredPassword === this.password; 
};

userSchema.methods.toggleWishlist = async function (productId) {
  const existingIndex = this.wishlist.findIndex(item => item.productId.toString() === productId.toString());
  if (existingIndex >= 0) {
    this.wishlist.splice(existingIndex, 1);
  } else {
    this.wishlist.push({ productId });
  }
  return await this.save();
};

userSchema.methods.updateCart = async function (cartItem) {
  const { productId, quantity, size, color } = cartItem;
  if (!productId || !quantity || !size || !color) {
    throw new Error('Missing required cart fields: productId, quantity, size, or color');
  }

  const existingItem = this.cart.find(item => 
    item.productId.toString() === productId.toString() && 
    item.size === size && 
    item.color === color
  );

  if (existingItem) {
    existingItem.quantity = quantity; // Update to overwrite instead of increment
  } else {
    this.cart.push({ productId, quantity, size, color });
  }
  return await this.save();
};

userSchema.methods.updateSavedForLater = async function (cartItem) {
  const { productId, quantity, size, color } = cartItem;
  if (!productId || !quantity || !size || !color) {
    throw new Error('Missing required saved for later fields: productId, quantity, size, or color');
  }

  const existingItem = this.savedForLater.find(item => 
    item.productId.toString() === productId.toString() && 
    item.size === size && 
    item.color === color
  );

  if (existingItem) {
    existingItem.quantity = quantity; // Update to overwrite instead of increment
  } else {
    this.savedForLater.push({ productId, quantity, size, color });
  }
  return await this.save();
};

userSchema.methods.removeFromSavedForLater = async function (productId, size, color) {
  this.savedForLater = this.savedForLater.filter(item => 
    !(item.productId.toString() === productId.toString() && item.size === size && item.color === color)
  );
  return await this.save();
};

userSchema.methods.clearCart = async function () {
  this.cart = [];
  return await this.save();
};

module.exports = mongoose.model('User', userSchema);