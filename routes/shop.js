const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProduct);

router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post('/cart-delete-item', shopController.postCardDeleteItem);
router.post('/create-order', shopController.postOrder);
router.get('/checkout', shopController.getCheckout);
router.get('/orders', shopController.getOrders);
// router.get('/product-detail');

module.exports = router;
