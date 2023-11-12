const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const aboutController = require('../controllers/aboutController');

router.route('/').get(catchAsync(aboutController.index));
router.route('/contacts').get(catchAsync(aboutController.contacts));

module.exports = router;
