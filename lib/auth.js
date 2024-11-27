// <auth.js>
// 이름과 로그인 여부 정보, 권한(cls)를 출력

var db = require('./db');
var santizeHtml = require('sanitize-html');

function authIsOwner(req, res) {
    var name = 'Guest'; //로그인한 이름(기본은 Guest)
    var login = false; //로그인 여부
    var cls = 'NON' // 사용자 권한
    // 세션에서 로그인을 확인하면
    if(req.session.is_logined){
        name = req.session.name;
        login = true;
        cls= req.session.cls;
    }
    return {name, login, cls}
}

module.exports ={
    login : (req, res)=>{
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'
        var {name, login, cls} = authIsOwner(req, res);

        db.query(sql1+ sql2, (err, results)=>{
            var context ={
                who : name,
                login : login,
                body : 'login.ejs',
                cls : cls,
                boardtypes : results[0],
                categorys : results[1],
                category : results[1]
            };
            req.app.render('mainFrame', context, (err, html)=>{
                res.end(html);
            })
        })
    },

    login_process : (req, res)=>{
        var post = req.body;
        var sntzedLoginid = santizeHtml(post.loginid);
        var sntzedPassword = santizeHtml(post.password);

        // where은 req 로 받은 id와 pw와 같아야 하고, 레코드를 카운팅해서 num으로 줌
        // count(*)를 하면 where 조건을 만족하는 행의 개수를 반환함
        db.query('select count(*) as num from person where loginid = ? and password =?', 
            [sntzedLoginid, sntzedPassword], (err, results)=>{
            if(results[0].num === 1){ //num ==1 : 허가된 사용자라는 뜻(db에 사용자가 존재함)
                //사용자가 있으면 name, class, loginid, grade를 불러옴(address도 불러와도 됨)
                db.query('select name, class, loginid, grade from person where loginid=? and password = ? ', 
                    [sntzedLoginid, sntzedPassword], (err2, result)=>{
                    // 로그인한 사용자의 정보를 세션에 저장함
                    req.session.is_logined = true; // 로그인 상태 : true
                    req.session.loginid = result[0].loginid // 로그인한 아이디
                    req.session.name = result[0].name // 로그인한 이름
                    req.session.cls = result[0].class // 로그인한 아이디의 cls
                    req.session.grad = result[0].grade // 로그인한 아이디의 등급
                    res.redirect('/')
                })
            }
            // 만약 num != 1 이면(허가된 사용자가 아니면)
            else {
                req.session.is_logined = false;
                req.session.name = 'Guest';
                req.session.cls = 'NON';
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.end(`<script language=JavaScript type="text/javascript">alert("존재하지 않는 회원입니다.")
                        <!-
                        setTimeout("location.href='http://localhost:3000/auth/login'", 1000)
                        //-->
                        </script>`)
            }
        })
    },

    logout_process : (req, res)=>{
        req.session.destroy((err)=>{
            res.redirect('/');
        })  
    },

    register: (req,res)=>{
        var {name, login, cls} = authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'

        db.query(sql1+sql2, (err, results)=>{
            var context = {
                who : name, 
                login:login, 
                cls : cls, 
                body: 'personCU.ejs',
                boardtypes : results[0],
                category : results[1]
            }
            
            req.app.render('mainFrame', context, (error, html)=>{
                res.end(html)
            })  
        })
    },

    register_process: (req, res)=>{
        var post = req.body;
        var sntzedloginid = santizeHtml(post.loginid);
        var sntzedpw = santizeHtml(post.password);
        var sntzedname = santizeHtml(post.name);
        var sntzedaddress = santizeHtml(post.address);
        var sntzedtel = santizeHtml(post.tel);
        var sntzedbirth = santizeHtml(post.birth);
        var cls = 'CST';
        var grade = 'S';

        db.query('INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
            [sntzedloginid, sntzedpw, sntzedname, sntzedaddress, sntzedtel, sntzedbirth, cls, grade], (error, results)=>{
                if(error) {console.log(error)};
                res.redirect('/')
            })
    }
}