const express = require('express');
const router = express.Router();
const auth = require('../config/passport');
const mysql = require('mysql');
const dbconf = require('../config/database');
const connection = mysql.createConnection(dbconf);
const bcrypt = require('bcrypt');

const LocalStrategy = require('passport-local').Strategy;
const sms = require('../modules/sms');
const localAuth = require('../modules/auth');

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

router.post('/user/phone', (req, res, next) => {
  
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
 
//회원탈퇴
router.post('/user/deleteUser', auth.isLoggedIn, (req, res, done) =>{
    let query = `delete from tU where U_UserName = :uUserName`;    
    let uUserName = req.user.U_UserName;
    let uPw = req.body.pw;
    console.log("id :", uUserName);
    console.log("pw :", uPw);    
    if( !bcrypt.compareSync(uPw, req.user.U_Pw) ){
        res.json({data : "실패"});
    } else {
        connection.query(query,{uUserName},
            function(){
                req.logout();
                res.json( {  data : "성공"});
            })
    }        
        
});


//회원 아이디 중복확인
router.post('/user/checkId', (req, res, next) =>{
    let query = "select U_UserName from tU where U_UserName = :overId";
    let overId = req.body.id;
    console.log("내 아이디 :", overId);
    connection.query(query, 
        {
           overId                     
        },
        function(err, rows, fields) {
            if (err) throw err;           
            res.json( { data : rows });
            console.log("rows :", rows)
        });
        
});
//회원가입 액션
router.post('/user/join', (req, res, next) =>{
    let query = `insert into tU (U_UserName, U_Pw, U_Name, U_Phone, U_Email, U_Brand, U_Zip, U_Addr1, U_Addr2) 
            values( :uUserName,  :uPw,  :uName,  :uPhone , :uEmail, :uBrand,  :uZip,  :uAddr1,  :uAddr2)`;
    //console.log(req.body);

    let password = req.body.password;
    let hash_pw = bcrypt.hashSync(password, 10, null);
    
    connection.query(query, 
        {
            uUserName : req.body.id,
            uPw : hash_pw,
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
            console.log("회원가입 ::",rows);
            res.json( { name : req.body.name, id : req.body.id, data:rows });
        });
});

//회원가입 페이지 장차선호
router.post('/user/carPool', (req, res, next) =>{
    let query = `insert into tCP(CP_U_ID, CP_PreferDays, CP_DepartureTe, CP_ReturnTe) 
                values( :joinId, :preferDays, :departureTe, :returnTe)`;
    let preferDays = req.body['days[]'].join(',');
    let departureTe = req.body.sel;
    let returnTe = req.body.sel2;
    let joinId = req.body.joinId;
    console.log("날짜 :",preferDays)
    console.log("출발시간 :",departureTe)
    console.log("도착시간 :",returnTe)
    console.log("회원 아이디 :",joinId)
    connection.query(query, 
        {
            joinId, preferDays, departureTe, returnTe                
        },
        function(err, rows, fields) {
            if (err) throw err;           
            res.json( { data : "성공" });
        });
});


//아이디 찾기
router.post('/user/findId', (req, res, next) =>{
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
router.post('/user/findPw', (req, res, next) =>{
    let query = "select U_UserName, U_Name from tU where U_UserName =:uId and U_Phone =:uPhone";
    
    console.log(req.body);

    connection.query(query, 
        {
            uId : req.body.id, 
            uPhone : req.body.phone
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            res.json( {  data : rows[0],  id : req.body.id });
            console.log("비밀번호 찾기 ::", rows[0]);
        });
        
});

//비밀번호 찾기 후 수정
router.post('/user/modifyPw', (req, res, next) =>{
    let query = "update tU set U_Pw = :hash_pw where U_UserName = :uUserName";
    
    let password = req.body.password;
    let hash_pw = bcrypt.hashSync(password, 10, null);

    console.log(req.body);

    connection.query(query, 
        {
            hash_pw,
            uUserName : req.body.id
            
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            res.json( {  data : rows[0]});
            //console.log(rows);
        });
        
});

//입점신청 
router.post('/user/benefitApply', (req, res, next) =>{
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
router.post('/user/lookUp', (req, res, next) =>{
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
            console.log("rows",rows);
            
        });
        
});

 //마이페이지 본인 비밀번호 확인
router.post('/user/confirm', auth.isLoggedIn, (req, res, done) =>{

    //console.log(req.body.pw);
    let uPw = req.body.pw
    let uId = req.user.U_UserName
    console.log("비밀번호",uPw);
    console.log("내 아이이디 :",req.user.U_UserName);
    let query = "select U_Pw from tU where U_UserName =:uId and U_Pw =:uPw";
    
    connection.query(query, 
        {          
            uId, uPw                   
        },
        function(err, rows) {
            
            if (err) {return done(err);}
            if( !bcrypt.compareSync(uPw, req.user.U_Pw) ){
                console.log("확인");
                res.json({data: "실패"});
                return done( null, false, {message: "ID와 Password를 확인해주세요"} );
            } else {
                res.json( {  data : "성공"});
            }           
        });      
}); 


//마이페이지 정보 수정
router.post('/user/modifyInfo', auth.isLoggedIn, (req, res, next) =>{
    
    let uUserName = req.user.U_UserName;
    let uPhone = req.body.phone;
    let uBrand = req.body.brand;
    let uZip = req.body.postcode;
    let uAddr1 = req.body.address;
    let uAddr2 = req.body.detailAddress;
    let password = req.body.pw;
    let hash_pw = bcrypt.hashSync(password, 10, null);
    console.log("유저아이디 :", uUserName);
    console.log("password :", password);
    console.log("hash :", hash_pw);
    console.log("phone ::", uPhone);
    console.log("uZip :", uZip);
    console.log("uAddr1 :", uAddr1);
    console.log("uAddr2 ::", uAddr2);

    let query = `UPDATE tU SET U_Pw = :hash_pw, U_Phone = :uPhone, U_Brand = :uBrand,
                U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2, U_uDt = now() WHERE U_UserName =:uUserName`;

    let query2 = `UPDATE tU SET U_Phone = :uPhone, U_Brand = :uBrand,
                U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2, U_uDt = now() WHERE U_UserName =:uUserName`;

    let query3 = `UPDATE tU SET  U_Pw = :hash_pw, U_Brand = :uBrand,
                U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2, U_uDt = now() WHERE U_UserName =:uUserName`;

    let query4 = `UPDATE tU SET U_Phone = :uPhone, U_Brand = :uBrand,
                 U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2, U_uDt = now() WHERE U_UserName =:uUserName`;

        if(password === "" && uPhone === "" ){           
            connection.query(query2,{uBrand, uZip, uAddr1, uAddr2, uUserName},
                function(){                   
                    res.json( {  data : "성공"});
                })
                
        } else if(password != "" && uPhone != "" ) {
            connection.query(query,{hash_pw, uPhone, uBrand, uZip, uAddr1, uAddr2, uUserName},
                function(){                   
                    res.json( {  data : "성공"});
                })
        } else if(password != "" && uPhone === "" ) {
            connection.query(query3,{hash_pw, uBrand, uZip, uAddr1, uAddr2, uUserName},
                function(){                   
                    res.json( {  data : "성공"});
            })     
        } else if(password === "" && uPhone != "" ) {
            connection.query(query4,{uPhone, uBrand, uZip, uAddr1, uAddr2, uUserName},
                function(){                   
                    res.json( {  data : "성공"});
            })     
        }   
});


//회원탈퇴
router.post('/user/deleteUser', auth.isLoggedIn, (req, res, done) =>{
    let query = `delete from tU where U_UserName = :uUserName`;    
    let uUserName = req.user.U_UserName;
    let uPw = req.body.pw;
    console.log("id :", uUserName);
    console.log("pw :", uPw);    
    if( !bcrypt.compareSync(uPw, req.user.U_Pw) ){
        res.json({data : "실패"});
    } else {
        connection.query(query,{uUserName},
            function(){
                req.logout();
                res.json( {  data : "성공"});
            })
    }        
        
});

//회원 예약유무 
router.post('/user/delchoice',  auth.isLoggedIn, (req, res, next) =>{
   
    let query = `select * from tCR where CR_U_ID = :sessionId AND CR_Cancel = 'N' 
                AND (select CT_DepartureTe from tCT where tCT.CT_ID = tCR.CR_CT_ID) > now()`;
    let sessionId = req.user.U_ID;

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

//마이페이지 예매현황 클릭 후 예매취소 리스트
router.post('/user/payCancel', auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let seatNum = req.body['sendArray[]'];
    console.log(seatNum);
    console.log("dddd :", sessionId);
    //console.log(seatNum);    
    let query = `
                select 
                    tCR.CR_CT_ID as ctId,
                    tCR.CR_cDt as payDay,
                    date_format(tCT.CT_DepartureTe,'%m.%d') as deptTe1,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d') as deptTe2,
                    date_format(tCR.CR_cDt,'%y%y-%m-%d') as PayDay,
                    tCR.CR_cDt as cDt,
                    tCT.CT_DepartureTe as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    tPH.PH_ID as pId,
                    count(CR_SeatNum) as seatCnt
                from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                where tCR.CR_CT_ID = tCT.CT_ID AND tCR.CR_Cancel = 'N'
                    and tCR.CR_U_ID = :sessionId and tCR.CR_cDt IN ( :seatNum)
                    and tCT.CT_DepartureTe > now() 
                group by tCR.CR_cDt
                order by tCT.CT_DepartureTe desc	 
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
router.post('/user/cancelRes', auth.isLoggedIn, (req, res, next) =>{
    let query = `update tCR
                    inner join tCT on tCR.CR_CT_ID = tCT.CT_ID
                    set CR_Cancel = :crCancel, CR_CancelDt = now()
                    where CR_U_Id = :sessionId and CR_PH_ID IN (:crPId) and
                    CR_CT_ID IN (:crCtId) and tCT.CT_DepartureTe > date_add(now(),interval +4 day);`;
    //pID  cr_cdt
    let sessionId = req.user.U_ID;
    let crCancel = 'Y';
    let crPId = req.body['trVal[]'];
    let crCtId = req.body['tdVal[]'];
    
    console.log("pId@@@@@@@@ :", crPId);
    console.log("cDt@@@@@@@@ :", crCtId);

    connection.query(query, 
        {          
            crCancel, sessionId, crPId, crCtId
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            // //console.log(findId);
            res.json( {  data : rows.affectedRows});
            console.log("rows : ",rows.affectedRows);
            
        });
        
});

//마이페이지 예매 및 결제내역
router.post('/user/resPay',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let query = `select 
                    date_format(tCR.CR_cDt,'%y%y-%m-%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y-%m-%d %k:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    tCR.CR_cDt as no	
                from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    where tCR.CR_CT_ID = tCT.CT_ID
                    and tCR.CR_U_ID = :sessionId
                    group by tCR.CR_cDt
                order by no desc
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

//마이페이지 예매 및 결제내역 날짜 조회
router.post('/user/resPayBetween',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let deptDay = req.body.deptDay;
    let endDay = req.body.endDay;
    let query = `select 
                    date_format(tCR.CR_cDt,'%y%y-%m-%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y-%m-%d %k:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_cDt as crCdt,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID,
                    tCR.CR_cDt as no	
                from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    where tCR.CR_CT_ID = tCT.CT_ID
                    and tCR.CR_U_ID = :sessionId and tCR.CR_cDt between date(:deptDay) AND date(:endDay)+1
                    group by tCR.CR_cDt
                order by no desc
             `;
    
    console.log(req.body);

    connection.query(query, 
        {          
            sessionId, deptDay, endDay
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows :",rows);
            
        });
        
});

//마이페이지 예매 및 결제내역 모바일
router.post('/user/resPayMo',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let query = `select 
                    date_format(tCR.CR_cDt,'%y%y-%m-%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y-%m-%d %k:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_cDt as crCdt,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID,
                    tCR.CR_cDt as no	
                from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    where tCR.CR_CT_ID = tCT.CT_ID
                    and tCR.CR_U_ID = :sessionId
                    group by tCR.CR_cDt
                order by no desc
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

//마이페이지 예매 및 결제내역 상세보기 모바일
router.post('/user/resPayDetailMo',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let moCtId = req.body.ctId;
    let moPhId = req.body.phId;
    let query = `select 
                    date_format(tCR.CR_cDt,'%y%y-%m-%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y-%m-%d %k:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_cDt as crCdt,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID
                from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    where tCR.CR_CT_ID = tCT.CT_ID and tCR.CR_CT_ID = :moCtId and tCR.CR_PH_ID = :moPhId
                    and tCR.CR_U_ID = :sessionId
                    group by tCR.CR_cDt
                order by PayDay desc
             `;
    
    console.log("넘겨받은 ct :", moCtId);
    console.log("넘겨받은 ph :", moPhId);

    connection.query(query, 
        {          
            sessionId, moCtId, moPhId
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows :",rows);
            
        });
        
});


//마이페이지 취소 및 환불조회
router.post('/user/resCancelList', auth.isLoggedIn, (req, res, next) =>{
    let query = `   select 
                        date_format(tCR.CR_cDt,'%y%y-%m-%d') as PayDay,
                        date_format(tCT.CT_DepartureTe,'%y%y-%m-%d %k:%i') as deptTe,
                        tCR.CR_CancelDt as cancelDay,
                        count(CR_SeatNum) as seatCnt,
                        tPH.PH_Type as payType,
                        tPH.PH_Price as price,
                        CR_CT_ID as ctId,
                        CR_PH_ID as phId	
                    from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                        where tCR.CR_CT_ID = tCT.CT_ID AND tCR.CR_Cancel = :crCancel
                        and tCR.CR_U_ID = :sessionId
                        group by tCR.CR_cDt
                    order by PayDay desc
	                `;

    let sessionId = req.user.U_ID;
    let crCancel = 'Y';
    
    console.log("취소 환불 ",req.body);

    connection.query(query, 
        {          
            sessionId, crCancel
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            res.json( {  data : rows});
            console.log("rows : ",rows);
            
        });
        
});  


//마이페이지 취소 및 환불조회 날짜검색
router.post('/user/resCancelListBetween', auth.isLoggedIn, (req, res, next) =>{
    let cancelDeptDay = req.body.cancelDeptDay
    let cancelEndDay = req.body.cancelEndDay
    let query = `   select 
                        date_format(tCR.CR_cDt,'%y%y-%m-%d') as PayDay,
                        date_format(tCT.CT_DepartureTe,'%y%y-%m-%d %k:%i') as deptTe,
                        date_format(tCR.CR_CancelDt ,'%y%y-%m-%d %k:%i') as cancelDay,
                        count(CR_SeatNum) as seatCnt,
                        tPH.PH_Type as payType,
                        CR_CT_ID as ctId,
                        CR_PH_ID as phId,	
                        tPH.PH_Price as price	
                    from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                        where tCR.CR_CT_ID = tCT.CT_ID AND tCR.CR_Cancel = :crCancel
                        and tCR.CR_U_ID = :sessionId and tCR.CR_CancelDt between date(:cancelDeptDay) AND date(:cancelEndDay)+1
                        group by tCR.CR_cDt
                    order by cancelDay desc
	                `;

    let sessionId = req.user.U_ID;
    let crCancel = 'Y';
    
    console.log("취소 환불 ",req.body);

    connection.query(query, 
        {          
            sessionId, crCancel, cancelDeptDay, cancelEndDay
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
                
            res.json( {  data : rows});
            console.log("rows : ",rows);          
    });       
});  

//마이페이지 취소 및 환불조회 모바일
router.post('/user/resCancelListMo', auth.isLoggedIn, (req, res, next) =>{
    let query = `select 
                    date_format(tCR.CR_cDt,'%y%y-%m-%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y-%m-%d %k:%i') as deptTe,
                    tCR.CR_CancelDt as cancelDay,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_CT_ID as ctId,
                    CR_PH_ID as phId	
                from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    where tCR.CR_CT_ID = tCT.CT_ID AND tCR.CR_Cancel = :crCancel
                    and tCR.CR_U_ID = :sessionId
                    group by tCR.CR_cDt
                order by PayDay desc`;

    let sessionId = req.user.U_ID;
    let crCancel = 'Y';
    
    console.log(req.body);

    connection.query(query, 
        {          
            sessionId, crCancel
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            res.json( {  data : rows});
            console.log("rows : ",rows);
            
        });
        
}); 

//마이페이지 취소 및 환불조회 상세보기 모바일
router.post('/user/resCancelDetailMo', auth.isLoggedIn, (req, res, next) =>{
    let query = `select 
                    date_format(tCR.CR_cDt,'%y%y-%m-%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y-%m-%d %k:%i') as deptTe,
                    date_format(tCR.CR_CancelDt,'%y%y-%m-%d')as cancelDay,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    tB.B_Name as carName,
                    CR_CT_ID as ctId,
                    CR_PH_ID as phId	
                from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    where tCR.CR_CT_ID = tCT.CT_ID AND tCR.CR_Cancel = :crCancel
                    and tCR.CR_U_ID = :sessionId and CR_CT_ID = :ctId and CR_PH_ID = :phId
                    group by tCR.CR_cDt
                order by PayDay desc`;

    let sessionId = req.user.U_ID;
    let crCancel = 'Y';
    let ctId = req.body.ctId;
    let phId = req.body.phId;
    console.log("ctId :", ctId);
    console.log("phId :", phId);

    connection.query(query, 
        {          
            sessionId, crCancel, ctId, phId
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            res.json( {  data : rows});
            console.log("rows : ",rows);
            
        });
        
}); 

//결제완료
router.post('/payment', auth.isLoggedIn, (req, res) =>{
    
    let str_values_list = [],
        str_values ="",
        seatNums = req.body['seatNums[]'],
        ct_id = req.body.ct_id,
        oPrice = req.body.oPrice,
        sPrice = req.body.sPrice,
        price = ((oPrice-sPrice) < 0) ? 0 : (oPrice-sPrice),
        ph_type = '-'; // 무료기간동안만 - 으로 넣음.
    
    /**
     * TODO : 무료기간 끝나면 PH_TYPE 값 결제 수단으로 변경해야함.
     */
    let ph_query = `
        INSERT INTO tPH
            (PH_U_ID, PH_PG_ID, PH_Price, PH_OPrice, PH_SPrice, PH_Type)
        VALUES
            (:u_id, :pg_id, :price, :oPrice, :sPrice, :ph_type)
    `;
    
    //  결제 내역 먼저 추가. 
    connection.query(ph_query, {
        u_id    : req.user.U_ID,
        pg_id   : 1,    // pg_id :  PG 사 결정되면 결제 정보 입력해야함.
        oPrice  : oPrice,
        sPrice  : sPrice,
        price   : (oPrice-sPrice),
        ph_type : ph_type
    }, function (err, result){

        let ph_id = result.insertId;

        let cr_query = `
            INSERT INTO tCR
                (CR_CT_ID, CR_U_ID, CR_PH_ID, CR_SeatNum)
            VALUES
        `;
        
        if( typeof(seatNums) === "object"){ //선택한 좌석이 2개 이상
            seatNums.map((seatNum)=>{
                str_values_list.push(`(${ct_id}, ${req.user.U_ID}, ${ph_id}, ${seatNum})`);
            });
            str_values = str_values_list.join(', ');
        } else if(typeof(seatNums) === "string" ){ // 선택한 좌석이 1개
            str_values = `(${ct_id}, ${req.user.U_ID}, ${ph_id}, ${seatNums})`;
        }
    
        cr_query += str_values;

        //  예약 정보 추가
        connection.query(cr_query, null,
            function(err, result) {
                if(err) throw err;
                
                res.json({
                    ph_type : ph_type,
                    price : price
                });
            });
    });
    
});

//장차예매 리스트
router.post('/user/resCarList', auth.isLoggedIn, (req, res, next) =>{
    let query = `
        SELECT
            tCT.CT_ID as ctID,
            tB.B_Name as b_name,
            date_format(tCT.CT_DepartureTe,'%Y-%m-%d %H:%i') as deptTe,
            date_format(tCT.CT_ReturnTe,'%Y-%m-%d %H:%i') as retuTe,
            tCT.CT_CarNum as carNum,
            (select count(tCR.CR_SeatNum) from tCR where tCR.CR_CT_ID =tCT.CT_ID AND CR_Cancel = 'N') as available_seat_cnt,
            tCY.CY_Totalpassenger as total_passenger
        FROM tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID
        WHERE date_format(CT_DepartureTe,'%H%i') = :deptTe
        AND date_format(CT_ReturnTe,'%H%i') = :retuTe
        AND tCT.CT_DepartureTe > now()
        ORDER BY tCT.CT_DepartureTe asc`;

    let sessionId = req.user.U_ID;
    let crCancel = 'N';
    let deptTe = req.body.sel;
    let retuTe = req.body.sel2;
    console.log("deptTe :", deptTe);
    console.log("retuTe :", retuTe);

    connection.query(query, 
        {          
            crCancel, deptTe, retuTe
                                
        },
        function(err, rows, fields) {
            if (err) throw err;                       
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows : ",rows);
            
        });
        
});


// CT_ID로 예약된 좌석 정보 가져오기
router.get('/useSeat/:ct_id', auth.isLoggedIn, (req, res, next) =>{
    let query = `select CR_SeatNum from tCR where CR_CT_ID = :ct_id and CR_Cancel = 'N' `;
    let ct_id = req.params.ct_id;
    
    connection.query(query, { ct_id : ct_id },
        function(err, rows, fields) {
            if(err) throw err;
            let seat_list = [];
            rows.map((data) => {
                seat_list.push(data.CR_SeatNum);
            });
            res.json({ data : seat_list });

        })
 
});

// 인증번호 생성 & 발송
router.post('/auth/phone', async ( req, res ) => {
    let phone_number = req.body.phone_number;
    if( !phone_number ) return res.json({statusCode : 400, massage : 'phone_number is undefinded'});
    let result = await localAuth.saveNumber( phone_number );
    
    let data = {
        receiver : result.phone_number,
        auth_number : result.auth_number
    }

    sms.phoneAuthSend( req, data )
    .then(( send_result ) => {
        let result_data = {};

        if( send_result.result_code === 1 ){
            result_data = {
                statusCode : 200,
                message : "success",
            }
        } else {
            result_data = {
                statusCode : 500,
                message : "fail",
            }
        }
        
        res.json(result_data);
    });

});

// 인증번호 확인
router.get('/auth/phone', async ( req, res ) => {
    let phone_number = req.query.phone_number;
    let auth_number = req.query.auth_number;

    let result = await localAuth.checkNubmer( phone_number, auth_number );
    
    res.json(result);
});

module.exports = router;
