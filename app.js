const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const path = require('path');
const rootDir = require('./utils/path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const errorsController = require('./controllers/errors');
const config = require('./config/default.json');
const User = require('./models/user');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');

const store = new MongoDBStore({
  uri: config.mongodbURI,
  collection: 'sessions',
});
const csrfProtection = csrf();

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, '/public/images'),
//   filename: (req, file, cb) =>
//     cb(null, new Date().toISOString() + '-' + file.originalname),
// });

app.set('view engine', 'ejs');
app.set('views', './views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  )
    cb(null, true);
  else cb(null, false);
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/images', express.static(path.join(rootDir, 'images')));

app.use(
  session({
    secret: 'my secret key',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});
app.use(async (req, res, next) => {
  if (!req.session.user) return next();
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return next();
    req.user = user;
    next();
  } catch (err) {
    next(new Error(err));
  }
});

app.post('/create-order', isAuth, shopController.postOrder);

app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

app.get('/500', errorsController.get500);
app.use(errorsController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Internal Error',
    path: '500',
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose.connect(
  config.mongodbURI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  async (err) => {
    console.log('connected');
    app.listen(5000);
  }
);
