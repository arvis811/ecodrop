const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const disposeController = require('../controllers/disposeController');

router.route('/').get(catchAsync(disposeController.index));

module.exports = router;
