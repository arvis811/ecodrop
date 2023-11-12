const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const usersController = require('../controllers/usersController');

router.route('/register').get(usersController.renderRegister).post(catchAsync(usersController.register));
router
  .route('/login')
  .get(usersController.renderLogin)
  .post(
    passport.authenticate('local', {
      failureRedirect: '/auth/login',
    }),
    usersController.login,
  );
router.get('/logout', usersController.logout);

module.exports = router;
