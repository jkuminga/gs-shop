const sanitize = require('sanitize-html');
var db = require('./db');
var sanitizeHtml = require('sanitize-html');

function authIsOwner(req, res){
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    if(req.session.is_logined){
        name = req.session.name;
        login = true;
        cls = req.session.cls;
    }
    return {name, login, cls}
}


module.exports = {
    view : (req, res)=>{
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'
        var {name, login, cls} = authIsOwner(req, res)
        db.query(sql1+ sql2, (err, results)=>{
            if(err) {console.log(err) }
            var context={
                who : name,
                login : login,
                cls : cls,
                body: 'code.ejs',      
                boardtypes : results[0],
                codes : results[1],
                category : results[1]
            }
            
            req.app.render('mainFrame', context, (error, html)=>{
                if(error) {console.log(error)}
                res.end(html)
            })
        })
    },
    
    create : (req, res)=>{
        var sql1 = 'SELECT * FROM boardtype;';
        var sql2 = 'SELECT * FROM code;'
        db.query(sql1 + sql2, (err, results) => {
            if(err) { console.log(err) }
            var {name, login, cls} = authIsOwner(req, res)
            var option = 'create';

            var context = {
                who : name,
                login : login,
                cls : cls,
                body: 'codeCU.ejs',      
                option : option,
                boardtypes : results[0],
                category : results[1]
            }

            res.render('mainFrame', context, (error, html)=>{
                if(error) {console.log(error)}
                res.end(html)
            })
        })
    },

    create_process : (req, res) =>{
        var post = req.body;
        var sntzedmainid = sanitizeHtml(post.main_id);
        var sntzedmainname = sanitizeHtml(post.main_name);
        var sntzedsubid = sanitizeHtml(post.sub_id);
        var sntzedsubname = sanitizeHtml(post.sub_name);
        var sntzedstart = sanitizeHtml(post.start);
        var sntzedend = sanitizeHtml(post.end);

        db.query('INSERT INTO code (main_id, main_name, sub_id, sub_name, start, end) VALUES(?,?,?,?,?,?)',
            [sntzedmainid, sntzedmainname, sntzedsubid, sntzedsubname, sntzedstart, sntzedend], (err, results)=>{
                if(err) {console.log(err)}
                res.redirect('/code/view')
            })
    },

    update: (req, res)=>{
        var {name, login, cls} = authIsOwner(req, res);

        var main = req.params.main;
        var sub = req.params.sub;
        var start = req.params.start;
        var option = 'update';
        
        var sql1 = 'SELECT * FROM boardtype;';
        var sql2 = 'SELECT * FROM code;'

        db.query(sql1+sql2, (err2, results)=>[
            db.query('SELECT * FROM code where main_id = ? and sub_id=? and start =?',[main, sub, start], (err, code)=>{
                if(err) {console.log(err)}
    
                var context = {
                    who : name,
                    login : login,
                    cls : cls,
                    body : 'codeCU.ejs',
                    option : option,
                    code : code,
                    boardtypes : results[0],
                    category : results[1]
                }
    
                res.render('mainFrame', context, (error, html)=>{
                    if(error) {console.log(error)}
                    res.end(html)
                })
            })
        ]) 
    },

    update_process: (req, res)=>{
        var post = req.body;
        var sntzedmainname = sanitizeHtml(post.main_name);
        var sntzedsubname = sanitizeHtml(post.sub_name);
        var sntzedend = sanitizeHtml(post.end);

        db.query('UPDATE code set main_name = ?, sub_name = ?, end= ? where main_id=? and sub_id=?',
            [sntzedmainname, sntzedsubname, sntzedend, post.main_id, post.sub_id], (error, result)=>{
                if(error){ console.log(error) }
                res.redirect('/code/view')
            }
        )
    },

    delete_process : (req, res)=>{
        var mainid = req.params.main;
        var subid = req.params.sub;
        var start = req.params.start;
        
        db.query('DELETE FROM code where main_id= ? and sub_id=? and start= ?',
            [mainid, subid, start] , (error, result)=>{
                if(error){console.log(error)}
                res.redirect('/code/view');
            }
        )
    }
}
