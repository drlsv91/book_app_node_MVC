const Product = require('../models/product');

const getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};
const postProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const product = new Product({
    title,
    price,
    imageUrl,
    description,
    userId: req.user,
  });
  try {
    await product.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
};
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
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
    });
  } catch (err) {
    console.log(err);
  }
};

const postEditProduct = async (req, res, next) => {
  const { title, imageUrl, price, description, id } = req.body;

  const product = await Product.findById(id);
  product.title = title;
  product.imageUrl = imageUrl;
  product.price = price;
  product.description = description;
  try {
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    console.log(err);
  }
};

const deleteProduct = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Product.findOneAndDelete(id);
    res.redirect('/admin/products');
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getAddProduct,
  postProduct,
  getProducts,
  getEditProduct,
  postEditProduct,
  deleteProduct,
};
