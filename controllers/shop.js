const Product = require('../models/product');
const Cart = require('../models/cart');

const getIndex = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();
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
    const products = await Product.fetchAll();
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
    let products = await req.user.getCart();
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
    await req.user.deleteItemFromCart(productId);
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
    await req.user.addOrder();
    res.redirect('/orders');
  } catch (err) {
    console.log(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders();
    console.log(orders);
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
