const express = require('express');
const router = express.Router();
const purchase = require('../lib/purchase');

router.get('/detail/:merId', (req, res)=>{
    purchase.purchasedetail(req, res);
})

router.get('/',(req, res)=>{
    purchase.purchase(req, res);
})

router.post('/purchase_process',(req, res)=>{
    purchase.purchase_process(req, res);
})

router.get('/cancel/:merId', (req, res)=>{
    purchase.cancel(req, res);
})

router.post('/cart_process', (req, res)=>{
    purchase.cart_process(req, res);
})

router.get('/cart', (req, res)=>{
    purchase.cart(req, res);
})

router.post('/cart_purchase_process', (req, res)=>{
    purchase.cart_purchase_process(req, res);
})

router.post('/cart_delete_process', (req, res)=>{
    purchase.cart_delete_process(req, res)
})

module.exports = router