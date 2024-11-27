const db = require('./db');
const sanitize = require('sanitize-html');
var util = require('./util');


module.exports={
    view : (req,res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM person;'
        var sql3 = 'SELECT * FROM code'
        
        db.query(sql1+sql2+sql3, (err, results)=>{
            if(err) { console.log(err) }
            
            var context = {
                who : name,
                login : login,
                cls : cls,
                boardtypes : results[0],    
                person : results[1],
                category : results[2],
                body : 'person.ejs'
            }

            res.render('mainFrame', context, (error, html)=>{
                if(error) {console.log(error)}
                res.end(html)
            })
        })

    },

    create : (req, res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;'
        // var sql2 = 'SELECT * FROM person;'
        var sql2 = 'SELECT * FROM code'

        db.query(sql1+sql2, (err, results)=>{
            if(err) {console.log(err)}
            var context ={
                who: name,
                login: login,
                cls : cls,
                boardtypes : results[0],
                category : results[1],
                body: 'personC2.ejs'
            }

            res.render('mainFrame', context, (error, html)=>{
                if(error) {console.log(error)}
                res.end(html)
            })
        })
    },

    create_process : (req, res)=>{
        var post = req.body;
        var sntzedId = sanitize(post.loginid);
        var sntzedpw = sanitize(post.password);
        var sntzedname = sanitize(post.name);
        var sntzedaddress = sanitize(post.address);
        var sntzedtel = sanitize(post.tel);
        var sntzedbirth = sanitize(post.birth);
        var sntzedclass = sanitize(post.class);
        var sntzedgrade = sanitize(post.grade);

        db.query('INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES(?,?,?,?,?,?,?,?)',
            [sntzedId, sntzedpw,sntzedname, sntzedaddress,sntzedtel,sntzedbirth,sntzedclass,sntzedgrade], (error, results)=>{
                if(error) {console.log(error)}
                res.redirect('/person/view')
                res.end()
            }
        )
    },

    update : (req, res)=>{
        var loginId = req.params.loginId;
        console.log(loginId)
        
        var {name, login, cls} = util.authIsOwner(req, res);

        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code'

        db.query(sql1+sql2, (err1, results)=>{
            if(err1) {console.log(err1)}
            db.query('SELECT * FROM person where loginid = ?',
                [loginId], (err2, person)=>{
                    if(err2) {console.log(err2)}
                    var context = {
                        who: name,
                        login : login,
                        cls: cls,
                        boardtypes: results[0],
                        category:results[1],
                        person : person,
                        body : 'personU2.ejs'
                    }
        
                    res.render('mainFrame', context, (error, html)=>{
                        if(error) { console.log(error) }
                        res.end(html)
                    })

                }
            )            
        })
    },

    update_process : (req, res)=>{
        var post = req.body;
        var sntzedpw = sanitize(post.password);
        var sntzedname = sanitize(post.name);
        var sntzedaddress = sanitize(post.address);
        var sntzedtel = sanitize(post.tel);
        var sntzedbirth = sanitize(post.birth);
        var sntzedclass = sanitize(post.class);
        var sntzedgrade = sanitize(post.grade);

        db.query('UPDATE person set password=?, name=?, address=?, tel=?, birth=?, class=?, grade=? where loginid=?',
            [sntzedpw, sntzedname, sntzedaddress, sntzedtel, sntzedbirth, sntzedclass, sntzedgrade, post.loginid], (error, results)=>{
                if(error) {console.log(error)}
                res.redirect('/person/view');
                res.end()
            })
    },

    delete_process : (req, res)=>{
        var loginId = req.params.loginId;
        
        db.query('DELETE FROM person WHERE loginid=?',
            [loginId], (err, results)=>{
                if(err) {console.log(err)}
                res.redirect('/person/view')
                res.end()
            }
        )
    }
}