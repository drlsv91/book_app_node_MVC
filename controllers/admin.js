const Product = require('../models/product');
const { validationResult } = require('express-validator');
const fileHelpers = require('../utils/file');

const getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};
const postAddProduct = async (req, res, next) => {
  const image = req.file;
  const { title, price, description } = req.body;
  const errors = validationResult(req);
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: { title, price, description },
      errorMessage: 'Attached file is not an image',
      validationErrors: [],
    });
  }
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: { title, price, description },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const imageUrl = image.path;
  const product = new Product({
    title,
    price,
    imageUrl,
    description,
    userId: req.user,
  });
  try {
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  const { _id } = req.user;

  try {
    const products = await Product.find({ userId: _id });
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin | Products',
      path: '/admin/products',
    });
  } catch (err) {
    console.log(err);
  }
};

const getEditProduct = async (req, res, next) => {
  const editMode = JSON.parse(req.query.edit);
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.redirect('/admin/products');
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: editMode,
      product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    console.log(err);
  }
};

const postEditProduct = async (req, res, next) => {
  const { title, price, description, id } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: true,
      hasError: true,
      product: { title, price, description, _id: id },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  try {
    const product = await Product.findById(id);
    if (product.userId.toString() !== req.user._id.toString())
      return res.redirect('/');
    product.title = title;
    if (image) {
      fileHelpers.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.price = price;
    product.description = description;
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const id = req.params.productId;

  try {
    const product = await Product.findById(id);
    if (!product) return next(new Error('No product found!'));
    fileHelpers.deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: id, userId: req.user._id }, (err) => {
      if (err) return res.redirect('/');
    });
    res.status(200).json({ message: 'Product successfully deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Product deleting failed' });
  }
};

module.exports = {
  getAddProduct,
  postAddProduct,
  getProducts,
  getEditProduct,
  postEditProduct,
  deleteProduct,
};
