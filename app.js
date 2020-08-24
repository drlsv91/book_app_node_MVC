const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./utils/path');
const errorsController = require('./controllers/errors');
const { mongodbConnect } = require('./utils/database');
const User = require('./models/user');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  const id = '5f43bb87d2dc3c798093e4e3';
  try {
    const user = await User.findById(id);
    req.user = new User(user.name, user.email, user.cart, user._id);
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(express.static(path.join(rootDir, 'public')));

app.use(errorsController.get404);

mongodbConnect(() => {
  app.listen(5000);
});
