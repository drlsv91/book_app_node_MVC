const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');

router.get('/add-product', adminController.getAddProduct);

router.get('/products', adminController.getProducts);
router.post('/add-product', adminController.postProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.deleteProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

module.exports = router;
