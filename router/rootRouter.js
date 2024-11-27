const express = require('express');
var router = express.Router()
var root = require('../lib/root');

// multer
const multer = require('multer');
const upload = multer({
    storage : multer.diskStorage({
        destination : function(req, file, cb) { cb(null, 'public/image');},
        filename : function(req, file, cb){
            var newFileName = Buffer.from(file.originalname,"latin1").toString("utf-8")
                cb(null, newFileName);
        }
    })
})

router.get('/', (req, res)=>{
    root.home(req, res);
})

router.get('/category/:categ',(req,res)=>{
    root.categoryview(req, res);
})

router.post('/search', (req, res)=>{
    root.search(req, res);
})

router.get('/detail/:merId', (req, res)=>{
    root.detail(req, res)
})

router.get('/cartView',(req, res)=>{
    root.cartView(req, res);
})

router.get('/cartupdate/:cartId',(req, res)=>{
    root.cartupdate(req, res);
})

router.post('/cart_update_process' ,(req, res)=>{
    root.cart_update_process(req,res);
})

router.get('/cartdelete/:cartId', (req, res)=>{
    root.cart_delete_process(req, res);
})

router.get('/purchaseview' , (req, res)=>{
    root.purchaseview(req, res)
})

router.get('/purchaseupdate/:purchaseId',(req, res)=>{
    root.purchaseupdate(req, res);
})

router.post('/purchase_update_process' , (req ,res)=>{
    root.purchase_update_process(req, res)
})

router.get('/purchasedelete/:purchaseId', (req, res)=>{
    root.purchase_delete_process(req, res)
})

router.get('/anal/customer', (req,res)=>{
    root.analyse(req, res);
})

//업로드 프로세스
router.post('/upload_process', upload.single('uploadFile'), (req, res)=>{
    var file= '/image/' + req.file.filename
    res.send(`
        <h1>Image upload Successfully</h1>
        <a href ="/">Back</a>
        <p><img src="${file}" alt="image 출력"/></p>
        `
    );
    console.log(file);
})


module.exports = router;