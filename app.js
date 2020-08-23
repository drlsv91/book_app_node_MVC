const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./utils/path');
const errorsController = require('./controllers/errors');
const sequelize = require('./utils/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  User.findOne({ where: { id: 1 } })
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(express.static(path.join(rootDir, 'public')));

app.use(errorsController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);

Product.belongsToMany(Cart, { through: CartItem });
Cart.belongsToMany(Product, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  //   .sync({ force: true })
  .sync()
  .then((res) => {
    return User.findOne({ where: { id: 1 } });
  })
  .then((user) => {
    if (!user) return User.create({ name: 'victor', email: 'admin@mail.com' });
    return user;
  })
  .then((user) => {
    return user.createCart();
  })
  .then((cart) => {
    app.listen(5000);
  })
  .catch((err) => console.log('error = ', err));
