const db = require('./db');
const util = require('./util');
const sanitizer = require('sanitize-html');

module.exports = {
    purchase: (req ,res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var loginid = req.session.loginid;
        var sql1 = `SELECT * FROM boardtype;` //results[0]
        var sql2 = `SELECT * FROM code;` //results[1]
        var sql3 = `SELECT * FROM purchase INNER JOIN product ON purchase.mer_id = product.mer_id WHERE purchase.loginid = '${loginid}';`

        db.query(sql1+sql2, (err, results)=>{
            if(err) {console.log(err)}
            db.query(sql3, (err2, products)=>{
                if(err2){console.log(err2)}

                var context = {
                    who:name, login: login, cls:cls,
                    body: 'purchase.ejs',
                    boardtypes: results[0],
                    category : results[1],
                    products : products
                }
    
                res.render('mainFrame', context, (error, html)=>{
                    if(error) {console.log(error)}
                    res.end(html)
                })
            })
        })
    },

    purchasedetail : (req, res)=>{
        var merId = req.params.merId;
        var {name, login, cls} = util.authIsOwner(req, res);
        var loginid = req.session.loginid;
        var sql1 = `SELECT * FROM boardtype;` //results[0]
        var sql2 = `SELECT * FROM code;` //results[1]
        var sql3 = `SELECT * FROM product WHERE mer_id = ${merId};`

        db.query(sql1 + sql2+ sql3, (err, results)=>{
            if(err) {console.log(err)}

            var context = {
                who : name,
                login:login,
                cls: cls,
                body : 'purchaseDetail.ejs',
                boardtypes : results[0],
                category : results[1],
                product : results[2][0],
                loginid: loginid
            }
            
            res.render('mainFrame', context, (error, html)=>{
                if(error) {console.log(error)}
                res.end(html)
            })
        })
    },

    purchase_process: (req, res)=>{
        var post = req.body;
        var sntzedprice = sanitizer(parseInt(post.price));
        var sntzedqty = sanitizer(parseInt(post.qty));
        var total = parseInt(sntzedprice * sntzedqty)
        var point = total * 0.5
        var sntzedloginid = sanitizer(post.loginid)
        var sntzedmerId = sanitizer(post.mer_id);
        var Default = 'N';
        
        db.query(`INSERT INTO purchase (loginid, mer_id, date, price, point, qty, total, payYN, cancel, refund) VALUES (?,?, now(),?,?,?,?,?,?,?)`,
            [sntzedloginid, sntzedmerId, sntzedprice, point, sntzedqty, total, 'Y', Default, Default], (error, results)=>{
                if(error) {console.log(error)}
                res.redirect('/purchase')
                res.end()
            }
        )
        // loginid/mer_id/date/price/point/qty/total/payYn/cancel/refund/
    },

    cancel : (req, res)=>{
        var merId = req.params.merId;

        db.query(`UPDATE purchase SET cancel =? WHERE mer_id= ?`,["Y", merId], (error, results)=>{
            if(error) {console.log(error)}
            res.redirect('/purchase')
        })
    },

    cart_process : (req, res)=>{
        var post = req.body;
        var loginid = req.session.loginid;

        db.query('SELECT * FROM cart', (err, product)=>{
            if(err) {console.log(err)}
            var i = 0;
            while(i < product.length){
                if(product[i].mer_id == post.mer_id && product[i].loginid == loginid ){
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.end(`<script language=JavaScript type="text/javascript">alert("장바구니에 이미 있는 제품입니다.")
                            <!-
                            setTimeout("location.href='http://localhost:3000/detail/${post.mer_id}'", 1000)
                            //-->
                            </script>`)
                            break;
                }
                i++;
                if(i >=product.length){
                    db.query('INSERT INTO cart (loginid, mer_id, date) VALUES (?,?,now())',
                        [post.loginid, post.mer_id], (error, results)=>{
                            if(error) {console.log(error)}
                            res.redirect('/purchase/cart');
                            res.end()
                        })
                }
            }
        })
    },
    
    

    cart : (req, res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var loginid = req.session.loginid;
        var sql1 = `SELECT * FROM boardtype;` //results[0]
        var sql2 = `SELECT * FROM code;` //results[1]

        db.query(sql1+sql2, (err, results)=>{
            if(err) {console.log(err)}
            db.query(`SELECT * FROM cart c inner join product p on c.mer_id = p.mer_id WHERE c.loginid=?`,[loginid], (err2, product)=>{
                if(err2) {console.log(err2)}

                var context = {
                    who:name, login:login, cls:cls,
                    body: 'cart.ejs',
                    boardtypes : results[0],
                    category : results[1],
                    products : product,
                    loginid :loginid
                }
    
                res.render('mainFrame', context, (error, html)=>{
                    if(error) {console.log(error)}
                    res.end(html)
                })
            }) 
        })
    },

    cart_purchase_process : (req, res)=>{
        var post  = req.body;
        var sntzedqtys = post.qty //여러개 checked이면 배열
        var loginids = post.loginid; 
        var merIds = post.selectedproduct; //여러개 checked이면 배열

        if(!merIds){
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.end(`<script language=JavaScript type="text/javascript">alert("구매할 상품을 선택해 주세요")
                    <!-
                    setTimeout("location.href='http://localhost:3000/purchase/cart'", 1000)
                    //-->
                    </script>`);
        }
        else{
            if(merIds.length ==1 ){
                var loginid = loginids;
                var merId = merIds;
                var Default= 'N';
                var qty = sntzedqtys;

                db.query('SELECT* FROM product WHERE mer_id =?', [merId], (err, product)=>{
                    if(err) {console.log(err)}
                    var price = parseInt(product[0].price);
                    var total = (price * qty);
                    var point = (price * 0.05);
                    db.query('INSERT INTO purchase (loginid, mer_id, price, point, qty, total, payYN, cancel, refund, date) VALUES(?,?,?,?,?,?,?,?,?,now())',
                        [loginid, merId, price, point, qty, total, "Y", Default, Default],(error, result)=>{
                            if(error) {console.log(error)}
                        })
                    db.query('DELETE FROM cart where mer_id = ? and loginid=?', [merId, loginid],(error2, results2)=>{
                        if(error2) {console.log(error2)}
                    })
                })
            }
            else{
                merIds.forEach((merId, index)=>{
                    var qty = parseInt(sntzedqtys[index]);
                    var loginid = loginids[index];
                    var Default = 'N'
                    console.log(merId)

                    // checked 된 mer_id로 product에서 불러오기
                    db.query('SELECT * FROM product WHERE mer_id=?', [merId],(err, product)=>{
                        if(err){console.log(err)}
                        console.log(product)
                        // purchase에 넣기 위해 값 지정
                        var price = parseInt(product[0].price);
                        var total = (price * qty);
                        var point = (price * 0.05);
                        // purchase.db에 넣기
                        db.query('INSERT INTO purchase (loginid, mer_id, price, point, qty, total, payYN, cancel, refund, date) VALUES(?,?,?,?,?,?,?,?,?,now())',
                            [loginid, merId, price, point, qty, total, "Y", Default, Default], (error, results)=>{
                                if(error) {console.log(error)}
                                console.log(merId, qty)
                            })
                            
                        db.query('DELETE FROM cart WHERE mer_id= ? and loginid = ?', [merId, loginid], (error2, results2)=>{
                            if(error2) {console.log(error2)}
                        })
                    })
                })
            }
            res.redirect('/purchase')
            res.end()
        }        
    },

    cart_delete_process : (req, res)=>{
        var post = req.body;
        var loginids = post.loginid; //여러개 checked이면 배열
        var merIds = post.selectedproduct; //여러개 checked이면 배열
        
        if(!merIds){
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.end(`<script language=JavaScript type="text/javascript">alert("삭제할 상품을 선택해 주세요")
                    <!-
                    setTimeout("location.href='http://localhost:3000/purchase/cart'", 1000)
                    //-->
                    </script>`);
        }else{
            if(merIds.length == 1){
                db.query("DELETE FROM cart where mer_id=? and loginid=?",
                    [merIds, loginids],(error, results)=>{
                        if(error) {console.log(error)}
                        res.redirect('/purchase/cart');
                        res.end()
                    }
                )
            } else {
                merIds.forEach((merId, index)=>{
                    var loginid = loginids[index];

                    db.query('DELETE FROM cart where mer_id=? and loginid=?', [merId, loginid],(error2, results2)=>{
                        if(error2) {console.log(error2)}
                    })
                })
            res.redirect('/purchase/cart')
            res.end()
        }
        }   
    }
}
