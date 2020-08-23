const Product = require('../models/product');

const getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

const getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin | Products',
        path: '/admin/products',
      });
    })
    .catch((err) => console.log(err));
};

const getEditProduct = (req, res, next) => {
  const editMode = JSON.parse(req.query.edit);
  const productId = req.params.productId;
  req.user
    .getProducts({ where: { id: productId } })
    .then((products) => {
      if (!products) return res.redirect('/admin/products');
      res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: products[0],
      });
    })
    .catch((err) => console.log(err));
};

const postProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  req.user
    .createProduct({
      title,
      price,
      imageUrl,
      description,
    })

    .then((result) => {
      console.log(result);
      res.redirect('/');
    })
    .catch((err) => console.log('post product error = ', err));
};
const deleteProduct = (req, res, next) => {
  const { id } = req.body;
  Product.destroy({ where: { id } })
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

const postUpdatedProduct = (req, res, next) => {
  const { title, imageUrl, price, description, id } = req.body;
  Product.update(
    {
      title,
      price,
      imageUrl,
      description,
      userId: req.user.id,
    },
    { where: { id } }
  )
    .then((result) => {
      console.log(result);
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

module.exports = {
  getAddProduct,
  postProduct,
  getProducts,
  getEditProduct,
  postUpdatedProduct,
  deleteProduct,
};
