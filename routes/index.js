const express = require('express');
const router = express.Router();
const passport = require('passport');
const mysql = require('mysql');
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
    } else {
        // 로그인시 ID, PW 가 틀렸을 경우 FlashMessage
        let fmsg = req.flash("error");
        let loginFailMsg = '';
        if( fmsg.length > 0){
            loginFailMsg = fmsg[0];
        }
        res.render('login', {sessionUser : req.user, loginFailMsg : loginFailMsg});
    }
});

router.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
});

router.get('/reservation', auth.isLoggedIn, function(req,res, next){
    res.render('reservation_01', {sessionUser : req.user} );
});
//마이페이지 첫화면
router.get('/mypage',  auth.isLoggedIn, function(req, res, next) {
    let sessionId = req.user.U_ID;
    let crCancel = "N";
    let query = `SELECT * FROM tCT 
                  INNER JOIN tCR ON tCT.CT_ID = tCR.CR_CT_ID WHERE tCR.CR_Cancel = :crCancel AND tCR.CR_U_ID = :sessionId`;
    connection.query(query, { sessionId, crCancel},
      function(err, rows, fields) {
          if (err) throw err;
          res.render('mypage', { sessionUser : req.user, title: '버스 예약시스템', data : rows });
          console.log(rows);
      });
  });

//마이페이지 장차예매 현황
router.post('/api/user/resList',  auth.isLoggedIn, (req, res, next) =>{
    let query = `select SI_cDt from tSI where SI_Name = :siName and SI_Phone = :siPhone `;
    
    console.log(req.body);

    connection.query(query, 
        {          
            siName : req.body.name, 
            siPhone : req.body.phone
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            // //console.log(findId);
            res.json( {  data : rows[0]});
            console.log("rows :",rows);
            
        });
        
});

//마이페이지 예매 및 결제내역
router.post('/api/user/resPay',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let query = `select 
                    count(cr_seatnum) as seat_cnt,
                    sum(cr_price) as total_price,
                    (select ct_carnum from tCT where tCT.ct_id = tCR.CR_CT_ID) as carnum,
                    (select CT_DepartureTe from tCT where tCT.ct_id = tCR.CR_CT_ID) as dept_te,
                    CR_cDt
                    from tCR
                    where cr_u_id=:sessionId
                    group by cr_ct_id;
                `;
    
    console.log(req.body);

    connection.query(query, 
        {          
            sessionId
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows :",rows);
            
        });
        
});

//마이페이지 예매취소 리스트
router.post('/api/user/payCancel', auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let seatNum = req.body['sendArray[]'];
   // let seatNum2 = req.body.sendJson;
    //console.log("num2 :", seatNum2);
    // for(var i in seatNum){
    //     seatNum[i] = JSON.stringify(seatNum[i]);
        
    // }
    console.log(seatNum);
    console.log("dddd :", sessionId);
    //console.log(seatNum);    
    let query = `
                select 
                CR_CT_ID,
                CR_cDt,
                (select CT_DepartureTe from tCT where tCT.CT_ID = tCR.CR_CT_ID) as dept_te,
                (select CT_CarNum from tCT where tCT.CT_ID= tCR.CR_CT_ID) as carnum,
                CR_cDt,
                CR_Price,
                CR_SeatNum
                from tCR
                where CR_U_ID= :sessionId and CR_SeatNum IN (:seatNum)
                group by CR_CT_ID, CR_SeatNum;
                `;
                console.log("좌석 :", seatNum);
    console.log("세션 :", sessionId);
    

    connection.query(query, 
        {          
            sessionId, seatNum
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows :",rows);
            
        });
        
});

//예매취소 
router.post('/api/user/cancelRes', auth.isLoggedIn, (req, res, next) =>{
    let query = `update tCR set CR_Cancel = :crCancel, CR_CancelDt = now() where CR_U_Id = :sessionId and CR_CT_ID IN (:ctId) and CR_SeatNum IN (:crSeatNum)`;

    let sessionId = req.user.U_ID;
    let crCancel = 'Y';
    let ctId = req.body['trVal[]'];
    let crSeatNum = req.body['tdVal[]'];
    
    console.log("ctId :", ctId);
    console.log("crSeatNum :", crSeatNum);

    connection.query(query, 
        {          
            sessionId, crCancel, ctId, crSeatNum
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            // //console.log(findId);
            res.json( {  data : "성공"});
            console.log("rows : ",rows);
            
        });
        
});


//마이페이지 취소 및 환불조회
router.post('/api/user/resCancelList', auth.isLoggedIn, (req, res, next) =>{
    let query = `   select 
                    CR_cDt,
                    (select CT_DepartureTe from tCT where tCT.ct_id = tCR.CR_CT_ID) as dept_te,
                    CR_CancelDt,
                    CR_Price
                    from tCR
                    where cr_u_id= :sessionId and CR_Cancel = :crCancel`;

    let sessionId = req.user.U_ID;
    let crCancel = 'Y';
    
    console.log(req.body);

    connection.query(query, 
        {          
            sessionId, crCancel
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows : ",rows);
            
        });
        
});
  

//마이페이지 본인확인 페이지
router.get('/modify', auth.isLoggedIn, function(req, res, next){
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

//입점혜택 페이지1
router.get('/benefit_1', function(req, res, next) {
    res.render('benefit_list01', { sessionUser : req.user });
});

//입점혜택 페이지4
router.get('/benefit_4', function(req, res, next) {
    res.render('benefit_list04', { sessionUser : req.user });
});

//테스트
router.get('/daytest', function(req, res, next) {
    res.render('daytest', { sessionUser : req.user });
});
module.exports = router;
