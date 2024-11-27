const express = require('express');

var router = express.Router()

var author = require('../lib/auth');

//로그인
router.get('/login', (req, res)=>{
    author.login(req, res);
})

// 로그인 post
router.post('/login_process', (req, res)=>{
    author.login_process(req, res)
})
// 로그아웃
router.get('/logout_process',(req, res)=>{
    author.logout_process(req,res);
})

// 회원가입
router.get('/register', (req, res)=>{
    author.register(req, res);
})

//회원가입 post
router.post('/register_process', (req, res)=>{
    author.register_process(req, res);
})

module.exports = router