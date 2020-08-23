const Product = require('../models/product');
const Cart = require('../models/cart');

const getIndex = async (req, res, next) => {
  try {
    const products = await Product.findAll();
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
    const products = await Product.findAll();
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
    const product = await Product.findOne({ where: { id } });

    if (!product) return res.redirect('/');

    res.render('shop/product-details', {
      product,
      pageTitle: product.title,
      path: `/products`,
    });
  } catch (err) {
    console.log(err);
  }
};

const getCart = async (req, res, next) => {
  try {
    const cart = await req.user.getCart();
    const products = await cart.getProducts();
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
  let product;
  let newQuantity = 1;

  // get user cart
  const cart = await req.user.getCart();
  // get cart products
  const products = await cart.getProducts({ where: { id } });

  if (products.length > 0) {
    product = products[0];
  }
  if (product) {
    let oldQuantity = product.cartItem.quantity;
    newQuantity = oldQuantity + 1;
  }
  try {
    const getProduct = await Product.findOne({ where: { id } });
    await cart.addProduct(getProduct, { through: { quantity: newQuantity } });
    res.redirect('/cart');
  } catch (err) {
    console.log(err);
  }
};

const postCardDeleteItem = async (req, res, next) => {
  const productId = req.body.id;
  const cart = await req.user.getCart();
  const products = await cart.getProducts({ where: { id: productId } });
  try {
    await products[0].cartItem.destroy();
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
  const cart = await req.user.getCart();
  const products = await cart.getProducts();
  const order = await req.user.createOrder();
  try {
    await order.addProducts(
      products.map((product) => {
        product.orderItem = { quantity: product.cartItem.quantity };
        return product;
      })
    );
    cart.setProducts(null);
    res.redirect('/orders');
  } catch (err) {
    console.log(err);
    cart.setProducts(products);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders({ include: ['products'] });
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
