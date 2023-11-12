const User = require('../models/user');
const passport = require('passport');

module.exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    const user = new User({ firstName, lastName, email, username });

    // Register the user using the provided password
    const registeredUser = await User.register(user, password);

    // Save the registered user
    await registeredUser.save();

    // Log in the registered user
    req.login(registeredUser, async (err) => {
      if (err) return next(err);

      res.redirect('/');
    });
  } catch (error) {
    // Handle errors during registration
    res.redirect('/auth/register');
  }
};

module.exports.renderRegister = (req, res) => {
  res.render('auth/register');
};

module.exports.renderLogin = (req, res) => {
  res.render('auth/login');
};

module.exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/auth/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next);
};

// Controller for user logout
module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    } else {
      res.redirect('/');
    }
  });
};
