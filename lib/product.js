var db = require('./db');
var sanitize = require('sanitize-html');
var utils = require('./util');


module.exports = {
    view : (req, res)=>{
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM product;'
        var sql3 = 'SELECT * FROM code;'
        var {name, login, cls} = utils.authIsOwner(req, res);
        var status='view';

        db.query(sql1 + sql2+sql3, (err, results)=>{
            if(err) {console.log(err)}
            var context = {
                who : name, 
                login: login, // t or f,
                cls : cls,
                body : 'product.ejs',
                boardtypes : results[0],
                products : results[1],
                category : results[2],
                status: status
            }

            res.render('mainFrame', context, (error, html)=>{
                if(error){ console.log (error) }
                res.end(html)
            })
        })
    },

    create : (req, res)=>{
        var {name, login, cls} = utils.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'
        var status = 'create';

        db.query(sql1 + sql2 , (err, results)=>{
            var context = {
                who:name,
                login:login,
                cls:cls,
                body:'productC.ejs',
                boardtypes: results[0], 
                categorys: results[1],
                category : results[1],
                status : status
            }

            res.render('mainFrame', context, (error, html)=>{
                if(error){console.log(error)}
                res.end(html);
            })
        })
    },

    create_process : (req, res)=>{
        var post = req.body;
        var file = '/image/' + req.file.filename;
        console.log(req.file);
        var sntzedCatgory = sanitize(post.category)
        var main_id = sntzedCatgory.substr(0, 4)
        var sub_id = sntzedCatgory.substr(4,4)
        var sntzedName = sanitize(post.name)
        var sntzedPrice = parseInt(sanitize(post.price));
        var sntzedStock = parseInt(sanitize(post.stock));
        var sntzedBrand = sanitize(post.brand)
        var sntzedSupplier = sanitize(post.supplier)
        var sntzedfile = file
        var sntzedSaleYn = sanitize(post.sale_yn)
        var sntzedSalePrice = parseInt(sanitize(post.sale_price));

        db.query('INSERT INTO product (main_id, sub_id, name, price, stock, brand, supplier, image, sale_yn, sale_price) VALUES (?,?,?,?,?,?,?,?,?,?)', 
            [main_id, sub_id, sntzedName, sntzedPrice, sntzedStock,sntzedBrand,sntzedSupplier, sntzedfile, sntzedSaleYn, sntzedSalePrice ], (error, results)=>{
                if(error) {console.log(error)}
                res.redirect('/product/view')
                res.end()
            })
    },

    update : (req, res)=>{
        var merId = req.params.merId;
        var {name, login, cls} = utils.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'
        var status = 'update';

        db.query(sql1+ sql2, (err, results)=>{
            if(err) {console.log(err)}
            db.query('SELECT * FROM product where mer_id = ?', 
                [merId], (err2, product)=>{
                    if(err2) {console.log(err2)}
                    

                    var context = {
                        who : name,
                        login: login,
                        cls : cls,
                        body : 'productU.ejs',
                        boardtypes : results[0],
                        categorys : results[1],
                        category : results[1],
                        status : status,
                        product : product
                    }
        
                    res.render('mainFrame', context, (error, html)=>{
                        if(error) {console.log(error)}
                        res.end(html)
                    })
                }
            )
        })
    },

    update_process : (req, res)=>{
        var post = req.body;
        // var file = '/image/' + req.file.filename;
        var file = sanitize(post.image);
        var sntzedCatgory = sanitize(post.category)
        var main_id = sntzedCatgory.substr(0, 4)
        console.log(post.merId)
        var sub_id = sntzedCatgory.substr(4,4)
        console.log(main_id + sub_id)
        var sntzedName = sanitize(post.name)
        var sntzedPrice = parseInt(sanitize(post.price));
        var sntzedStock = parseInt(sanitize(post.stock));
        var sntzedBrand = sanitize(post.brand)
        var sntzedSupplier = sanitize(post.supplier)
        var sntzedfile = file
        var sntzedSaleYn = sanitize(post.sale_yn)
        var sntzedSalePrice = parseInt(sanitize(post.sale_price));

        db.query('UPDATE product set main_id=?, sub_id=?, name=?,price=?, stock=?, brand=?, supplier=?, image=?, sale_yn=?, sale_price=? where mer_id = ?',
            [main_id, sub_id, sntzedName, sntzedPrice,sntzedStock, sntzedBrand, sntzedSupplier, sntzedfile,sntzedSaleYn, sntzedSalePrice, post.merId], 
            (error, result)=>{
                if(error) {console.log(error)}
                res.redirect('/product/view')
                res.end()
            }
        )
    },

    delete_process : (req, res)=>{
        var merId = req.params.merId;
        db.query('DELETE FROM product WHERE mer_id = ?', 
            [merId], (error, results)=>{
                if(error) { console.log(error) }
                res.redirect('/product/view');
                res.end()
            }
        )

    }

}