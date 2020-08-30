const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const config = require('../config/default.json');
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);
const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;
let totalItems;

const getIndex = async (req, res, next) => {
  const page = +req.query.page || 1;
  try {
    totalItems = await Product.countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: page * ITEMS_PER_PAGE < totalItems,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    next(err);
  }
};

const getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;
  try {
    totalItems = await Product.countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
      currentPage: page,
      hasNextPage: page * ITEMS_PER_PAGE < totalItems,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    next(err);
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
  try {
    let user = await req.user.populate('cart.items.productId').execPopulate();
    let products = user.cart.items;
    let sum = 0;
    products.forEach((p) => {
      sum += p.quantity * p.productId.price;
    });
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout',
      isAuthenticated: req.session.isLoggedIn,
      products,
      total: sum,
    });
  } catch (err) {
    next(err);
  }
};

const postOrder = async (req, res, next) => {
  const token = req.body.stripeToken;
  console.log(req.body);
  try {
    let totalPrice = 0;
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items.map((i) => {
      return { product: { ...i.productId._doc }, quantity: i.quantity };
    });

    const order = new Order({
      user: { email: req.user.email, userId: req.user },
      products,
    });
    user.cart.items.forEach(
      (p) => (totalPrice += p.quantity * p.productId.price)
    );

    await order.save();
    const charges = stripe.charges.create({
      amount: totalPrice * 100,
      currency: 'usd',
      description: 'demo charge',
      source: token,
      metadata: { order_id: order._id.toString() },
    });
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
    res.render('shop/orders', {
      pageTitle: 'Orders',
      path: '/orders',
      orders,
    });
  } catch (err) {
    console.log(err);
  }
};

const getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);

  try {
    const order = await Order.findById({ _id: orderId });
    if (!order) return next(new Error('No order found'));
    if (order.user.userId.toString() !== req.user._id.toString())
      return next(new Error('Not authorized'));

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    pdfDoc.fontSize(26).text('Invoice', { underline: true });
    pdfDoc.text('-----------------');
    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.product.price * prod.quantity;
      pdfDoc
        .fontSize(16)
        .text(
          prod.product.title +
            ' - ' +
            prod.quantity +
            ' x ' +
            '$' +
            prod.product.price
        );
    });
    pdfDoc.text('----');
    pdfDoc.fontSize(20).text('Total price = $' + totalPrice);
    pdfDoc.end();

    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) return next(err);

    //   const file = fs.createReadStream(invoicePath);

    //   file.pipe(res);
    // });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getProducts,
  getIndex,
  getCart,
  getCheckout,
  getOrders,
  getProduct,
  getInvoice,
  postCart,
  postCardDeleteItem,
  postOrder,
};
