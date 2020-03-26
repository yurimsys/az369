const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dbconf = require('../config/database');
const passport = require('passport');
const auth = require('../config/passport');
const connection = mysql.createConnection(dbconf);
const config = require('../config');
const CryptoJS = require('crypto-js');
var async = require('async');
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

///관리자 부분
// router.get('/index', auth.isLoggedIn, function(req, res, next) {
router.get('/index', function(req, res, next) {
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
        res.render('admin_business');
    }
});


//비지니스 테이블
router.get('/business/List', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        //let query = `SELECT * FROM tB limit :now, :page`;
        let query = `SELECT * FROM tB limit 8000`; 
        //let page =  Number(req.query.length);
        //let now = Number(req.query.start);
        connection.query(query,
            function(err, rows, fields) {
                if (err) throw err;
                res.json({data : rows});
              console.log("비지니스",rows);
        });
        
    }
});

//관리자 비지니스 테이블 수정 페이지
router.post('/businessModify', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let bId = req.body.bId;
        let query = `SELECT * FROM tB where B_ID = :bId`; 
        connection.query(query,{bId},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({ data : rows[0] });
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

//business 테이블 검색
router.post('/business/search', auth.isLoggedIn, function(req, res, next) {
                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{

        let selectName = req.body.selectName;
        let selResult = req.body.selResult;
        let dept = req.body.dept;
        let end = req.body.end;
        let query = 'select * from tB where 1=1 '

        if(selResult !== "" && selResult !== undefined){
            query += ` and ${selectName} like '%${selResult}%'`
        }if(dept !== "" && dept !== undefined && end !== "" && end !== undefined){
            query += " and date_format(B_cDt,'%y%y-%m-%d') between date(:dept) AND date(:end)"
        }

        connection.query(query,{selectName, selResult, dept, end},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : rows});
              console.log(rows)
          });
    }
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 카타입 테이블(버스정보 테이블 tCY)  @@@@@@@@@@@@@@

//CarType 테이블
router.get('/carType', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        res.render('admin_carType');

    }
});

//CarType 데이터테이블
router.get('/carType/List', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `SELECT * FROM tCY inner join tB on tCY.CY_B_ID = tB.B_ID limit 8000`; 
        connection.query(query,
          function(err, rows, fields) {
              if (err) throw err;
              res.json({ data : rows });
          });
    }
});

//carType 운송사 목록
router.post('/carTypeBList', auth.isLoggedIn, function(req,res){
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select B_Name, B_ID from tB order by B_ID asc limit 200`;
        connection.query(query,
            function(err, rows){
                if(err) throw err;
                res.json({data : rows});
                console.log('운송사 목록 :', rows);
            })
    }


})

//CarType 테이블 수정 페이지
router.post('/carTypeModify', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let cyId = req.body.cyId;

        console.log("아이디 :", cyId);
        let query = `SELECT * FROM tCY where CY_ID = :cyId`; 
        connection.query(query,{cyId},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({ data : rows[0] });
              console.log("@@@@@@@@@@@@@@@@@@@@@@@@",rows);
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
              res.json({data : ""});

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

//CarType 테이블 검색
router.post('/carType/search', auth.isLoggedIn, function(req, res, next) {
                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{

        let selectName = req.body.selectName;
        let selResult = req.body.selResult;
        let dept = req.body.dept;
        let end = req.body.end;
        let query = 'SELECT * FROM tCY inner join tB on tCY.CY_B_ID = tB.B_ID where 1=1 '

        if(selResult !== "" && selResult !== undefined){
            query += ` and ${selectName} like '%${selResult}%'`
        }if(dept !== "" && dept !== undefined && end !== "" && end !== undefined){
            query += " and date_format(CY_cDt,'%y%y-%m-%d') between date(:dept) AND date(:end)"
        }

        connection.query(query,{selectName, selResult, dept, end},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : rows});
          });
    }

});

/////////////@@@@@@@@@@@ 카 타임 테이블(버스운행정보 tCT) @@@@@@@@@@

//carTime 좌석 리스트
router.post('/carTimeSeatList', auth.isLoggedIn, function(req, res) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select CR_SeatNum from tCR where CR_CT_ID = :ctId and CR_Cancel = 'n'`; 
        let ctId = req.body.ctId
        connection.query(query,{ctId},
          function(err, rows) {
              if (err) throw err;
              res.json({ data : rows});
              console.log("좌석 목록 :",rows);
          });
    }

});

 
//carTime 메인화면
router.get('/carTime', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        res.render("admin_carTime");
    }

});

//user 데이터테이블
router.get('/carTime/List', auth.isLoggedIn, function(req, res, next) {
                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select
                        CT_ID,
                        B_Name,
                        CY_Ty,
                        date_format(CT_DepartureTe,'%y%y-%m-%d %H:%i') as CT_DepartureTe,
                        date_format(CT_ReturnTe,'%y%y-%m-%d %H:%i') as CT_ReturnTe,
                        date_format(CT_LeadTe,'%H:%i') as CT_LeadTe,
                        CT_CarNum,
                        CT_DriverName,
                        CT_DriverPhone,
                        (CY_TotalPassenger-(select count(CR_CT_ID) from tCR where CR_Cancel = 'n' and CR_CT_ID = CT_ID)) as now,
                        CY_TotalPassenger as total
                        from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tB on tB.B_ID = tCY.CY_B_ID
                    group by CT_ID order by CT_DepartureTe desc limit 8000`; 
        connection.query(query,
            function(err, rows, fields) {
                if (err) throw err;
                res.json({ data : rows});
            }
        );
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
router.post('/carTimeModify', auth.isLoggedIn, function(req, res, next) {

    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let ctId = req.body.ctId;

        console.log("아이디 :", ctId);
        let query = `SELECT * FROM tCT where CT_ID = :ctId`; 
        connection.query(query,{ctId},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({ data : rows[0] });
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
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
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
router.post('/carTimeInsert', auth.isLoggedIn, function(req, res, next) {
            
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select tCY.CY_ID, tCY.CY_B_ID, tB.B_Name, CY_Ty from tCY inner join tB on tCY.CY_B_ID = tB.B_ID`; 
        connection.query(query,
          function(err, rows, fields) {        
              if (err) throw err;
              res.json({data:rows});
    
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

//carTime 테이블 검색
router.post('/carTime/search', auth.isLoggedIn, function(req, res, next) {
                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{

        let selectName = req.body.selectName;
        let selResult = req.body.selResult;
        let chkMem = req.body.chkMem;
        let dept = req.body.dept;
        let end = req.body.end;
        let query = `select
                        CT_ID,
                        B_Name,
                        CY_Ty,
                        date_format(CT_DepartureTe,'%y%y-%m-%d %H:%i') as CT_DepartureTe,
                        date_format(CT_ReturnTe,'%y%y-%m-%d %H:%i') as CT_ReturnTe,
                        date_format(CT_LeadTe,'%H:%i') as CT_LeadTe,
                        CT_CarNum,
                        CT_DriverName,
                        CT_DriverPhone,
                        (CY_TotalPassenger-(select count(CR_CT_ID) from tCR where CR_Cancel = 'n' and CR_CT_ID = CT_ID)) as now,
                        CY_TotalPassenger as total
                        from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tB on tB.B_ID = tCY.CY_B_ID
                    where 1=1 `;

        if(selResult !== "" && selResult !== undefined){
            query += ` and ${selectName} like '%${selResult}%'`
        }if(end !== "" && end !== undefined){
            query += " and date_format(CT_ReturnTe,'%y%y-%m-%d %H:%i') = :end"
        }if(dept !== "" && dept !== undefined){
            query += " and date_format(CT_DepartureTe,'%y%y-%m-%d %H:%i') = :dept"
        }
            query += "\n group by CT_ID order by CT_DepartureTe desc "
        connection.query(query,{selectName, selResult, chkMem, dept, end},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : rows});
          });
    }

});



/////////////////////////@@@@ 회원관리 @@@@@/////////////////////

//user 메인화면 페이징
router.get('/user', auth.isLoggedIn, function(req, res, next) {
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        res.render("admin_user");
    }
});


//user 데이터테이블
router.get('/user/List', auth.isLoggedIn, function(req, res, next) {
                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `SELECT * FROM tU limit 8000`; 
        connection.query(query,
            function(err, rows, fields) {
                if (err) throw err;
                res.json({ data : rows});
                console.log("user",rows);
            }
        );
    }
});  


//user 테이블 수정 페이지
router.post('/userModify', auth.isLoggedIn, function(req, res, next) {
                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let uId = req.body.uId;
        console.log("아이디 :", uId);
        let query = `SELECT * FROM tU where U_ID = :uId`; 
        connection.query(query,{uId},
            function(err, rows, fields) {
                if (err) throw err;
                res.json({ data : rows[0] });
                console.log("user",rows);
            }
        );
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
        let admin = req.body.admin
        let password = req.body.pw;
        let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString();
    
        let query = `insert into tU(U_UserName, U_Pw ,U_Name, U_Email, U_Phone, U_Brand, U_Zip, U_Addr1, U_Addr2, U_isAdmin) 
                    values(:userName, :hash_pw, :name, :email, :phone, :brand, :zip, :addr1, :addr2, :admin)`; 
    
        connection.query(query,{userName, hash_pw, name, email, phone, brand, zip, addr1, addr2, admin},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : "추가"});
          });
    }

});


//user 테이블 검색
router.post('/user/search', auth.isLoggedIn, function(req, res, next) {
                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{

        let selectName = req.body.selectName;
        let selResult = req.body.selResult;
        let chkMem = req.body.chkMem;
        let dept = req.body.dept;
        let end = req.body.end;
        //let query = ""
        let query = 'select * from tU where 1=1 '
        if(selResult !== "" && selResult !== undefined){
            query += ` and ${selectName} like '%${selResult}%'`
        }if(chkMem !== "" && chkMem !== undefined){
            query += " and U_isAdmin = :chkMem "
        }if(dept !== "" && dept !== undefined && end !== "" && end !== undefined){
            query += " and date_format(U_cDt,'%y%y-%m-%d') between date(:dept) AND date(:end)"
        }

        connection.query(query,{selectName, selResult, chkMem, dept, end},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : rows});
              console.log(rows)
          });
    }

});

///////////////////@@@@결제관리@@@@///////////////////////

//payment 메인화면
router.get('/payment/', auth.isLoggedIn, function(req, res, next) {
                                            
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        res.render("admin_payment");
    }
});

//payment 데이터테이블
router.get('/payment/List', auth.isLoggedIn, function(req, res, next) {
                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select
                        PH_ID, PH_U_ID, U_UserName, U_Name, U_Phone, PH_PG_ID, PH_PG_Name, PH_Price, PH_OPrice, PH_SPrice, PH_Type, CR_Cancel, CR_cDt, CR_CancelDt
                    from tPH inner join tU on PH_U_ID = U_ID inner join tCR on PH_ID = CR_PH_ID
                    group by PH_ID limit 8000`; 
        connection.query(query,
            function(err, rows, fields) {
                if (err) throw err;
                res.json({ data : rows});
            }
        );
    }
});  

//payment 검색
router.post('/payment/search', auth.isLoggedIn, function(req, res, next) {
                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{

        let selectName = req.body.selectName;
        let selResult = req.body.selResult;
        let chkRad = req.body.chkRad;
        let dept = req.body.dept;
        let end = req.body.end;
        let query = `select
                        PH_ID, PH_U_ID, U_UserName, U_Name, U_Phone, PH_PG_ID, PH_PG_Name, PH_Price, PH_OPrice, PH_SPrice, PH_Type, CR_Cancel, CR_cDt, CR_CancelDt
                    from tPH inner join tU on PH_U_ID = U_ID inner join tCR on PH_ID = CR_PH_ID
                    where 1=1
                    `

        if(selResult !== "" && selResult !== undefined){
            query += ` and ${selectName} like '%${selResult}%'`

        }if(chkRad == "y" && chkRad !== undefined && dept !== "" && dept !== undefined && end !== "" && end !== undefined){
            query += " and CR_Cancel = 'y' and date_format(CR_CancelDt,'%y%y-%m-%d') between date(:dept) AND date(:end)"
        }else if(chkRad !== "" && chkRad !== undefined && dept == "" && dept == undefined && end == "" && end == undefined){
            query += `and CR_Cancel = :chkRad `
        }

        if(chkRad == "n" && chkRad !== undefined && dept !== "" && dept !== undefined && end !== "" && end !== undefined){
            query += " and CR_Cancel = 'n' and date_format(CR_cDt,'%y%y-%m-%d') between date(:dept) AND date(:end)"
        }else if(chkRad !== "" && chkRad !== undefined && dept == "" && dept == undefined && end == "" && end == undefined){
            query += `and CR_Cancel = :chkRad `
        }
        if(chkRad !== "" && chkRad !== undefined){
            query += `and CR_Cancel = :chkRad `
        }
            query += '\n group by PH_ID limit 8000'

        connection.query(query,{selectName, selResult, chkRad, dept, end},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : rows});
              console.log(rows)
          });
    }
});


//Payment 결제취소 페이지
router.post('/cancelList', auth.isLoggedIn, function(req, res, next) {
                                                
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let phId = req.body.phId;
        //console.log("아이디 :", ctId);
        let query = `select 
                        PH_ID, PH_U_ID, U_UserName, U_Name, B_Name, CT_DepartureTe, count(PH_Price) as cnt, sum(PH_Price) as PH_Price, PH_Type, CR_Cancel, CR_cDt
                     from tPH inner join tU on tPH.PH_U_ID = tU.U_ID inner join tCR on tPH.PH_ID = tCR.CR_PH_ID inner join tCT on tCT.CT_ID = tCR.CR_CT_ID inner join tCY on tCY.CY_ID = tCT.CT_CY_ID inner join tB on tB.B_ID = tCY.CY_B_ID
                     where PH_ID = :phId`; 
        connection.query(query,{phId},
          function(err, rows, fields) {
             
              if (err) throw err;
              res.json({data : rows[0]});
    
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
                        tU.U_ID,
                        tU.U_UserName,
                        tU.U_Name,
                        tU.U_Phone,
                        tB.B_Name,
                        tCY.CY_Ty,
                        tPH.PH_Type,
                        tPH.PH_Price,
                        tCR.CR_Cancel,
                        tCR.CR_uDt,
                        (select group_concat(CR_SeatNum ,'번')) as CR_SeatNum,
                        tCR.CR_cDt
                    from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID inner join tU on tCR.CR_U_ID = tU.U_ID inner join tPH on tPH.PH_ID = tCR.CR_PH_ID
                        where tCR.CR_CT_ID =tCT.CT_ID AND tCR.CR_Cancel = 'n'
                    and tCT.CT_DepartureTe > now() 
                    group by tCR.CR_cDt
                    order by tCR.CR_cDt desc`;
        connection.query(query,
            function(err, rows, fields) {
            if (err) throw err;
            res.render("admin_userRes", { data : rows});
            console.log("user",rows);
        });
    }
});

// //userRes 메인화면
// router.get('/userRes', auth.isLoggedIn, function(req, res, next) {
                                                            
//     if(req.user.U_isAdmin === 'n'){
//         res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
//     }else{
//          res.render("admin_userRes");
//     }
// });


// //UserRes 데이터테이블
// router.get('/userRes/List', auth.isLoggedIn, function(req, res, next) {
//     if(req.user.U_isAdmin === 'n'){
//         res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
//     }else{
//     // let query = `select
//     //         tU.U_ID,
//     //         tU.U_UserName,
//     //         CR_SeatNum,
//     //         tU.U_Name,
//     //         tU.U_Phone,
//     //         tB.B_Name,
//     //         tCY.CY_Ty,
//     //         tPH.PH_Type,
//     //         tPH.PH_Price,
//     //         tCR.CR_Cancel,
//     //         tCR.CR_uDt,
//     //         tCR.CR_cDt
//     //     from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID inner join tU on tCR.CR_U_ID = tU.U_ID inner join tPH on tPH.PH_ID = tCR.CR_PH_ID
//     //         where tCR.CR_CT_ID =tCT.CT_ID
//     //     and tCT.CT_DepartureTe > now() 
        
//     //     order by tCR.CR_cDt desc limit 8000`; 
//         let query = `select
//                         tU.U_ID,
//                         (select group_concat(CR_SeatNum ,'번')) as CR_SeatNum,
//                         tU.U_UserName,
//                         tU.U_Name,
//                         tU.U_Phone,
//                         tB.B_Name,
//                         tCY.CY_Ty,
//                         tPH.PH_Type,
//                         tPH.PH_Price,
//                         tCR.CR_Cancel,
//                         tCR.CR_uDt,
//                         tCR.CR_cDt
//                     from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID inner join tU on tCR.CR_U_ID = tU.U_ID inner join tPH on tPH.PH_ID = tCR.CR_PH_ID
//                         where tCR.CR_CT_ID =tCT.CT_ID AND tCR.CR_Cancel = 'n'
//                     and tCT.CT_DepartureTe > now() 
//                     group by tCR.CR_cDt
//                     order by tCR.CR_cDt desc`; 
//         // let query = `select tcr.CR_cDt, tcr.CR_SeatNum 
//         // from tcr, tct where tcr.cr_ct_id = tct.ct_id limit 1000`;

//         connection.query(query,
//             function(err, rows, fields) {
//                 if (err) throw err;
//                 // let result = {};
//                 // rows.forEach(data => {
//                 //     if(result[data.CR_cDt] == undefined)
//                 //     result[data.CR_cDt] = [];
//                 //     result[data.CR_cDt].push(data.CR_SeatNum);
//                 // });
//                 // console.log("-------------------------");
//                 // console.log(result);
//                 // console.log("-------------------------");
//                 // console.log(rows);
//                 res.json({data : rows});
//         });
        
//     }
// });

//UserRes 좌석확인
router.post('/userResList', auth.isLoggedIn, function(req, res, next) {
                                                            
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{
        let query = `select CR_SeatNum from tCR where CR_U_ID = :uId and CR_cDt = :cDt`;
        let uId = req.body.uId;
        let cDt = req.body.cDt;
        connection.query(query,{uId, cDt},
            function(err, rows, fields) {
            if (err) throw err;
            res.json({ data : rows});
            console.log("user",rows);
        });
    }
});

//userRes 테이블 검색
router.post('/userRes/search', auth.isLoggedIn, function(req, res, next) {
                                        
    if(req.user.U_isAdmin === 'n'){
        res.send("<script type='text/javascript'>alert('접속권한이 없습니다.'); location.href='/';</script>");
    }else{

        let selectName = req.body.selectName;
        let selResult = req.body.selResult;
        let chkRad = req.body.chkRad;
        let dept = req.body.dept;
        let end = req.body.end;
        let query = `select
                        tU.U_ID,
                        tU.U_UserName,
                        (select group_concat(CR_SeatNum)) as CR_SeatNum,
                        tU.U_Name,
                        tU.U_Phone,
                        tB.B_Name,
                        tCY.CY_Ty,
                        tPH.PH_Type,
                        tPH.PH_Price,
                        tCR.CR_Cancel,
                        CR_uDt,
                        CR_cDt
                    from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID inner join tU on tCR.CR_U_ID = tU.U_ID inner join tPH on tPH.PH_ID = tCR.CR_PH_ID
                        where tCR.CR_CT_ID =tCT.CT_ID  and tCT.CT_DepartureTe > now() `

        if(selResult !== "" && selResult !== undefined){
            query += ` and ${selectName} like '%${selResult}%'`
        }if(chkRad !== "" && chkRad !== undefined){
            query += " and CR_Cancel = :chkRad "
        }if(dept !== "" && dept !== undefined && end !== "" && end !== undefined){
            query += " and date_format(CR_cDt,'%y%y-%m-%d') between date(:dept) AND date(:end)"
        }
            query += " \n group by tCR.CR_cDt order by tCR.CR_cDt desc"
        connection.query(query,{selectName, selResult, chkRad, dept, end},
          function(err, rows, fields) {
              if (err) throw err;
              res.json({data : rows});
              console.log(rows)
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
        let query = `select SI_ID, SI_Name, SI_Phone, SI_Brand, SI_Addr1, SI_Addr2, left(SI_Content,8) as SI_Content, SI_cDt, SI_Read from tSI`;
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
        let query = 'select * from tSI where 1=1 '

        if(selResult !== "" && selResult !== undefined){
            query += ` and ${selectName} like '%${selResult}%'`
        }if(dept !== "" && dept !== undefined && end !== "" && end !== undefined){
            query += " and date_format(SI_cDt,'%y%y-%m-%d') between date(:dept) AND date(:end)"
        }if(chkRad !== "" && chkRad !== undefined){
            query += `and SI_Read = :chkRad `
        }

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
