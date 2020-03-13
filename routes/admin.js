const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dbconf = require('../config/database');
const passport = require('passport');
const auth = require('../config/passport');
const connection = mysql.createConnection(dbconf);
const config = require('../config');
const CryptoJS = require('crypto-js');
var $  = require('jquery');
var dt = require('datatables.net');
let{
    Editor,
    Field,
    Validate,
    Format,
    Options
} = require('datatables.net-editor-server');

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

// //TESTSETESTS
// router.get('/data', async function(req, res, next) {
//     let editor = new Editor( mysql, 'tU' )
//         .fields(
//             new Field( 'U_UserName' ),
//             new Field( 'U_Name' ),
//             new Field( 'U_Brand' )
//         );
 
//     await editor.process(req.body);
//     res.json( editor.data() );
// });


//TESTSETESTS
// router.get('/data', function(req, res, next) {

//     res.render('datatest');
// });

//TESTSETESTS
router.get('/data', function(req, res, next) {
    let query = `SELECT * FROM tU`; 
    connection.query(query,
      function(err, rows, fields) {
          if (err) throw err;
          res.render('datatest',{ data : rows});
          console.log("으라으ㅏ르ㅏㅇ",rows);
    });
});


router.post('/dataList', function(req, res, next) {
        let query = `SELECT * FROM tU`; 
        connection.query(query,
          function(err, rows, fields) {
              if (err) throw err;
              res.json({ data : rows});
              console.log("좀 돼라",rows);
          });
    

});













//데이터테이블 테스트
router.all('/business', async function(req, res) {
    let editor = new Editor( mysql, 'tB', 'B_ID')
     .fields(
            new Field( 'B_ID' ),
            new Field( 'B_Name' ),
            new Field( 'B_Tel' ),
            new Field( 'B_Fax' ),
            new Field( 'B_Email' ),
            new Field( 'B_Zip' ),
            new Field( 'B_Addr1' ),
            new Field( 'B_Addr2' ),
            new Field( 'B_cDt' ),
            new Field( 'B_uDt' )
        );
    await editor.process(req.body);
    res.json(editor.data());
    console.log("데데데ㅔ데데데데데데데ㅔ데데데데데데데데데ㅔ데데데데데덷데데데",editor.data())
});


// //데이터테이블 테스트
// router.all('/business', async function(req, res) {
//     if(req.user.U_isAdmin === 'n'){
//         res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
//     }else{
//         let query = `SELECT * FROM tB`; 
//         connection.query(query,
//           function(err, rows, fields) {
//               if (err) throw err;
//               result = JSON.stringify(rows);

//               res.send('admin_business', { data : result });
//               console.log("비지니스",rows);
//           });
//     }
// });



///관리자 부분
router.get('/index', auth.isLoggedIn, function(req, res, next) {
    console.log(req.app.get('views'))
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        res.render('admin_index');
    }
   
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////비지니스 테이블 

//비지니스 테이블
router.get('/business', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `SELECT * FROM tB`; 
        connection.query(query,
          function(err, rows, fields) {
              if (err) throw err;
              res.render('admin_business', { data : rows });
              console.log("비지니스",rows);
          });
    }
});


// //관리자 비지니스 테이블
// router.get('/business', auth.isLoggedIn, function(req, res, next) {  

//     if(req.user.U_isAdmin === 'n'){
//         res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
//     }else{

//             res.render('admin_business');
            
         
//     }    
// });


// //관리자 비지니스 테이블
// router.post('/business', auth.isLoggedIn, function(req, res, next) {  

//     if(req.user.U_isAdmin === 'n'){
//         res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
//     }else{
//         let query = `SELECT * FROM tB `; 
//         connection.query(query,
//           function(err, rows, fields) {
//             if (err) throw err;
//               let testB = [];
//               rows.map((data) => {
//                 testB.push(data);
//               });
              
              
//               console.log("데이터테이블 테스트 :: ", rows);
//               res.json('admin_business', { data : testB});
              
//           });
//     }    
// });



//관리자 비지니스 테이블 수정 페이지
router.get('/businessModify/:bId', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let bId = req.params.bId;
        let query = `SELECT * FROM tB where B_ID = :bId`; 
        connection.query(query,{bId},
          function(err, rows, fields) {
              if (err) throw err;
              res.render('admin_business_modify', { data : rows[0] });
              console.log("비지니스",rows);
          });
    }

});



//비지니스 테이블 수정하기
router.post('/business/modify', auth.isLoggedIn, function(req, res, next) {

    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
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
    }

});


//관리자 비지니스 테이블 삭제 페이지
router.post('/businessDelete', auth.isLoggedIn, function(req, res, next) {

    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let bId = req.body.bId;
        console.log("아이디 :", bId);
        let query = `delete FROM tB where B_ID = :bId`; 
        connection.query(query,{bId},
          function(err, rows, fields) {             
            if (err) throw err;
            //req.flash("success", "삭제 완료!");
            //console.log(msg);
            res.json({data : ""});
          });
    }

});

//비지니스 테이블 추가
router.get('/businessInsert', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        res.render('admin_business_insert');
    }

   
});

//비지니스 테이블 추가하기
router.post('/business/insert', auth.isLoggedIn, function(req, res, next) {

    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
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
    }

});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 카타입 테이블(버스정보 테이블 tCY)  @@@@@@@@@@@@@@

//CarType 테이블
router.get('/carType', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `SELECT * FROM tCY inner join tB on tCY.CY_B_ID = tB.B_ID`; 
        connection.query(query,
          function(err, rows, fields) {
              if (err) throw err;
              res.render('admin_carType', { data : rows });
              console.log("비지니스",rows);
          });
    }
});

//carType 운송사 목록
router.post('/carTypeBList', auth.isLoggedIn, function(req,res){
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select B_Name, B_ID from tB`;
        connection.query(query,
            function(err, rows){
                if(err) throw err;
                res.json({data : rows});
                console.log('운송사 목록 :', rows);
            })
    }


})

//CarType 테이블 수정 페이지
router.get('/carTypeModify/:cyId', auth.isLoggedIn, function(req, res, next) {

    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let cyId = req.params.cyId;

        console.log("아이디 :", cyId);
        let query = `SELECT * FROM tCY where CY_ID = :cyId`; 
        connection.query(query,{cyId},
          function(err, rows, fields) {
              if (err) throw err;
              res.render('admin_carType_modify', { data : rows[0] });
              console.log("비지니스",rows);
          });
    }


});



//CarType 테이블 수정하기
router.post('/carType/modify', auth.isLoggedIn, function(req, res, next) {
    
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let cyId = req.body.cyId;
        let cyTy = req.body.cyTy;
        let total = req.body.total;
        let service = req.body.service;
        let price = req.body.price;
        let cyBId = req.body.cyBId;
    
        console.log("아이디 :", cyId);
        let query = `update tCY set CY_Ty =:cyTy, CY_B_ID =:cyBId, CY_TotalPassenger =:total, CY_ServicePassenger =:service,
                            CY_SeatPrice =:price, CY_uDt = now()
                     where CY_ID =:cyId`; 
    
        connection.query(query,{cyId, cyTy, cyBId, total, service, price},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : "수정"});
          });
    }

});


//CarType 테이블 삭제 페이지
router.post('/carTypeDelete', auth.isLoggedIn, function(req, res, next) {

    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let cyId = req.body.cyId;
        console.log("아이디 :", cyId);
        let query = `delete FROM tCY where CY_ID = :cyId`; 
        connection.query(query,{cyId},
          function(err, rows, fields) {
             
              if (err) throw err;
              //req.flash("success", "삭제 완료!");
              //console.log(msg);
              res.json({data : ""});
              //res.redirect('/admin/business');
              //console.log("비지니스",rows);
          });
    }

});


//CarType 테이블 추가
router.get('/carTypeInsert', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select B_Name, B_ID from tB`; 

        connection.query(query,
          function(err, rows, fields) {
              if (err) throw err;
              res.render('admin_carType_insert',{data:rows});
          });
    
    }

   
});

//CarType 테이블 추가하기
router.post('/carType/insert', auth.isLoggedIn, function(req, res, next) {

    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
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
    }

});


/////////////@@@@@@@@@@@ 카 타임 테이블(버스운행정보 tCT) @@@@@@@@@@
 


//carTime 메인화면
router.get('/carTime', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select * from tCT inner join tCY on tCT.CT_CY_ID = tCY.CY_ID inner join tB on tCY.CY_B_ID = tB.B_ID`; 
        connection.query(query,
          function(err, rows, fields) {
              if (err) throw err;
              res.render("admin_carTime", { data : rows});
              console.log("user",rows);
          });
    }

});



//carTime 운송사 목록
router.post('/carTimeBList', auth.isLoggedIn, function(req, res) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `SELECT CY_ID, B_Name, CY_Ty FROM tCY inner join tB on tCY.CY_B_ID = tB.B_ID`; 
        connection.query(query,
          function(err, rows) {
              if (err) throw err;
              res.json({ data : rows});
              console.log("운송사 목록 :",rows);
          });
    }

});


//CarTime 테이블 수정 페이지
router.get('/carTimeModify/:ctId', auth.isLoggedIn, function(req, res, next) {

    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let ctId = req.params.ctId;

        console.log("아이디 :", ctId);
        let query = `SELECT * FROM tCT where CT_ID = :ctId`; 
        connection.query(query,{ctId},
          function(err, rows, fields) {
              if (err) throw err;
              res.render('admin_carTime_modify', { data : rows[0] });
              console.log("비지니스",rows);
          });
    }

});


//CarTime 테이블 수정하기
router.post('/carTime/modify', auth.isLoggedIn, function(req, res, next) {
    
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
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
    }

});


//CarTime 테이블 삭제 페이지
router.post('/carTimeDelete', auth.isLoggedIn, function(req, res, next) {
        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let ctId = req.body.ctId;
        console.log("아이디 :", ctId);
        let query = `delete FROM tCT where CT_ID = :ctId`; 
        connection.query(query,{ctId},
          function(err, rows, fields) {
             
              if (err) throw err;
              //req.flash("success", "삭제 완료!");
              //console.log(msg);
              res.json({data : ""});
              //res.redirect('/admin/business');
              //console.log("비지니스",rows);
          });
    }

});

//CarTime 테이블 추가
router.get('/carTimeInsert', auth.isLoggedIn, function(req, res, next) {
            
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select tCY.CY_ID as cyId, tCY.CY_B_ID as cyBId, tB.B_Name as bName, CY_Ty  from tCY inner join tB on tCY.CY_B_ID = tB.B_ID`; 
        connection.query(query,
          function(err, rows, fields) {        
              if (err) throw err;
              res.render('admin_carTime_insert',{data:rows});
    
          });
    }

});

//CarTime 테이블 추가하기
router.post('/carTime/insert', auth.isLoggedIn, function(req, res, next) {
                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let ctCyId = req.body.ctCyId;
        let dept = req.body.dept;
        let retun = req.body.retun;
        let lead= req.body.lead;
        let carNum = req.body.carNum;
        let drName = req.body.drName;
        let drPhone = req.body.drPhone;
        console.log("입력 ::", req.body)
        let query = `insert into tCT(CT_CY_ID, CT_DepartureTe, CT_ReturnTe, CT_LeadTe, CT_CarNum, CT_DriverName, CT_DriverPhone) 
                    values(:ctCyId, :dept, :retun, :lead, :carNum, :drName, :drPhone)`; 
    
        connection.query(query,{ctCyId, dept, retun, lead, carNum, drName, drPhone},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : "추가"});
          });
    }

});

/////////////////////////@@@@ 회원관리 @@@@@/////////////////////

//user 메인화면 페이징
router.get('/user', auth.isLoggedIn, function(req, res, next) {
                    
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `SELECT * FROM tU`; 
        connection.query(query,
          function(err, rows, fields) {
              if (err) throw err;
              res.render("admin_user", { data : rows});
              console.log("user",rows);
          });
    }

});
//user 테이블 수정 페이지
router.get('/userModify/:uId', auth.isLoggedIn, function(req, res, next) {
                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let uId = req.params.uId;

        console.log("아이디 :", uId);
        let query = `SELECT * FROM tU where U_ID = :uId`; 
        connection.query(query,{uId},
          function(err, rows, fields) {
              if (err) throw err;
              res.render('admin_user_modify', { data : rows[0] });
              console.log("user",rows);
          });
    }

});



//user 테이블 수정하기 @@@
router.post('/user/modify', auth.isLoggedIn, function(req, res, next) {
                            
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
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
    }

});


//user 테이블 삭제 페이지 
router.post('/userDelete', auth.isLoggedIn, function(req, res, next) {
                                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let uId = req.body.uId;
        console.log("아이디 :", uId);
        let query = `delete FROM tU where U_ID = :uId`; 
        connection.query(query,{uId},
          function(err, rows, fields) {
             
              if (err) throw err;
              //req.flash("success", "삭제 완료!");
              //console.log(msg);
              res.json({data : ""});
              //res.redirect('/admin/business');
              //console.log("비지니스",rows);
          });
    }

});


//user 테이블 추가
router.get('/userInsert', auth.isLoggedIn, function(req, res, next) {
                                    
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        res.render('admin_user_insert');
    }

});

//user 테이블 추가하기 @@@
router.post('/user/insert', auth.isLoggedIn, function(req, res, next) {
                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let userName = req.body.userName;
        let name = req.body.name;
        let email = req.body.email;
        let phone = req.body.phone;
        let brand = req.body.brand;
        let zip = req.body.postcode;
        let addr1 = req.body.address;
        let addr2 = req.body.detailAddress;
        let password = req.body.pw;
        let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString();
    
        let query = `insert into tU(U_UserName, U_Pw ,U_Name, U_Email, U_Phone, U_Brand, U_Zip, U_Addr1, U_Addr2) 
                    values(:userName, :hash_pw, :name, :email, :phone, :brand, :zip, :addr1, :addr2)`; 
    
        connection.query(query,{userName, hash_pw, name, email, phone, brand, zip, addr1, addr2},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : "추가"});
          });
    }

});

///////////////////@@@@결제관리@@@@///////////////////////

//payment 메인화면
router.get('/payment/', auth.isLoggedIn, function(req, res, next) {
                                            
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select
                        tPH.PH_ID as PH_ID, tPH.PH_U_ID as PH_U_ID, tU.U_UserName as U_UserName, tU.U_Phone as U_Phone, tU.U_Name as U_Name,
                        tPH.PH_PG_ID as PH_PG_ID, tPH.PH_PG_Name as PH_PG_Name, tPH.PH_Price as PH_Price, tPH.PH_OPrice as PH_Oprice,
                        tPH.PH_SPrice as PH_SPrice, tPH.PH_Type as PH_Type, tCR.CR_Cancel as CR_Cancel, tCR.CR_cDt as CR_cDt
                        from tPH inner join tU on tPH.PH_U_ID = tU.U_ID inner join tCR on tPH.PH_ID = tCR.CR_PH_ID
                    order by CR_cDt desc`;
        connection.query(query,
            function(err, rows, fields) {
                if (err) throw err;
                res.render("admin_payment", { data : rows});
            console.log("user",rows);
        });
    }

});

//Payment 결제취소 페이지
router.get('/cancelList/:phId/:phUId', auth.isLoggedIn, function(req, res, next) {
                                                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let phId = req.params.phId;
        let phUId = req.params.phUId;
        //console.log("아이디 :", ctId);
        let query = `select 
                        PH_ID, PH_U_ID, U_UserName, U_Name, B_Name, CT_DepartureTe, count(PH_Price) as cnt, sum(PH_Price) as PH_Price,PH_Type, CR_Cancel, CR_cDt
                     from tPH inner join tU on tPH.PH_U_ID = tU.U_ID inner join tCR on tPH.PH_ID = tCR.CR_PH_ID inner join tCT on tCT.CT_ID = tCR.CR_CT_ID inner join tCY on tCY.CY_ID = tCT.CT_CY_ID inner join tB on tB.B_ID = tCY.CY_B_ID
                     where tPH.PH_U_ID = :phUId and tPH.PH_ID = :phId`; 
        connection.query(query,{phUId, phId},
          function(err, rows, fields) {
             
              if (err) throw err;
              res.render('admin_payment_cancelList',{data : rows[0]});
    
          });
    }

});


//Payment 결제취소 페이지
router.post('/cancelPayment', auth.isLoggedIn, function(req, res, next) {
                                                    
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let phId = req.body.phId;
        let phUId = req.body.phUId;
        let query = `update tCR set CR_Cancel = 'Y', CR_CancelDt = now() where CR_U_ID = :phUId and CR_PH_ID = :phId`; 
        connection.query(query,{phUId, phId},
          function(err, rows, fields) {
             
              if (err) throw err;
              //req.flash("success", "삭제 완료!");
              //console.log(msg);
              
              res.json({data : "취소"});
          });
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

/////예약관리

//userRes 메인화면
router.get('/userRes', auth.isLoggedIn, function(req, res, next) {
                                                            
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select 
                        CR_ID, CR_CT_ID, CR_U_ID, U_UserName, U_Name, U_Phone, B_Name, CY_Ty ,CR_U_ID, CR_PH_ID, PH_Type, CR_SeatNum, PH_Price, CR_Cancel, CR_CancelDt, CR_cDt, CR_uDt
                    from tCR inner join tCT on tCR.CR_CT_ID = tCT.CT_ID inner join tU on tCR.CR_U_ID = tU.U_ID inner join tCY on tCT.CT_CY_ID = tCY.CY_ID
                        inner join tB on tCY.CY_B_ID = tB.B_ID inner join tPH on tCR.CR_PH_ID = tPH.PH_ID
                    order by CR_cDt desc`;
        connection.query(query,
            function(err, rows, fields) {
            if (err) throw err;
            res.render("admin_userRes", { data : rows});
            console.log("user",rows);
        });
    }

});

//입점선호도 조사

//storeIn 메인화면
router.get('/storeIn', auth.isLoggedIn, function(req, res, next) {
                                                                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select SI_ID, SI_Name, SI_Phone, SI_Brand, SI_Addr1, SI_Addr2, left(SI_Content,8) as SI_Content, SI_cDt, SI_Read from tSI`;
        connection.query(query,
            function(err, rows, fields) {
            if (err) throw err;
            res.render("admin_storeIn", { data : rows});
            console.log("user",rows);
        });
    }


});

//storeIn 메인화면 자세히 보기
router.get('/storeInDetail/:siID', auth.isLoggedIn, function(req, res, next) {
                                                                    
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let siID = req.params.siID;
        let query = `select SI_ID, SI_Name, SI_Phone, SI_Brand, SI_Addr1, SI_Addr2, SI_Content, SI_cDt from tSI where SI_ID = :siID`;
        connection.query(query,{siID},
        function(err, rows, fields) {
        if (err) throw err;
        res.render("admin_storeIn_detail", { data : rows[0]});
        console.log("user",rows);
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
        let query = `SELECT * FROM tsi where SI_Read = 'n'`;
        connection.query(query,
        function(err, rows, fields) {
        if (err) throw err;
        res.json( { data : rows});
        console.log("user",rows);
        });

    }

});
module.exports = router;
