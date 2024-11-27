const db = require('./db');
const util = require('./util');
const sanitize = require('sanitize-html');

module.exports = {
    home : (req, res)=>{
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'

        db.query(sql1+ sql2, (err, results)=>{
            if(err) {console.log(err)}
            db.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES where table_schema = 'webdb2024';`, (err2, metadata)=>{
                if(err2) {console.log(err2)}
                console.log(metadata[0].TABLE_NAME);
                var context = {
                    who: name, login: login, cls: cls,
                    body : 'tableManage.ejs',
                    boardtypes: results[0], category : results[1],
                    metadata: metadata
                }
        
                res.render('mainFrame', context, (error, html)=>{
                    if(error) {console.log(error)}
                    res.end(html)
                })
            })  
        })
    },

    view : (req, res) =>{
        var table = req.params.table;
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = 'SELECT * FROM boardtype;'
        var sql2 = 'SELECT * FROM code;'
        var sql3 = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS where table_schema = 'webdb2024' and table_name = '${table}';`

        db.query(sql1+sql2+sql3, (err, results)=>{
            if(err) {console.log(err)}
            db.query(`SELECT * FROM ${table}`, (err2, tabledata)=>{
                if(err2) {console.log(err2)}

                var context = {
                    who: name, login:login, cls:cls,
                    body:'tableView.ejs',
                    boardtypes : results[0], category : results[1],
                    table: results[2], tabledata : tabledata,
                    tablename : table
                }

                res.render('mainFrame', context, (error, html)=>{ 
                    if(error) {console.log(error)}
                    res.end(html);
                })
            })
        })
    }
}