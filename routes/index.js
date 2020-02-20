const express = require('express');
const router = express.Router();
const passport = require('passport');
const mysql = require('mysql');
const fs = require('fs');
const pconf = require('../config/passport');
let dbconf = JSON.parse( fs.readFileSync('./config/database.json') );
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


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next){
    res.render('login');
});

router.get('/logout', function(req, res, next){
    req.logOut();
    res.redirect('/');
});

router.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureMessage: "fail message"
    })
);


router.get('/mypage', pconf.isAuthenticated, function(req, res, next) {

  let query = "SELECT u_name, u_email, u_phone, u_brand from tU where u_name = :name";
  connection.query(query, { name : "김동현"},
    function(err, rows, fields) {
        if (err) throw err;
        res.render('mypage', { title: '버스 예약시스템', data : rows[0] });
    });
});

router.get('/modify', function(req, res, next){
    res.render('modify_01', { title : '정보수정' });
});

router.get('/modify2', function(req, res, next){
    res.render('modify_02', { title : '정보수정' });
});

router.get('/reservation', (req, res) => {
    res.render('reservation_01');
});

router.post('/api/user/phone', (req, res, next) => {
  
    let query  = "update tU set u_phone = :newPhone where u_name = :name";
    console.log(req.body.phone);
    console.log(req.body);
    
    connection.query(query, 
    {
        newPhone : req.body.phone,
        name : "김동현"
    },
    function(err, rows, fields) {
        if (err) throw err;
        res.json({
            statusCode : 200
        });
    });

    res.json("test");
    // 주소 변경
    // 로그 추가
});

module.exports = router;
