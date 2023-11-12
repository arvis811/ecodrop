const Product = require('../models/product');
const fns = require('date-fns');
const { ObjectId } = require('mongoose').Types;
const path = require('path');

// show all products
module.exports.index = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 10; // Number of items to display per page
    const { page, limit, deviceStatus, deviceType, maxDistance, userlongitude, userlatitude } = req.query;
    // console.log('deviceType', deviceType);
    // Validate and sanitize input parameters
    const currentPage = parseInt(page) || 1;
    const limitPerPage = parseInt(limit) || ITEMS_PER_PAGE;

    // Define filter options for the search query
    const filterOptions = {};

    if (deviceStatus) {
      filterOptions.deviceStatus = { $regex: new RegExp(deviceStatus, 'i') };
    }

    if (deviceType) {
      filterOptions.deviceType = { $regex: new RegExp(deviceType, 'i') };
    }

    //console.log(userlongitude, userlatitude, maxDistance);

    if (userlatitude && userlongitude && maxDistance) {
      // Convert maxDistance to radians
      const maxDistanceRadians = maxDistance / 6371;

      filterOptions.location = {
        $geoWithin: {
          $centerSphere: [[userlongitude, userlatitude], maxDistanceRadians],
        },
      };
    }

    // Retrieve total number of products for pagination logic
    const totalProducts = await Product.countDocuments(filterOptions);

    // Calculate starting index based on current page and limit
    const startIndex = (currentPage - 1) * limitPerPage;

    // Retrieve products for current page with applied filter options
    const products = await Product.find(filterOptions).skip(startIndex).limit(limitPerPage);

    // Calculate total number of pages based on total products and limit per page
    const totalPages = Math.ceil(totalProducts / limitPerPage);
    // Render response with pagination data

    res.render('products/index', { products, currentPage, limitPerPage, totalProducts, totalPages, startIndex, deviceStatus, deviceType });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render('products/new');
};

module.exports.createProduct = async (req, res, next) => {
  try {
    if (req.body.product.latitude === null || req.body.product.longitude === null || req.body.product.latitude === '' || req.body.product.longitude === '' || isNaN(req.body.product.latitude) || isNaN(req.body.product.longitude)) {
      return res.redirect('/products/new');
    }

    const unprocessedBody = {
      deviceStatus: req.body.product.deviceStatus,
      location: {
        type: 'Point',
        coordinates: [req.body.product.longitude, req.body.product.latitude],
      },
      deviceType: req.body.product.deviceType,
      description: req.body.product.description,
    };
    // console.log(unprocessedBody);

    const product = new Product(unprocessedBody);

    // assign images to the new product
    product.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));

    // asign current user as author
    product.author = req.user._id;

    // Save the product to the database
    await product.save();

    res.redirect(`/products/${product._id}`);
  } catch (err) {
    console.log(err);
  }
};

// Show product
module.exports.showProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product with the provided ID and populate author
    const product = await Product.findById(productId).populate('author');

    // Check if the product is found
    if (!product) {
      return res.redirect('/products');
    }

    // Format the creation
    const createDateInWords = fns.formatDistanceToNow(new Date(product.createdAt), {
      addSuffix: true,
    });

    res.render('products/show', {
      product,
      createDateInWords,
    });
  } catch (error) {
    console.error('Error retrieving device:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// Delete product
module.exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.status(200).redirect('/products');
};
