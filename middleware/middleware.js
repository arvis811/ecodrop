const Product = require('../models/product.js');

// Middleware function to check if user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware function to check if the user is the author of the device
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product.author.equals(req.user._id)) {
    return res.redirect(`/products/${product._id}`);
  }
  next();
};
