var db = require('./db');
var util = require('./util');
const sanitize = require('sanitize-html');

module.exports = {
    upload: (req, res)=>{
        var context = {login :''};
        req.app.render('uploadtest', context, (err, html)=>{
            res.end(html);
        })
    },

    home : (req, res)=>{
        var {login, name, cls} = util.authIsOwner(req, res)
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM product;'
        var sql3 = 'SELECT * FROM code;'
        var status = 'home'; 

        db.query(sql1+ sql2+sql3, (error, results)=>{
            if(error) {console.log(error)}
            var context = {
                who: name,
                login :  login,
                body: 'product.ejs',
                cls : cls,
                boardtypes : results[0],
                products: results[1],
                status: status,
                category : results[2]
            }
            res.render('mainFrame', context, (err, html)=>{
                if(err) {console.log(err)}
                res.end(html)
            })
        })
    },

    categoryview : (req, res)=>{
        var categ = req.params.categ;
        var mainId = categ.substr(0,4);
        var subId = categ.substr(4,4);
        var {name, login, cls} = util.authIsOwner(req, res)
        var sql1 = `SELECT * FROM boardtype;` //results[0]
        var sql2 = `SELECT * FROM code;` //results[1]
        var status = 'categoryview'
        db.query(sql1+sql2,(err, results)=>{
            if(err) {console.log(err)}
            db.query('SELECT * FROM product where main_id=? and sub_id = ?',
                [mainId, subId], (err2, product)=>{
                    if(err2) {console.log(err2)}

                    var context = {
                        who: name,
                        login : login,
                        cls : cls,
                        body : 'categoryproduct.ejs',
                        category : results[1],
                        boardtypes : results[0],
                        products : product,
                        status : status,
                    }

                    res.render('mainFrame', context, (error, html)=>{
                        if(error) {console.log(error)}
                        res.end(html)
                    })
                }
            )
        })
    },

    search : (req, res)=>{
        var {name, login , cls} = util.authIsOwner(req, res);
        var post = req.body;
        var search = sanitize(post.search);
        var sql1 = `SELECT * FROM boardtype;` //results[0]
        var sql2 = `SELECT * FROM code;` //results[1]

        db.query(sql1+ sql2, (err, results)=>{
            if(err) { console.log(err) }
            db.query(`select * from product where name like '%${search}%' or brand like '%${search}%' or supplier like '%${search}%';`,
                (err2, product)=>{
                    if(err2) {console.log(err2)}
                    var context = {
                        who : name,
                        login: login,
                        cls: cls,
                        body: 'product.ejs',
                        status : 'search',
                        boardtypes : results[0],
                        category : results[1],
                        products : product
                    }

                    res.render('mainFrame', context, (error, html)=>{
                        if(error) {console.log(error)}
                        res.end(html)
                    })
                }
            )
        })
    },

    detail : (req, res)=>{
        var merId = req.params.merId;
        var loginid = req.session.loginid;
        var {name, login, cls} = util.authIsOwner(req, res)
        var sql1 = `SELECT * FROM boardtype;` //results[0]
        var sql2 = `SELECT * FROM code;` //results[1]
        var sql3 = `SELECT * FROM product WHERE mer_id = ${merId}`
        db.query(sql1+ sql2+ sql3, (err, results)=>{
            if(err) {console.log(err)}

            var context = {
                who : name,
                login : login,
                cls : cls,
                body : 'productDetail.ejs',
                boardtypes: results[0],
                category : results[1],
                product : results[2][0],
                loginid : loginid
            }
            
            res.render('mainFrame', context, (error, html)=>{
                if(error) {console.log(error)}
                res.end(html)
            })
        })
    },
    
    cartView : (req, res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = `SELECT * FROM boardtype;` //results[0]
        var sql2 = `SELECT * FROM code;` //results[1]

        db.query(sql1+sql2, (err, results)=>{
            if(err) {console.log(err)}
            db.query('SELECT c.*, p.name as mer_name, person.name as name FROM cart c inner join product p ON c.mer_id = p.mer_id inner join person ON c.loginid = person.loginid;',(err2, cart)=>{
                if(err2) {console.log(err2)}

                var context = {
                    who : name, login : login, cls: cls,
                    body : 'cartView.ejs',
                    boardtypes: results[0],
                    category: results[1],
                    cart : cart
                }

                res.render('mainFrame', context, (error, html)=>{
                    if(error) {console.log(error)}
                    res.end(html)
                })
            })
        })
    },
    
    cartupdate : (req, res)=>{
        var cartId = req.params.cartId;
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'
        var sql3 = 'SELECT * FROM person;'
        var sql4 = 'SELECT * FROM product;'

        db.query(sql1+sql2+sql3+sql4, (err, results)=>{
            if(err) {console.log(err)}
            db.query(`SELECT * FROM cart WHERE cart_id = ${cartId}`, (err2, cart)=>{
                if(err2) {console.log(err2)}
                console.log(cart)

                var context = {
                    who:name, login:login, cls:cls,
                    body: 'cartU.ejs',
                    boardtypes:results[0], category : results[1],
                    person : results[2], product : results[3],
                    cart : cart
                }

                res.render('mainFrame', context, (error, html)=>{
                    if(error) {console.log(error)}
                    res.end(html)
                })
            })
        })
    },

    cart_update_process : (req, res)=>{
        var post = req.body;

        var sntzedname = post.name;
        var sntzedmername = post.mer_name;

        db.query('UPDATE cart SET loginid = ?, mer_id=? WHERE cart_id=?',
            [sntzedname, sntzedmername, post.cart_id],(error, results)=>{
                if(error){console.log(error)}
                res.redirect('/cartview')
                res.end()
            })
    },

    cart_delete_process : (req, res)=>{
        var cartId = req.params.cartId;
        
        db.query(`DELETE FROM cart WHERE cart_id = ${cartId}`,(error, result)=>{
            if(error) {console.log(error)}
            res.redirect('/cartview')
            res.end()
        })
    },

    purchaseview : (req ,res)=>{
        var {name, login, cls} = util.authIsOwner(req, res)
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'

        db.query(sql1 + sql2, (err, results)=>{
            if(err) {console.log(err)}
            db.query('SELECT p.*, person.name as name, product.name as mer_name from purchase p INNER JOIN person ON p.loginid = person.loginid INNER JOIN product ON p.mer_id = product.mer_id;',(err2, purchase)=>{
                if(err2) {console.log(err2)}
                
                var context = {
                    who : name, login: login, cls: cls,
                    body : 'purchaseView.ejs',
                    boardtypes : results[0], category : results[1],
                    purchase: purchase
                }

                res.render('mainFrame', context, (error, html)=>{
                    if(error) {console.log(error)}
                    res.end(html);
                })
            })
        })
    },

    purchaseupdate: (req, res)=>{
        var purchaseId = req.params.purchaseId;
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'
        var sql3 = 'SELECT * FROM person;'
        var sql4 = 'SELECT * FROM product;'

        db.query(sql1 + sql2 + sql3 + sql4, (err, results)=>{
            if(err) {console.log(err)}
            db.query(`SELECT * FROM purchase where purchase_id = ${purchaseId}`, (err2, purchase)=>{
                if(err2) {console.log(err2)}
                
                var context = {
                    who : name, login: login, cls: cls,
                    body: 'purchaseU.ejs',
                    boardtypes : results[0], category : results[1], person : results[2], product: results[3],
                    purchase : purchase
                }

                res.render('mainFrame', context, (error, html)=>{
                    if(error) {console.log(error)}
                    res.end(html)
                })
            })
        })
    },

    purchase_update_process : (req ,res) =>{
        var post = req.body;

        var sntzedloginid = post.name;
        var sntzedmerid = post.mer_name;
        var sntzedprice = post.price;
        var sntzedpoint = post.point;
        var sntzedqty = post.qty;
        var sntzedtotal = post.total;
        var sntzedpayyn = post.payYN;
        var sntzedcancel = post.cancel;
        var sntzedrefund = post.refund;

        db.query('UPDATE purchase SET loginid=?, mer_id=?, price=?, point=?, qty=?,total=?,payYN=?,cancel=?,refund=? WHERE purchase_id = ?',
            [sntzedloginid, sntzedmerid, sntzedprice, sntzedpoint, sntzedqty, sntzedtotal, sntzedpayyn, sntzedcancel, sntzedrefund, post.purchase_id], (error, results)=>{
                if(error) {console.log(error)}
                res.redirect('/purchaseview')
                res.end()
            }
        )
    },

    purchase_delete_process : (req, res)=>{
        var purchaseId = req.params.purchaseId;

        db.query(`DELETE FROM purchase WHERE purchase_id = ${purchaseId}`, (error, result)=>{
            if(error) {console.log(error)}
            res.redirect('/purchaseview')
            res.end()
        })
    },

    analyse : (req, res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1= 'SELECT * FROM boardtype;'
        var sql2= 'SELECT * FROM code;'

        db.query(sql1 + sql2, (err, results)=>{
            if(err) {console.log(err)}
            db.query('select address,ROUND(( count(*) / ( select count(*) from person )) * 100, 2) as rate from person group by address;',
                (err2, percentage)=>{
                    if(err2) {console.log(err2)}

                    var context = {
                        who : name, cls: cls, login: login,
                        body : 'ceoAnal.ejs',
                        boardtypes : results[0], category : results[1],
                        percentage : percentage
                    }
                    
                    res.render('mainFrame', context, (error, html)=>{
                        if(error) {console.log(error)}
                        res.end(html)
                    })
                }
            )
        })
    }
}