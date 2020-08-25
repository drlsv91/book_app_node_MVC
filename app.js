const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./utils/path');
const errorsController = require('./controllers/errors');
const mongoose = require('mongoose');
const config = require('./config/default.json');
const User = require('./models/user');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  const id = '5f44d0c4f81357445847fe34';
  try {
    const user = await User.findById(id);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(express.static(path.join(rootDir, 'public')));

app.use(errorsController.get404);

mongoose.connect(
  config.mongodbURI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  async (err) => {
    if (!err) {
      let user = await User.findOne();
      if (!user)
        user = new User({
          name: 'victor',
          email: 'admin@mail.com',
          cart: { items: [] },
        });
      await user.save();
      console.log('connected');
      app.listen(5000);
    }
  }
);
