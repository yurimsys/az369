const express = require('express');
const router = express.Router();
const auth = require('../config/passport');
const mysql = require('mysql');
const mssql = require('mssql');
const dbconf = require('../config/database');
const connection = mysql.createConnection(dbconf.mysql);
const conn_ms = mssql.connect(dbconf.mssql);
const nodemailer = require('nodemailer');
const config = require('../config');
const CryptoJS = require('crypto-js');
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

/**
 * SiGNAGE API Start
 */

 // 광고 타입 
router.get('/adtype', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tADY', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
    
});

// 매장 업종 조회
router.get('/category', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tBC where BC_ID NOT IN(select BC_ID from tBC inner join tBCR on tBC.BC_ID = tBCR.BCR_LV2_BC_ID )', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//브랜드 리스트
router.get('/brandList', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tBS', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

// 광고 리스트
router.get('/ad', function(req, res, next) {
    let req_type = req.query.type;
    let query = '';
    if(req_type !== 'display'){
        query = `
            SELECT AD_ID, BS_NameKor, ADY_CD, ADY_Location, ADY_SlideDuration, BC_NameKor, AD_PaymentStatus, AD_Title, AD_DtS, AD_DtF, AD_ContentURL 
            FROM tAD
                INNER JOIN tADY on AD_ADY_ID = ADY_ID 
                LEFT JOIN tBS on AD_BS_ID = BS_ID
                LEFT JOIN tBC on AD_BC_ID = BC_ID`;
        mssql.connect(dbconf.mssql, function (err, result){
            if(err) throw err;
            new mssql.Request().query(query, (err, result) => {
                res.json({ data : result.recordset });
            })
        });
    } else {
        query = `
            SELECT AD_ID, BS_NameKor, ADY_CD, ADY_Location, ADY_SlideDuration, BC_NameKor, AD_PaymentStatus, AD_Title, AD_DtS, AD_DtF, AD_ContentURL 
            FROM tAD
                INNER JOIN tADY on AD_ADY_ID = ADY_ID 
                LEFT JOIN tBS on AD_BS_ID = BS_ID
                LEFT JOIN tBC on AD_BC_ID = BC_ID
            WHERE AD_DtF >= GETDATE()`;
        
            mssql.connect(dbconf.mssql, function (err, result){
            if(err) throw err;
            new mssql.Request().query(query, (err, result) => {
                let result_data = {};
                result.recordset.forEach((row) => {
                    if(result_data[row.ADY_CD] === undefined){
                        result_data[row.ADY_CD] = {};
                        result_data[row.ADY_CD].slide_sec = row.ADY_SlideDuration;
                        let content_obj = {
                            url : row.AD_ContentURL,
                            display_s : row.AD_DtS,
                            display_f : row.AD_DtF
                        };
                        result_data[row.ADY_CD].contents = [content_obj];
                    } else {
                        let content_obj = {
                            url : row.AD_ContentURL,
                            display_s : row.AD_DtS,
                            display_f : row.AD_DtF
                        };
                        result_data[row.ADY_CD].contents.push(content_obj)
                    }
                });
    
                res.json({ data : result_data });
            })
        });
    }
});

router.post('/ad', async function(req, res){
    let pool = await mssql.connect(dbconf.mssql)
    
    /**
     * TODO : 결제 추가 시 작성.
     */
    let PaymentStatus = null;

    // TEST
    
    req.body.BS_ID = '1';
    req.body.ADY_ID = '2';
    req.body.BC_ID = null;
    PaymentStatus = '결제완료';
    req.body.Title = '테스트 제목121';
    req.body.DtS = '2020-05-10 10:00:00';
    req.body.DtF = '2020-06-10 10:00:00';
    req.body.ContentURL = 'image/a.jpg';
    req.body.ContentTy = 'Image';
    

    let result = await pool.request()
        .input('BS_ID',         req.body.BS_ID)
        .input('ADY_ID',        req.body.ADY_ID)
        .input('BC_ID',         req.body.BC_ID)
        .input('PaymentStatus', PaymentStatus)
        .input('Title',         req.body.Title)
        .input('DtS',           req.body.DtS)
        .input('DtF',           req.body.DtF)
        .input('ContentURL',    req.body.ContentURL)
        .input('ContentTy',     req.body.ContentTy)
        .query(`
            INSERT INTO tAD (AD_BS_ID, AD_ADY_ID, AD_BC_ID, AD_PaymentStatus, AD_Title, AD_DtS, AD_DtF, AD_ContentURL, AD_ContentTy)
            VALUES (@BS_ID, @ADY_ID, @BC_ID, @PaymentStatus, @Title, @DtS, @DtF, @ContentURL, @ContentTy)
        `)
    console.log(result)
    res.json({data : result.rowsAffected})
    
});
 
// SIGNAGE API END
 



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
    let query = `delete from tU where U_uId = :uUserName`;    
    let uUserName = req.user.U_uId;
    let uPw = req.body.pw;
    console.log("id :", uUserName);
    console.log("pw :", uPw);    
        
    if(CryptoJS.AES.decrypt(req.user.U_Pw, config.enc_salt).toString(CryptoJS.enc.Utf8)!== uPw ){
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
    let query = "select U_uId from tU where U_uId = :overId limit 1";
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
    let query = `insert into tU (U_uId, U_Pw, U_Name, U_Phone, U_Email, U_Brand, U_Zip, U_Addr1, U_Addr2) 
            values( :uUserName,  :uPw,  :uName,  :uPhone , :uEmail, :uBrand,  :uZip,  :uAddr1,  :uAddr2)`;

    let password = req.body.password;
    let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString()
    
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
    let query = "select U_uId from tU where U_Name =:uName and U_Phone =:uPhone limit 1";
    
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
    let query = "select U_uId, U_Name from tU where U_uId =:uId and U_Phone =:uPhone limit 1";
    
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
    let query = "update tU set U_Pw = :hash_pw where U_uId = :uUserName";
    
    let password = req.body.password;
    let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString();

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
    
    let transporter  = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.account.mail.id,
            pass: config.account.mail.pw
        }
    })
    
    let mailOptions = {
        from: config.account.mail.id,
        to: (req.app.get('env') === 'development') ? config.mail_address.dev : config.mail_address.ceo,
        subject: '[AZ369] 신규 입점문의 내역.',
        text: '이름 :'+req.body.name+'\n'+'휴대전화 : '+req.body.phone+'\n'+'브랜드명 : '+req.body.brand+
              '\n'+'주소 : '+req.body.address+'\n'+'문의내역 : '+req.body.memo
    }

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
            transporter.sendMail(mailOptions, function(error, info){ 
                transporter.close();
            })
            res.json({data: ''});
        });
        
});

//입점신청 조회
router.post('/user/lookUp', (req, res, next) =>{
    let query = `select SI_cDt from tSI where SI_Name = :siName and SI_Phone = :siPhone limit 1`;
    
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
    let uId = req.user.U_uId
    //let hash_pw = CryptoJS.AES.encrypt(uPw, config.enc_salt).toString();
    console.log("비밀번호",uPw);
    console.log("내 아이이디 :",req.user.U_uId);
    let query = "select U_Pw from tU where U_uId =:uId and U_Pw =:uPw";
    
    connection.query(query, 
        {          
            uId, uPw                   
        },
        function(err, rows) {
            
            if (err) {return done(err);}
            if(CryptoJS.AES.decrypt(req.user.U_Pw, config.enc_salt).toString(CryptoJS.enc.Utf8)!== uPw ){
                res.json({data: "실패"});
                return done( null, false, {message: "ID와 Password를 확인해주세요"} );
            } else {
                console.log("성공")
                res.json( {  data : "성공"});
            }           6
        });      
}); 


//마이페이지 정보 수정
router.post('/user/modifyInfo', auth.isLoggedIn, (req, res, next) =>{
    
    let uUserName = req.user.U_uId;
    let uPhone = req.body.phone;
    let uBrand = req.body.brand;
    let uZip = req.body.postcode;
    let uAddr1 = req.body.address;
    let uAddr2 = req.body.detailAddress;
    let password = req.body.pw;
    let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString();
    
    console.log("유저아이디 :", uUserName);
    console.log("password :", password);
    console.log("hash :", hash_pw);
    console.log("phone ::", uPhone);
    console.log("uZip :", uZip);
    console.log("uAddr1 :", uAddr1);
    console.log("uAddr2 ::", uAddr2);

    let query = `UPDATE tU SET U_Pw = :hash_pw, U_Phone = :uPhone, U_Brand = :uBrand,
                U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2, U_uDt = now() WHERE U_uId =:uUserName`;

    let query2 = `UPDATE tU SET U_Phone = :uPhone, U_Brand = :uBrand,
                U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2, U_uDt = now() WHERE U_uId =:uUserName`;

    let query3 = `UPDATE tU SET  U_Pw = :hash_pw, U_Brand = :uBrand,
                U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2, U_uDt = now() WHERE U_uId =:uUserName`;

    let query4 = `UPDATE tU SET U_Phone = :uPhone, U_Brand = :uBrand,
                 U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2, U_uDt = now() WHERE U_uId =:uUserName`;

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
    let query = `delete from tU where U_uId = :uUserName`;    
    let uUserName = req.user.U_uId;
    let uPw = req.body.pw;
    console.log("id :", uUserName);
    console.log("pw :", uPw);    
    
    if( CryptoJS.AES.decrypt(uPw, config.enc_salt).toString(CryptoJS.enc.Utf8) !== req.user.U_Pw ){
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
                    order by PayDay desc`;

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
router.post('/user/resDept', auth.isLoggedIn, (req, res, next) =>{
    let query = `
                select	distinct date_format(CT_DepartureTe,'%H%i') as deptTe, date_format(CT_DepartureTe,'%H:%i') as deptTe2
                 from tCT`;

    connection.query(query,
        function(err, rows, fields) {
            if (err) throw err;                       
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows : ",rows);            
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
            tCY.CY_Totalpassenger as total_passenger,
            tCY.CY_SeatPrice as seatPrice
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

router.get('/useSeat2/:ct_id', auth.isLoggedIn, (req, res, next) =>{
    let query = `select 
                    CY_SeatPrice from tCR inner join tCT on tCR.CR_CT_ID = tCT.CT_ID inner join tCY on tCT.CT_CY_ID = tCY.CY_ID
                where CR_CT_ID = :ct_id and CR_Cancel = 'N'`;
    let ct_id = req.params.ct_id;
    
    connection.query(query, { ct_id : ct_id },
        function(err, rows, fields) {
            if(err) throw err;
            let seat_price = [];
            rows.map((data) => {
                seat_price.push(data.CY_SeatPrice);
            });
            res.json({data : seat_price});

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


//비디오 팝업
router.post('/user/videoPopup', (req, res, next) =>{
    let query = `select * from tYL where YL_id = :youId`;
    let youId = req.body.youId;

    connection.query(query,
        {
            youId

        },
        function(err, rows, fields) {
            if (err) throw err;

            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows : ",rows);

        });
});

//비디오 좌우
router.post('/user/videoPopupBtn', (req, res, next) =>{
    let query = `select * from tYL order by YL_dDt desc limit :begin, 1`;
    let begin = Number(req.body.begin);

    connection.query(query,{begin},
        function(err, rows, fields) {
            if (err) throw err;

            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows : ",rows);

        });
});


//비디오 총 수
router.post('/video/count', function(req, res, next) {
    let query = `SELECT count(*) as cnt FROM tYL `; 
    connection.query(query,
      function(err, rows, fields) {
          if (err) throw err;
          let cnt = rows;
          res.send( { data : cnt});
          console.log("카운트는 :",cnt);
      });
});

//추천 비디오
router.post('/video/best', function(req, res, next) {
    let query = `select * from tYL where YL_d_order order by rand() limit 1`; 
    connection.query(query,
      function(err, rows, fields) {
          if (err) throw err;
          res.send( { data : rows});
      });
});

//사이니지


//대분류 카테고리
router.get('/api/categoryLV1', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select distinct(BCR_LV1_BC_ID), BC_NameEng, BC_NameKor from tBCR inner join tBC on tBCR.BCR_LV1_BC_ID = tBC.BC_ID', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//중분류 카테고리
router.get('/api/categoryLV2', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tBC inner join tBCR on tBC.BC_ID = tBCR.BCR_LV2_BC_ID', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});
//전체 브랜드 리스트
router.get('/api/brandList', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query(`
        select BS_NameKor, BS_NameEng, tBCR.BCR_ID, BCR_LV1_BC_ID, BCR_LV2_BC_ID, BCR_LV3_BC_ID, tBS.BS_ID, BS_BC_ID, 
                BS_LoginID, BS_LoginPW, BS_CEO, convert(varchar, BS_MainDtS, 108) as BS_MainDtS,
                convert(varchar, BS_MainDtf, 108) as BS_MainDtF, convert(varchar, BS_SubDtF, 108) as BS_SubDtF, BC_NameKor, BC_NameEng,
                convert(varchar, BS_BreakDtS, 108) as BS_BreakDtS, convert(varchar, BS_BreakDtF, 108) as BS_BreakDtF,
                BS_ContentsKor, BS_ContentsEng, BS_ThumbnailUrl,
                convert(varchar, BS_PersonalDay, 108) as BS_PersonalDay, BS_ImageUrl,tLS.LS_Number, LS_Sector, LS_Floor 
        from tBCR inner join tBSxBCR on tBCR.BCR_ID = tBSxBCR.BCR_ID inner join tBS on tBS.BS_ID = tBSxBCR.BS_ID
                inner join tBSxtLS on tBSxtLS.BS_ID = tBS.BS_ID inner join tLS on tLS.LS_Number = tBSxtLS.LS_Number
        inner join tBC on tBC.BC_ID = tBCR.BCR_LV2_BC_ID`,
        (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//언어선택
router.get('/api/language', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tME', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});
//
//svg파일 호수 맵핑
router.get('/api/storeInfo', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query(`SELECT LS_Number, tBS.BS_ID, BS_BC_ID, BS_NameKor, BS_NameEng,BC_NameKor, BC_NameEng 
                                          FROM tBSxtLS inner join tBS on tBSxtLS.BS_ID = tBS.BS_ID inner join tBC on tBC.BC_ID = tBS.BS_BC_ID`, (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

module.exports = router;
