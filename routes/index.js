const express = require('express');
const router = express.Router();
const passport = require('passport');
const mysql = require('mysql');
const fs = require('fs');
const auth = require('../config/passport');
// let dbconf = JSON.parse( fs.readFileSync('./config/database.json') );
const connection = mysql.createConnection({
    "host"     : "nodejs-005.cafe24.com",
    "user"     : "yurimsys12",
    "password" : "qw12qw12(",
    "database" : "yurimsys12",
    "port"     : "3306",
    'dateStrings' : 'date'
});

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
    req.logOut();
    res.redirect('/');
});

<<<<<<< HEAD

//마이페이지 첫화면
router.get('/mypage', pconf.isAuthenticated, function(req, res, next) {
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
router.post('/api/user/resList', (req, res, next) =>{
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
        
=======
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
>>>>>>> 998bdaa000c32bc6d584fdbb222785e0da3deee5
});

//마이페이지 예매 및 결제내역
router.post('/api/user/resPay', (req, res, next) =>{
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
router.post('/api/user/payCancel', (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let seatNum = req.body['sendArray[]'].join(',');
   // let seatNum2 = req.body.sendJson;
    //console.log("num2 :", seatNum2);
    console.log(seatNum);
    
    //console.log(seatNum);    
    let query = `
                select 
                CR_cDt,
                (select CT_DepartureTe from tCT where tCT.ct_id = tCR.CR_CT_ID) as dept_te,
                (select ct_carnum from tCT where tCT.ct_id = tCR.CR_CT_ID) as carnum,
                CR_cDt,
                CR_Price
                from tCR
                where cr_u_id= :sessionId and CR_SeatNum IN(:seatNum)
                group by cr_ct_id
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
//마이페이지 취소 및 환불조회
router.post('/api/user/resCancel', (req, res, next) =>{
    let query = `   select 
                    CR_cDt,
                    (select CT_DepartureTe from tCT where tCT.ct_id = tCR.CR_CT_ID) as dept_te,
                    CR_CancelDt,
                    CR_Price
                    from tCR
                    where cr_u_id= :sessionId and CR_Cancel = :crCancel
                    group by cr_ct_id;`;

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

<<<<<<< HEAD

//회원가입 액션
router.post('/api/user/join', (req, res, next) =>{
    let query = `insert into tU (U_UserName, U_Pw, U_Name, U_Phone, U_Email, U_Brand, U_Zip, U_Addr1, U_Addr2) 
            values( :uUserName,  :uPw,  :uName,  :uPhone , :uEmail, :uBrand,  :uZip,  :uAddr1,  :uAddr2)`;
    //console.log(req.body);

    connection.query(query, 
        {
            uUserName : req.body.id,
            uPw : req.body.password,
            uName : req.body.name,
            uPhone : req.body.phone,
            uEmail : req.body.email,
            uBrand : req.body.brand,
            uZip : req.body.postcode,
            uAddr1 : req.body.address,
            uAddr2 : req.body.detailAddress           
        },
        function(err, rows, fields) {
            if (err) throw err;
            console.log(rows);
            res.json( { name : req.body.name, id : req.body.id });
        });
});

//회원가입 페이지 장차선호
router.post('/api/user/carPool', (req, res, next) =>{
    let query = `insert into tCP(CP_PreferDays, CP_DepartureTe, CP_ReturnTe) values(:preferDays, :departureTe, :returnTe) 
                 where CP_U_ID = :uUserName`;
    let preferDays = req.body.days;
    let departureTe = req.body.sel;
    let returnTe = req.body.sel2;
    let uUserName = req.body.id;
    console.log("@@@1 :",preferDays)
    console.log("@@@1 :",departureTe)
    console.log("@@@1 :",returnTe)
    console.log("@@@1 :",uUserName)
    connection.query(query, 
        {
            preferDays, departureTe, returnTe, uUserName                    
        },
        function(err, rows, fields) {
            if (err) throw err;           
            res.json( { data : "성공" });
        });
});

//아이디 중복확인
router.post('/api/user/overlap', (req, res, next) =>{
    let query = "select U_UserName from tU where U_UserName = :uUserName";
    
    console.log(req.body);

    connection.query(query, 
        {
            uUserName : req.body.id                      
        },
        function(err, rows, fields) {
            if (err) throw err;           
            res.json( {  data : rows[0] });
        });
        
});

//아이디 찾기
router.post('/api/user/findId', (req, res, next) =>{
    let query = "select U_UserName from tU where U_Name =:uName and U_Phone =:uPhone";
    
    console.log(req.body);

    connection.query(query, 
        {
            uName : req.body.name,
            uPhone : req.body.phone                     
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            res.json( {  data : rows[0]});
            //console.log(rows);
        });
        
});


//비밀번호 찾기
router.post('/api/user/findPw', (req, res, next) =>{
    let query = "select U_UserName from tU where U_UserName =:uId and U_Name =:uName";
    
    console.log(req.body);

    connection.query(query, 
        {
            uId : req.body.id, 
            uName : req.body.name
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            res.json( {  data : rows[0], name : req.body.name, id : req.body.id });
            //console.log(rows);
        });
        
});

//비밀번호 찾기 후 수정
router.post('/api/user/modifyPw', (req, res, next) =>{
    let query = "update tU set U_Pw = :uPw where U_UserName = :uUserName";
    
    console.log(req.body);

    connection.query(query, 
        {
            uUserName : req.body.id, 
            uPw : req.body.password
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            res.json( {  data : rows[0]});
            //console.log(rows);
        });
        
});

//입점신청 
router.post('/api/user/benefitApply', (req, res, next) =>{
    let query = `insert into tSI (SI_Name, SI_Phone, SI_Brand, SI_Addr1, SI_Content) 
        values( :siName, :siPhone, :siBrand, :siAddr, :siMemo)`;
    
    console.log(req.body);

    connection.query(query, 
        {          
            siName : req.body.name, 
            siPhone : req.body.phone,
            siBrand: req.body.brand,
            siAddr: req.body.address,
            siMemo: req.body.memo
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            res.json( {  data : rows[0]});
            //console.log(rows);
        });
        
});

//입점신청 조회
router.post('/api/user/lookUp', (req, res, next) =>{
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
            console.log("로우수로울우ㅜ",rows);
            
        });
        
});

//마이페이지 본인 비밀번호 확인  ** 세션
router.post('/api/user/confirm', pconf.isAuthenticated, (req, res, next) =>{1

    //console.log(req.body.pw);
    let uPw = req.body.pw
    let uId = req.user.U_UserName
    console.log(uPw);
    console.log("내 아이이디 :",req.user.U_UserName);
    let query = "select U_Pw from tU where U_UserName =:uId and U_Pw =:uPw";
    
    connection.query(query, 
        {          
            uId, uPw                   
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            
            res.json( {  data : rows[0]});
            console.log(rows);
        });
        
});


//마이페이지 정보 수정
router.post('/api/user/modifyInfo', pconf.isAuthenticated, (req, res, next) =>{
    

    // let query = `UPDATE tu SET U_Pw = :?, U_Phone = :?, U_Brand = :?,
    //             U_Zip = :?, U_Addr1 = :?, U_Addr2 = :? WHERE U_UserName =:UserName`;           

    let uUserName = req.user.U_UserName;
    let uPw = req.body.pw;
    let uPhone = req.body.phone;
    let uBrand = req.body.brand;
    let uZip = req.body.postcode;
    let uAddr1 = req.body.address;
    let uAddr2 = req.body.detailAddress;
    
    console.log(uUserName, uPw, uPw, uBrand, uZip, uAddr1, uAddr2);

    let query = `UPDATE tU SET U_Pw = :uPw, U_Phone = :uPhone, U_Brand = :uBrand,
                U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2 WHERE U_UserName =:uUserName`;
    connection.query(query, 
        {          
            uPw, uPhone, uBrand, uZip, uAddr1, uAddr2, uUserName
                              
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            
            res.json( {  data : rows[0]});
            console.log(rows);
        });
        
});

//회원탈퇴
router.post('/api/user/deleteUser', pconf.isAuthenticated, (req, res, next) =>{
    let query = `delete from tU where U_UserName = :uUserName`;   
    console.log(req.body);
    let uUserName = req.user.U_UserName;
    connection.query(query, 
        {          
            uUserName
                               
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            req.logOut();            
            res.json( {  data : "삭제"});
        });
        
});

=======
>>>>>>> 998bdaa000c32bc6d584fdbb222785e0da3deee5
module.exports = router;
