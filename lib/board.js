const db = require('./db');
const sanitize = require('sanitize-html');
const util = require('./util');

module.exports= {
    typeview : (req ,res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;';
        var sql2 = 'SELECT * FROM code;'

        db.query(sql1 + sql2, (err, results)=>{
            if(err) {console.log(err)}
            var context = {
                who: name,
                login : login,
                cls: cls,
                body : 'boardtype.ejs',
                boardtypes : results[0],
                category : results[1]
            }

            res.render('mainFrame', context, (error, html)=>{
                if(error) {console.log(error)}
                res.end(html)
            })
        })
    },

    typecreate : (req, res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;';
        var sql2 = 'SELECT * FROM code;'

        db.query(sql1+sql2, (err, results)=>{
            if(err) {console.log(err)}

            var context = {
                who:name,
                login:login,
                cls:cls,
                boardtypes: results[0],
                category : results[1],
                body : 'boardtypeC.ejs'
            }

            res.render('mainFrame', context, (error, html)=>{
                if(error) { console.log(error) }
                res.end(html)
            })
        })
    },

    typecreate_process : (req, res)=>{
        var post = req.body;

        var sntzedtitle = sanitize(post.title)
        var sntzeddescription = sanitize(post.description)
        var sntzednumPerPage = sanitize(post.numPerPage)
        

        db.query('INSERT INTO boardtype (title, description, numPerPage, write_YN, re_YN) VALUES(?,?,?,?,?)',
            [sntzedtitle, sntzeddescription, sntzednumPerPage, post.write_YN, post.re_YN], (error, results)=>{
                if(error) {console.log(error)}
                res.redirect('/board/type/view')
                res.end()
            }
        )
    },

    typeupdate : (req, res)=>{
        var typeId = req.params.typeId;
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;';
        var sql2 = 'SELECT * FROM code;'

        db.query(sql1+sql2, (err, results)=>{
            if(err) {console.log(err)}
            db.query('SELECT * FROM boardtype WHERE type_id = ?',
                [typeId], (err2, boardtype)=>{
                    if(err2) {console.log(err2)}

                    var context={
                        who: name,
                        login:login,
                        cls:cls,
                        body: 'boardtypeU.ejs',
                        boardtypes: results[0],
                        boardtype :boardtype,
                        category : results[1]
                    }

                    res.render('mainFrame', context, (error, html)=>{
                        if(error) {console.log(error)}
                        res.end(html);
                    })
                }
            )
        })
    },

    typeupdate_process : (req, res)=>{
        var post = req.body;

        var sntzedtitle = sanitize(post.title)
        var sntzeddescription = sanitize(post.description)
        var sntzednumPerPage = sanitize(post.numPerPage)

        db.query('UPDATE boardtype set title=?, description=?, numPerPage=?, write_YN=?, re_YN=? WHERE type_id=?',
            [sntzedtitle, sntzeddescription, sntzednumPerPage, post.write_YN, post.re_YN, post.type_id], (error, results)=>{
                if(error) {console.log(error)}
                res.redirect('/board/type/view');
                res.end()
            }
        )
    },

    typedelete_process : (req, res)=>{
        var typeId = req.params.typeId;

        db.query('DELETE FROM boardtype WHERE type_id=?', [typeId], (error, results)=>{
            if(error) {console.log(error)}
            res.redirect('/board/type/view')
            res.end()
        })
    },

    view : (req, res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var sntzedTypeId = sanitize(req.params.typeId);
        var pNum = req.params.pNum;
        var sql1 = 'SELECT * FROM boardtype;';
        var sql2 = `SELECT * FROM boardtype WHERE type_id = ${sntzedTypeId};`
        var sql3 = `SELECT count(*) as total from board where type_id = ${sntzedTypeId};`
        var sql4 = 'SELECT * FROM code;'

        db.query(sql1+sql2+sql3+sql4, (err, results)=>{
            if(err) {console.log(err)}
            // 선택된 게시판의 페이지당 라인 수
            var numPerPage = results[1][0].numPerPage; 
            // 오프셋 : 선택된 페이지 -1 * 페이지당 라인수
            // 1페이지면 0부터 시작해서 라인 수만큼 가져옴
            var offs = (pNum-1) * numPerPage;
            var totalPages = Math.ceil(results[2][0].total / numPerPage);
            db.query(`select b.board_id as board_id, b.title as title, b.date as date, p.name as name from board b inner join person p on b.loginid = p.loginid where b.type_id=? and b.p_id=? ORDER BY date desc, board_id desc LIMIT ? OFFSET ?`,
                [sntzedTypeId,0,numPerPage,offs], (error, boards)=>{    
                    if(error) {console.log(error)}

                    var context = {
                        who: name,
                        login : login,
                        cls:cls,
                        body:'board.ejs',
                        boards : boards,
                        boardtypes: results[0],
                        selectedbt : results[1][0],
                        totalPages : totalPages,
                        pNum : pNum,
                        category : results[3]
                        
                    }

                    res.render('mainFrame', context, (error, html)=>{
                        if(error) {console.log(error)}
                        res.end(html)
                    })
                })
        })
    },

    create : (req, res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var loginid = req.session.loginid;
        var sntzedTypeId = sanitize(req.params.typeId);
        var sql1 = 'SELECT * FROM boardtype;';
        var sql2 = `SELECT * FROM boardtype WHERE type_id = ${sntzedTypeId};`
        var sql3 = 'SELECT * FROM code;'

        db.query(sql1 + sql2+ sql3, (err, results)=>{
            if(err) {console.log(err)}

            var context ={
                who: name,
                login : login,
                cls : cls,
                loginid : loginid,
                boardtypes : results[0],
                body : 'boardC.ejs',
                selectedbt : results[1][0],
                category : results[2],
            }

            res.render('mainFrame', context, (error, html)=>{
                if(error) {console.log(error)}
                res.end(html);
            })
        })
    },

    create_process : (req, res)=>{
        var post = req.body;
        // type_id(hidden)loginid (hidden)p_id (hidden)titlecontentpwdate
        var sntzedtitle = post.title;
        var sntzedcontent = post.content;
        var sntzedpw = post.password;

        db.query('INSERT INTO board (type_id, p_id, loginid, password, title, date, content) VALUES(?,?,?,?,?, now(),?)'
            ,[post.type_id, post.p_id, post.loginid, sntzedpw, sntzedtitle, sntzedcontent], (error, result)=>{
                if(error) {console.log(error)}
                res.redirect(`/board/view/${post.type_id}/1`)
                res.end()
            }
        )
    },

    detail: (req, res)=>{
        var boardId = req.params.boardId;
        var pNum = req.params.pNum;
        var {name, login, cls} = util.authIsOwner(req, res);
        var loginid = req.session.login_id;

        var sql1 = 'SELECT * FROM boardtype;';
        var sql2 = `SELECT board.*, person.name FROM board INNER JOIN person on board.loginid = person.loginid where board.board_id= ${boardId} and board.p_id=0;`
        var sql3 = 'SELECT * FROM code;'

        db.query(sql1+ sql2+ sql3, (err, results)=>{
            if(err) { console.log(err) };
            db.query(`SELECT * FROM boardtype where type_id=?`, [results[1][0].type_id], (err2, boardtype)=>{
                if(err2){console.log(err2)}
                console.log()

                var context = {
                    who:name,
                    login: login,
                    cls: cls,
                    body: 'boardR.ejs',
                    boardtypes : results[0],
                    selectedb : results[1],
                    loginid : loginid,
                    selectedbt : boardtype,
                    pNum : pNum,
                    category : results[2]
                }
                
                res.render('mainFrame', context, (error, html)=>{
                    if(error) {console.log(error)}
                    res.end(html)
                })
            })     
        })
    },

    update : (req, res)=>{
        var boardId = req.params.boardId;
        var typeId = req.params.typeId;
        var pNum = req.params.pNum;
        var {name, login, cls} = util.authIsOwner(req, res);
        var loginid = req.session.login_id;

        var sql1 = 'SELECT * FROM boardtype;';
        var sql2 = `SELECT board.*, person.name FROM board INNER JOIN person on board.loginid = person.loginid where board.board_id= ${boardId} and board.p_id=0;`
        var sql3 = `SELECT * FROM boardtype WHERE type_id = ${typeId};`
        var sql4 = 'SELECT * FROM code;'

        db.query(sql1 + sql2 + sql3 + sql4, (err, results)=>{
            if(err) { console.log(err) };
            
            var context = {
                who:name,
                login: login,
                cls: cls,
                body: 'boardU.ejs',
                boardtypes : results[0],
                selectedb : results[1],
                selectedbt : results[2],   
                loginid : loginid,                 
                pNum : pNum,
                category : results[3]
            }                
            
            res.render('mainFrame', context, (error, html)=>{
                if(error) {console.log(error)}
                res.end(html)                
            })
        })    
    },

    update_process : (req, res)=>{
        var post = req.body;

        var sntzedboardId = post.board_id;
        var sntzedtitle = post.title;
        var sntzedcontent = post.content;
        var sntzedpw = post.password;
        var sntzedtypeId = post.type_id;
        var sntzedoripw = post.originalpw;
        var sntzedpNum = post.pNum;

        if(sntzedpw == sntzedoripw){
            db.query('UPDATE board set title=?, content=?, date=now() WHERE board_id=?',
                [sntzedtitle, sntzedcontent, post.board_id], (error, result)=>{
                    if(error) {console.log(error)}
                    res.redirect(`/board/detail/${sntzedboardId}/${sntzedpNum}`)
                    res.end()
                }
            )
        }
        else{
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.end(`<script language=JavaScript type="text/javascript">alert("비밀번호가 일치하지 않습니다.")
                    <!-
                    setTimeout("location.href='http://localhost:3000/board/update/${sntzedboardId}/${sntzedtypeId}/${sntzedpNum}'", 1000)
                    //-->
                    </script>`)
        }
    },

    delete_process : (req ,res)=>{
        var boardId = req.params.boardId;
        var typeId = req.params.typeId;
        var pNum = req.params.pNum;

        db.query('DELETE FROM board WHERE board_id= ?',[boardId], (error, result)=>{
            if(error) {console.log(error)}
            res.redirect(`/board/view/${typeId}/${pNum}`)
            res.end()
        })
    }
}
