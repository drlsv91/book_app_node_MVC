const Product = require('../models/product');
const Order = require('../models/order');

const getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  } catch (err) {
    console.log(err);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  } catch (err) {
    console.log(err);
  }
};
const getProduct = async (req, res, next) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);

    if (!product || product.length === 0) return res.redirect('/');
    res.render('shop/product-details', {
      product: product,
      pageTitle: product.title,
      path: `/products`,
    });
  } catch (err) {
    console.log(err);
  }
};

const getCart = async (req, res, next) => {
  try {
    let user = await req.user.populate('cart.items.productId').execPopulate();
    let products = user.cart.items;
    res.render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      products,
    });
  } catch (err) {
    console.log(err);
  }
};

const postCart = async (req, res, next) => {
  const id = req.body.productId;
  const product = await Product.findById(id);
  try {
    await req.user.addToCart(product);
    res.redirect('/cart');
  } catch (err) {
    console.log(err);
  }
};

const postCardDeleteItem = async (req, res, next) => {
  const productId = req.body.id;
  try {
    await req.user.removeFromCart(productId);
    res.redirect('/cart');
  } catch (err) {
    console.log(err);
  }
};

const getCheckout = async (req, res, next) => {
  // const orders = await req.user.getOrders();
  // const products = await orders.getProducts();
  // console.log(products);
  res.render('shop/checkout', { pageTitle: 'Checkout', path: '/checkout' });
};

const postOrder = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items.map((i) => {
      return { product: { ...i.productId._doc }, quantity: i.quantity };
    });
    const order = new Order({
      user: { name: req.user.name, userId: req.user },
      products,
    });
    await order.save();
    // clear the cart
    await req.user.clearCart();

    res.redirect('/orders');
  } catch (err) {
    console.log(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id });
    res.render('shop/orders', { pageTitle: 'Orders', path: '/orders', orders });
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  getProducts,
  getIndex,
  getCart,
  getCheckout,
  getOrders,
  getProduct,
  postCart,
  postCardDeleteItem,
  postOrder,
};
