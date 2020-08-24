const Product = require('../models/product');

const getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();
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
    const products = await Product.findById(productId);
    if (!products) return res.redirect('/admin/products');
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: products[0],
    });
  } catch (err) {
    console.log(err);
  }
};

const postProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const userId = req.user._id;
  const product = new Product(
    title,
    price,
    imageUrl,
    description,
    null,
    userId
  );
  try {
    await product.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
};
const deleteProduct = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Product.deleteById(id);
    res.redirect('/admin/products');
  } catch (err) {
    console.log(err);
  }
};

const postEditProduct = async (req, res, next) => {
  const { title, imageUrl, price, description, id } = req.body;
  const product = new Product(title, price, imageUrl, description, id);
  try {
    await product.save();
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
