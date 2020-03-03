const express = require('express');
const router = express.Router();
const auth = require('../config/passport');
const mysql = require('mysql');
const dbconf = require('../config/database');
const connection = mysql.createConnection(dbconf);
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

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


///관리자 부분
router.get('/index', function(req, res, next) {
    res.render('admin_index');
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////비지니스 테이블 


//관리자 비지니스 테이블
router.get('/business', function(req, res, next) {  
    let query = `SELECT * FROM tB `; 
    connection.query(query,
      function(err, rows, fields) {
          if (err) throw err;
          
          let smsg = req.flash("success");
          console.log("smsg : ", smsg);
          res.render('admin_business', { data : rows, message : smsg });
          console.log("비지니스",rows);
          
      });
      
});

//관리자 비지니스 테이블 수정 페이지
router.get('/businessModify/:bId', function(req, res, next) {
    let bId = req.params.bId;

    console.log("아이디 :", bId);
    let query = `SELECT * FROM tB where B_ID = :bId`; 
    connection.query(query,{bId},
      function(err, rows, fields) {
          if (err) throw err;
          res.render('admin_business_modify', { data : rows[0] });
          console.log("비지니스",rows);
      });
});



//비지니스 테이블 수정하기
router.post('/business/modify', function(req, res, next) {
    let bId = req.body.bId;
    let bName = req.body.bName;
    let bTel = req.body.bTel;
    let bFax = req.body.bFax;
    let bEmail = req.body.bEmail;
    let bZip = req.body.bZip;
    let bAddr1 = req.body.bAddr1;
    let bAddr2 = req.body.bAddr2;

    console.log("아이디 :", bId);
    let query = `update tB set B_Name =:bName, B_Tel =:bTel, B_Fax =:bFax, B_Email =:bEmail,
                        B_Zip =:bZip, B_Addr1 =:bAddr1, B_Addr2 =:bAddr2, B_uDt = now()
                 where B_ID =:bId`; 

    connection.query(query,{bId, bName, bTel, bFax, bEmail, bZip, bAddr1, bAddr2},
      function(err, rows, fields) {
          if (err) throw err;
          res.json({data : "수정"});
      });
});


//관리자 비지니스 테이블 삭제 페이지
router.get('/businessDelete/:bId', function(req, res, next) {
    let bId = req.params.bId;
    console.log("아이디 :", bId);
    let query = `delete FROM tB where B_ID = :bId`; 
    connection.query(query,{bId},
      function(err, rows, fields) {
         
          if (err) throw err;
          //req.flash("success", "삭제 완료!");
          //console.log(msg);
          res.send("<script type='text/javascript'>alert('삭제완료'); location.href='/admin/business';</script>");
          //res.redirect('/admin/business');
          //console.log("비지니스",rows);
      });
});

//비지니스 테이블 추가
router.get('/businessInsert', function(req, res, next) {
    res.render('admin_business_insert');
});

//비지니스 테이블 추가하기
router.post('/business/insert', function(req, res, next) {
    let bName = req.body.name;
    let bTel = req.body.tel;
    let bFax = req.body.fax;
    let bEmail = req.body.email;
    let bZip = req.body.zip;
    let bAddr1 = req.body.addr1;
    let bAddr2 = req.body.addr2;

    let query = `insert into tB(B_Name, B_Tel, B_Fax, B_Email, B_Zip, B_Addr1, B_Addr2) 
                values(:bName, :bTel, :bFax, :bEmail, :bZip, :bAddr1, :bAddr2)`; 

    connection.query(query,{ bName, bTel, bFax, bEmail, bZip, bAddr1, bAddr2},
      function(err, rows, fields) {
          if (err) throw err;
          res.json({data : "추가"});
      });
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 카타입 테이블(버스정보 테이블 tCY)  @@@@@@@@@@@@@@

//CarType 테이블
router.get('/carType', function(req, res, next) {

    let query = `SELECT * FROM tCY `; 
    connection.query(query,
      function(err, rows, fields) {
          if (err) throw err;
          res.render('admin_carType', { data : rows });
          console.log("비지니스",rows);
      });
});

//CarType 테이블 수정 페이지
router.get('/carTypeModify/:cyId', function(req, res, next) {
    let cyId = req.params.cyId;

    console.log("아이디 :", cyId);
    let query = `SELECT * FROM tCY where CY_ID = :cyId`; 
    connection.query(query,{cyId},
      function(err, rows, fields) {
          if (err) throw err;
          res.render('admin_carType_modify', { data : rows[0] });
          console.log("비지니스",rows);
      });
});



//CarType 테이블 수정하기
router.post('/carType/modify', function(req, res, next) {
    let cyId = req.body.cyId;
    let cyTy = req.body.cyTy;
    let total = req.body.total;
    let service = req.body.service;
    let price = req.body.price;


    console.log("아이디 :", cyId);
    let query = `update tCY set CY_Ty =:cyTy, CY_TotalPassenger =:total, CY_ServicePassenger =:service,
                        CY_SeatPrice =:price, CY_uDt = now()
                 where CY_ID =:cyId`; 

    connection.query(query,{cyId, cyTy, total, service, price},
      function(err, rows, fields) {
          if (err) throw err;
          res.json({data : "수정"});
      });
});


//CarType 테이블 삭제 페이지
router.get('/carTypeDelete/:cyId', function(req, res, next) {
    let cyId = req.params.cyId;
    console.log("아이디 :", cyId);
    let query = `delete FROM tCY where CY_ID = :cyId`; 
    connection.query(query,{cyId},
      function(err, rows, fields) {
         
          if (err) throw err;
          //req.flash("success", "삭제 완료!");
          //console.log(msg);
          res.send("<script type='text/javascript'>alert('삭제완료'); location.href='/admin/carType';</script>");
          //res.redirect('/admin/business');
          //console.log("비지니스",rows);
      });
});


//CarType 테이블 추가
router.get('/carTypeInsert', function(req, res, next) {
    res.render('admin_carType_insert');
});

//CarType 테이블 추가하기
router.post('/carType/insert', function(req, res, next) {
    let cyBId= req.body.cyBId;
    let cyTy = req.body.cyTy;
    let total = req.body.total;
    let service = req.body.service;
    let price = req.body.price;

    let query = `insert into tCY(CY_B_ID, CY_Ty, CY_TotalPassenger, CY_ServicePassenger, CY_SeatPrice) 
                values(:cyBId, :cyTy, :total, :service, :price)`; 

    connection.query(query,{ cyBId, cyTy, total, service, price},
      function(err, rows, fields) {
          if (err) throw err;
          res.json({data : "추가"});
      });
});


/////////////@@@@@@@@@@@ 카 타임 테이블(버스운행정보 tCT) @@@@@@@@@@
 

//CarTime 테이블
router.get('/carTime', function(req, res, next) {

    let query = `SELECT * FROM tCT `; 
    connection.query(query,
      function(err, rows, fields) {
          if (err) throw err;
          res.render('admin_carTime', { data : rows });
          console.log("carTime",rows);
      });
});

//CarTime 테이블 수정 페이지
router.get('/carTimeModify/:ctId', function(req, res, next) {
    let ctId = req.params.ctId;

    console.log("아이디 :", ctId);
    let query = `SELECT * FROM tCT where CT_ID = :ctId`; 
    connection.query(query,{ctId},
      function(err, rows, fields) {
          if (err) throw err;
          res.render('admin_carTime_modify', { data : rows[0] });
          console.log("비지니스",rows);
      });
});



//CarTime 테이블 수정하기
router.post('/carTime/modify', function(req, res, next) {
    let ctId = req.body.ctId;
    let ctCyId = req.body.ctCyId;
    let dept = req.body.dept;
    let retun = req.body.retun;
    let lead = req.body.lead;
    let carNum = req.body.carNum;
    let drName = req.body.drName;
    let drPhone = req.body.drPhone;

    console.log(ctId, ctCyId, dept, retun, lead, carNum, drName, drPhone);

    console.log("아이디 :", ctId);
    let query = `update tCT set CT_CY_ID =:ctCyId, CT_DepartureTe =:dept, CT_ReturnTe =:retun,
                                CT_LeadTe =:lead, CT_carNum =:carNum, CT_DriverName =:drName, CT_DriverPhone =:drPhone
                 where CT_ID =:ctId`; 

    connection.query(query,{ctCyId, dept, retun, lead, carNum, drName, drPhone, ctId},
      function(err, rows, fields) {
          if (err) throw err;
          res.json({data : "수정"});
      });
});


//CarTime 테이블 삭제 페이지
router.get('/carTimeDelete/:ctId', function(req, res, next) {
    let ctId = req.params.ctId;
    console.log("아이디 :", ctId);
    let query = `delete FROM tCT where CT_ID = :ctId`; 
    connection.query(query,{ctId},
      function(err, rows, fields) {
         
          if (err) throw err;
          //req.flash("success", "삭제 완료!");
          //console.log(msg);
          res.send("<script type='text/javascript'>alert('삭제완료'); location.href='/admin/carTime';</script>");
          //res.redirect('/admin/business');
          //console.log("비지니스",rows);
      });
});


//CarTime 테이블 추가
router.get('/carTimeInsert', function(req, res, next) {
    res.render('admin_carTime_insert');
});

//CarTime 테이블 추가하기
router.post('/carTime/insert', function(req, res, next) {
    let ctCyId = req.body.ctCyId;
    let dept = req.body.dept;
    let retun = req.body.retun;
    let lead= req.body.lead;
    let carNum = req.body.carNum;
    let drName = req.body.drName;
    let drPhone = req.body.drPhone;

    let query = `insert into tCT(CT_CY_ID, CT_DepartureTe, CT_ReturnTe, CT_LeadTe, CT_CarNum, CT_DriverName, CT_DriverPhone) 
                values(:ctCyId, :dept, :retun, :lead, :carNum, :drName, :drPhone)`; 

    connection.query(query,{ctCyId, dept, retun, lead, carNum, drName, drPhone},
      function(err, rows, fields) {
          if (err) throw err;
          res.json({data : "추가"});
      });
});

/////////////////////////@@@@ 회원관리 @@@@@/////////////////////

//user 메인화면
router.get('/user', function(req, res, next) {
    res.render('admin_user');

});

//user 메인화면 페이징
router.get('/user/:currentPage', function(req, res, next) {
    let query = `SELECT * FROM tU order by U_ID desc limit :beginRow, :rowPerPage`; 
    let currentPage = req.params.currentPage;
    console.log("커런트 페이지지ㅣ ::", currentPage);
    //페이지 내 보여줄 수
    let rowPerPage = 10;
    let beginRow = (currentPage-1)* rowPerPage;
    connection.query(query, {beginRow, rowPerPage},
      function(err, rows, fields) {
          if (err) throw err;
          res.render("admin_user", { data : rows});
          console.log("user",rows);
      });
});

//user 메인화면 카운트
router.post('/user/count', function(req, res, next) {
    let query = `SELECT count(*) as cnt FROM tU `; 
    connection.query(query,
      function(err, rows, fields) {
          if (err) throw err;
          let cnt = rows;
          res.send( { data : cnt});
          console.log("카운트는 :",cnt);
      });
});

//user 테이블 수정 페이지
router.get('/userModify/:uId', function(req, res, next) {
    let uId = req.params.uId;

    console.log("아이디 :", uId);
    let query = `SELECT * FROM tU where U_ID = :uId`; 
    connection.query(query,{uId},
      function(err, rows, fields) {
          if (err) throw err;
          res.render('admin_user_modify', { data : rows[0] });
          console.log("user",rows);
      });
});



//user 테이블 수정하기 @@@
router.post('/user/modify', function(req, res, next) {
    let uId = req.body.uId;
    let userName = req.body.userName;
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let brand = req.body.brand;
    let zip = req.body.zip;
    let addr1 = req.body.addr1;
    let addr2 = req.body.addr2;

  

    console.log("아이디 :", uId);
    let query = `update tU set U_UserName =:userName, U_Name =:name, U_Email =:email, U_Phone =:phone,
                        U_Brand =:brand, U_Zip =:zip, U_Addr1 =:addr1, U_Addr2 =:addr2, U_uDt = now()
                 where U_ID =:uId`; 

    connection.query(query,{uId, userName, phone, name, email, brand, zip, addr1, addr2},
      function(err, rows, fields) {
          if (err) throw err;
          res.json({data : "수정"});
      });
});


//user 테이블 삭제 페이지 
router.get('/userDelete/:uId', function(req, res, next) {
    let uId = req.params.uId;
    console.log("아이디 :", uId);
    let query = `delete FROM tU where U_ID = :uId`; 
    connection.query(query,{uId},
      function(err, rows, fields) {
         
          if (err) throw err;
          //req.flash("success", "삭제 완료!");
          //console.log(msg);
          res.send("<script type='text/javascript'>alert('삭제완료'); location.href='/admin/user/1';</script>");
          //res.redirect('/admin/business');
          //console.log("비지니스",rows);
      });
});


//user 테이블 추가
router.get('/userInsert', function(req, res, next) {
    res.render('admin_user_insert');
});

//user 테이블 추가하기 @@@
router.post('/user/insert', function(req, res, next) {
    let userName = req.body.userName;
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let brand = req.body.brand;
    let zip = req.body.postcode;
    let addr1 = req.body.address;
    let addr2 = req.body.detailAddress;
    let password = req.body.pw;
    let hash_pw = bcrypt.hashSync(password, 10, null);


    let query = `insert into tU(U_UserName, U_Pw ,U_Name, U_Email, U_Phone, U_Brand, U_Zip, U_Addr1, U_Addr2) 
                values(:userName, :hash_pw, :name, :email, :phone, :brand, :zip, :addr1, :addr2)`; 

    connection.query(query,{userName, hash_pw, name, email, phone, brand, zip, addr1, addr2},
      function(err, rows, fields) {
          if (err) throw err;
          res.json({data : "추가"});
      });
});


module.exports = router;