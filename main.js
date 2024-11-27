var express = require('express')
const app = express();
// 라우터 불러오기
var authRouter = require('./router/authRouter')
var rootRouter = require('./router/rootRouter')
var codeRouter = require('./router/codeRouter')
var productRouter = require('./router/productRouter')
var personRouter = require('./router/personRouter');
var boardRouter = require('./router/boardRouter');
var purchaseRouter = require('./router/purchaseRouter');
var tableRouter = require('./router/tableRouter');
//세션 저장
var session = require('express-session');
var MySqlStore = require('express-mysql-session')(session);
//bodyParser 설정
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

//db 옵션 설정
var options = {
    host : 'localhost',
    user : 'nodejs',
    password : 'nodejs',
    database : 'webdb2024'
};
// 세션 저장 db 설정
var sessionStore = new MySqlStore(options);

// 세션 사용
app.use(session({
    secret : 'keyboard cat',
    resave : false,
    saveUninitialized : true,
    store : sessionStore
}));
// 각 경로로 요청이 들어오면 각 프로그램이 실행됨
// main.js에서 각 url로 분류하기 위해서 사용
app.use('/', rootRouter);
app.use('/auth', authRouter);
app.use('/code', codeRouter);
app.use('/product', productRouter);
app.use('/person', personRouter);
app.use('/board', boardRouter);
app.use('/purchase', purchaseRouter);
app.use('/table', tableRouter);
// ejs engine 설정
app.set('views', './views');
app.set('view engine', 'ejs');


// 정적파일 폴더지정
app.use(express.static('public'));

app.get('/favicon.ico', (req,res)=> res.writeHead(404));

const port = 3000;
app.listen(port, ()=>{
    console.log('connected to 3000')
})

module.exports = app;