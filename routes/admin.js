const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mssql = require('mssql');
const dbconf = require('../config/database');
const passport = require('passport');
const auth = require('../config/passport');
const connection = mysql.createConnection(dbconf.mysql);
const conn_ms = mssql.connect(dbconf.mssql);
const config = require('../config');
const CryptoJS = require('crypto-js');

connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    }.bind(this));
};

connection.on('error', function(err) {
    console.log('------ on error!');
    console.log(err);
});


//사이니지
router.get('/signage_ad', function(req, res, next) {
    var pageSetting = {
        title: '광고관리',
        description: '센트럴돔 내 사이니지 광고를 관리하는 페이지 입니다.',
        layout: 'admin/templates/admin_layout'
    };
    res.render('admin/admin_signage_ad', pageSetting);
});

router.get('/signage_brand', function(req, res, next) {
    var pageSetting = {
        title: '매장관리',
        description: '센트럴돔 내 매장을 관리하는 페이지 입니다.',
        layout: 'admin/templates/admin_layout'
    };
    res.render('admin/admin_signage_brand', pageSetting);
});

//배차관리 페이지
router.get('/az369_vehicle', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        var pageSetting = {
            title: '배차 관리',
            description: '장차서비스 배차 관리페이지',
            layout: 'admin/templates/admin_layout'
        };
        res.render('admin/admin_az369_vehicle',pageSetting);
    }
});

//장차 예약 관리 페이지
router.get('/az369_reservation', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        var pageSetting = {
            title: '예약 관리',
            description: '장차서비스 예약 관리페이지',
            layout: 'admin/templates/admin_layout'
        };
        res.render('admin/admin_az369_reservation',pageSetting);
    }
});

//장차 차량 유형 관리 페이지
router.get('/az369_vehicle_type', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        var pageSetting = {
            title: '차량 타입 관리',
            description: '장차서비스 차량 타입 관리페이지',
            layout: 'admin/templates/admin_layout'
        };
        res.render('admin/admin_az369_vehicle_type',pageSetting);
    }
});

//장차 운송사 페이지
router.get('/az369_business', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        var pageSetting = {
            title: '운송사 관리',
            description: '장차서비스 운송사 관리페이지',
            layout: 'admin/templates/admin_layout'
        };
        res.render('admin/admin_az369_business',pageSetting);
    }
});

//장차 회원 관리 페이지
router.get('/az369_user', auth.isLoggedIn, function(req, res) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        var pageSetting = {
            title: '회원 관리',
            description: '장차서비스 회원 관리페이지',
            layout: 'admin/templates/admin_layout'
        };
        res.render('admin/admin_az369_user',pageSetting);
    }
});

//장차 결제 관리 페이지
router.get('/az369_payment', auth.isLoggedIn, function(req, res) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        var pageSetting = {
            title: '장차 결제 관리',
            description: '장차서비스 결제 관리페이지',
            layout: 'admin/templates/admin_layout'
        };
        res.render('admin/admin_az369_payment',pageSetting);
    }
});

//장차 유튜브 관리 페이지
router.get('/az369_video', auth.isLoggedIn, function(req, res) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        var pageSetting = {
            title: '장차 유튜브 관리',
            description: '장차서비스 유튜브 관리페이지',
            layout: 'admin/templates/admin_layout'
        };
        res.render('admin/admin_az369_video',pageSetting);
    }
});



//선호도 조사
//Preference 메인화면
router.get('/preference', auth.isLoggedIn, function(req, res, next) {
                                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select
                        (select count(CP_PreferDays) from tCP where CP_PreferDays like '%월%') as mon,
                        (select count(CP_PreferDays) from tCP where CP_PreferDays like '%화%') as tue,
                        (select count(CP_PreferDays) from tCP where CP_PreferDays like '%수%') as wed,
                        (select count(CP_PreferDays) from tCP where CP_PreferDays like '%목%') as thu,
                        (select count(CP_PreferDays) from tCP where CP_PreferDays like '%금%') as fri,
                        (select count(CP_DepartureTe) from tCP where date_format(CP_DepartureTe, '%k%i') = '2000') as depta,
                        (select count(CP_DepartureTe) from tCP where date_format(CP_DepartureTe, '%k%i') = '2100') as deptb,
                        (select count(CP_DepartureTe) from tCP where date_format(CP_DepartureTe, '%k%i') = '2200') as deptc,
                        (select count(CP_DepartureTe) from tCP where date_format(CP_DepartureTe, '%k%i') = '2300') as deptd,
                        (select count(CP_ReturnTe) from tCP where date_format(CP_ReturnTe, '%k%i') = '200') as retua,
                        (select count(CP_ReturnTe) from tCP where date_format(CP_ReturnTe, '%k%i') = '300') as retub,
                        (select count(CP_ReturnTe) from tCP where date_format(CP_ReturnTe, '%k%i') = '400') as retuc,
                        (select count(CP_ReturnTe) from tCP where date_format(CP_ReturnTe, '%k%i') = '500') as retud
                    from tCP limit 1`;
        connection.query(query,
            function(err, rows, fields) {
                if (err) throw err;
            res.render('admin_preference',{data:rows});
            console.log("list ::",rows);
        });
    }
});

//입점선호도 조사

//storeIn 메인화면
router.get('/storeIn', auth.isLoggedIn, function(req, res, next) {
                                                                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        res.render("admin_storeIn");
    }
});

//storeIn 데이터테이블
router.get('/storeIn/List', auth.isLoggedIn, function(req, res, next) {
                                                                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select 
                        SI_ID, 
                        SI_Name, 
                        SI_Phone, 
                        SI_Brand, 
                        SI_Addr1, 
                        SI_Addr2, 
                        left(SI_Content,8) as SI_Content, 
                        SI_cDt, 
                        SI_Read 
                    from tSI order by SI_cDt desc`;
        connection.query(query,
            function(err, rows, fields) {
            if (err) throw err;
            res.json({ data : rows});
        });
    }
});

//storeIn 검색
router.post('/storeIn/search', auth.isLoggedIn, function(req, res, next) {
                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{

        let selectName = req.body.selectName;
        let selResult = req.body.selResult;
        let chkRad = req.body.chkRad;
        let dept = req.body.dept;
        let end = req.body.end;
        let query = `select 
                        SI_ID, 
                        SI_Name, 
                        SI_Phone, 
                        SI_Brand, 
                        SI_Addr1, 
                        SI_Addr2, 
                        left(SI_Content,8) as SI_Content, 
                        SI_cDt, 
                        SI_Read 
                    from tSI where 1=1`;

        if(selResult !== "" && selResult !== undefined){
            query += ` and ${selectName} like '%${selResult}%'`
        }if(dept !== "" && dept !== undefined && end !== "" && end !== undefined){
            query += " and date_format(SI_cDt,'%y%y-%m-%d') between date(:dept) AND date(:end)"
        }if(chkRad !== "" && chkRad !== undefined){
            query += ` and SI_Read = :chkRad `
        }
            query += ` order by SI_cDt desc`
        connection.query(query,{selectName, selResult, chkRad, dept, end},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : rows});
              console.log(rows)
          });
    }
});


//storeIn 메인화면 자세히 보기
router.post('/storeInDetail', auth.isLoggedIn, function(req, res, next) {
                                                                    
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let siId = req.body.siId;
        let query = `select * from tSI where SI_ID = :siId`;
        connection.query(query,{siId},
        function(err, rows, fields) {
        if (err) throw err;
        res.json({ data : rows[0]});
        });
    }

});


//storeIn 문의사항 확인
router.post('/storeIn/check', auth.isLoggedIn, function(req, res, next) {
                                                                    
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let siId = req.body.siId;
        let query = `update tSI set SI_Read = 'y' where SI_ID = :siId`;
        connection.query(query,{siId},
        function(err, rows, fields) {
        if (err) throw err;
        res.json({data : ''})
        });
    }

});

//입점신청 알림 
router.post('/nowRow', auth.isLoggedIn, function(req, res, next) {
                                                                    
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `SELECT * FROM tSI where SI_Read = 'n'`;
        connection.query(query,
        function(err, rows, fields) {
        if (err) throw err;
        res.json( { data : rows});
        console.log("user",rows);
        });

    }

});


//의향서
//survey 메인화면
router.get('/survey', auth.isLoggedIn, function(req, res, next) {
                                                                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        res.render("admin_survey");
    }
});

//survey 데이터테이블
router.get('/survey/List', auth.isLoggedIn, function(req, res, next) {
                                                                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select * from tLSV order by LSV_cDt desc`;
        connection.query(query,
            function(err, rows, fields) {
            if (err) throw err;
            res.json({ data : rows});
        });
    }
});

//survey 상세보기
router.post('/survey/all', auth.isLoggedIn, function(req, res, next) {
                                                                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let surId = req.body.surId;
        let surPhone = req.body.surPhone;
        let query = `select * from tLSV where LSV_NAME = :surId and LSV_Phone = :surPhone order by LSV_cDt desc`;
        connection.query(query,{surId, surPhone},
            function(err, rows, fields) {
            if (err) throw err;
            res.json({ data : rows});
        });
    }
});

//survey 테이블 검색
router.post('/survey/search', auth.isLoggedIn, function(req, res, next) {
                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{

        let selectName = req.body.selectName;
        let selResult = req.body.selResult;
        let chkIns = req.body.chkIns;
        let chkMod = req.body.chkMod;
        let chkCon = req.body.chkCon;
        let dept = req.body.dept;
        let end = req.body.end;
        let query = 'SELECT * FROM tLSV where 1=1 '

        if(selResult !== "" && selResult !== undefined){
            query += ` and ${selectName} like '%${selResult}%'`
        }
        if(chkIns !== "" && chkIns !== undefined){
            query += ` and LSV_wInsuranceTy = :chkIns `
        }
        if(chkMod !== "" && chkMod !== undefined){
            query += ` and LSV_wModify = :chkMod`
        }
        if(chkCon !== "" && chkCon !== undefined){
            query += ` and LSV_Contract = :chkCon `
        }          
        if(dept !== "" && dept !== undefined && end !== "" && end !== undefined){
            query += " and date_format(LSV_cDt,'%y%y-%m-%d') between date(:dept) AND date(:end)"
        }
        connection.query(query,{selectName, selResult, chkIns, chkMod, chkCon, dept, end},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : rows});
          });
    }

});



module.exports = router;
