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


router.get('/opentest', function(req, res, next) {
    res.render('opentest');
});


router.get('/', function(req, res, next) {
    res.render('index', { sessionUser : req.user });
});


// Survey 이전버전
router.get('/a', function(req, res){
    res.render('az369_survey');
});

router.post('/a', function(req, res){
    
    console.log(req.body);


    let query = `
        INSERT INTO admin_survey
            (NAME, Phone, Addr, WT_Contact_Period, WT_Rantal_Fee_Min, WT_Rantal_Fee_Max, WT_Deposit_Min,
            WT_Deposit_Max, WT_Insurance_Type, CUR_Rental_Fee, CUR_Deposit, WT_Modify)
        VALUES
            (:NAME, :Phone, :Addr, :WT_Contact_Period, :WT_Rantal_Fee_Min, :WT_Rantal_Fee_Max, :WT_Deposit_Min,
            :WT_Deposit_Max, :WT_Insurance_Type, :CUR_Rental_Fee, :CUR_Deposit, :WT_Modify)`;

    connection.query(query, {
        NAME : req.body.name,
        Phone : req.body.phone ,
        Addr : req.body.addr ,
        WT_Contact_Period : req.body.wt_contact_period ,
        WT_Rantal_Fee_Min : req.body.wt_rental_fee_min ,
        WT_Rantal_Fee_Max : req.body.wt_rental_fee_max ,
        WT_Deposit_Min : req.body.wt_deposit_min ,
        WT_Deposit_Max : req.body.wt_deposit_max ,
        WT_Insurance_Type : req.body.wt_insurance_type ,
        CUR_Rental_Fee : req.body.cur_rental_fee ,
        CUR_Deposit : req.body.cur_deposit ,
        WT_Modify : req.body.wt_modify 
    }, function(err, result){
        if(err) throw err;
        res.render('az369_survey_send');
    });

});

// Survey 최근버전
router.get('/b', function(req, res){
    
    let ctrt = req.query.ctrt;
    
    if( ctrt == 'n') return res.render('az369_survey_02_N');
    if( ctrt == 'y') return res.render('az369_survey_02_Y');
    res.render('az369_survey_01');
});
router.post('/b', function(req, res){
    
    console.log(req.body);


    let query = `
        INSERT INTO admin_survey
            (NAME, Phone, Addr, WT_Contact_Period, WT_Rantal_Fee_Min, WT_Rantal_Fee_Max, WT_Deposit_Min,
            WT_Deposit_Max, WT_Insurance_Type, CUR_Rental_Fee, CUR_Deposit, WT_Modify, CUR_has_Contract)
        VALUES
            (:NAME, :Phone, :Addr, :WT_Contact_Period, :WT_Rantal_Fee_Min, :WT_Rantal_Fee_Max, :WT_Deposit_Min,
            :WT_Deposit_Max, :WT_Insurance_Type, :CUR_Rental_Fee, :CUR_Deposit, :WT_Modify, :CUR_has_Contract)`;

    connection.query(query, {
        NAME : req.body.name,
        Phone : req.body.phone ,
        Addr : req.body.addr ,
        WT_Contact_Period : req.body.wt_contact_period ,
        WT_Rantal_Fee_Min : req.body.wt_rental_fee_min ,
        WT_Rantal_Fee_Max : req.body.wt_rental_fee_max ,
        WT_Deposit_Min : req.body.wt_deposit_min ,
        WT_Deposit_Max : req.body.wt_deposit_max ,
        WT_Insurance_Type : req.body.wt_insurance_type ,
        CUR_Rental_Fee : req.body.cur_rental_fee ,
        CUR_Deposit : req.body.cur_deposit ,
        WT_Modify : req.body.wt_modify,
        CUR_has_Contract : req.body.cur_has_contract 
    }, function(err, result){
        if(err) throw err;
        res.render('az369_survey_03');
    });

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
    let query = `select	distinct date_format(CT_DepartureTe,'%H%i') as deptTe, date_format(CT_ReturnTe, '%H%i') as returnTe, 
                        date_format(CT_DepartureTe,'%H:%i') as deptTe2, date_format(CT_ReturnTe, '%H:%i') as returnTe2
                from tCT`;
    connection.query(query,
        function(err, rows, fields) {
            if (err) throw err;
            res.render('reservation_01', {sessionUser : req.user, data : rows} );
            console.log("rowrowrow :",rows);
    });  
});

router.get('/complate', auth.isLoggedIn, function(req, res, next){
    res.render('reservation_02', {sessionUser: req.user} );
});

router.get('/reservation2', auth.isLoggedIn, function(req, res, next){
    res.render('reservation_01-2', {sessionUser: req.user} );
});

//마이페이지 첫화면
router.get('/mypage',  auth.isLoggedIn, function(req, res, next) {
    let sessionId = req.user.U_ID;
    let crCancel = "N";
    let query = `select 
                    distinct tB.B_Name as carName,
                    date_format(tCT.CT_DepartureTe,'%m.%d') as deptTe1,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d') as deptTe2,
                    date_format(tCT.CT_DepartureTe,'%k:%i') as deptTe3,
                    date_format(tCT.CT_DepartureTe,'%y%y-%m-%d %k:%i') as deptTe,
                    tCT.CT_DepartureTe,
                    tCT.CT_CarNum as carNum,
                    tCR.CR_cDt as payDay,
                    (select group_concat(CR_SeatNum ,'번')) as seatNum
                from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    where tCR.CR_CT_ID =tCT.CT_ID AND tCR.CR_Cancel = :crCancel
                    and tCR.CR_U_ID = :sessionId
                and tCT.CT_DepartureTe > now() 
                group by tCR.CR_cDt
                order by tCT.CT_DepartureTe desc, payDay desc;

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

router.get('/modify2', auth.isLoggedIn, function(req, res, next){
    res.render('modify_02', { sessionUser : req.user });
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

//비디오
router.get('/video', function(req, res, next) {
    res.render('video', { sessionUser : req.user });
});

module.exports = router;
