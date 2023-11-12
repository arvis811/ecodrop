const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor } = require('../middleware/middleware');
const productsController = require('../controllers/productsController');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/').get(catchAsync(productsController.index)).post(isLoggedIn, upload.array('image'), catchAsync(productsController.createProduct));
router.get('/new', isLoggedIn, productsController.renderNewForm);
router.route('/:id').get(catchAsync(productsController.showProduct)).delete(isLoggedIn, isAuthor, catchAsync(productsController.deleteProduct));

module.exports = router;
