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
///관리자 부분
router.get('/adminIndex', function(req, res, next) {
    res.render('admin_index');
});


router.get('/adminTable', function(req, res, next) {
    res.render('admin_table');
});

router.get('/adminBusiness', function(req, res, next) {  
    let query = `SELECT * FROM tB `; //서비스 후 > now() 변경
    connection.query(query,
      function(err, rows, fields) {
          if (err) throw err;
          res.render('admin_business', { data : rows });
          console.log("비지니스",rows);
      });
});


router.get('/adminBusinessModify/:bId', function(req, res, next) {
    let reqId = req.param.bId;
    let reqMode = req.param.mode;
    console.log("아이디 :", reqId);
    console.log("변수 :", reqMode);
    // let query = `SELECT * FROM tB `; //서비스 후 > now() 변경
    // connection.query(query,
    //   function(err, rows, fields) {
    //       if (err) throw err;
    //       res.render('admin_business', { data : rows });
    //       console.log("비지니스",rows);
    //   });
});




//////관리자 끝나는 부분

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

router.get('/complate', auth.isLoggedIn, function(req, res, next){
    res.render('reservation_02', {sessionUser: req.user} );
});

//마이페이지 첫화면
router.get('/mypage',  auth.isLoggedIn, function(req, res, next) {
    let sessionId = req.user.U_ID;
    let crCancel = "N";
    let query = `select 
                        tCR.CR_CT_ID,
                        tCR.CR_cDt as payDay,
                        date_format(tCT.CT_DepartureTe,'%m.%d') as deptTe1,
                        date_format(tCT.CT_DepartureTe,'%y%y.%m.%m') as deptTe2,
                        tCT.CT_DepartureTe,
                        tB.B_Name as carName,
                        count(CR_SeatNum) as seatCnt
                    from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                        where tCR.CR_CT_ID = tCT.CT_ID AND tCR.CR_Cancel = :crCancel
                        and tCR.CR_U_ID =:sessionId
                    and tCT.CT_DepartureTe > now() 
                        group by tCR.CR_cDt
                    order by tCT.CT_DepartureTe desc
	`; //서비스 후 > now() 변경
    connection.query(query, { sessionId, crCancel},
      function(err, rows, fields) {
          if (err) throw err;
          res.render('mypage', { sessionUser : req.user, title: '버스 예약시스템', data : rows });
          console.log(rows);
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
router.get('/reservation2', (req, res) => {
    res.render('reservation_01-2', { sessionUser : req.user });
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

//결제완료
router.post('/complate', auth.isLoggedIn, (req, res) =>{
    
    let seatNums = 16,
        oPrice = 30000,
        sPrice = 30000;
    
    let query = `
        INSERT INTO tCR
            (CR_CT_ID, CR_U_ID, CR_SeatNum, CR_OPrice, CR_SPrice, CR_Price, CR_PMethod)
        VALUES
            (:ct_id, :u_id, :seatNum, :oPrice, :sPrice, :Price, '신용카드')
    `;
    
    connection.query(query,
        {
            ct_id   : 1,
            u_id    : req.user.U_ID,
            seatNum : seatNums,
            oPrice  : oPrice,
            sPrice  : sPrice,
            Price   : (oPrice - sPrice)
        },
        function(err, result) {
            if(err) throw err;
            
            res.render('reservation_02',{ 
                sessionUser : req.user,
                price : (oPrice - sPrice)
            });
        });
});

module.exports = router;
