const express = require('express');
const router = express.Router();
const table = require('../lib/table');


router.get('/', (req, res)=>{
    table.home(req, res);
})

router.get('/view/:table', (req, res)=>{
    table.view(req, res);
})

module.exports = router