// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const session = require('express-session');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const ExpressError = require('./utils/ExpressError');
// Import routes
const productRoutes = require('./routes/productRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const userRoutes = require('./routes/userRoutes');
const disposeRoutes = require('./routes/disposeRoutes');

const User = require('./models/user');

// Create Express app
const app = express();

// Middleware
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const dbURL = process.env.DB_URL;
mongoose
  .connect(dbURL, {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('MongoDB connection error: ', error);
  });

const secret = process.env.SECRET;
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbURL,
    secret: secret,
    touchAfter: 24 * 60 * 60,
  }),
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js authentication
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make currentUser, success, and error available in all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Mount Routes
app.use('/auth', userRoutes);
app.use('/products', productRoutes);
app.use('/about', aboutRoutes);
app.use('/dispose', disposeRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

// Serve manifest.json
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Serve service-worker.js
app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'service-worker.js'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
