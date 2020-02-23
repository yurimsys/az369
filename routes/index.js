const express = require('express');
const router = express.Router();
const passport = require('passport');
const mysql = require('mysql');
const fs = require('fs');
const auth = require('../config/passport');
const dbconf = require('../config/database');
const connection = mysql.createConnection(dbconf);

connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    }.bind(this));
};

router.get('/', function(req, res, next) {
    res.render('index', { sessionUser : req.user });
});

router.get('/login', function(req, res, next){
    if(req.user !== undefined){
        res.redirect('/');
    }
    res.render('login', {sessionUser : req.user});
});

router.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureMessage: "fail message"
    })
);

router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
});

router.get('/mypage', auth.isLoggedIn, function(req, res, next) {
  let sessionId = req.user.U_ID;
  let query = `select * from tct 
                inner join tcr on tct.CT_ID = tcr.CR_CT_ID where tcr.CR_U_ID = :sessionId`;
  connection.query(query, { sessionId},
    function(err, rows, fields) {
        if (err) throw err;
        res.render('mypage', { sessionUser : req.user, title: '버스 예약시스템', data : rows });
        console.log(rows);
    });
});

//마이페이지 본인확인 페이지
router.get('/modify', function(req, res, next){
    res.render('modify_01', { sessionUser : req.user });
});

router.get('/modify2', function(req, res, next){
    res.render('modify_02', { sessionUser : req.user });
});

router.get('/reservation', (req, res) => {
    res.render('reservation_01', { sessionUser : req.user });
});

//사업개요
router.get('/summary', (req, res, next) => {
    res.render('summary', { sessionUser : req.user })
});

//센트럴돔 소개
router.get('/ctd_info', (req, res, next) => {
    res.render('ctd_info', { sessionUser : req.user })
});

//위치 안내
router.get('/location', (req, res, next) => {
    res.render('location', { sessionUser : req.user })
});

//장차운행안내
router.get('/benefit', (req, res, next) => {
    res.render('benefit', { sessionUser : req.user })
});

//장차운행안내
router.get('/vehicle', (req, res, next) => {
    res.render('vehicle', { sessionUser : req.user })
});

//회원가입 동의 페이지
router.get('/join', (req, res, next) => {
    res.render('join_01', { sessionUser : req.user })
});

//회원가입 페이지
router.get('/join2', function(req, res, next) {
    res.render('join_02', { sessionUser : req.user });
});

//회원가입 완료페이지
router.get('/join3', function(req, res, next) {
    res.render('join_03', { sessionUser : req.user });
});

//아이디 찾기 1페이지
router.get('/findId', function(req, res, next) {
    res.render('find_id_01', { sessionUser : req.user });
  });

//아이디 찾기 완료 페이지
router.get('/findId2', function(req, res, next) {
    res.render('find_id_02', { sessionUser : req.user });
});

//비밀번호 찾기 페이지
router.get('/findPw', function(req, res, next) {
    res.render('find_pw_01', { sessionUser : req.user });
});

//비밀번호 찾은 후 수정 페이지
router.get('/findPw2', function(req, res, next) {
    res.render('find_pw_02', { sessionUser : req.user });
});

//비밀번호 찾은 후 수정 완료 페이지
router.get('/findPw3', function(req, res, next) {
    res.render('find_pw_03', { sessionUser : req.user });
});

//입점신청 페이지
router.get('/benefit_application', function(req, res, next) {
    res.render('benefit_application', { sessionUser : req.user });
});

module.exports = router;
