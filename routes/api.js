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
const multer = require('multer')
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { throws } = require('assert');
const { json } = require('body-parser');
const api_request = require('request'); 
const sync_request = require('sync-request');
//디코딩 모듈
const iconv = require('iconv-lite');
//특정 시간 실행 모듈
const schedule = require('node-schedule');
connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    }.bind(this));
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '_tmp_files/'))
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
  })
const upload = multer({storage: storage})
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'upload/')
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
//   })

// const upload = multer({storage : storage})


router.post('/upload', upload.any(), function(req, res){
    console.log('test',req.file);
})



router.post('/add', upload.any(), async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        if(req.files.length === 0) throw Error('Non include files');
        let content_type = req.files[0].mimetype.split('/')[0];
        let filename = req.files[0].filename;
        let old_path = req.files[0].path;
        let new_path = path.join(config.path.ad_image , filename);

        fs.rename(old_path, new_path, (err) => {
            if (err) throw err;
            fs.stat(new_path, (err, stats) => {
            if (err) throw err;
            console.log(`stats: ${JSON.stringify(stats)}`);
            });
        });

    } catch (err) {
        console.log(err);
        console.log('error fire')
        res.json({result : 0});
    }
});



connection.on('error', function(err) {
    console.log('------ on error!');
    console.log(err);
});

/**
 * SiGNAGE API Start
 */

router.put('/test', upload.any(), function(req, res){
    console.log(req);
    let filename = req.files[0].filename;
    let old_path = req.files[0].path;
    let new_path = path.join(config.path.ad_image , filename);

    fs.rename(old_path, new_path, (err) => {
        if (err) throw err;
        fs.stat(new_path, (err, stats) => {
          if (err) throw err;
          console.log(`stats: ${JSON.stringify(stats)}`);
        });
      });
    res.json({result:1});
})

 // 광고 타입 
router.get('/adtype', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tADY', (err, result) => {
            if(err) throw err;
            res.json({ data : result.recordset });
        })
    });
    
});

// 광고 리스트
router.get('/ad', async function(req, res, next) {
    try {
        //test
        console.log('req : ',req);
    let pool = await mssql.connect(dbconf.mssql)

    let req_type = req.query.type;
    let query = `
                SELECT 
                    AD_ID, 
                    BS_CEO,
                    BS_NameKor, 
                    ADY_CD, 
                    ADY_Location, 
                    ADY_SlideDuration, 
                    AD_BC_ID, 
                    BC_NameKor, 
                    AD_PaymentStatus, 
                    AD_Title, 
                    AD_DtS, 
                    AD_DtF, 
                    AD_ContentURL, 
                    BS_ID, 
                    AD_ADY_ID
                FROM tAD
                    INNER JOIN tADY on AD_ADY_ID = ADY_ID 
                    LEFT JOIN tBS on AD_BS_ID = BS_ID
                    LEFT JOIN tBC on AD_BC_ID = BC_ID 
                `;
    // 관리 페이지 용도
    if(req_type !== 'display'){
        let condition_list = [];
        if( req.query.adDtS ){
            condition_list.push(`AD_DtS >= ${req.query.adDtS}`);
        }
        if( req.query.adDtF ){
            condition_list.push(`AD_DtF <= ${req.query.adDtF}`);
        }
        if( req.query.adAdyId ){
            condition_list.push(`AD_ADY_ID = ${req.query.adAdyId}`);
        }
        if( req.query.adBsId ){
            condition_list.push(`AD_BS_ID = ${req.query.adBsId}`);
        }
        if( req.query.adTitle ){
            condition_list.push(`AD_Title like '%${req.query.adTitle}%'`);
        }
        if( req.query.adBcId ){
            condition_list.push(`AD_BC_ID = ${req.query.adBcId}`);
        }

        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = 'WHERE '+condition_list.join(searchType);
            query += condition_stmt;
        }
        let result = await pool.request()
        .query(query);

        res.json({ data : result.recordset });
    
    // SIGNAGE 용도
    } else {
        query += "WHERE AD_DtF >= GETDATE() AND AD_DtS <= GETDATE() AND AD_Default = 'n'";


        let query2 = `
                SELECT 
                    AD_ID, 
                    BS_NameKor, 
                    ADY_CD, 
                    ADY_Location, 
                    ADY_SlideDuration, 
                    AD_BC_ID, 
                    BC_NameKor, 
                    AD_PaymentStatus, 
                    AD_Title, 
                    AD_DtS, 
                    AD_DtF, 
                    AD_ContentURL, 
                    BS_ID
                FROM tAD
                        INNER JOIN tADY on AD_ADY_ID = ADY_ID 
                        LEFT JOIN tBS on AD_BS_ID = BS_ID
                        LEFT JOIN tBC on AD_BC_ID = BC_ID 
                WHERE AD_DtF >= GETDATE() AND AD_Default = 'y' 
                `;
        let query3 = `SELECT 
                        AD_ID, 
                        BS_NameKor, 
                        ADY_CD, 
                        ADY_Location, 
                        ADY_SlideDuration, 
                        AD_BC_ID, 
                        BC_NameKor, 
                        AD_PaymentStatus, 
                        AD_Title, 
                        AD_DtS, 
                        AD_DtF, 
                        AD_ContentURL 
                    FROM tAD 
                        left JOIN tADY on AD_ADY_ID = ADY_ID 
                        LEFT JOIN tBS on AD_BS_ID = BS_ID 
                        LEFT JOIN tBC on AD_BC_ID = BC_ID 
                    WHERE AD_DtF >= GETDATE() AND AD_Default = 'y' AND AD_BC_ID is not null
                    `

        let result_data = {};
        
        let result = await pool.request()
        .query(query);

        result.recordset.forEach((row) => {
            if(result_data[row.ADY_CD] === undefined){
                result_data[row.ADY_CD] = {};
                result_data[row.ADY_CD].slide_sec = row.ADY_SlideDuration;
                result_data[row.ADY_CD].contents = [];
            } 
            let content_obj = {
                url : row.AD_ContentURL,
                display_s : row.AD_DtS,
                display_f : row.AD_DtF
            };
            
            if(row.AD_BC_ID !== null){
                content_obj.category_id = row.AD_BC_ID
                content_obj.bs_id = 'bs'+row.BS_ID
                // content_obj.url = row.AD_BC_ID
            }
            result_data[row.ADY_CD].contents.push(content_obj);
            
        });

        let result2 = await pool.request()
        .query(query2); 
        
        let all_data = {};
        

        result2.recordset.forEach((data)=>{
            if(!result_data.hasOwnProperty(data.ADY_CD)){
                if(all_data[data.ADY_CD] === undefined){
                    all_data[data.ADY_CD] = {}
                    all_data[data.ADY_CD].slide_sec = data.ADY_SlideDuration;
                    all_data[data.ADY_CD].contents = [];
                }

                let content_obj = {
                    url : data.AD_ContentURL,
                    display_s : data.AD_DtS,
                    display_f : data.AD_DtF
                };
    
                if(data.AD_BC_ID !== null){
                    content_obj.category_id = data.AD_BC_ID
                }
                all_data[data.ADY_CD].contents.push(content_obj);
            }
        })

        //디폴트 이미지
        let result3 = await pool.request()
        .query(query3);

        res.json({ data : Object.assign(result_data, all_data) , data2 : result3.recordset});
    }

} catch (err) {
    console.log(err);
    console.log('error fire')
}
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
    let query = `insert into tU (
                            U_uId, 
                            U_Pw, 
                            U_Name, 
                            U_Phone, 
                            U_Email, 
                            U_Brand, 
                            U_Zip, 
                            U_Addr1, 
                            U_Addr2) 
                    values( 
                        :uUserName,  
                        :uPw,  
                        :uName,  
                        :uPhone, 
                        :uEmail, 
                        :uBrand,  
                        :uZip,  
                        :uAddr1,  
                        :uAddr2)`;

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
    let query = `INSERT INTO tCP(
                        CP_U_ID, 
                        CP_PreferDays, 
                        CP_DepartureTe, 
                        CP_ReturnTe) 
                    VALUES( 
                        :joinId, 
                        :preferDays, 
                        :departureTe, 
                        :returnTe)`;
    // let preferDays = req.body['days[]'].join(',');
    let preferDays = req.body.preferDays.join(',');;
    let departureTe = req.body.departureTe;
    let returnTe = req.body.returnTe;
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
    let query = `SELECT 
                        U_uId 
                    FROM tU 
                    WHERE U_Name =:uName AND 
                          U_Phone =:uPhone 
                    limit 1`;
    
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
    let query = `select 
                        U_uId, 
                        U_Name 
                    FROM tU 
                    WHERE U_uId =:uId AND 
                          U_Phone =:uPhone 
                    limit 1`;
    
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
    let query = `UPDATE tU set 
                        U_Pw = :hash_pw 
                    WHERE U_uId = :uUserName`;
    
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
    let query = `INSERT INTO tSI (
                        SI_Name, 
                        SI_Phone, 
                        SI_Brand, 
                        SI_Addr1, 
                        SI_Content) 
                    VALUES( 
                        :siName, 
                        :siPhone, 
                        :siBrand, 
                        :siAddr, 
                        :siMemo)`;
    
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
    let query = `SELECT 
                        SI_cDt 
                    FROM tSI 
                    WHERE SI_Name = :siName AND 
                          SI_Phone = :siPhone 
                    limit 1`;
    
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
    let query = `SELECT 
                        U_Pw 
                    FROM tU 
                    WHERE U_uId =:uId and 
                          U_Pw =:uPw`;
    
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
            }           
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
    let uEmail = req.body.u_email;
    let password = req.body.pw;
    let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString();
    
    let query = `UPDATE tU SET `;

    let condition_list = [];
    // if( uUserName ){
    //     condition_list.push(`U_Name = '${uUserName}'`);
    // }
    if( uPhone){
        condition_list.push(`U_Phone = '%${uPhone}%'`);
    }
    if( uBrand ){
        condition_list.push(`U_Brand = '${uBrand}'`);
    }
    if( uZip){
        condition_list.push(`U_Zip = '${uZip}'`);
    }
    if( uAddr1 ){
        condition_list.push(`U_Addr1 = '${uAddr1}'`);
    }
    if( uAddr2){
        condition_list.push(`U_Addr2 = '${uAddr2}'`);
    }
    if( uEmail){
        condition_list.push(`U_Email = '${uEmail}'`);
    }
    if( password){
        condition_list.push(`U_Pw = '${hash_pw}'`);
    }

    if( condition_list.length > 0){
        
        let condition_stmt = condition_list
        query += condition_stmt + ` WHERE U_uId = '${uUserName}'`
    }

    connection.query(query,
        function(err, rows){
            res.json( {  data : "성공"});
    })

});


//회원탈퇴
router.post('/user/deleteUser', auth.isLoggedIn, (req, res, done) =>{
    let query = `DELETE 
                        FROM tU 
                        WHERE U_uId = :uUserName`;    
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
router.get('/user/delchoice',  auth.isLoggedIn, (req, res, next) =>{
   
    let query = `SELECT 
                        * 
                    FROM tCR 
                    WHERE CR_U_ID = :sessionId AND 
                          CR_Cancel = 'N' AND 
                          (select CT_DepartureTe from tCT where tCT.CT_ID = tCR.CR_CT_ID) > now()`;
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
    let seatNum = req.body.sendArray;
    console.log(seatNum);
    console.log("sessionId :", sessionId);

    let query = `
                SELECT 
                    tCR.CR_ID,
                    tCR.CR_CT_ID as ctId,
                    tPH.PH_ID,
                    tCR.CR_cDt as payDay,
                    tB.B_Name as carName,
                    (SELECT right(CT_CarNum, 4)) AS carNum,
                    tCR.CR_SeatNum,
                    tPH.PH_Type,
                    tCR.CR_Price,
                    PH_OrderNumber,
                    tCR.CR_QrCode,
                    PH_PG_ID,
                    CR_U_ID,
                    PH_OPrice,
                    PH_CodeType,
                    DAYOFWEEK(tCT.CT_DepartureTe) AS deptDay,
                    DAYOFWEEK(tCT.CT_ReturnTe) AS retnDay,
                    DAYOFWEEK(tCR.CR_cDt ) AS payDayWeek,
                    date_format(tCR.CR_cDt ,'%y%y.%m.%d') as payDayYM,
                    date_format(tCR.CR_cDt ,'%H:%i') as payDayTm,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') AS deptTe,
                    date_format(tCT.CT_DepartureTe,'%m.%d') AS startDay,
                    date_format(tCT.CT_ReturnTe,'%m.%d') as returnDay,
                    date_format(tCT.CT_DepartureTe,'%H:%i') as startTime,
                    date_format(tCT.CT_ReturnTe,'%H:%i') as returnTime,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d') as deptTe2,
                    date_format(tCT.CT_ReturnTe,'%y%y.%m.%d') as returnTe2,
                    date_format(tCR.CR_cDt,'%y%y.%m.%d %H:%i') as PayDay2,
                    CR_PayState,
                    PH_CardName,
                    PH_BankNumber,
                    PH_BankCode
                FROM tCR
                    INNER JOIN tCT ON tCT.CT_ID = tCR.CR_CT_ID
                    INNER JOIN tCY ON tCY.CY_ID = tCT.CT_CY_ID
                    INNER JOIN tB ON tB.B_ID = tCY.CY_B_ID
                    INNER JOIN tPH ON tPH.PH_ID = tCR.CR_PH_ID
                WHERE 
                    tCR.CR_CT_ID = tCT.CT_ID AND 
                    tCR.CR_Cancel = 'N' AND 
                    tCR.CR_U_ID = :sessionId AND
                    tCR.CR_cDt IN ( :seatNum) AND
                    now() < date_add(CT_ReturnTe,interval +4 HOUR)
                    ORDER BY tCR.CR_SeatNum
                    `;
                    // and tCT.CT_DepartureTe > NOW()
                    // order by tCT.CT_DepartureTe desc
    console.log("좌석 :", seatNum);
    console.log("세션 :", sessionId);


    connection.query(query,
        {
            sessionId, seatNum

        },
        function(err, rows, fields) {
            if (err) throw err;

            // //console.log(findId);
            res.json( {  data : rows, session_user : sessionId});
            console.log("rows :",rows);
        });

});

router.get('/user/canceltype', auth.isLoggedIn, (req, res)=>{
    let ph_id = req.query.ph_id;
    let query = `SELECT COUNT(*) as count FROM tCR WHERE CR_PH_ID = :ph_id`;

    connection.query(query, 
        {
            ph_id : ph_id
        },
        function(err, rows, fields) {
            if (err) throw err;

            res.json({data : rows})
        });
})

// 무통장 입금 결제 상태 확인
router.get('/user/vBank', auth.isLoggedIn, async (req, res) =>{
    let vBank_query = `SELECT * FROM tCR WHERE CR_ID IN (:cr_id)`;
    let cr_id = req.query.cr_id;
    connection.query(vBank_query, 
        {
            cr_id : cr_id
        },
        function(err, rows, fields) {
            if (err) throw err;

            if(rows[0].CR_PayState == '결제대기'){
                res.json({data : '결제대기'});
            }else{
                res.json({data : '결제완료'});
            }
        });
})

//좌석 예매 취소 api
router.post('/cancel-seat', auth.isLoggedIn, async (req, res) =>{

    // 예매 취소할 user의 id 
    let sessionId = req.body.u_id 
    // 예매 취소할 좌석의 id
    let cr_id = req.body.cr_id;
    // 취소 상태값
    let cancel_type = req.body.cancelType;
    // 취소결과값
    let cancel_name;
    if(cancel_type == 1){
        cancel_name = '부분취소'
    }else{
        cancel_name = '전체취소'
    }

    //관리자 페이지에서 취소하기 위한 쿼리
    let admin_query = `UPDATE tCR
                            INNER JOIN tCT on tCR.CR_CT_ID = tCT.CT_ID
                            SET CR_Cancel = 'Y', 
                                CR_CancelDt = now(), 
                                CR_PayState = '결제취소'
                            WHERE CR_ID IN (:cr_id) AND  
                                    CR_U_Id = :sessionId`;

    //예매 취소 쿼리
    let cancel_seat_query = `UPDATE tCR
                                INNER JOIN tCT on tCR.CR_CT_ID = tCT.CT_ID
                                SET CR_Cancel = 'Y', 
                                    CR_CancelDt = now(), 
                                    CR_PayState = '결제취소'
                                WHERE CR_ID IN (:cr_id) AND  
                                    CR_U_Id = :sessionId 
                                    `;

    // cencel_type 이 1일 경우에 사용                         
    //취소 컬럼 업데이트 (부분취소 or 전체취소)
    let part_cancel_query = `UPDATE tCR
                                    SET CR_Memo = '${cancel_name}'
                                WHERE CR_PH_ID = (SELECT * FROM (SELECT CR_PH_ID FROM tCR WHERE CR_ID IN (:cr_id) LIMIT 1) AS part) AND
                                    CR_U_ID = :sessionId
                            `

    //취소한 좌석과 금액을 구하는 쿼리
    let select_query = `SELECT 
                                CR_SeatNum, 
                                CR_Price 
                            FROM tCR 
                            WHERE CR_ID IN (:cr_id) AND 
                                tCR.CR_U_ID = :sessionId`;
    


    //관리자 페이지에서 사용할 좌석예매 취소 쿼리
    if(req.query.type == 'admin'){
        connection.query(admin_query, {sessionId, cr_id}, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('/cancel-seat , admin_query ERROR', err);
                        res.json({data : '302'});
                    })
                }
                //취소상태 업데이트
                connection.query(part_cancel_query, 
                    {
                        cr_id, 
                        sessionId
                    },function(err, part_result){
                        //업데이트 성공 시
                        connection.commit(function(err) {
                            if (err) {
                                return connection.rollback(function() {
                                    throw err;
                                });
                            }
                            res.json({data : '201'})
                        });
                    })
        })
    }else{
        //트랜잭션 시작
        connection.beginTransaction(function(err){
            //예매 취소 쿼리 시작
            connection.query(cancel_seat_query,
                {
                    cr_id, sessionId
        
                },function(err, rows, fields) {
                    if (err){
                        connection.rollback(function(){
                            console.log('/cancel-seat , cancel_seat_query ERROR', err);
                        })
                    }
                    //취소한 좌석과 금액을 구하는 쿼리
                    connection.query(select_query,
                        {
                            cr_id, sessionId
                        },
                        function(err, result, fields){
                            if (err){
                                connection.rollback(function(){
                                    console.log('/cancel-seat , select_query ERROR', err);
                                })
                            }
                            //취소상태 업데이트
                            connection.query(part_cancel_query, 
                                {
                                    cr_id, sessionId
                                }
                                ,function(err, part_result){
                                    //취소한 좌석
                                    let over_lap = [];
                                    for(let i=0; i <result.length; i++){
                                        over_lap.push(result[i].CR_SeatNum)
                                    }
                                    // 취소후 사용자에게 보여줄 취소한 좌석
                                    let seat_number = over_lap.join('번,')+'번';
                                    // 취소한 금액
                                    let refund_pay = result.length *result[0].CR_Price

                                    connection.commit(function(err) {
                                        if (err) {
                                            return connection.rollback(function() {
                                                throw err;
                                            });
                                        }

                                        res.json({seats : seat_number, cancelPay : refund_pay})
                                    });
                                });
                        })
                });
        })
    }
})


//예매 취소 전 가능 여부 확인 API
router.post('/user/cancelRes', async (req, res, done) =>{

    //해당 좌석이 입금이 되지 않은 가상계좌일 경우 확인 쿼리
    let vBank_query = `SELECT 
                            CR_PayState 
                        FROM tCR
                        INNER JOIN tCT on tCR.CR_CT_ID = tCT.CT_ID
                        WHERE CR_ID IN (:cr_id) AND  
                        CR_U_Id = :sessionId `  
    
    //해당 좌석이 3일 이내 취소하려는지 확인 쿼리
    let day_query = `SELECT 
                        COUNT(*) count 
                    FROM tCR
                    INNER JOIN tCT on tCR.CR_CT_ID = tCT.CT_ID
                    WHERE CR_ID IN (:cr_id) AND  
                            CR_U_Id = :sessionId AND
                            CT_DepartureTe > date_add(now(),INTERVAL +3 DAY)`;

    //해당 좌석이 계좌이체 인지 확인 쿼리
    let bank_query = `SELECT PH_Type FROM tPH
                            INNER JOIN tCR ON tPH.PH_ID = tCR.CR_PH_ID
                        WHERE CR_ID IN (:cr_id)`                            
                            
    //해당 좌석 출발하였는지 확인 쿼리
    let start_query = `SELECT 
                            tCT.CT_PyStart, 
                            tCT.CT_ID 
                        FROM tCT 
                        INNER JOIN tCR ON tCR.CR_CT_ID = tCT.CT_ID 
                        WHERE tCR.CR_ID IN (:cr_id)`;
           
    //해당 좌석이 승차를 했는지 확인 하는 쿼리
    let scan_query = `SELECT 
                            CR_ScanPy 
                        FROM tCR 
                        WHERE tCR.CR_ID IN (:cr_id) AND 
                              tCR.CR_U_ID =:sessionId `;

    
    let sessionId = req.body.u_id
    let cr_id = req.body.cr_id;

    connection.beginTransaction(function(err){

        //해당 좌석이 입금이 되지않은 가상계좌인지
        connection.query(vBank_query, 
            {
                sessionId : sessionId,
                cr_id : cr_id
            },
            function(err, vBank_row){
                //에러시 롤백 
                if (err){
                    connection.rollback(function(){
                        console.log('/user/cancelRes , vBank_query ERROR', err);
                    })
                }
                if(vBank_row[0].CR_PayState == '결제대기'){
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                throw err;
                            });
                        }
                        //결제대기 상태일땐 어느때나 취소가 가능
                        console.log('/user/cancelRes    200');
                        res.json({data : '200'})
                    });
                }else{
                    //3일 이전에 취소하는 건지
                    connection.query(day_query,
                        {
                            sessionId : sessionId,
                            cr_id : cr_id
                        },
                        function(err, day_rows){
                            //에러시 롤백 
                            if (err){
                                connection.rollback(function(){
                                    console.log('/user/cancelRes , day_query ERROR', err);
                                })
                            }
                            if(day_rows[0].count == 0){
                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            throw err;
                                        });
                                    }
                                    //3일 이내 취소 불가능
                                    console.log('/user/cancelRes    201');
                                    res.json({data : '201'})
                                });
                                
                            }else{
                                //해당 좌석이 계좌이체인지 확인하는 쿼리
                                connection.query(bank_query,
                                    {
                                        cr_id : cr_id
                                    }
                                    ,function(err, bank_row){
                                        if(err){
                                            connection.rollback(function(){
                                                console.log('/user/cancelRes , bank_row ERROR', err);
                                            })
                                        }
                                        //계좌이체 이면 204를 반환
                                        if(bank_row[0].PH_Type === '계좌이체'){
                                            connection.commit(function(err) {
                                                if (err) {
                                                    return connection.rollback(function() {
                                                        throw err;
                                                    });
                                                }
                                                console.log('/user/cancelRes    204');
                                                res.json({data : '204'})
                                            });
                                        }
                                        else{
                                            //해당 좌석이 출발했는지 확인
                                            connection.query(start_query,
                                                {
                                                    sessionId : sessionId,
                                                    cr_id : cr_id
                                                },
                                                function(err, start_row){
                                                    //에러시 롤백 
                                                    if (err){
                                                        connection.rollback(function(){
                                                            console.log('/user/cancelRes , start_query ERROR', err);
                                                        })
                                                    }
                                                    //버스가 평택에서 출발을 했으면 201 반환
                                                    if(start_row[0].CT_PyStart === 'Y'){
                                                        connection.commit(function(err) {
                                                            if (err) {
                                                                return connection.rollback(function() {
                                                                    throw err;
                                                                });
                                                            }
                                                            //이미 출발함
                                                            console.log('/user/cancelRes    202');
                                                            res.json({data : '202'})
                                                        });
                                                    }else{
                                                        //해당 좌석이 승차를 확인했는지
                                                        connection.query(scan_query, 
                                                            {
                                                                sessionId : sessionId,
                                                                cr_id : cr_id
                                                            },
                                                            function(err, scan_row){
                                                                //에러시 롤백 
                                                                if (err){
                                                                    connection.rollback(function(){
                                                                        console.log('/user/cancelRes , scan_query ERROR', err);
                                                                    })
                                                                }
                                                                //승차가 완료되었으면 취소 불가능
                                                                if(scan_row[0].CR_ScanPy == 'Y'){
                                                                    connection.commit(function(err) {
                                                                        if (err) {
                                                                            return connection.rollback(function() {
                                                                                throw err;
                                                                            });
                                                                        }
                                                                        //승차 완료됨
                                                                        console.log('/user/cancelRes    203');
                                                                        res.json({data : '203'})
                                                                    });
                                                                }else{
            
                                                                    //아무런 제약이 없을때 200을 반환한다.
                                                                    connection.commit(function(err) {
                                                                        if (err) {
                                                                            return connection.rollback(function() {
                                                                                throw err;
                                                                            });
                                                                        }
                                                                        //취소 가능
                                                                        console.log('/user/cancelRes    200');
                                                                        res.json({data : '200'})
                                                                    });
                                                                    
                                                                }
            
                                                            })
                                                    }
            
                                                })
                                        }
                                    })
                            }
                    })
                }
            })

    })
});



//마이페이지 예매 및 결제내역
router.post('/user/resPay',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    // count(CR_SeatNum) as seatCnt,
    let query = `SELECT 
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    (select group_concat( ' ', CR_SeatNum)) as seatNumMo,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID,
                    PH_PG_ID,
                    PH_CodeType,
                    CR_PayState,
                    tCR.CR_cDt as no	
                FROM tCT
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                WHERE tCR.CR_CT_ID = tCT.CT_ID and 
                      tCR.CR_U_ID = :sessionId
                GROUP BY tCR.CR_cDt
                ORDER BY no DESC
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

//마이페이지 예매 및 결제내역 모바일
router.post('/user/resPayMo',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let query = `SELECT 
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_cDt as crCdt,
                    PH_PG_ID,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID,
                    tCR.CR_cDt as no
                FROM tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                WHERE 
                    tCR.CR_CT_ID = tCT.CT_ID and 
                    tCR.CR_U_ID = :sessionId
                GROUP BY tCR.CR_cDt
                ORDER BY no DESC
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
    let query = `SELECT 
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    (select group_concat( ' ', CR_SeatNum)) as seatNumMo,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_cDt as crCdt,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID,
                    PH_PG_ID,
                    PH_CodeType,
                    CR_PayState,
                    tCR.CR_cDt as no
                FROM tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                WHERE 
                    tCR.CR_CT_ID = tCT.CT_ID AND 
                    tCR.CR_U_ID = :sessionId AND 
                    tCR.CR_cDt between date(:deptDay) AND 
                    DATE_ADD(:endDay, INTERVAL 1 DAY)
                GROUP BY tCR.CR_cDt
                ORDER BY no DESC
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



//마이페이지 예매 및 결제내역 상세보기 모바일
router.post('/user/resPayDetailMo',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let moCtId = req.body.ctId;
    let moPhId = req.body.phId;
    let query = `SELECT
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d') as deptYM,
                    date_format(tCT.CT_DepartureTe,'%H:%i') as deptTM,
                    DAYOFWEEK(tCT.CT_DepartureTe) AS deptWeek,
                    DAYOFWEEK(tCT.CT_DepartureTe) AS payWeek,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    (select group_concat( ' ', CR_SeatNum)) as seatNumMo,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    PH_PG_ID,
                    CR_PayState,
                    PH_CodeType,
                    CR_cDt as crCdt,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID
                FROM tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                WHERE 
                    tCR.CR_CT_ID = tCT.CT_ID AND
                    tCR.CR_CT_ID = :moCtId AND
                    tCR.CR_PH_ID = :moPhId AND 
                    tCR.CR_U_ID = :sessionId
                GROUP BY tCR.CR_cDt
                ORDER BY PayDay DESC
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
router.get('/user/resCancelList', auth.isLoggedIn, (req, res, next) =>{
    let query = `   SELECT
                        date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                        date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                        date_format(tCR.CR_CancelDt,'%y%y.%m.%d %H:%i') as cancelDay,
                        CR_SeatNum,
                        (select group_concat( ' ', CR_SeatNum)) as seatNumMo,
                        tPH.PH_Type as payType,
                        tPH.PH_Price as price,
                        CR_CT_ID as ctId,
                        CR_PH_ID as phId
                    FROM tCT 
                        left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                        left join tB on tCY.CY_B_ID = tB.B_ID 
                        left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                        left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    WHERE 
                        tCR.CR_CT_ID = tCT.CT_ID AND 
                        tCR.CR_Cancel = :crCancel AND
                        tCR.CR_U_ID = :sessionId
                    GROUP BY tCR.CR_cDt
                    ORDER BY cancelDay DESC`;

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
    let query = `   SELECT 
                        date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                        date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                        date_format(tCR.CR_CancelDt,'%y%y.%m.%d %H:%i') as cancelDay,
                        count(CR_SeatNum) as seatCnt,
                        (select group_concat( ' ', CR_SeatNum)) as seatNumMo,
                        tPH.PH_Type as payType,
                        CR_CT_ID as ctId,
                        CR_PH_ID as phId,
                        tPH.PH_Price as price	
                    FROM tCT 
                        left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                        left join tB on tCY.CY_B_ID = tB.B_ID 
                        left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                        left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    WHERE 
                        tCR.CR_CT_ID = tCT.CT_ID AND 
                        tCR.CR_Cancel = :crCancel AND 
                        tCR.CR_U_ID = :sessionId AND 
                        tCR.CR_CancelDt between date(:cancelDeptDay) AND 
                        DATE_ADD(:cancelEndDay, INTERVAL 1 DAY)
                    GROUP BY tCR.CR_cDt
                    ORDER BY cancelDay DESC
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
    let query = `SELECT 
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    date_format(tCR.CR_CancelDt,'%y%y.%m.%d %H:%i') as cancelDay,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_CT_ID as ctId,
                    CR_PH_ID as phId	
                FROM tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                WHERE 
                    tCR.CR_CT_ID = tCT.CT_ID AND 
                    tCR.CR_Cancel = :crCancel AND 
                    tCR.CR_U_ID = :sessionId
                GROUP BY tCR.CR_cDt
                ORDER BY PayDay DESC`;

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
    let query = `SELECT 
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d') as deptYM,
                    date_format(tCT.CT_DepartureTe,'%H:%i') as deptTM,
                    DAYOFWEEK(tCT.CT_DepartureTe) AS deptWeek,
                    DAYOFWEEK(tCT.CT_DepartureTe) AS payWeek,
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    date_format(tCR.CR_CancelDt,'%y%y.%m.%d %H:%i') as cancelDay,
                    (select group_concat( ' ', CR_SeatNum)) as seatNumMo,
                    CR_SeatNum ,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    tB.B_Name as carName,
                    CR_CT_ID as ctId,
                    CR_PH_ID as phId
                FROM tCT
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                WHERE 
                    tCR.CR_CT_ID = tCT.CT_ID AND 
                    tCR.CR_Cancel = :crCancel and 
                    tCR.CR_U_ID = :sessionId and 
                    CR_CT_ID = :ctId and 
                    CR_PH_ID = :phId
                GROUP BY tCR.CR_cDt
                ORDER BY PayDay DESC`;

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


//결제전 버스 출발 확인
router.get('/bus_check', auth.isLoggedIn, function(req, res){

    //결제 전 버스출발 확인 쿼리
    let checkQuery = `SELECT 
                            tCT.CT_PyStart 
                        FROM tCT 
                        WHERE CT_ID = :ct_id`;
    let ct_id = req.query.ct_id;

    connection.query(checkQuery, {ct_id : ct_id},
        function(err, checkRow){
            if (err) throw err;
            if(checkRow[0].CT_PyStart === 'Y'){
                res.json({data : '500'});
            }else{
                res.json({data : '101'});
            }
    })

})

router.get('/ordernumber', function(req, res){

    let query = `SELECT * FROM tPH ORDER BY PH_ID DESC LIMIT 1`;

    connection.query(query,
        function(err, result){
            if (err) throw err;
            //주문 번호
            let order_number;
            let default_number;
                    
            //데이터가 완전히 없을때
            if(result.length == 0){
                //처음 주문번호로 시작
                default_number = 1;
                //주문번호 생성
                order_number = getToday() + default_number.toString().padStart(6,'0');
            }else{
                default_number = result[0].PH_OrderNumber

                //기본값이 null 일때
                if(default_number == null){
                    //처음 주문번호로 시작
                    default_number = 1;
                    //주문번호 생성
                    order_number = getToday() + default_number.toString().padStart(6,'0');
                }else{
                    //날짜가 다른경우
                    if(default_number.substr('0','6') != getToday()){
                        //다시 처음 주문번호로 시작
                        default_number = 1;
                        order_number = getToday() + default_number.toString().padStart(6,'0');
                    }
                    //당일 추가 주문 건
                    else{
                        //Number 치환 후 + 1
                        default_number = (Number(default_number.substr('6','6').replace(/(^0+)/, ""))+1)
                        order_number = getToday() + default_number.toString().padStart(6,'0');
                    }
                }
            }
            res.json({data : order_number})
    })
})

//현재 날짜 계산
function getToday(){
    var date = new Date();
    var year_toString = date.getFullYear().toString();
    var year = year_toString.substr(2,4)
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    return year + month + day;
}

//결제 버튼 클릭시 해당 좌석 비활성화
router.post('/temporary_seat', async function(req, res){
    connection.beginTransaction(function(err){

        let u_id = req.body.user_id; //등록할 회원 아이디
        let seatNums = req.body['seatNums']; // 등록할 좌석
        let ct_id = req.body.ct_id // 등록할 장차
        let str_values_list = [];
        let str_values ="";
        let overlap_query = `SELECT 
                                CR_ID, 
                                CR_U_ID
                             FROM tCR 
                             WHERE CR_CT_ID = ${ct_id} AND 
                                   CR_Cancel = 'N' AND
                                   CR_SeatNum IN (${seatNums})
                                `;

        let cr_query = `
            INSERT INTO tCR
                (CR_CT_ID, CR_U_ID, CR_SeatNum, CR_Memo)
            VALUES
        `;
        
        if( typeof(seatNums) === "object"){ //선택한 좌석이 2개 이상
            for(let i=0; i<seatNums.length; i++){
                str_values_list.push(`(${ct_id}, ${u_id}, ${seatNums[i]}, '진행중')`)
            }
            str_values = str_values_list.join(', ');
        } else if(typeof(seatNums) === "string" ){ // 선택한 좌석이 1개
            str_values = `(${ct_id}, ${u_id}, ${seatNums}, '진행중')`;
        }

        cr_query += str_values;


        connection.query(overlap_query,function(err, rows){
            if(err) throw err;
            if(rows.length > 0 && rows[0].CR_U_ID == u_id){
                //사용자가 예약한 좌석이면
                res.json({data : "continue"});
            }else if(rows.length > 0 && rows[0].CR_U_ID != u_id){
                //사용자가 예약한 좌석이 아니면
                res.json({data : "fail"})
            }else{
                connection.query(cr_query, null,
                    function(err, result) {
                        if (err){
                            console.log('error :', err);
                            connection.rollback(function(){
                                res.json({data : 201});
                            })
                        } 
                        
                        connection.commit(function(err) {
                            if (err) {
                                console.log('error :', err);
                                return connection.rollback(function() {
                                    throw err;
                                });
                            }
                            res.json({data : 'success'});    
                        });
        
                    });
            }
        })
    })
})

//결제 버튼 클릭시 해당 좌석 비활성화 삭제@@
router.delete('/temporary_seat_delete', async function(req, res){
    connection.beginTransaction(function(err){

        if(err){
            console.log('ERR !',err);
            res.json({data :  '302'});
        }else{
            let u_id = req.body.user_id; //등록할 회원 아이디
            let seatNums = req.body['seatNums']; // 등록할 좌석
            let ct_id = req.body.ct_id // 등록할 장차
            let pay_check = req.body.pay_check;
    
            let query = `DELETE FROM tCR WHERE 
                            CR_CT_ID = ${ct_id} AND 
                            CR_U_ID = ${u_id} AND
                            CR_Cancel = 'N' AND
                            CR_SeatNum IN (${seatNums})`
    
            if(pay_check == ""){
                if(seatNums != undefined){
                    connection.query(query, 
                        function(err, result) {
                            if (err){
                                connection.rollback(function(){
                                    res.json({data : 201});
                                })
                            } 
            
                            connection.commit(function(err) {
                                if (err) {
                                    return connection.rollback(function() {
                                        throw err;
                                    });
                                }
                                res.json({data : 'success'});    
                            });
            
                        });
                }else{
                    res.json({data : 202});
                }
            }else{
                res.redirect('/complete');
            }
        }
    })
})

//인터넷 창 강제 조료시 해당 좌석 비활성화 삭제 아이폰용
router.delete('/temporary_seat_delete_ios', async function(req, res){
    connection.beginTransaction(function(err){

        if(err){
            console.log('ERR !',err);
            res.json({data :  '302'});
        }else{
            let u_id = req.body.user_id; //등록할 회원 아이디
    
            let query = `DELETE FROM tCR WHERE 
                            CR_U_ID = ${u_id} AND
                            CR_Cancel = 'N' AND
                            CR_PH_ID IS NULL`
    
            connection.query(query, 
                function(err, result) {
                    if (err){
                        connection.rollback(function(){
                            res.json({data : 201});
                        })
                    } 
    
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                throw err;
                            });
                        }
                        res.json({data : 'success'});    
                    });
    
                });
        }
    })
})

//무통장 입금, 후불 결제 등 예매 직후 시간부터 하루내에 결제가 이루어 지지 않으면 예매 취소
function cancelNonDeposit(){
    connection.beginTransaction(function(err){
        if(err) throw err;
        let query = `UPDATE tCR SET
                            CR_Cancel = 'Y',
                            CR_CancelDt = NOW(),
                            CR_PayState = '결제취소',
                            CR_Memo = '자동취소'
                        WHERE CR_PayState = '결제대기' AND
                            DATE_ADD(CR_cDt, INTERVAL + 24 HOUR) < NOW()
                    `
                              
        connection.query(query,function(err, rows){
            if(err){
                connection.rollback(function(){
                    console.log('Err',err);
                })
            }else{
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            throw err;
                        });
                    }
                    console.log('Success');
                });
            }
        })
    })
}

//미입금의 가상계좌 내용 이노페이에 취소 요청
function vBankInterval(){
    let query = `SELECT * FROM tCR 
                    INNER JOIN tPH ON tCR.CR_PH_ID = tPH.PH_ID
                WHERE PH_Type = '무통장입금' AND 
                        CR_PayState = '결제대기' AND
                        DATE_ADD(CR_cDt, INTERVAL + 24 HOUR) < NOW()                
                GROUP BY PH_BankNumber`
                
    connection.query(query, function(err, rows){
        if(err) throw err;
        // res.json({data : rows})
        console.log('rows',rows);
        if(rows.length > 0){
            let tid = rows[0].PH_PG_ID               // 결제 고유번호
            let moid = rows[0].PH_OrderNumber   // 주문번호
            let pay = rows[0].PH_OPrice              // 결제 가격
            let vbank_code = rows[0].PH_BankCode   // 은행코드
            let vbank_num = rows[0].PH_BankNumber // 가상계좌 번호
                
            //post 요청 
            //중요 !! async 동기 요청을 하기 때문에 request-sync 모듈을 사용함!
            //참조 https://github.com/request/request-promise
            let sync_res = sync_request('POST','https://api.innopay.co.kr/api/vbankCancel', {
                json: { 
                    "mid" : "pgaz369azm", //상점 아이디
                    "licenseKey": "fx/UT4tcb5VWxP24BXiwH0stdJnNxFf6GpdFdvd42Bmwnurd/1QgGPORTIfioiAVy/B0cx6j5spsDwAfGsleuQ==", // 라이센스 키
                    "tid" : tid, // 결제 고유번호
                    "moid" : moid, // 주문번호
                    "amt" : pay, // 결제 가격
                    "vbankBankCode" : vbank_code, // 은행코드
                    "vbankNum" : vbank_num // 가상계좌 번호
                }
           })
           let test_user = JSON.parse(sync_res.getBody('utf-8'));
           console.log('test',test_user);
        }else{
            console.log('취소할 24시간이 지난 가상계좌는 없음');
        }

    })
}

//노드 스케쥴 선언
var schedule_rule = new schedule.RecurrenceRule(); 
//매시간 0분에 실행 선언
schedule_rule.minute = 0;
//매시간 정각에 취소 실행
let cancel_non_deposit = schedule.scheduleJob(schedule_rule, () => {
    cancelNonDeposit();
    vBankInterval();
    console.log('미입금 취소!')
})

//좌석 예매 강제종료 시 좌석 초기화 안되는 부분 처리 함수
function exceptionEnd(){
    //20분이 지난 진행중인 좌석을 찾아서 삭제 쿼리
    let del_query = `DELETE FROM tCR
                        WHERE CR_ID IN (
                                         SELECT 
                                            CR_ID 
                                         FROM (SELECT 
					                                CR_ID 
					                            FROM tCR
					                            WHERE CR_Memo = '진행중' AND
					                                  DATE_ADD(CR_cDt, INTERVAL + 20 minute) < NOW()) AS temp)`                                                      

    connection.beginTransaction(err => {
        if(err) throw err;

        connection.query(del_query, function(err, rows){
            if(err){
                connection.rollback(function(){
                    //처리 중 에러시 롤백 시킴
                    console.log('Error ROLLBACK exceptionEnd()', err);
                })
            }
            //오류가 발생하지 않으면 
            connection.commit(function(err) {
                if (err) {
                    return connection.rollback(function() {
                        throw err;
                    });
                }
                console.log('강제종료로 인한 좌석 초기화', rows);  
            });
        })
    })
}

//20분마다 exceptionEnd() 함수 실행
setInterval(exceptionEnd, 1000 * 60 * 20)

//후불결제의 경우 결제처리 완료 후 정상데이터로 업데이트
router.post('/my-payment', auth.isLoggedIn, async (req, res) =>{
    connection.beginTransaction(function(err){

        let cardName = req.body.card_name; //카드사명,은행사명
        let pg_id = req.body.tid;
        let ph_type; //결제수단
        let cancel_type; // 취소코드
        let bank_cd = ''; //은행코드
        let pay_ph_id = req.body.pay_ph_id;

        if(req.body.bankCd){
            bank_cd = req.body.bankCd
        }

        if(req.body.cancel_type == 'CARD'){
            ph_type = '신용카드';
            cancel_type = "01";
        }else if(req.body.cancel_type == 'free'){
            ph_type = '무료에매';
            cancel_type = "00";
        }else if(req.body.cancel_type == "BANK"){
            ph_type = '계좌이체';
            cancel_type = "02";
        }else if(req.body.cancel_type == "VBANK"){
            ph_type = '무통장입금';
            cancel_type = "03";
        }else if(req.body.cancel_type == "EPAY"){
            ph_type = req.body.EPayType;
            cancel_type = "16";
        }
        let udt_query = `UPDATE tCR INNER JOIN tPH ON tCR.CR_PH_ID = tPH.PH_ID
                                SET 
                                    CR_Memo = '',
                                    CR_PayState = '결제완료',
                                    PH_PG_ID = '${pg_id}',
                                    PH_Type = '${ph_type}',
                                    PH_CodeType = '${cancel_type}',
                                    PH_CardName = '${cardName}',
                                    PH_BankCode = '${bank_cd}'
                                WHERE PH_ID = ${pay_ph_id}`

        connection.query(udt_query,
            function(err, result){
                if (err){
                    connection.rollback(function(){
                        console.log('my-payment eroor :', err);
                        //실패
                        res.json({data : '0'});    
                    })
                }
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            throw err;
                        });
                    }
                    //입력 성공
                    res.json({data : '1'});    
                });
        })
    })
})

//결제완료
router.post('/payment', auth.isLoggedIn, async (req, res) =>{
    connection.beginTransaction(function(err){

        let str_values_list = [],
        str_values ="",
        seatNums = req.body['seatNums'], // 선택 좌석
        ct_id = req.body.ct_id, // 차량 ID
        oPrice = req.body.oPrice, // 원가격
        sPrice = req.body.sPrice, // 세일가격
        moid = req.body.moid, // 주문번호
        price = ((oPrice-sPrice) < 0) ? 0 : (oPrice-sPrice);
        // ph_type = '-'; // 무료기간동안만 - 으로 넣음.
        let ph_type; //결제수단
        let pg_id; //거래 고유 아이디
        let u_id = req.body.user_id //등록할 회원 아이디
        let cr_memo; // 메모
        let cancel_type; // 취소코드
        let cardName; //카드사, 은행사명
        let bankNum = req.body.bank_number; //가상계좌
        let payState; //결제 상태
        let bank_cd = req.body.bankCd; // 은행코드
        

        if(req.body.card_name == undefined){
            cardName = req.body.bank_name;
        }

        if(req.body.bank_name == undefined){
            cardName = req.body.card_name;
        }

        if(req.body.cancel_type == 'CARD'){
            ph_type = '신용카드';
            cr_memo = "";
            cancel_type = "01";
            payState = "결제완료"
        }else if(req.body.cancel_type == 'free'){
            ph_type = '무료에매';
            cr_memo = '무료예매';
            cancel_type = "00";
            payState = "결제완료"
        }else if(req.body.cancel_type == "BANK"){
            ph_type = '계좌이체';
            cr_memo = "";
            cancel_type = "02";
            payState = "결제완료"
        }else if(req.body.cancel_type == "VBANK"){
            ph_type = '무통장입금';
            cr_memo = "";
            cancel_type = "03";
            payState = "결제대기"
        }else if(req.body.cancel_type == "EPAY"){
            ph_type = req.body.EPayType;
            cr_memo = "";
            cancel_type = "16";
            payState = "결제완료"
        }


        if(req.body.tid != undefined){
            pg_id = req.body.tid;
        }else{
            //후불결제일 경우
            pg_id = '1';
        }
        //결제 전 중복확인 쿼리
        let selectQuery = `SELECT 
                                    *    
                            FROM tCR 
                            WHERE 1=1 
                                AND tCR.CR_CT_ID = :ct_id 
                                AND CR_Cancel = 'N' 
                                AND tCR.CR_SeatNum IN (:seatNums)`;

        //결제 전 버스출발 확인 쿼리
        let checkQuery = `SELECT tCT.CT_PyStart FROM tCT WHERE CT_ID = :ct_id`;
        
        let ph_query = `
            INSERT INTO tPH
                (PH_U_ID, PH_PG_ID, PH_OrderNumber, PH_Price, PH_OPrice, PH_SPrice, PH_Type, PH_CodeType, PH_CardName, PH_BankNumber, PH_BankCode)
            VALUES
                (:u_id, :pg_id, :moid, :price, :oPrice, :sPrice, :ph_type, :cancel_type, :cardName, :bankNum, :bank_cd)
        `;

        let delete_query = `DELETE FROM tCR WHERE 
                                CR_CT_ID = ${ct_id} AND 
                                CR_U_ID = ${u_id} AND
                                CR_Cancel = 'N' AND
                                CR_SeatNum IN (${seatNums})`
        
        connection.query(delete_query, function(err){
            if(err){
                connection.rollback(function(){
                    res.json({data : '502'})
                })
            }else{
                connection.query(checkQuery, {ct_id : ct_id},
                    function(err, checkRow){
                        if (err) throw err;
                        if(checkRow[0].CT_PyStart === 'Y'){
                            res.json({data : '500'});
                        }else{
                            //결제 전 중복확인
                            connection.query(selectQuery, {ct_id, seatNums},
                                function(err, rows, fields) {
                                    if (err){
                                        connection.rollback(function(){
                                            throw err;
                                        })
                                    }       


                                    let one_price = req.body.oPrice / req.body.seatNums.length;
                                    if(rows.length == 0){
                                        //  결제 내역 먼저 추가. 
                                        connection.query(ph_query, {
                                            u_id    : u_id,
                                            moid    : moid,
                                            oPrice  : oPrice,
                                            sPrice  : sPrice,
                                            price   : (oPrice-sPrice),
                                            ph_type : ph_type,
                                            pg_id   : pg_id,
                                            cancel_type : cancel_type,
                                            cardName : cardName,
                                            bankNum : bankNum,
                                            bank_cd : bank_cd
                                        }, function (err, result){
                                            if (err){
                                                connection.rollback(function(){
                                                    throw err;
                                                })
                                            }
                                            let ph_id = result.insertId;
                                            let origin_qrcode=[];
                                            let hash_qrcode = [];
                                            for(let i =0; i<seatNums.length; i++){
                                                origin_qrcode.push(ct_id+'-'+u_id+'-'+ph_id+'-'+seatNums[i]);
                                                hash_qrcode.push(CryptoJS.AES.encrypt(origin_qrcode[i], config.enc_salt).toString());
                                            }
                                            console.log('origin:',origin_qrcode);
                                            

                                            let cr_query = `
                                                INSERT INTO tCR
                                                    (CR_CT_ID, CR_U_ID, CR_PH_ID, CR_SeatNum, CR_Price, CR_QrCode, CR_Memo, CR_PayState)
                                                VALUES
                                            `;
                                            
                                            //쿼리 추가
                                            if( typeof(seatNums) === "object"){ //선택한 좌석이 2개 이상
                                                for(let i=0; i<seatNums.length; i++){
                                                    str_values_list.push(`(${ct_id}, ${u_id}, ${ph_id}, ${seatNums[i]}, ${one_price}, '${hash_qrcode[i]}', '${cr_memo}','${payState}')`)
                                                }
                                                // seatNums.map((seatNum)=>{
                                                //     str_values_list.push(`(${ct_id}, ${req.user.U_ID}, ${ph_id}, ${seatNum}, ${one_price}, ${hash_qrcode})`);
                                                // });
                                                str_values = str_values_list.join(', ');
                                            } else if(typeof(seatNums) === "string" ){ // 선택한 좌석이 1개
                                                str_values = `(${ct_id}, ${u_id}, ${ph_id}, ${seatNums}, ${oPrice}, '${hash_qrcode}', '${cr_memo}','${payState}')`;
                                            }
                                        
                                            cr_query += str_values;
                                            //  예약 정보 추가
                                            connection.query(cr_query, null,
                                                function(err, result) {
                                                    if (err){
                                                        connection.rollback(function(){
                                                            throw err;
                                                       })
                                                    }
                                                    connection.commit(function(err) {
                                                        if (err) {
                                                            return connection.rollback(function() {
                                                                throw err;
                                                            });
                                                        }
                                                        res.json({
                                                            ph_type : ph_type,
                                                            price : price,
                                                            data : '1'
                                                        });    
                                                    });
                                                });
                                        });
                                }else{
                                    let over_lap = [];
                                    for(let i=0; i <rows.length; i++){
                                        over_lap.push(rows[i].CR_SeatNum)
                                    }
                                    let seat_number = over_lap.join('번,')+'번';
                                    res.json({data : '0', seats : seat_number})
                                }
                            }); 
                        }
                })
            }
        })
    })
});


//장차예매 리스트
router.post('/user/resDept', auth.isLoggedIn, (req, res, next) =>{
    let query = `
                SELECT 
                    distinct date_format(CT_DepartureTe,'%H%i') as deptTe, 
                    date_format(CT_DepartureTe,'%H:%i') as deptTe2
                FROM tCT`;

    connection.query(query,
        function(err, rows, fields) {
            if (err) throw err;                       
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows : ",rows);            
        });       
});

//기사앱 좌석 리스트
router.post('/driver_seat',(req, res, next) =>{

    let driver_query = `SELECT
                            tCT.CT_ID as ctID,
                            tB.B_Name as b_name,
                            tCT.CT_PyStart,
                            tCT.CT_SeStart,
                            date_format(tCT.CT_DepartureTe,'%Y.%m.%d %H:%i') as deptTe,
                            date_format(tCT.CT_DepartureTe,'%Y.%m.%d') as deptYM,
                            date_format(tCT.CT_ReturnTe,'%Y.%m.%d %H:%i') as retuTe,
                            date_format(tCT.CT_ReturnTe,'%Y.%m.%d') as retuYM,
                            date_format(tCT.CT_DepartureTe,'%m.%d') as startDay,
                            date_format(tCT.CT_DepartureTe,'%H:%i') as startTime,
                            date_format(tCT.CT_ReturnTe,'%H:%i') as returnTime,
                            DAYOFWEEK(tCT.CT_DepartureTe) AS deptDay,
                            DAYOFWEEK(tCT.CT_ReturnTe) AS retnDay,
                            tCT.CT_CarNum as carNum,
                            (SELECT right(CT_CarNum, 4)) AS backNum,
                            (select count(tCR.CR_SeatNum) from tCR where tCR.CR_CT_ID =tCT.CT_ID AND CR_Cancel = 'N') as available_seat_cnt,
                            tCY.CY_Totalpassenger as total_passenger,
                            tCY.CY_SeatPrice as seatPrice,
                            tCY.CY_ID,
                            tCY.CY_Ty,
                            tCY.CY_TotalPassenger
                        FROM tCT 
                            left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                            left join tB on tCY.CY_B_ID = tB.B_ID
                        WHERE
                            tCT.CT_ReturnTe > date_add(now(),INTERVAL + 5 HOUR)
                            ORDER BY tCT.CT_DepartureTe ASC LIMIT 1`;

    //기사앱 쿼리
    connection.query(driver_query,
        function(err, rows, fields) {
            if (err) throw err;                       
            // //console.log(findId);
            let driver_ctid = rows[0].ctID;
            let driver_scan_query = `SELECT 
                                        tCR.CR_CT_ID,
                                        tCR.CR_SeatNum, 
                                        tCR.CR_ScanPy, 
                                        tCR.CR_ScanSe 
                                    FROM tCR 
                                    WHERE 
                                        tCR.CR_CT_ID = :driver_ctid AND
                                        tCR.CR_Cancel = 'N' AND
                                        (tCR.CR_ScanPy = 'Y' OR 
                                        tCR.CR_ScanSe = 'Y')`; 
            
            connection.query(driver_scan_query, {driver_ctid : driver_ctid},
                function(err, result, fields) {
                    if (err) throw err;                       
    
                    res.json( {data : rows, scan_seat : result});
                    
                });
        });

});


//장차예매 리스트 로그인 제외
router.post('/user/resCarList',(req, res, next) =>{
    //기본 쿼리
    let query = `SELECT
                    tCT.CT_ID as ctID,
                    tB.B_Name as b_name,
                    tCT.CT_PyStart,
                    date_format(tCT.CT_DepartureTe,'%Y.%m.%d %H:%i') as deptTe,
                    date_format(tCT.CT_DepartureTe,'%Y.%m.%d') as deptYM,
                    date_format(tCT.CT_ReturnTe,'%Y.%m.%d %H:%i') as retuTe,
                    date_format(tCT.CT_ReturnTe,'%Y.%m.%d') as retuYM,
                    date_format(tCT.CT_DepartureTe,'%m.%d') as startDay,
                    date_format(tCT.CT_DepartureTe,'%H:%i') as startTime,
                    date_format(tCT.CT_ReturnTe,'%H:%i') as returnTime,
                    DAYOFWEEK(tCT.CT_DepartureTe) AS deptDay,
                    DAYOFWEEK(tCT.CT_ReturnTe) AS retnDay,
                    tCT.CT_CarNum as carNum,
                    (SELECT right(CT_CarNum, 4)) AS backNum,
                    (select count(tCR.CR_SeatNum) from tCR where tCR.CR_CT_ID =tCT.CT_ID AND CR_Cancel = 'N') as available_seat_cnt,
                    tCY.CY_Totalpassenger as total_passenger,
                    tCY.CY_SeatPrice as seatPrice,
                    tCY.CY_ID,
                    tCY.CY_Ty,
                    tCY.CY_TotalPassenger
                FROM tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID
                WHERE 
                    tCT.CT_PyStart = 'N' AND
                    tCT.CT_DepartureTe > DATE_ADD(NOW(),INTERVAL -40 HOUR_MINUTE)
                ORDER BY tCT.CT_DepartureTe ASC LIMIT 1`;

    connection.query(query,
        function(err, rows, fields) {
            if (err) throw err;           
            //기사가 평택을 출발했을때 다음 예매정보 표시            
            if(rows.length != 0 && rows[0].CT_PyStart === 'Y'){
                let next_bus = rows[0].deptTe;
                let next_query = `SELECT
                                tCT.CT_ID as ctID,
                                tB.B_Name as b_name,
                                tCT.CT_PyStart,
                                date_format(tCT.CT_DepartureTe,'%Y.%m.%d %H:%i') as deptTe,
                                date_format(tCT.CT_DepartureTe,'%Y.%m.%d') as deptYM,
                                date_format(tCT.CT_ReturnTe,'%Y.%m.%d %H:%i') as retuTe,
                                date_format(tCT.CT_ReturnTe,'%Y.%m.%d') as retuYM,
                                date_format(tCT.CT_DepartureTe,'%m.%d') as startDay,
                                date_format(tCT.CT_DepartureTe,'%H:%i') as startTime,
                                date_format(tCT.CT_ReturnTe,'%H:%i') as returnTime,
                                DAYOFWEEK(tCT.CT_DepartureTe) AS deptDay,
                                DAYOFWEEK(tCT.CT_ReturnTe) AS retnDay,
                                tCT.CT_CarNum as carNum,
                                (SELECT right(CT_CarNum, 4)) AS backNum,
                                (select count(tCR.CR_SeatNum) from tCR where tCR.CR_CT_ID =tCT.CT_ID AND CR_Cancel = 'N') as available_seat_cnt,
                                tCY.CY_Totalpassenger as total_passenger,
                                tCY.CY_SeatPrice as seatPrice,
                                tCY.CY_ID,
                                tCY.CY_Ty,
                                tCY.CY_TotalPassenger
                            FROM tCT 
                                left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                                left join tB on tCY.CY_B_ID = tB.B_ID
                            WHERE 
                                tCT.CT_DepartureTe > NOW() AND
                                tCT.CT_DepartureTe > :next_bus
                            ORDER BY tCT.CT_DepartureTe ASC LIMIT 1`;

                connection.query(next_query, {next_bus : next_bus}, 
                    function(err, result){
                        if (err) throw err;
                        res.json({data : result});
                })

            }else{
                connection.query(query,
                    function(err, rows){
                        if (err) throw err;
                        function getInputDayLabel(date) {
                            console.log('data',date);
                            var week = new Array('일', '월', '화', '수', '목', '금', '토');
                            var today = new Date(date).getDay();
                            console.log('today',today);
                            var todayLabel = week[today];
                            return todayLabel;
                        }
                        if(rows.length == 0){
                            res.json({data : rows});    
                        }else{
                            console.log('get',getInputDayLabel(rows[0].deptTe));
                            res.json({data : rows, dept : getInputDayLabel(rows[0].deptTe), return : getInputDayLabel(rows[0].retuTe)});
                        }
                        
                })
            }
            
        });

});


// CT_ID로 예약된 좌석 정보 가져오기
router.get('/useSeat/:ct_id', (req, res, next) =>{
    let query = `select CR_ID, CR_SeatNum from tCR where CR_CT_ID = :ct_id and CR_Cancel = 'N' `;
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


//비디오 팝업
router.post('/user/videoPopup', (req, res, next) =>{
    let query = `select 
                        YL_id,
                        YL_url,
                        YL_title,
                        YL_description,
                        YL_ch_name,
                        YL_d_order,
                        DATE_FORMAT(YL_dDt, '%y%y-%m-%d') YL_dDt
                FROM tYL 
                WHERE 
                    YL_id = :youId`;
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
router.get('/video/best', function(req, res, next) {
    let query = `SELECT 
                        YL_id,
                        YL_url,
                        YL_title,
                        YL_description,
                        YL_ch_name,
                        YL_d_order,
                        DATE_FORMAT(YL_dDt, '%y%y-%m-%d') YL_dDt
                FROM tYL
                    WHERE 
                        YL_d_order = 'Y' 
                    ORDER BY rand() limit 1`; 
    connection.query(query,
      function(err, rows, fields) {
          if (err) throw err;
          res.send( { data : rows});
      });
});

//사이니지


//대분류 카테고리
router.get('/categoryLV1', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select distinct(BCR_LV1_BC_ID), BC_NameEng, BC_NameKor from tBCR INNER join tBC on tBCR.BCR_LV1_BC_ID = tBC.BC_ID', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//중분류 카테고리
router.get('/categoryLV2', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tBC INNER join tBCR on tBC.BC_ID = tBCR.BCR_LV2_BC_ID', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});



//전체 브랜드 리스트
router.get('/brandList', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query(`
            select 
                BS_NameKor, 
                BS_NameEng, 
                tBCR.BCR_ID, 
                BCR_LV1_BC_ID, 
                BCR_LV2_BC_ID, 
                BCR_LV3_BC_ID, 
                tBS.BS_ID, 
                BS_BC_ID, 
                BS_LoginID, 
                BS_LoginPW, 
                BS_CEO, 
                BS_Phone, 
                BS_CEOPhone, 
                BS_Addr1Kor, 
                BS_Addr2Kor, 
                BS_Addr1Eng, 
                BS_Addr2Eng, 
                convert(varchar, BS_MainDtS, 108) as BS_MainDtS,
                convert(varchar, BS_MainDtf, 108) as BS_MainDtF, 
                convert(varchar, BS_SubDtS, 108) as BS_SubDtS, 
                convert(varchar, BS_SubDtF, 108) as BS_SubDtF, 
                BC_NameKor, 
                BC_NameEng,
                convert(varchar, BS_BreakDtS, 108) as BS_BreakDtS, 
                convert(varchar, BS_BreakDtF, 108) as BS_BreakDtF,
                BS_ContentsKor, 
                BS_ContentsEng, 
                BS_ThumbnailUrl, 
                BS_PersonalDayKor, 
                BS_PersonalDayEng,  
                BS_ImageUrl,
                tLS.LS_Number, 
                LS_Sector, 
                LS_Floor 
            from tBCR 
                INNER join tBSxtBCR on tBCR.BCR_ID = tBSxtBCR.BCR_ID 
                INNER join tBS on tBS.BS_ID = tBSxtBCR.BS_ID
                INNER join tBSxtLS on tBSxtLS.BS_ID = tBS.BS_ID 
                INNER join tLS on tLS.LS_Number = tBSxtLS.LS_Number
                INNER join tBC on tBC.BC_ID = tBCR.BCR_LV2_BC_ID`,
        (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//언어선택
router.get('/language', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tME', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//svg파일 호수 맵핑
router.get('/storeInfo', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query(
            `SELECT 
                LS_Number, 
                tBS.BS_ID, 
                BS_BC_ID, 
                BS_NameKor, 
                BS_NameEng,
                BC_NameKor, 
                BC_NameEng 
            FROM tBSxtLS 
                INNER join tBS on tBSxtLS.BS_ID = tBS.BS_ID 
                INNER join tBC on tBC.BC_ID = tBS.BS_BC_ID`, 
        (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//전체 중복제거 브랜드 리스트
router.get('/brandListOverLap', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        let req_type = req.query.type;
        let query = `
                    select 
                        tBS.BS_ID,
                        BS_LoginID, 
                        BS_LoginPW, 
                        BS_CEO, 
                        BS_NameKor, 
                        BS_NameEng, 
                        BC_NameKor,
                        BC_NameEng,
                        tBCR.BCR_ID, 
                        BS_Phone,
                        BS_CEOPhone,
                        BCR_LV1_BC_ID, 
                        BCR_LV2_BC_ID, 
                        BCR_LV3_BC_ID, 
                        BS_BC_ID, 
                        BS_Addr1Kor,
                        BS_Addr2Kor,
                        BS_Addr1Eng,
                        BS_Addr2Eng,
                        convert(varchar, BS_MainDtS, 108) as BS_MainDtS,
                        convert(varchar, BS_MainDtf, 108) as BS_MainDtF, 
                        convert(varchar, BS_SubDtS, 108) as BS_SubDtS, 
                        convert(varchar, BS_SubDtF, 108) as BS_SubDtF, 
                        convert(varchar, BS_BreakDtS, 108) as BS_BreakDtS, 
                        convert(varchar, BS_BreakDtF, 108) as BS_BreakDtF,
                        BS_ContentsKor, 
                        BS_ContentsEng, 
                        BS_PersonalDayKor, 
                        BS_PersonalDayEng, 
                        BS_ThumbnailUrl,
                        BS_ImageUrl,
                        tLS.LS_Number, 
                        LS_Sector,
                        LS_Floor 
                    from tBCR 
                        INNER join tBSxtBCR on tBCR.BCR_ID = tBSxtBCR.BCR_ID 
                        INNER join tBS on tBS.BS_ID = tBSxtBCR.BS_ID
                        INNER join tBSxtLS on tBSxtLS.BS_ID = tBS.BS_ID 
                        INNER join tLS on tLS.LS_Number = tBSxtLS.LS_Number
                        INNER join tBC on tBC.BC_ID = tBCR.BCR_LV2_BC_ID
                        `

        // 관리 페이지 상세검색
        if(req_type === 'search'){
            let condition_list = [];
            //아이디
            if(req.query.bsLoginId){
                condition_list.push(`BS_LoginID = '${req.query.bsLoginId}'`);
            }
            //대표자명
            if(req.query.bsCeo){
                condition_list.push(`BS_LoginID = '${req.query.bsCeo}'`);
            }
            //매장명
            if(req.query.bsNameKo){
                condition_list.push(`BS_NameKor like '%${req.query.bsNameKo}%'`);
            }
            //매장 소개
            if(req.query.bsContentsKo){
                condition_list.push(`BS_ContentsKor like '%${req.query.bsContentsKo}%'`);
            }
            //대분류 카테고리
            if(req.query.bsBcId != 'null'){
                condition_list.push(`BCR_LV1_BC_ID = ${req.query.bsBcId}`);
            }
            //중분류 카테고리
            if(req.query.bsBcId2 != 'null'){
                condition_list.push(`BCR_LV2_BC_ID = ${req.query.bsBcId2}`);
            }
            //대표자 전화번호
            if(req.query.bsCeoPhone){
                condition_list.push(`BS_CEOPhone like '%${req.query.bsCeoPhone}%'`);
            }
            //매장 전화번호
            if(req.query.bsPhone){
                condition_list.push(`BS_Phone like '%${req.query.bsPhone}%'`);
            }
            //도로명 주소
            if(req.query.bsAddr1Ko){
                condition_list.push(`BS_Addr1Kor like '%${req.query.bsAddr1Ko}%'`);
            }
            //상세 주소
            if(req.query.bsAddr2Ko){
                condition_list.push(`BS_Addr2Kor like '%${req.query.bsAddr2Ko}%'`);
            }
            //층수
            if(req.query.bsStoreNumber != 'null'){
                condition_list.push(`tLS.LS_Number = '${req.query.bsStoreNumber}'`);
            }
            //호실
            if(req.query.bsFloor != 'null'){
                condition_list.push(`tLS.LS_Floor = '${req.query.bsFloor}'`);
            }
            //휴무일
            if(req.query.bsPersonalKo){
                condition_list.push(`BS_PersonalDayKor like '%${req.query.bsPersonalKo}%'`);
            }            
            //평일 오픈시간
            if(req.query.bsMainOpen){
                condition_list.push(`convert(varchar, BS_MainDtS, 108) >= '${req.query.bsMainOpen}'`);
            }            
            //평일 마감시간
            if(req.query.bsMainClose){
                condition_list.push(`convert(varchar, BS_MainDtF, 108) <= '${req.query.bsMainClose}'`);
            }
            //주말 오픈시간
            if(req.query.bsSubOpen){
                condition_list.push(`convert(varchar, BS_SubDtS, 108) >= '${req.query.bsSubOpen}'`);
            }
            //주말 마감시간
            if(req.query.bsSubClose){
                condition_list.push(`convert(varchar, BS_SubDtF, 108) <= '${req.query.bsSubClose}'`);
            }
            //점심시간 시작
            if(req.query.bsBreakOpen){
                condition_list.push(`convert(varchar, BS_BreakDtS, 108) >= '${req.query.bsBreakOpen}'`);
            }
            //점심시간 종료
            if(req.query.bsBreakClose){
                condition_list.push(`convert(varchar, BS_BreakDtF, 108) <= '${req.query.bsBreakClose}'`);
            }

            let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
            if( condition_list.length > 0){
                let condition_stmt = ' WHERE '+condition_list.join(searchType);
                query += condition_stmt;
            }

            new mssql.Request().query(query,
                (err, result) => {
                    let brandList = result.recordset;
                    filtered = brandList.filter(function (a) {
                        var key = ['BS_NameKor', 'BS_NameEng'].map(function (k) { return a[k]; }).join('|');
                        // var key = Object.keys(a).map(function (k) { return a[k]; }).join('|');
                        if (!this[key]) {
                            return this[key] = true;
                        }
                    }, Object.create(null));
                    // console.log('==============')
                    // console.log(filtered);
        
                    res.json({ data : filtered });
                })
        
        // 중복제거한 전체 리스트
        }else{
            new mssql.Request().query(query,
                (err, result) => {
                    let brandList = result.recordset;
                    filtered = brandList.filter(function (a) {
                        var key = ['BS_NameKor', 'BS_NameEng'].map(function (k) { return a[k]; }).join('|');
                        if (!this[key]) {
                            return this[key] = true;
                        }
                    }, Object.create(null));
                    // console.log('==============')
                    // console.log(filtered);
        
                    res.json({ data : filtered });
                })

        }




    });
});

//브랜드 상세정보 메뉴 리스트

router.get('/brandMenuList', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query(`select * from tM left join tMC on tM.M_MC_ID = tMC.MC_ID`,
        (err, result) => {
            let brandMenuList = result.recordset;

            let eventMenu = [];
            let normalMenu = [];
            for(let i=0; i<brandMenuList.length; i++){
                if(brandMenuList[i].M_MC_ID !== null){
                eventMenu.push(brandMenuList[i])
                }else{
                    normalMenu.push(brandMenuList[i])
                }
            }
            // console.log('===========')
            // console.log(eventMenu);
            // console.log('===========')
            // console.log(normalMenu);
            // console.log('===========')
            res.json({ event : eventMenu , normal : normalMenu});
        })
    });
});


//////@@@@@@ 사이니지 관리 페이지 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@///////
///////////////////GET @@@@@@@@@@@@@@@@@@@@@@@@ GET @@@@@@@ GET
//매장 리스트
router.get('/bsList', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tBS', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});
//특정 매장 리스트
router.get('/bsList/:bsId', async function(req,res){
    let bsId = req.params.bsId;
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .input('bsId', mssql.Int, bsId)
            .query(`select 
                        BS_NameKor, 
                        BS_NameEng, 
                        tBCR.BCR_ID, 
                        BCR_LV1_BC_ID, 
                        BCR_LV2_BC_ID, 
                        BCR_LV3_BC_ID, 
                        tBS.BS_ID,
                        BS_BC_ID, 
                        BS_LoginID, 
                        BS_LoginPW, 
                        BS_CEO, 
                        BS_Phone, 
                        BS_CEOPhone, 
                        BS_Addr1Kor, 
                        BS_Addr2Kor, 
                        BS_Addr1Eng, 
                        BS_Addr2Eng, 
                        convert(varchar, BS_MainDtS, 108) as BS_MainDtS,
                        convert(varchar, BS_MainDtf, 108) as BS_MainDtF, 
                        convert(varchar, BS_SubDtF, 108) as BS_SubDtF, 
                        BC_NameKor, 
                        BC_NameEng,
                        convert(varchar, BS_BreakDtS, 108) as BS_BreakDtS, 
                        convert(varchar, BS_BreakDtF, 108) as BS_BreakDtF,
                        BS_ContentsKor, 
                        BS_ContentsEng, 
                        BS_ThumbnailUrl, 
                        BS_PersonalDayKor, 
                        BS_PersonalDayEng,  
                        BS_ImageUrl,
                        tLS.LS_Number, 
                        LS_Sector, 
                        LS_Floor 
                    from tBCR 
                        INNER join tBSxtBCR on tBCR.BCR_ID = tBSxtBCR.BCR_ID 
                        INNER join tBS on tBS.BS_ID = tBSxtBCR.BS_ID
                        INNER join tBSxtLS on tBSxtLS.BS_ID = tBS.BS_ID 
                        INNER join tLS on tLS.LS_Number = tBSxtLS.LS_Number
                        INNER join tBC on tBC.BC_ID = tBCR.BCR_LV2_BC_ID where tBS.BS_ID = @bsId`)
        console.log(result.recordset);
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})


//광고 리스트
router.get('/adList', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .query(`select * from tAD left join tADY on tAD.AD_ADY_ID = tADY.ADY_ID`)
        // console.log(result.recordset);
        res.json({ data : result.recordset });
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//특정 광고 리스트
router.get('/adList/:adBsId', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
        .input('adBsId', mssql.Int, req.params.adBsId)
            .query(`select * from tAD left join tADY on tAD.AD_ADY_ID = tADY.ADY_ID where AD_BS_ID = @adBsId`)
        console.log(result.recordset);
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//광고종류 리스트
router.get('/adyList', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .query(`select * from tADY`)
        res.json({ data : result.recordset });
        console.log(result.recordset);
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//카테고리 리스트
router.get('/bcList', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .query(`select * from tBC`)
        console.log(result.recordset);
        res.json({data : result.recordset})
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})


//카테고리 분류 리스트
router.get('/bcrList', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .query(`select * from tBCR`)
        console.log(result.recordset);
        res.json({ data : result.recordset });
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})



//임대인 리스트
router.get('/lList', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .query(`select * from tL`)
        console.log(result.recordset);
        res.json({ data : result.recordset });
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//특정 임대인 리스트 
router.get('/lList/:lId', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .input('lId', mssql.Int, req.params.lId)
            .query(`select * from tL where L_ID = @lId`)
        console.log(result.recordset);
        res.json({ data : result.recordset });
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//임대인 맵핑 리스트
router.get('/lxlsList', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .query(`select * from tLxLs`)
        console.log(result.recordset);
        res.json({ data : result.recordset });
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//특정임대인 맵핑 리스트
router.get('/lxlsList/:lId', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .input('lId', mssql.Int, req.params.lId)
            .query(`select * from tLxLs where L_ID = @lId`)
        console.log(result.recordset);
        res.json({ data : result.recordset });
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//상품 리스트 
router.get('/mList', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .query(`select * from tM left join tMC on tM.M_MC_ID = tMC.MC_ID`)
            res.json({ data : result.recordset });
        console.log(result.recordset);
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//특정 매장 상품 리스트 
router.get('/mList/:mBsId', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .input('mBsId', mssql.Int, req.params.mBsId)
            .query(`select * from tM left join tMC on tM.M_MC_ID = tMC.MC_ID where M_BS_ID = @mBsId`)
        console.log(result.recordset);
        res.json({ data : result.recordset });
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//상품분류 리스트 
router.get('/mcList', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .query(`select * from tMC`)
        console.log(result.recordset);
        res.json({ data : result.recordset });
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//특정 매장상품분류 리스트 
router.get('/mcList/:mcBsId', async function(req, res){
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .input('mcBsId', mssql.int, req.params.mcBsId)
            .query(`select * from tMC where MC_BS_ID = @mcBsId`)
        console.log(result.recordset);
        res.json({ data : result.recordset });
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})


///////////api@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@api
//층수
router.get('/floor', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tLS', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//매장 등록
router.post('/tbs', upload.any(), async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)

    //     let BS_ThumbnailUrl, BS_ImageUrl
    //     let imgArr = req.files
    // //업로드 파일 구분
    //     imgArr.forEach(function(element){
    //         element.fieldname == 'tumb' ? BS_ThumbnailUrl = element.originalname : BS_ImageUrl = element.originalname
    //     })
    //     console.log('썸네일', BS_ThumbnailUrl);
    //     console.log('메인', BS_ImageUrl);

        // 이미지입력
        if(req.files.length === 0) throw Error('Non include files');
        //입력된 파일들과 새로운 경로로 저장
        let content_type = req.files[0].mimetype.split('/')[0];
        let img_name = req.files[0].filename;
        let tumb_name = req.files[1].filename;
        //이전 저장소
        let old_img_path = req.files[0].path;
        let old_tumb_path = req.files[1].path;
        //새 저장소
        let new_tumb_path = path.join(config.path.bs_image , tumb_name);
        let new_img_path = path.join(config.path.bs_image , img_name);
        //썸네일 재지정 함수
        fs.rename(old_tumb_path, new_tumb_path, (err) => {
            if (err) throw err;
            fs.stat(new_tumb_path, (err, stats) => {
            if (err) throw err;
            console.log(`stats: ${JSON.stringify(stats)}`);
            });
        });
        //이미지 재지정 함수
        fs.rename(old_img_path, new_img_path, (err) => {
            if (err) throw err;
            fs.stat(new_img_path, (err, stats) => {
            if (err) throw err;
            console.log(`stats: ${JSON.stringify(stats)}`);
            });
        });

        
        let mainDtS = '2020-01-01 '+ req.body.bsMainOpen;
        let mainDtF = '2020-01-01 '+ req.body.bsMainClose;
        let subDtS = '2020-01-01 '+req.body.bsSubOpen
        let subDtF = '2020-01-01 '+req.body.bsSubClose
        let breakS = '2020-01-01 '+req.body.bsBreakOpen
        let breakF = '2020-01-01 '+req.body.bsBreakClose

        // 매장입력 BS_BC_ID == lv1Cat
        let result = await pool.request()
            .input('BS_BC_ID', mssql.Int, req.body.bsBcId)
            .input('BS_LoginID', mssql.NVarChar, req.body.bsLoginId)
            .input('BS_LoginPW', mssql.NVarChar, req.body.bsLoginPw)
            .input('BS_CEO', mssql.NVarChar, req.body.bsCeo)
            .input('BS_NameKor', mssql.NVarChar, req.body.bsNameKo)
            .input('BS_NameEng', mssql.NVarChar, req.body.bsNameEn)
            .input('BS_ContentsKor', mssql.NVarChar, req.body.bsContentsKo)
            .input('BS_ContentsEng', mssql.NVarChar, req.body.bsContentsEn)
            .input('BS_Phone', mssql.NVarChar, req.body.bsPhone)
            .input('BS_CEOPhone', mssql.NVarChar, req.body.bsCeoPhone)
            .input('BS_Addr1Kor', mssql.NVarChar, req.body.bsAddr1Ko)
            .input('BS_Addr1Eng', mssql.NVarChar, req.body.bsAddr1En)
            .input('BS_Addr2Kor', mssql.NVarChar, req.body.bsAddr2Ko)
            .input('BS_Addr2Eng', mssql.NVarChar, req.body.bsAddr2En)
            .input('BS_MainDtS', mssql.DateTime, mainDtS)
            .input('BS_MainDtF', mssql.DateTime, mainDtF)
            .input('BS_SubDtS', mssql.DateTime, subDtS)
            .input('BS_SubDtF', mssql.DateTime, subDtF)
            .input('BS_BreakDtS', mssql.DateTime, breakS)
            .input('BS_BreakDtF', mssql.DateTime, breakF)
            .input('BS_PersonalDayKor', mssql.NVarChar, req.body.bsPersonalKo)
            .input('BS_PersonalDayEng', mssql.NVarChar, req.body.bsPersonalEn)
            .input('BS_ThumbnailUrl', mssql.NVarChar, '/img/sign_brand/'+req.files[1].originalname)
            .input('BS_ImageUrl', mssql.NVarChar, '/img/sign_brand/'+req.files[0].originalname)
            .query(`INSERT INTO tBS(
                                BS_BC_ID, BS_LoginID, BS_LoginPW, BS_CEO, BS_NameKor, BS_NameEng, BS_ContentsKor, BS_ContentsEng, 
                                BS_Phone, BS_CEOPhone, BS_Addr1Kor, BS_Addr2Kor, BS_Addr1Eng, BS_Addr2Eng, BS_MainDtS, BS_MainDtF,
                                BS_SubDtS, BS_SubDtF, BS_BreakDtS, BS_BreakDtF,BS_PersonalDayKor, BS_PersonalDayEng, BS_ThumbnailUrl,
                                BS_ImageUrl)
                        VALUES(@BS_BC_ID, @BS_LoginID, @BS_LoginPW, @BS_CEO, @BS_NameKor, @BS_NameEng, @BS_ContentsKor,
                                @BS_ContentsEng, @BS_Phone, @BS_CEOPhone, @BS_Addr1Kor, @BS_Addr2Kor, @BS_Addr1Eng, @BS_Addr2Eng, @BS_MainDtS, 
                                @BS_MainDtF, @BS_SubDtS, @BS_SubDtF, @BS_BreakDtS, @BS_BreakDtF, @BS_PersonalDayKor, @BS_PersonalDayEng,
                                @BS_ThumbnailUrl, @BS_ImageUrl)`);

        console.log('여기');
        //제일 최근에 입력된 BS_ID를 구함
        let result1 = await pool.request()
            .query('select top 1 * from tBS order by BS_ID desc')
        
        //카테고리 업종 입력 BCR_ID 구하기
        let result2 = await pool.request()
            .input('BCRLV1', mssql.Int, req.body.bsBcId)
            .input('BCRLV2', mssql.Int, req.body.bsBcId2)
            .query('select BCR_ID from tBCR where BCR_LV1_BC_ID = @BCRLV1 AND BCR_LV2_BC_ID = @BCRLV2')

        console.log('최근 입력된 BS_ID');
        console.log(result1.recordset[0].BS_ID)
        console.log('BCR_ID');
        console.log(result2.recordset[0].BCR_ID)

        // 업종 입력 완료
        let result3 = await pool.request()
            .input('BS_ID', mssql.Int, result1.recordset[0].BS_ID)
            .input('BCR_ID', mssql.Int, result2.recordset[0].BCR_ID)
            .query('insert into tBSxtBCR(BS_ID, BCR_ID) values(@BS_ID, @BCR_ID)')

        //층수 입력
        let result4 = await pool.request()
            .input('BS_ID', mssql.Int, result1.recordset[0].BS_ID)
            .input('LS_Number', mssql.Int, req.body.bsStoreNumber)
            .query('insert into tBSxtLS(BS_ID, LS_Number) values(@BS_ID, @LS_Number)')

        res.json({data:'1'})
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//매장 수정
router.put('/tbs/:bsId', upload.any(), async function (req, res, next) {
    const transaction =new mssql.Transaction();
    try {
        let pool = await mssql.connect(dbconf.mssql)
        

        // 광고입력
        // if(req.files.length === 0) throw Error('Non include files');
        //입력된 파일들과 새로운 경로로 저장
        // let content_type = req.files[0].mimetype.split('/')[0];

        //수정되는 파일이 있을때

        let tumb_url, img_url
        let tumb_name, img_name;
        let old_tumb_path, old_img_path;
        let new_tumb_path, new_img_path;
        img_url = req.body.bsImgUrl;
        tumb_url = req.body.bsTumbUrl;

        let bs_id = req.params.bsId

        //이미지만 바꿀때
        if(req.files.length == 1 && req.files[0] != undefined && req.files[0].fieldname == 'store_img'){
            onlyImg();
        }
        //썸네일만 바꿀때
        else if(req.files.length == 1 && req.files[0] != undefined && req.files[0].fieldname == 'store_thumb'){
            onlyThumb();
        }
        //둘다 바꿀때
        else if(req.files.length === 2){
            allImgUpdate();
        }
        
        function onlyImg(){
            img_name = req.files[0].filename;
            old_img_path = req.files[0].path;old_img_path
            new_img_path = path.join(config.path.bs_image , img_name);
            //이미지 재지정 함수
            fs.rename(old_img_path, new_img_path, (err) => {
                if (err) throw err;
                fs.stat(new_img_path, (err, stats) => {
                if (err) throw err;
                console.log(`stats: ${JSON.stringify(stats)}`);
                });
            });
            img_url = req.files[0].originalname;
            tumb_url = req.body.bsTumbUrl;
        }

        function onlyThumb(){
            tumb_name = req.files[0].filename;
            old_tumb_path = req.files[0].path;
            new_tumb_path = path.join(config.path.bs_image , tumb_name);
            //썸네일 재지정 함수
            fs.rename(old_tumb_path, new_tumb_path, (err) => {
                if (err) throw err;
                fs.stat(new_tumb_path, (err, stats) => {
                if (err) throw err;
                console.log(`stats: ${JSON.stringify(stats)}`);
                });
            });
            tumb_url = req.files[0].originalname;
            img_url = req.body.bsImgUrl;
        }

        function allImgUpdate(){
            img_name = req.files[0].filename;
            tumb_name = req.files[1].filename;
            //이전 저장소
            old_img_path = req.files[0].path;
            old_tumb_path = req.files[1].path;
            //새 저장소
            new_tumb_path = path.join(config.path.bs_image , tumb_name);
            new_img_path = path.join(config.path.bs_image , img_name);
            //이미지 재지정 함수
            fs.rename(old_img_path, new_img_path, (err) => {
                if (err) throw err;
                fs.stat(new_img_path, (err, stats) => {
                if (err) throw err;
                console.log(`stats: ${JSON.stringify(stats)}`);
                });
            });
            //썸네일 재지정 함수
            fs.rename(old_tumb_path, new_tumb_path, (err) => {
                if (err) throw err;
                fs.stat(new_tumb_path, (err, stats) => {
                if (err) throw err;
                console.log(`stats: ${JSON.stringify(stats)}`);
                });
            });
            img_url = req.files[0].originalname;
            tumb_url = req.files[1].originalname;
    
        }
        
        let mainDtS = '2020-05-18 '+ req.body.bsMainOpen;
        let mainDtF = '2020-05-18 '+ req.body.bsMainClose;
        let subDtS = '2020-05-18 '+req.body.bsSubOpen
        let subDtF = '2020-05-18 '+req.body.bsSubClose
        let breakS = '2020-05-18 '+req.body.bsBreakOpen
        let breakF = '2020-05-18 '+req.body.bsBreakClose
        
        let query = `
                UPDATE tBS SET 
                    BS_BC_ID = @BS_BC_ID,
                    BS_LoginID = @BS_LoginID,
                    BS_LoginPW = @BS_LoginPW,
                    BS_CEO = @BS_CEO,
                    BS_NameKor = @BS_NameKor,
                    BS_NameEng = @BS_NameEng,
                    BS_ContentsKor = @BS_ContentsKor,
                    BS_ContentsEng = @BS_ContentsEng,
                    BS_Phone = @BS_Phone,
                    BS_CEOPhone = @BS_CEOPhone,
                    BS_Addr1Kor = @BS_Addr1Kor,
                    BS_Addr2Kor = @BS_Addr2Kor,
                    BS_Addr1Eng = @BS_Addr1Eng,
                    BS_Addr2Eng = @BS_Addr2Eng,
                    BS_MainDtS = @BS_MainDtS,
                    BS_MainDtF = @BS_MainDtF,
                    BS_SubDtS = @BS_SubDtS,
                    BS_SubDtF = @BS_SubDtF,
                    BS_BreakDtS = @BS_BreakDtS,
                    BS_BreakDtF = @BS_BreakDtF,
                    BS_PersonalDayKor = @BS_PersonalDayKor,
                    BS_PersonalDayEng = @BS_PersonalDayEng,
                    BS_ThumbnailUrl = @BS_ThumbnailUrl,
                    BS_ImageUrl = @BS_ImageUrl
                WHERE BS_ID = @BS_ID`

        await new Promise(resolve => transaction.begin(resolve));
        let request = new mssql.Request(transaction);
        // 매장입력 BS_BC_ID == lv1Cat
        await request
            .input('BS_ID', mssql.Int, bs_id)
            .input('BS_BC_ID', mssql.Int, req.body.bsBcId)
            .input('BS_LoginID', mssql.NVarChar, req.body.bsLoginId)
            .input('BS_LoginPW', mssql.NVarChar, req.body.bsLoginPw)
            .input('BS_CEO', mssql.NVarChar, req.body.bsCeo)
            .input('BS_NameKor', mssql.NVarChar, req.body.bsNameKo)
            .input('BS_NameEng', mssql.NVarChar, req.body.bsNameEn)
            .input('BS_ContentsKor', mssql.NVarChar, req.body.bsContentsKo)
            .input('BS_ContentsEng', mssql.NVarChar, req.body.bsContentsEn)
            .input('BS_Phone', mssql.NVarChar, req.body.bsPhone)
            .input('BS_CEOPhone', mssql.NVarChar, req.body.bsCeoPhone)
            .input('BS_Addr1Kor', mssql.NVarChar, req.body.bsAddr1Ko)
            .input('BS_Addr1Eng', mssql.NVarChar, req.body.bsAddr1En)
            .input('BS_Addr2Kor', mssql.NVarChar, req.body.bsAddr2Ko)
            .input('BS_Addr2Eng', mssql.NVarChar, req.body.bsAddr2En)
            .input('BS_MainDtS', mssql.DateTime, mainDtS)
            .input('BS_MainDtF', mssql.DateTime, mainDtF)
            .input('BS_SubDtS', mssql.DateTime, subDtS)
            .input('BS_SubDtF', mssql.DateTime, subDtF)
            .input('BS_BreakDtS', mssql.DateTime, breakS)
            .input('BS_BreakDtF', mssql.DateTime, breakF)
            .input('BS_PersonalDayKor', mssql.NVarChar, req.body.bsPersonalKo)
            .input('BS_PersonalDayEng', mssql.NVarChar, req.body.bsPersonalEn)
            .input('BS_ThumbnailUrl', mssql.NVarChar, '/img/sign_brand/'+tumb_url)
            .input('BS_ImageUrl', mssql.NVarChar, '/img/sign_brand/'+img_url)
            .query(query);


        if(req.body.bsBcId !== undefined && req.body.bsBcId2 !== undefined){
            //카테고리 업종 입력 BCR_ID 구하기
            let result2 = await request
                .input('BCRLV1', mssql.Int, req.body.bsBcId)
                .input('BCRLV2', mssql.Int, req.body.bsBcId2)
                .query('select BCR_ID from tBCR where BCR_LV1_BC_ID = @BCRLV1 AND BCR_LV2_BC_ID = @BCRLV2')
            
            // 업종 수정
            await request
                .input('BS_ID2', mssql.Int, bs_id)
                .input('BCR_ID', mssql.Int, result2.recordset[0].BCR_ID)
                .query('update tBSxtBCR set BCR_ID = @BCR_ID where BS_ID = @BS_ID2')
        }

        if(req.body.bsStoreNumber !== undefined){
            // 층수 수정
            await request
                .input('BS_ID3', mssql.Int, bs_id)
                .input('LS_Number', mssql.Int, req.body.bsStoreNumber)
                .query('update tBSxtLS set LS_Number = @LS_Number where BS_ID = @BS_ID3')
        }

        await transaction.commit();
        res.json({result : 1})
    } catch (err) {
        await transaction.rollback();
        console.log(err);
        console.log('error fire')
    }
});

//특정 매장 삭제
router.delete('/tbs/:bsId', async function(req,res){
    let bsId = req.params.bsId;
    try {
        let pool = await mssql.connect(dbconf.mssql)

        await pool.request()
            .input('bsId', mssql.Int, bsId)
            .query(`delete from tBSxtBCR where BS_ID = @bsId`)
        
        await pool.request()
            .input('bsId', mssql.Int, bsId)
            .query(`delete from tBSxtLS where BS_ID = @bsId`)

        await pool.request()
        .input('bsId', mssql.Int, bsId)
        .query(`delete from tBS where BS_ID = @bsId`)
        console.log('성공');
        res.json({data : 1})
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//매장 다중 삭제 기능
router.delete('/tbs', async function(req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let row_ids = req.body.row_ids;

        await pool.request()
        .query(`delete from tBSxtBCR where BS_ID in (${row_ids})`)
    
        await pool.request()
            .query(`delete from tBSxtLS where BS_ID in (${row_ids})`)

        await pool.request()
        .query(`delete from tBS where BS_ID in (${row_ids})`)
        
        res.json({data : 1 });
    } catch (err) {
        console.log(err);
        console.log('error fire')
        res.json({result : 0});
    }
});
///////////////광고


//광고 등록
router.post('/ad', upload.any(), async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        if(req.files.length === 0) throw Error('Non include files');
        let content_type = req.files[0].mimetype.split('/')[0];
        let filename = req.files[0].filename;
        let old_path = req.files[0].path;
        let new_path = path.join(config.path.ad_image , filename);

        fs.rename(old_path, new_path, (err) => {
            if (err) throw err;
            fs.stat(new_path, (err, stats) => {
            if (err) throw err;
            console.log(`stats: ${JSON.stringify(stats)}`);
            });
        });

        if(req.body.addef == undefined){
            req.body.addef = 'n'
        }


        console.log('보내기');
        let result = await pool.request()
            .input('adBsId', mssql.Int, req.body.adBsId)
            .input('adAdyId', mssql.Int, req.body.adAdyId)
            .input('adBcId', mssql.Int, req.body.adBcId)
            .input('adPay', mssql.NVarChar, req.body.adPay)
            .input('adTitle', mssql.NVarChar, req.body.adTitle)
            .input('adDtS', mssql.DateTime, req.body.adDtS)
            .input('adDtF', mssql.DateTime, req.body.adDtF)
            .input('adUrl', mssql.NVarChar, '/img/ad/'+filename)
            .input('adConTy', mssql.NVarChar, content_type)
            .input('addef', mssql.NVarChar, req.body.addef)
            .query(`insert into tAD(
                                    AD_BS_ID, AD_ADY_ID, AD_BC_ID, AD_PaymentStatus, AD_Title, AD_DtS, 
                                    AD_DtF, AD_ContentURL, AD_ContentTy, AD_Default
                                    )
                            values(
                                    @adBsId, @adAdyId, @adBcId, @adPay, @adTitle, @adDtS, @adDtF, @adUrl, @adConTy, @addef
                                    )`
                    );
        console.log('성공');
        res.json({result : 1});
    } catch (err) {
        console.log(err);
        console.log('error fire')
        res.json({result : 0});
    }
});

//광고 수정
router.put('/ad/:adId', upload.any(), async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)



        let filename;
        let old_path;
        let new_path; 
        filename = req.body.adUrl
        // 광고입력
        // if(req.files.length === 0) throw Error('Non include files');
        // let content_type = req.files[0].mimetype.split('/')[0];

        //수정할 이미지가 있을때
        if(req.files.length == 1){
            adImgUpdate();
        }
        function adImgUpdate(){
            filename = req.files[0].filename;
            old_path = req.files[0].path;
            new_path = path.join(config.path.ad_image , filename);
    
            fs.rename(old_path, new_path, (err) => {
                if (err) throw err;
                fs.stat(new_path, (err, stats) => {
                if (err) throw err;
                console.log(`stats: ${JSON.stringify(stats)}`);
                });
            });
        }
        query = `UPDATE tAD SET 
                    AD_BS_ID = @adBsId, 
                    AD_ADY_ID = @adAdyId, 
                    AD_BC_ID = @adBcId,
                    AD_PaymentStatus = @adPay, 
                    AD_ContentTy = @adConTy,
                    AD_ContentURL = @adUrl, 
                    AD_DtF = @adDtF, 
                    AD_DtS = @adDtS,
                    AD_Title = @adTitle 
                where AD_ID =`+req.params.adId
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('adBsId', mssql.Int, req.body.adBsId)
            .input('adAdyId', mssql.Int, req.body.adAdyId)
            .input('adBcId', mssql.Int, req.body.adBcId)
            .input('adPay', mssql.NVarChar, req.body.adPay)
            .input('adTitle', mssql.NVarChar, req.body.adTitle)
            .input('adDtS', mssql.DateTime, req.body.adDtS)
            .input('adDtF', mssql.DateTime, req.body.adDtF)
            .input('adUrl', mssql.NVarChar, '/img/ad/'+filename) //req.files.xxxx
            .input('adConTy', mssql.NVarChar, req.body.adConTy)
            .query(query);
        console.log('성공');
        res.json({result : 1});
    } catch (err) {
        console.log(err);
        console.log('error fire')
        res.json({result : 0});
    }
});
//광고 삭제
router.delete('/ad/:adId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('adId', mssql.Char, req.params.adId)
            .query(`delete from tAD where AD_ID = @adId`);
        console.log('성공');
        res.json({result : 1});
    } catch (err) {
        console.log(err);
        console.log('error fire')
        res.json({result : 0});
    }
});
router.delete('/ad', async function(req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let row_ids = req.body.row_ids;
        let result = await pool.request()
            .query(`delete from tAD where AD_ID in (${row_ids})`);
        console.log('성공');
        let rowAffected = 0;
        if(result.rowAffected.length > 0) rowAffected = result.rowAffected[0];
        
        res.json({result : 1, rowAffected : rowAffected});
    } catch (err) {
        console.log(err);
        console.log('error fire')
        res.json({result : 0});
    }
});
//광고종류 등록
router.post('/addAdy',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('adyCd', mssql.NVarChar, req.body.adyCd)
            .input('adyLoc', mssql.NVarChar, req.body.adyLoc)
            .input('adySlide', mssql.Int, req.body.adySlide)
            .input('adyLimit', mssql.Int, req.body.adyLimit)
            .input('adyAmount', mssql.Int, req.body.adyAmount)
            .input('adyWidth', mssql.Int, req.body.adyWidth)
            .input('adyHeight', mssql.Int, req.body.adyHeight)
            .query(`insert into tADY(ADY_CD, ADY_Location, ADY_SlideDuration, ADY_Limit, ADY_Amount, ADY_Width,ADY_Height)
                           values(@adyCd, @adyLoc, @adySlide, @adyLimit, @adyAmount, @adyWidth, @adyHeight)`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//광고종류 수정
router.put('/modifyAdy/:adyId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let tADY = new Object();
            tADY.ADY_CD=  req.body.adyCd
            tADY.ADY_Location = req.body.adyLoc
            tADY.ADY_SlideDuration = req.body.adySlide
            tADY.ADY_Limit = req.body.adyLimit
            tADY.ADY_Amount = req.body.adyAmount
            tADY.ADY_Width =  req.body.adyWidth
            tADY.ADY_Height = req.body.adyHeight

        let adyObj = Object.keys(tADY)
        let bodyObj = Object.keys(req.body)
        let query = 'update tADY set '
        let j=0;
        for(let i=0; i<adyObj.length; i++){
            if(tADY[Object.keys(tADY)[i]] !== undefined){
                if(req.body[Object.keys(req.body)[j]] == tADY[Object.keys(tADY)[i]]){
                    query += adyObj[i]+'=' +' @'+bodyObj[j]+','
                    j++
                }
            }
        //마지막 , 제거
            if(i === adyObj.length -1){
                query = query.substring(0, query.length-1)
                query += ' where ADY_ID ='+req.params.adyId
            }
        }
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('adyCd', mssql.NVarChar, req.body.adyCd)
            .input('adyLoc', mssql.NVarChar, req.body.adyLoc)
            .input('adySlide', mssql.Int, req.body.adySlide)
            .input('adyLimit', mssql.Int, req.body.adyLimit)
            .input('adyAmount', mssql.Int, req.body.adyAmount)
            .input('adyWidth', mssql.Int, req.body.adyWidth)
            .input('adyHeight', mssql.Int, req.body.adyHeight)
            .query(query);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//광고종류 삭제
router.delete('/deleteAdy/:adyId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('adyId', mssql.NVarChar, req.params.adyId)
            .query(`delete from tADY where ADY_ID = @adyId`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

///@@@@@@@@@@ 카테고리 
//카테고리 등록
router.post('/addBc',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('bcNameKor', mssql.NVarChar, req.body.bcNameKor)
            .input('bcNameEng', mssql.NVarChar, req.body.bcNameEng)
            .query(`insert into tBC(BC_NameKor, BC_NameEng)
                           values(@bcNameKor, @bcNameEng)`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//카테고리 수정
router.put('/modifyBc/:bcId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let tBC = new Object();
            tBC.BC_NameKor=  req.body.bcNameKor
            tBC.BC_NameEng = req.body.bcNameEng

        let tbcObj = Object.keys(tBC)
        let bodyObj = Object.keys(req.body)
        let query = 'update tBC set '
        let j=0;
        for(let i=0; i<tbcObj.length; i++){
            if(tBC[Object.keys(tBC)[i]] !== undefined){
                if(req.body[Object.keys(req.body)[j]] == tBC[Object.keys(tBC)[i]]){
                    query += tbcObj[i]+'=' +' @'+bodyObj[j]+','
                    j++
                }
            }
        //마지막 , 제거
            if(i === tbcObj.length -1){
                query = query.substring(0, query.length-1)
                query += ' where BC_ID ='+req.params.bcId
            }
        }
        console.log('보내기');
        let result = await pool.request()
            .input('bcNameKor', mssql.NVarChar, req.body.bcNameKor)
            .input('bcNameEng', mssql.NVarChar, req.body.bcNameEng)
            .query(query);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});


//카테고리 삭제
router.delete('/deleteBc/:bcId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('bcId', mssql.Int, req.params.bcId)
            .query(`delete from tBC where BC_ID = @bcId`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//카테고리분류 등록
router.post('/addBcr',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('bcrCat1', mssql.Int, req.body.bcrCat1)
            .input('bcrCat2', mssql.Int, req.body.bcrCat2)
            .input('bcrCat3', mssql.Int, req.body.bcrCat3)
            .query(`insert into tBCR(BCR_LV1_BC_ID, BCR_LV2_BC_ID, BCR_LV3_BC_ID)
                           values(@bcrCat1, @bcrCat2, @bcrCat3)`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//카테고리 분류 수정
router.put('/modifyBcr/:bcrId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let tBCR = new Object();
            tBCR.BCR_LV1_BC_ID=  req.body.bcrCat1
            tBCR.BCR_LV2_BC_ID = req.body.bcrCat2
            tBCR.BCR_LV3_BC_ID = req.body.bcrCat3

        let tbcrObj = Object.keys(tBCR)
        let bodyObj = Object.keys(req.body)
        let query = 'update tBCR set '
        let j=0;
        for(let i=0; i<tbcrObj.length; i++){
            if(tBCR[Object.keys(tBCR)[i]] !== undefined){
                if(req.body[Object.keys(req.body)[j]] == tBCR[Object.keys(tBCR)[i]]){
                    query += tbcrObj[i]+'=' +' @'+bodyObj[j]+','
                    j++
                }
            }
        //마지막 , 제거
            if(i === tbcrObj.length -1){
                query = query.substring(0, query.length-1)
                query += ' where BCR_ID ='+req.params.bcrId
            }
        }
        console.log('보내기');
        let result = await pool.request()
            .input('bcrCat1', mssql.Int, req.body.bcrCat1)
            .input('bcrCat2', mssql.Int, req.body.bcrCat2)
            .input('bcrCat3', mssql.Int, req.body.bcrCat3)
            .query(query);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//카테고리분류 삭제
router.delete('/deleteBcr/:bcrId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('bcrId', mssql.Int, req.params.bcrId)
            .query(`delete from tBCR where BCR_ID = @bcrId`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//@@@@@@@@@@@@ 임대인

//임대인 등록
router.post('/addL',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('lLsNumber', mssql.NVarChar, req.body.lLsNumber)
            .input('lPw', mssql.NVarChar, req.body.lPw)
            .input('lName', mssql.NVarChar, req.body.lName)
            .input('lPhone', mssql.NVarChar, req.body.lPhone)
            .query(`insert into tL(L_LS_Number, L_PW, L_Name, L_Phone)
                           values(@lLsNumber, @lPw, @lName, @lPhone)`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//임대인 수정
router.put('/modifyL/:lId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let tL = new Object();
            tL.L_LS_Number=  req.body.lLsNumber
            tL.L_PW = req.body.lPw
            tL.L_Name = req.body.lName
            tL.L_Phone = req.body.lPhone

        let tlObj = Object.keys(tL)
        let bodyObj = Object.keys(req.body)
        let query = 'update tL set '
        let j=0;
        for(let i=0; i<tlObj.length; i++){
            if(tL[Object.keys(tL)[i]] !== undefined){
                if(req.body[Object.keys(req.body)[j]] == tL[Object.keys(tL)[i]]){
                    query += tlObj[i]+'=' +' @'+bodyObj[j]+','
                    j++
                }
            }
        //마지막 , 제거
            if(i === tlObj.length -1){
                query = query.substring(0, query.length-1)
                query += ' where L_ID ='+req.params.lId
            }
        }
        console.log('보내기');
        let result = await pool.request()
            .input('lLsNumber', mssql.NVarChar, req.body.lLsNumber)
            .input('lPw', mssql.NVarChar, req.body.lPw)
            .input('lName', mssql.NVarChar, req.body.lName)
            .input('lPhone', mssql.NVarChar, req.body.lPhone)
            .query(query);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//임대인 삭제
router.delete('/deleteL/:lId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('lId', mssql.Int, req.params.lId)
            .query(`delete from tL where L_ID = @lId`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//임대인 맵핑 등록
router.post('/addLxLs',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('lId', mssql.Int, req.body.lId)
            .input('lsNumber', mssql.NVarChar, req.body.lsNumber)
            .query(`insert into tL(L_LS_Number, L_PW, L_Name, L_Phone)
                           values(@lLsNumber, @lPw, @lName, @lPhone)`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//임대인 맵핑 수정
router.put('/modifyLxLs/:lId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        console.log('보내기');
        let result = await pool.request()
            .input('lId', mssql.Int, req.params.lId)
            .input('lsNumber', mssql.NVarChar, req.body.lsNumber)
            .query('update  tLxLs set LS_Number = @lsNumber where L_ID =@lId');
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//임대인 맵핑 삭제
router.delete('/deleteLxLs/:lId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('lId', mssql.Int, req.params.lId)
            .query(`delete from tLxLs where L_ID = @lId`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});
//@@@@@@@@@@@@@@@ 상품
//상품 등록 BS_ID 세션값으로 
router.post('/addM', upload.any(), async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('mBsId', mssql.Int, req.body.mBsId) //세션값 매장점주
            .input('mMcId', mssql.Int, req.body.mMcId)
            .input('mNameKor', mssql.NVarChar, req.body.mNameKor)
            .input('mNameEng', mssql.NVarChar, req.body.mNameEng)
            .input('mImageUrl', mssql.NVarChar, req.body.mImageUrl) //req.files.originalname
            .input('mPriority', mssql.Int, req.body.mPriority)
            .input('mPrice', mssql.Int, req.body.mPrice)
            .query(`insert into tM(M_MS_ID, M_MC_ID, M_NameKor, M_NameEng, M_ImageUrl, M_Priority, M_PRice)
                        values(@mBsId, @adAdyId, @mNameKor, @mNameEng, @mImageUrl, @mPriority, @mPrice)`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});


//상품 수정
router.put('/modifyM/:mId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let tM = new Object();
            tM.M_MCID=  req.body.mMcId
            tM.M_NAmeKor = req.body.mNameKor
            tM.M_NameEng = req.body.mNameEng
            tM.M_ImageUrl = req.body.mImageUrl // req.files.originalname
            tM.M_Priority = req.body.mPriority
            tM.M_PRice = req.body.mPrice

        let tmObj = Object.keys(tM)
        let bodyObj = Object.keys(req.body)
        let query = 'update tM set '
        let j=0;
        for(let i=0; i<tmObj.length; i++){
            if(tM[Object.keys(tM)[i]] !== undefined){
                if(req.body[Object.keys(req.body)[j]] == tM[Object.keys(tM)[i]]){
                    query += tmObj[i]+'=' +' @'+bodyObj[j]+','
                    j++
                }
            }
        //마지막 , 제거
            if(i === tmObj.length -1){
                query = query.substring(0, query.length-1)
                query += ' where M_ID ='+req.params.mId
            }
        }
        console.log('보내기');
        let result = await pool.request()
            .input('mMcId', mssql.Int, req.body.mMcId)
            .input('mNameKor', mssql.NVarChar, req.body.mNameKor)
            .input('mNameEng', mssql.NVarChar, req.body.mNameEng)
            .input('mImageUrl', mssql.NVarChar, req.body.mImageUrl) //req.files.originalname
            .input('mPriority', mssql.Int, req.body.mPriority)
            .input('mPrice', mssql.Int, req.body.mPrice)
            .query(query);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});


//상품 삭제
router.delete('/deleteM/:mId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('mId', mssql.Int, req.params.mId)
            .query(`delete from tM where M_ID = @mId`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//상품 분류 등록
router.post('/addMc', upload.any(), async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('mcBsId', mssql.Int, req.body.mcBsId) //세션값 매장점주
            .input('mcNameKor', mssql.NVarChar, req.body.mcNameKor)
            .input('mcPriority', mssql.NVarChar, req.body.mcPriority)
            .input('mcNameEng', mssql.NVarChar, req.body.mcNameEng)
            .query(`insert into tMC(MC_BS_ID, MC_NameKor, MC_Priority, MC_NameEng)
                        values(@mcBsId, @mcNameKor, @mcPriority, @mcNameEng)`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//상품 분류 수정
router.put('/modifyMc/:mcId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let tMC = new Object();
            tMC.MC_NameKor = req.body.mcNameKor
            tMC.MC_Priority = req.body.mcPriority
            tMC.MC_NameEng = req.body.mcNameEng // req.files.originalname

        let tmcObj = Object.keys(tMC)
        let bodyObj = Object.keys(req.body)
        let query = 'update tMC set '
        let j=0;
        for(let i=0; i<tmcObj.length; i++){
            if(tMC[Object.keys(tMC)[i]] !== undefined){
                if(req.body[Object.keys(req.body)[j]] == tMC[Object.keys(tMC)[i]]){
                    query += tmcObj[i]+'=' +' @'+bodyObj[j]+','
                    j++
                }
            }
        //마지막 , 제거
            if(i === tmcObj.length -1){
                query = query.substring(0, query.length-1)
                query += ' where MC_ID ='+req.params.mcId
            }
        }
        console.log('보내기');
        let result = await pool.request()
            .input('mcNameKor', mssql.NVarChar, req.body.mcNameKor)
            .input('mcPriority', mssql.NVarChar, req.body.mcPriority)
            .input('mcNameEng', mssql.NVarChar, req.body.mcNameEng)
            .query(query);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//상품분류 삭제
router.delete('/deleteMc/:mcId',  async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        // 광고입력
        console.log('보내기');
        let result = await pool.request()
            .input('mcId', mssql.Int, req.params.mcId)
            .query(`delete from tMC where MC_ID = @mcId`);
        console.log('성공');
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});


// 기사앱 예약된 좌석 정보 가져오기
router.get('/busSeat/:ct_id', (req, res, next) =>{
    let query = `select CR_ID, CR_SeatNum from tCR where CR_CT_ID = :ct_id and CR_Cancel = 'N' `;
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


//기사앱 좌석 클릭시 회원 정보
router.get('/bus_user_info', (req, res, next) =>{

    let ct_id = req.query.ct_id;
    let cr_seatnum = req.query.cr_seatnum;
    let query = `select 
                    U_NAME, 
                    U_PHONE, 
                    tCR.CR_SeatNum 
                from tCR 
                    INNER JOIN tU ON tCR.CR_U_ID = tU.U_ID 
                WHERE tCR.CR_CT_ID = :ct_id AND 
                      tCR.CR_SeatNum = :cr_seatnum AND 
                      tCR.CR_Cancel = 'N'`; 
    connection.query(query,{
            ct_id : ct_id,
            cr_seatnum : cr_seatnum
        },
      function(err, rows) {
          if (err) throw err;
          res.json({ data : rows});
          console.log("좌석 목록 :",rows);
      });
});

//기사 앱 QRcode 확인
router.post('/bus_qrcode_scan', async (req, res, done) =>{
    connection.beginTransaction(function(err){
        let query = `SELECT 
                        tCT.CT_ReturnTe, 
                        tCR.CR_ScanPy, 
                        tCR.CR_ScanSe,
                        tCR.CR_SeatNum,
                        DATE_ADD(CT_ReturnTe,INTERVAL +3 HOUR) AS scanTime,
                        NOW() AS nowTime,
                        CR_PayState
                    FROM tCT
                        INNER JOIN tCR ON tCT.CT_ID = tCR.CR_CT_ID
                    WHERE 
                        tCR.CR_Cancel = 'N' AND
                        tCR.CR_CT_ID = :cr_id AND
                        tCR.CR_QrCode = :qr_code`;    

        let qr_code = req.body.qr_code;
        let location_type = req.body.location;
        let cr_id = req.body.cr_id;
        
        connection.query(query, { qr_code : qr_code, cr_id : cr_id },
            function(err, rows){
            if(err) throw err;
            if(rows.length == 1){
                //무통장 입금 안된경우
                if(rows[0].CR_PayState == '결제대기'){
                    res.json({data : '0'})
                    return false;
                }

                //마지막 출발시간이 현재 시간보다 작으면 기간지난 qrcode
                if(rows[0].scanTime < rows[0].nowTime){
                    res.json({data : '3'})
                    return false;
                }
                let update_query = `UPDATE tCR SET `;
                if(location_type === 'pyeongtaek'){
                    if(rows[0].CR_ScanPy === 'Y'){
                        //이미 스캔되었습니다.
                        res.json({data : '2'})
                        return false;
                    }
                    update_query += ` CR_ScanPy = 'Y'`;
                }else if(location_type === 'seoul'){
                    if(rows[0].CR_ScanSe === 'Y'){
                        //이미 스캔되었습니다.
                        res.json({data : '2'})
                        return false;
                    }
                    update_query += ` CR_ScanSe = 'Y'`;
                }
                update_query += ` WHERE CR_QrCode = :qr_code`;
                
                connection.query(update_query,{qr_code : qr_code},
                    function(err, result){
                        if (err){
                            connection.rollback(function(){
                                console.log('error :', err);
                                res.json({data : 301});
                            })
                        }
                        connection.commit(function(err) {
                            if (err) {
                                return connection.rollback(function() {
                                    throw err;
                                });
                            }
                            //입력 성공
                            res.json({
                                data : '1',
                                seatNum : rows[0].CR_SeatNum
                            });    
                        });
                })

            }else{
                //잘못된 qrcode
                res.json({data : '0'})
            }
        })
    })
    
});

//기사앱 출발시 평택,서울 출발확인 컬럼 변경
router.put('/bus_start', (req, res, done) =>{
    let ct_id = req.body.ct_id;
    let location = req.body.location;
    let query = `UPDATE tCT SET `;

    if(location == 'py'){
        query += `CT_PyStart = 'Y'`;
    }else{
        query += `CT_SeStart = 'Y'`;
    }
    query += ` WHERE CT_ID = :ct_id`;

    connection.query(query, {ct_id : ct_id},
        function(err, rows) {
            if (err) throw err;
            res.json({ data : '1'});
    });
});

//기사앱 출발취소시 평택,서울 출발확인 컬럼 변경
router.put('/bus_cancel', (req, res, done) =>{
    let ct_id = req.body.ct_id;
    let location = req.body.location;
    let query = `UPDATE tCT SET `;

    if(location == 'py'){
        query += `CT_PyStart = 'N'`;
    }else{
        query += `CT_SeStart = 'N'`;
    }
    query += ` WHERE CT_ID = :ct_id`;

    connection.query(query, {ct_id : ct_id},
        function(err, rows) {
            if (err) throw err;
            res.json({ data : '1'});
    });
});

//장차 관리자 페이지 API

router.get('/vehicle',function(req,res){
    let query = `SELECT 
                    CT_ID,
                    CY_ID,
                    (SELECT COUNT(CR_SeatNum) FROM tCR  WHERE CR_Cancel = 'N' 
                    AND tCR.CR_CT_ID = tCT.CT_ID) AS COUNT,
                    CT_CY_ID,
                    B_Name,
                    CT_CarNum,
                    CY_Ty,
                    CT_DriverName,
                    CT_DriverPhone,
                    CY_SeatPrice,
                    CT_DepartureTe,
                    CT_ReturnTe,
                    CT_PyStart,
                    CT_SeStart
                FROM tCT 
                    left JOIN tCR ON tCR.CR_CT_ID = tCT.CT_ID
                    INNER JOIN tCY ON tCT.CT_CY_ID = tCY.CY_ID
                    INNER JOIN tB ON tCY.CY_B_ID = tB.B_ID`

    // let query = `SELECT * FROM tCT 
    //                 INNER JOIN tCY ON tCT.CT_CY_ID = tCY.CY_ID
    //                 INNER JOIN tB ON tCY.CY_B_ID = tB.B_ID`
    let req_type = req.query.type

    if(req_type === 'search'){
        let condition_list = [];
        if( req.query.cy_id != 'null'){
            condition_list.push(`CT_CY_ID = ${req.query.cy_id}`);
        }
        if( req.query.car_num ){
            condition_list.push(`CT_CarNum like '%${req.query.car_num}%'`);
        }
        if( req.query.driver_name ){
            condition_list.push(`CT_DriverName like '%${req.query.driver_name}%'`);
        }
        if( req.query.driver_phone ){
            condition_list.push(`CT_DriverPhone like '%${req.query.driver_phone}%'`);
        }
        if( req.query.py_start ){
            condition_list.push(`CT_DepartureTe like '%${req.query.py_start}%'`);
        }
        if( req.query.se_start ){
            condition_list.push(`CT_ReturnTe like '%${req.query.se_start}%'`);
        }
        if( req.query.py_start_check != 'null'){
            condition_list.push(`CT_PyStart = '${req.query.py_start_check}'`);
        }
        if( req.query.se_start_check != 'null' ){
            condition_list.push(`CT_SeStart = '${req.query.se_start_check}'`);
        }

        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = ' WHERE '+condition_list.join(searchType);
            query += condition_stmt + ' GROUP BY tCT.CT_ID';
        }else{
            query += ' GROUP BY tCT.CT_ID';
        }
        connection.query(query,
            function(err,rows){
                if(err) throw err;
                res.json({data : rows});
        })

    }else{
        query += ' GROUP BY tCT.CT_ID';
        connection.query(query,
            function(err,rows){
                if(err) throw err;
                res.json({data : rows});
        })
    }
    

})

//배차 운송사 목록
router.get('/business_list',function(req,res){
    let query = `SELECT * FROM tCY
                INNER JOIN tB ON tCY.CY_B_ID = tB.B_ID`

    connection.query(query,
        function(err,rows){
            if(err) throw err;
            res.json({data : rows});
    })
})

//배차 등록
router.post('/vehicle',async function(req,res){
    let query = `INSERT INTO tCT(
                    CT_CY_ID, 
                    CT_DepartureTe, 
                    CT_ReturnTe, 
                    CT_CarNum, 
                    CT_DriverName, 
                    CT_DriverPhone,
                    CT_PyStart,
                    CT_SeStart
                    )
                VALUES( :cy_id, :py_start, :se_start, :car_num, :driver_name, :driver_phone, :py_start_check, :se_start_check) `

    let cy_id = req.body.cy_id,
        py_start = req.body.py_start,
        se_start = req.body.se_start,
        car_num = req.body.car_num,
        driver_name = req.body.driver_name,
        driver_phone = req.body.driver_phone,
        py_start_check = req.body.py_start_check,
        se_start_check = req.body.se_start_check
    
    connection.query(query, { cy_id, py_start, se_start, car_num, driver_name, driver_phone, py_start_check, se_start_check},
        function(err,rows){
            if (err){
                connection.rollback(function(){
                    console.log('ERROR ! :', err);
                    res.json({data : 300});
                    // throw err;
                })
            }else{
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            res.json({data : 300});
                            throw err;
                        });
                    }
                    res.json({data : 200});    
                });
            }
   
    })
})
//배차 수정
router.put('/vehicle/:ctid',async function(req,res){
    let query = `UPDATE tCT SET
                    CT_CY_ID = :cy_id,
                    CT_DepartureTe = :py_start,
                    CT_ReturnTe = :se_start,
                    CT_CarNum = :car_num,
                    CT_DriverName = :driver_name,
                    CT_DriverPhone = :driver_phone,
                    CT_PyStart = :py_start_check,
                    CT_SeStart = :se_start_check
                WHERE CT_ID = :ct_id        
    `
    
    let cy_id = req.body.cy_id,
        ct_id = req.params.ctid,
        py_start = req.body.py_start,
        se_start = req.body.se_start,
        car_num = req.body.car_num,
        driver_name = req.body.driver_name,
        driver_phone = req.body.driver_phone,
        py_start_check = req.body.py_start_check,
        se_start_check = req.body.se_start_check
    
    connection.query(query, { cy_id, py_start, se_start, car_num, driver_name, driver_phone, py_start_check, se_start_check, ct_id},
        function(err,rows){
            if (err){
                connection.rollback(function(){
                    console.log('ERROR ! :',err);
                    res.json({data : 300});
                    // throw err;
                })
            }else{
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            res.json({data : 300});
                            throw err;
                        });
                    }
                    res.json({data : 200});    
                });
            }
    })
})

//배차 삭제
router.delete('/vehicle/:ctid',async function(req,res){
    let query = `delete from tCT where CT_ID = :ct_id `

    let ct_id = req.params.ctid
    
    connection.query(query, {ct_id},
        function(err,rows){
            if (err){
                connection.rollback(function(){
                    console.log('ERROR ! :',err);
                    res.json({data : 300});
                    // throw err;
                })
            }else{
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            res.json({data : 300});
                            throw err;
                        });
                    }
                    res.json({data : 200});    
                });
            }

    })
});

//배차 다중 삭제
router.delete('/vehicle',async function(req,res){
    
    let ct_id = req.body.row_ids
    let query = `delete from tCT where CT_ID IN (${ct_id})`

    connection.query(query,
        function(err,rows){
            if (err){
                connection.rollback(function(){
                    console.log('ERROR ! :', err);
                    res.json({data : 300});
                    // throw err;
                })
            }else{
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            res.json({data : 300});
                            throw err;
                        });
                    }
                    res.json({data : 200});    
                });
            }

    })
});

//예약 관리 리스트

router.get('/reservation',function(req,res){
    let query = `SELECT 
                    CR_ID,
                    CR_CT_ID,
                    CR_U_ID,
                    CR_PH_ID,
                    U_Name,
                    U_uId,
                    U_Email,
                    B_Name,
                    U_Phone,
                    U_Brand,
                    U_Zip,
                    U_Addr1,
                    U_Addr2,
                    CR_SeatNum,
                    CR_Price,
                    CR_ScanPy,
                    CR_ScanSe,
                    CR_Cancel,
                    CR_CancelDt,
                    CR_PayState,
                    CR_cDt,
                    CT_ID,
                    CT_DepartureTe,
                    CT_ReturnTe,
                    CT_CarNum,
                    U_uId,
                    CR_Memo,
                    PH_Type,
                    PH_PG_ID,
                    PH_ID,
                    PH_CodeType,
                    PH_OrderNumber,
                    PH_BankNumber,
                    PH_BankCode
                FROM tCR
                    INNER JOIN tCT ON tCR.CR_CT_ID = tCT.CT_ID
                    INNER JOIN tU ON tCR.CR_U_ID = tU.U_ID
                    INNER JOIN tCY ON tCY.CY_ID = tCT.CT_CY_ID
                    INNER JOIN tB ON tB.B_ID = tCY.CY_B_ID
                    INNER JOIN tPH ON tPH.PH_ID = tCR.CR_PH_ID
                    `
    if(req.query.type == 'search'){
        let condition_list = [];
        if( req.query.search_user_name){
            condition_list.push(`U_Name like '%${req.query.search_user_name}%'`);
        }
        if( req.query.search_user_phone){
            condition_list.push(`U_Phone like '%${req.query.search_user_phone}%'`);
        }
        if( req.query.search_user_brand){
            condition_list.push(`U_Brand like '%${req.query.search_user_brand}%'`);
        }
        if( req.query.search_user_addr1){
            condition_list.push(`U_Addr1 like '%${req.query.search_user_addr1}%'`);
        }
        if( req.query.search_user_addr2){
            condition_list.push(`U_Addr2 like '%${req.query.search_user_addr2}%'`);
        }
        if( req.query.search_ct_id != 'null'){
            condition_list.push(`B_Name like '%${req.query.search_ct_id}%'`);
        }
        if( req.query.search_seat_num){
            condition_list.push(`CR_SeatNum = '${req.query.search_seat_num}'`);
        }
        if( req.query.search_seat_price){
            condition_list.push(`CR_Price = '${req.query.search_seat_price}'`);
        }
        if( req.query.search_res_day){
            condition_list.push(`CR_cDt like '%${req.query.search_res_day}%'`);
        }
        if( req.query.search_py_start){
            condition_list.push(`CT_DepartureTe like '%${req.query.search_py_start}%'`);
        }
        if( req.query.search_se_start){
            condition_list.push(`CT_ReturnTe like '%${req.query.search_se_start}%'`);
        }
        if( req.query.search_cr_cancel != 'null' ){
            condition_list.push(`CR_Cancel = '${req.query.search_cr_cancel}'`);
        }
        if( req.query.search_py_scan != 'null' ){
            condition_list.push(`CR_ScanPy = '${req.query.search_py_scan}'`);
        }
        if( req.query.search_se_scan != 'null' ){
            condition_list.push(`CR_ScanSe = '${req.query.search_se_scan}'`);
        }
        if( req.query.search_cr_memop){
            condition_list.push(`CR_Memo like '%${req.query.search_cr_memo}%'`);
        }

        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = ' WHERE '+condition_list.join(searchType);
            query += condition_stmt;
        }
        connection.query(query,
            function(err,rows){
                if(err) throw err;
                res.json({data : rows});
        })

    }else{

        connection.query(query,
            function(err,rows){
                if(err) throw err;
                res.json({data : rows});
            })
    }

})

//운송사 리스트
router.get('/vehicle/list', function(req,res){
    let query = `SELECT 
                    tCT.CT_ID, 
                    tB.B_NAME, 
                    tCT.CT_DepartureTe,
                    tCY.CY_SeatPrice,
                    DATE_ADD(CT_DepartureTe,INTERVAL +60 HOUR_MINUTE) as dept,
                    date_format(tCT.CT_DepartureTe ,'%y%y.%m.%d %H') as deptTime
                FROM tCT 
                    INNER JOIN tCY ON tCT.CT_CY_ID = tCY.CY_ID
                    INNER JOIN tB ON tCY.CY_B_ID = tB.B_ID
                WHERE tCT.CT_PyStart = 'N'`
    if(req.query.type === 'default'){
        query = query;
    }else{
        
        query += ' AND tCT.CT_DepartureTe > DATE_ADD(NOW(),INTERVAL -40 HOUR_MINUTE)'
    }

    connection.query(query,
        function(err, rows){
            if(err) throw err;
            res.json({data : rows});

    })
})

//관리자 페이지 예약 등록
router.post('/reservation',async function(req,res){
    connection.beginTransaction(function(err){

        let pay_query = `INSERT INTO tPH(
                            PH_U_ID,
                            PH_PG_ID,
                            PH_OrderNumber,
                            PH_Price,
                            PH_OPrice,
                            PH_SPrice,
                            PH_Type
                        )
                        VALUES( :u_id, 1, :moid, :ph_price, :ph_price, 0, '후불결제')`;

        let ph_id_query = 'SELECT PH_ID FROM tPH ORDER BY PH_ID DESC LIMIT 1';

        let res_query = `INSERT INTO tCR(
                        CR_CT_ID, 
                        CR_U_ID, 
                        CR_PH_ID, 
                        CR_SeatNum,
                        CR_Price,
                        CR_QrCOde,
                        CR_Memo,
                        CR_PayState 
                        )
                    VALUES  `;

        let ct_id = req.body.ct_id,
            u_id = req.body.u_id,
            seat_price = req.body.seat_price;
        let str_values_list = [];
        let str_values = "";
        let seatNums = req.body['seatNums']; // 등록할 좌석
        let moid = req.body.moid; //주문 번호
        let ph_price = (seat_price * seatNums.length);


        connection.query(pay_query, {u_id, moid, ph_price},
            function(err,pay_result){
                if (err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    //입력된 결제 아이디 값
                    let ph_id = pay_result.insertId;

                    let origin_qrcode = [];
                    let hash_qrcode = [];

                    for(let i =0; i<seatNums.length; i++){
                        origin_qrcode.push(ct_id+'-'+u_id+'-'+ph_id+'-'+seatNums[i]);
                        hash_qrcode.push(CryptoJS.AES.encrypt(origin_qrcode[i], config.enc_salt).toString());
                    }

                    if( typeof(seatNums) === "object"){ //선택한 좌석이 2개 이상
                        for(let i=0; i<seatNums.length; i++){
                            str_values_list.push(`(${ct_id}, ${u_id}, ${ph_id}, ${seatNums[i]}, ${seat_price}, '${hash_qrcode[i]}', '후불결제', '결제대기')`)
                        }
                        str_values = str_values_list.join(', ');
                    } else if(typeof(seatNums) === "string" ){ // 선택한 좌석이 1개
                        str_values = `(${ct_id}, ${u_id}, ${ph_id}, ${seatNums}, ${seat_price}, '${hash_qrcode}', '후불결제', '결제대기')`;
                    }
                
                    res_query += str_values;


                    connection.query(res_query, null,
                        function(err, result){
                            if (err){
                                connection.rollback(function(){
                                    console.log('ERROR ! :',err);
                                    res.json({data : 300});
                                    // throw err;
                                })
                            }else{
                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            res.json({data : 300});
                                            throw err;
                                        });
                                    }
                                    res.json({data : 200});    
                                });
                            }

                        })
                }
        })
    })
})

//예약 수정
router.put('/reservation/:crid', async function(req,res){

    let cr_cancel = req.body.cr_cancel,
        py_scan = req.body.py_scan,
        se_scan = req.body.se_scan,
        cr_id = req.params.crid,
        cr_memo,
        cr_state = req.body.cr_state,
        ct_id = req.body.ct_id,
        seatNums = req.body.seatNums,
        ph_id = req.body.ph_id
        
    //전체적인 수정 쿼리
    let query = `UPDATE tCR SET
                    CR_Cancel = :cr_cancel,
                    CR_CT_ID = :ct_id,
                    CR_SeatNum = :seatNums,
                    CR_ScanPy = :py_scan,
                    CR_ScanSe = :se_scan,
                    CR_Memo = :cr_memo,
                    CR_PayState = :cr_state
                    `
    //취소상태를 전체취소, 부분취소를 나누기 위해 현 좌석 상태 확인 쿼리
    let cancel_type_query = `SELECT CR_Memo FROM tCR WHERE CR_PH_ID = ${ph_id}`

    let cancel_update_query = `UPDATE tCR SET
                                    CR_Memo = :cr_memo
                                WHERE CR_PH_ID = ${ph_id}`
    


    connection.beginTransaction(function(err){
        connection.query(cancel_type_query,
            function(err, cancel_type_result){

                //좌석예매를 취소하는 경우
                if(cr_cancel === 'Y'){
                    query += ',CR_CancelDt = now() WHERE CR_ID = :cr_id';
                    cr_state = '결제취소';

                    //예매된 좌석이 하나밖에 없을때
                    if(cancel_type_result.length == 1){
                        cr_memo = '전체취소';
                    }
                    //하나보다 클때
                    else if(cancel_type_result.length > 1){
                        // if(cancel_type_result[0].CR_Memo == '' && cancel_type_result[1].CR_Memo == ''){
                        //     cr_memo = '부분취소';
                        // }

                        // if(cancel_type_result[0].CR_Memo == '부분취소' ||cancel_type_result[1].CR_Memo == '부분취소'){
                        //     cr_memo = '전체취소';
                        // }
                        //부분취소는 무조건 정산으로 들어가기 때문에 한번이라도 부분취소를 하게 되면 부분취소로 변경
                        cr_memo = '부분취소';
                    }

                //좌석예매를 수정하는 경우
                }else if(cr_cancel === 'N' && cr_state == '결제대기'){
                    cr_state = '결제대기';
                    cr_memo = '';
                    // if(req.body.cr_memo == '후불결제'){
                    //     cr_memo = '후불결제';    
                    // }
                    query += ' WHERE CR_ID = :cr_id';
                }
                else if(cr_cancel === 'N'){
                    cr_state = '결제완료';
                    cr_memo = '';
                    query += ' WHERE CR_ID = :cr_id';
                }
                else{
                    cr_memo = '';
                    query += ' WHERE CR_ID = :cr_id';
                }
                //데이터 업데이트 진행
                connection.query(query, {cr_cancel, ct_id, seatNums, py_scan, se_scan, cr_id, cr_memo, cr_state},
                    function(err, rows){
                        if (err){
                            connection.rollback(function(){
                                console.log('/reservation, query ERROR', err);
                                res.json({data : 304});
                                // throw err;
                            })
                        }else{
                            //CR_Memo 취소 상태 전체 변경
                            connection.query(cancel_update_query, {cr_memo},
                                function(err, cancel_update_result){
                                    if(err){
                                        return connection.rollback(function() {
                                            console.log('/reservation, cancel_update_query ERROR', err);
                                            res.json({data : 300});
                                        });
                                    }
                                    connection.commit(function(err) {
                                        if (err) {
                                            return connection.rollback(function() {
                                                res.json({data : 300});
                                                throw err;
                                            });
                                        }
                                        res.json({data : 200});    
                                    });
                                })
                        }
                })
        })

    })

})
//예약 한개 삭제
router.delete('/reservation/:crid', async function(req,res){
    connection.beginTransaction(function(err){
        let query = `delete from tCR where CR_ID = :cr_id`

        let cr_id = req.params.crid;

        connection.query(query, {cr_id},
            function(err, rows){
                if (err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }

        })
    })
})

//예약 다중 삭제
router.delete('/reservation',async function(req,res){
    connection.beginTransaction(function(err){
        let cr_id = req.body.row_ids
        let query = `delete from tCR where CR_ID IN (${cr_id})`;

        connection.query(query,
            function(err,rows){
                if (err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }

        })
    })
});

//장차 회원 리스트
router.get('/member', function(req,res){
    
    let query = `SELECT * FROM tU`;

    if(req.query.type === 'search'){
        let condition_list = [];
        if( req.query.u_login_id){
            condition_list.push(`U_uId like '%${req.query.u_login_id}%'`);
        }
        if( req.query.u_name){
            condition_list.push(`U_Name like '%${req.query.u_name}%'`);
        }
        if( req.query.u_email){
            condition_list.push(`U_Email like '%${req.query.u_email}%'`);
        }
        if( req.query.u_phone){
            condition_list.push(`U_Phone like '%${req.query.u_phone}%'`);
        }
        if( req.query.u_brand){
            condition_list.push(`U_Brand like '%${req.query.u_brand}%'`);
        }
        if( req.query.u_admin != 'null'){
            condition_list.push(`U_isAdmin = '${req.query.u_admin}'`);
        }
        if( req.query.postcode){
            condition_list.push(`U_Zip like '%${req.query.postcode}%'`);
        }
        if( req.query.address){
            condition_list.push(`U_Addr1 like '%${req.query.address}%'`);
        }
        if( req.query.detailAddress){
            condition_list.push(`U_Addr2 like '%${req.query.detailAddress}%'`);
        }
        if( req.query.u_cdt){
            condition_list.push(`U_cDt like '%${req.query.u_cdt}%'`);
        }

        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = ' WHERE '+condition_list.join(searchType);
            query += condition_stmt;
        }

        connection.query(query,
            function(err, rows){
            if(err) throw err;

            res.json({data : rows})
        })

    }else{
        connection.query(query,
            function(err, rows){
            if(err) throw err;

            res.json({data : rows})
        })
    }
});

//장차 신규 회원 등록
router.post('/member', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `insert into tU (
                                U_uId,
                                U_Pw, 
                                U_Name,
                                U_Email, 
                                U_Phone, 
                                U_Brand, 
                                U_Zip, 
                                U_Addr1, 
                                U_Addr2,
                                U_isAdmin
                                ) 
                        values( 
                            :u_login_id,
                            :hash_pw,  
                            :u_name,  
                            :u_email,  
                            :u_phone, 
                            :u_brand, 
                            :postcode,  
                            :address,  
                            :detailAddress,  
                            :u_admin)`;

        let u_login_id = req.body.u_login_id,
            u_name = req.body.u_name,
            u_email = req.body.u_email,
            u_phone = req.body.u_phone,
            u_brand = req.body.u_brand,
            postcode = req.body.postcode,
            address = req.body.address,
            detailAddress = req.body.detailAddress,
            u_admin = req.body.u_admin;
        
        let u_pw = '1234';
        let hash_pw = CryptoJS.AES.encrypt(u_pw, config.enc_salt).toString()
        connection.query(query, 
                {u_login_id, hash_pw, u_name, u_email, u_phone, u_brand, postcode, address, detailAddress, u_admin},
            function(err, rows){
                if (err){
                    connection.rollback(function(){
                        console.log('err! :',err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }

        })
    })
})

//장차 회원 정보 수정
router.put('/member/:uid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `UPDATE tU SET
                        U_uId = :u_login_id,
                        U_Name = :u_name,
                        U_Email = :u_email,
                        U_Phone = :u_phone,
                        U_Brand = :u_brand,
                        U_Zip = :postcode,
                        U_Addr1 = :address,
                        U_Addr2 = :detailAddress,
                        U_isAdmin = :u_admin
                        WHERE U_ID = :u_id `;
        let u_login_id = req.body.u_login_id,
            u_name = req.body.u_name,
            u_email = req.body.u_email,
            u_phone = req.body.u_phone,
            u_brand = req.body.u_brand,
            postcode = req.body.postcode,
            address = req.body.address,
            detailAddress = req.body.detailAddress,
            u_admin = req.body.u_admin,
            u_id = req.params.uid;    

        connection.query(query,{u_login_id, u_name, u_email, u_phone, u_brand, postcode, address, detailAddress, u_admin, u_id}, 
            function(err,rows){
                if (err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            res.json({data : 300});
                            throw err;
                        });
                    }
                    res.json({data : 200});    
                });
            }
        })
    })
})

//특정 회원 정보 삭제
router.delete('/member/:uid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `DELETE FROM tU where U_ID = :u_id`;
        let u_id = req.params.uid;
        connection.query(query,{u_id}, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })
})

//선택된 다수의 회원 삭제
router.delete('/member', async function(req, res){
    connection.beginTransaction(function(err){
        let u_id = req.body.row_ids;
        let query = `DELETE FROM tU where U_ID IN (${u_id})`;

        connection.query(query, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('err!!!!',err);
                        res.json({data : 300});
                    //    throw err;
                    })
                    
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                console.log('ERROR :', err);
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })

})

//운송사 목록
router.get('/business',function(req,res){
    let query = `SELECT * FROM tB`
    if(req.query.type === 'search'){
        let condition_list = [];
        if( req.query.b_name){
            condition_list.push(`B_Name like '%${req.query.b_name}%'`);
        }
        if( req.query.b_phone){
            condition_list.push(`B_Tel like '%${req.query.b_phone}%'`);
        }
        if( req.query.b_fax){
            condition_list.push(`B_Fax like '%${req.query.b_fax}%'`);
        }
        if( req.query.b_email){
            condition_list.push(`B_Email like '%${req.query.b_email}%'`);
        }
        if( req.query.b_zip){
            condition_list.push(`B_Zip like '%${req.query.b_zip}%'`);
        }
        if( req.query.b_addr1){
            condition_list.push(`B_Addr1 = '${req.query.b_addr1}'`);
        }
        if( req.query.b_addr2){
            condition_list.push(`B_Addr2 like '%${req.query.b_addr2}%'`);
        }
        if( req.query.b_cdt){
            condition_list.push(`B_cDt like '%${req.query.b_cdt}%'`);
        }

        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = ' WHERE '+condition_list.join(searchType);
            query += condition_stmt;
        }

        connection.query(query,
            function(err, rows){
            if(err) throw err;

            res.json({data : rows})
        })

    }else{
        connection.query(query,
            function(err,rows){
                if(err) throw err;
                res.json({data : rows});
        })
    }

})

//운송사 신규 등록
router.post('/business', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `insert into tB (
                                B_Name,
                                B_Tel, 
                                B_Fax, 
                                B_Email, 
                                B_Zip, 
                                B_Addr1, 
                                B_Addr2
                                ) 
                        values( 
                            :b_name,  
                            :b_phone,  
                            :b_fax,  
                            :b_email, 
                            :b_zip, 
                            :b_addr1,  
                            :b_addr2)`;

        let b_name = req.body.b_name,
            b_phone = req.body.b_phone,
            b_fax = req.body.b_fax,
            b_email = req.body.b_email,
            b_zip = req.body.b_zip,
            b_addr1 = req.body.b_addr1,
            b_addr2 = req.body.b_addr2;

        connection.query(query, 
                {b_name, b_phone, b_fax, b_email, b_zip, b_addr1, b_addr2},
            function(err, rows){
                if (err){
                    connection.rollback(function(){
                        console.log('err! :',err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }

        })
    })
})

//운송사 정보 수정
router.put('/business/:bid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `UPDATE tB SET
                        B_Name = :b_name,
                        B_Tel = :b_phone,
                        B_Fax = :b_fax,
                        B_Email = :b_email,
                        B_Zip = :b_zip,
                        B_Addr1 = :b_addr1,
                        B_Addr2 = :b_addr2,
                        B_uDt = now()
                    WHERE B_ID = :b_id `;

        let b_name = req.body.b_name,
            b_phone = req.body.b_phone,
            b_fax = req.body.b_fax,
            b_email = req.body.b_email,
            b_zip = req.body.b_zip,
            b_addr1 = req.body.b_addr1,
            b_addr2 = req.body.b_addr2,
            b_id = req.params.bid;    

        connection.query(query,{b_name, b_phone, b_fax, b_email, b_zip, b_addr1, b_addr2, b_id}, 
            function(err,rows){
                if (err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            res.json({data : 300});
                            throw err;
                        });
                    }
                    res.json({data : 200});    
                });
            }
        })
    })
})

//특정 운송사 정보 삭제
router.delete('/business/:bid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `DELETE FROM tB where B_ID = :b_id`;
        let b_id = req.params.bid;
        connection.query(query,{b_id}, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })
})

//선택된 다수의 회원 삭제
router.delete('/business', async function(req, res){
    connection.beginTransaction(function(err){
        let b_id = req.body.row_ids;
        let query = `DELETE FROM tB where B_ID IN (${b_id})`;

        connection.query(query, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('err!!!!',err);
                        res.json({data : 300});
                    //    throw err;
                    })
                    
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                console.log('ERROR :', err);
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })

})

//차량 타입 목록
router.get('/vehicle_type',function(req,res){
    let query = `SELECT * FROM tCY INNER JOIN tB ON tCY.CY_B_ID = tB.B_ID`
    let cy_list = req.body.cy_list,
        cy_type = req.body.cy_type,
        cy_total = req.body.cy_total,
        cy_service = req.body.cy_service,
        cy_price = req.body.cy_price;

    if(req.query.type === 'search'){
        let condition_list = [];
        if( req.query.cy_list != 'null'){
            condition_list.push(`CY_B_ID = ${req.query.cy_list}`);
        }
        if( req.query.cy_type){
            condition_list.push(`CY_Ty like '%${req.query.cy_type}%'`);
        }
        if( req.query.cy_total){
            condition_list.push(`CY_TotalPassenger like '%${req.query.cy_total}%'`);
        }
        if( req.query.cy_service){
            condition_list.push(`CY_ServicePassenger like '%${req.query.cy_service}%'`);
        }
        if( req.query.cy_price){
            condition_list.push(`CY_SeatPrice like '%${req.query.cy_price}%'`);
        }

        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = ' WHERE '+condition_list.join(searchType);
            query += condition_stmt;
        }

        connection.query(query,
            function(err, rows){
            if(err) throw err;

            res.json({data : rows})
        })

    }else{
        connection.query(query,
            function(err,rows){
                if(err) throw err;
                res.json({data : rows});
        })
    }

})

//차량타입 신규 등록
router.post('/vehicle_type', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `insert into tCY (
                                CY_B_ID,
                                CY_Ty, 
                                CY_TotalPassenger, 
                                CY_ServicePassenger, 
                                CY_SeatPrice
                                ) 
                        values( 
                            :cy_list,  
                            :cy_type,  
                            :cy_total,  
                            :cy_service, 
                            :cy_price)`;

        let cy_list = req.body.cy_list,
            cy_type = req.body.cy_type,
            cy_total = req.body.cy_total,
            cy_service = req.body.cy_service,
            cy_price = req.body.cy_price;

        connection.query(query, 
                {cy_list, cy_type, cy_total, cy_service, cy_price},
            function(err, rows){
                if (err){
                    connection.rollback(function(){
                        console.log('err! :',err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }

        })
    })
})

//운송사 정보 수정
router.put('/vehicle_type/:cyid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `UPDATE tCY SET
                        CY_B_ID = :cy_list,
                        CY_Ty = :cy_type,
                        CY_Totalpassenger = :cy_total,
                        CY_ServicePassenger = :cy_service,
                        CY_SeatPrice = :cy_price,
                        CY_uDt = now()
                    WHERE CY_ID = :cy_id `;

        let cy_list = req.body.cy_list,
            cy_type = req.body.cy_type,
            cy_total = req.body.cy_total,
            cy_service = req.body.cy_service,
            cy_price = req.body.cy_price,
            cy_id = req.params.cyid;

        connection.query(query,{cy_list, cy_type, cy_total, cy_service, cy_price, cy_id}, 
            function(err,rows){
                if (err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            res.json({data : 300});
                            throw err;
                        });
                    }
                    res.json({data : 200});    
                });
            }
        })
    })
})

//특정 운송사 정보 삭제
router.delete('/vehicle_type/:cyid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `DELETE FROM tCY where CY_ID = :cy_id`;
        let cy_id = req.params.cy_id;
        connection.query(query,{cy_id}, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })
})

//선택된 다수의 회원 삭제
router.delete('/vehicle_type', async function(req, res){
    connection.beginTransaction(function(err){
        let cy_id = req.body.row_ids;
        let query = `DELETE FROM tCY where CY_ID IN (${cy_id})`;

        connection.query(query, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('err!!!!',err);
                        res.json({data : 300});
                    //    throw err;
                    })
                    
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                console.log('ERROR :', err);
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })

})

//차량 타입 목록
router.get('/user_list',function(req,res){

    let query = `SELECT U_ID, U_Name, U_Phone FROM tU`

    connection.query(query,
        function(err,rows){
            if(err) throw err;
            res.json({data : rows});
    })
    
})

//장차 결제 리스트 및 검색
router.get('/admin_payment',function(req, res){
    //부분 취소 후 결제여부가 결제취소로 뜨는걸 방지하기 위해 정렬 후 그룹바이
    let query = `SELECT * FROM (SELECT 
                                    PH_ID,
                                    U_uId,
                                    U_Name,
                                    PH_PG_ID,
                                    U_Phone,
                                    PH_PG_Name,
                                    PH_Price,
                                    (CR_Price * (SELECT COUNT(*) FROM tCR
                                            WHERE CR_PH_ID = PH_ID AND 
                                            CASE WHEN CR_PayState = '결제취소' 
                                                 THEN CR_PayState = '결제취소' 
                                                 WHEN CR_PayState = '결제완료'
                                                 THEN CR_PayState = '0'
                                                 WHEN PH_Type = '후불결제'
                                                 THEN CR_PayState = '0'
                                                 WHEN PH_Type = '무통장입금'
                                                 THEN CR_PayState = '0'
                                                 ELSE CR_PayState = '결제대기'
                                                 END)) AS cancel_pay,
                                                
                                    (PH_Price - CR_Price * (SELECT COUNT(*) FROM tCR 
                                            WHERE CR_PH_ID = PH_ID AND 
                                            CASE WHEN CR_PayState = '결제취소' 
                                                 THEN CR_PayState = '결제취소' 
                                                 WHEN CR_PayState = '결제완료'
                                                 THEN CR_PayState = '0'
                                                 ELSE CR_PayState = '결제대기'
                                                 END)) AS last_pay,
                                    CR_PayState,
                                    PH_Type,
                                    PH_PayAmount,
                                    CR_Memo,
                                    CR_cDt,
                                    CR_CancelDt,
                                    PH_PayConfirm,
                                    PH_OrderNumber
                                FROM tPH 
                                    INNER JOIN tU ON tU.U_ID = tPH.PH_U_ID
                                    INNER JOIN tCR ON tCR.CR_PH_ID = tPH.PH_ID
                                    ORDER BY CR_PayState ASC) sort`;

    // 검색일 경우 쿼리 추가                                    
    if(req.query.type === 'search'){
        let condition_list = [];
        if( req.query.u_name){
            condition_list.push(`U_Name like '%${req.query.u_name}%'`);
        }
        if( req.query.u_phone){
            condition_list.push(`U_Phone like '%${req.query.u_phone}%'`);
        }
        if( req.query.pg_name){
            condition_list.push(`PH_PG_Name like '%${req.query.pg_name}%'`);
        }
        if( req.query.pg_id){
            condition_list.push(`PH_PG_ID like '%${req.query.pg_id}%'`);
        }
        if( req.query.ph_price){
            condition_list.push(`PH_Price like '%${req.query.ph_price}%'`);
        }
        if( req.query.ph_type){
            condition_list.push(`PH_Type like '%${req.query.ph_type}%'`);
        }
        if( req.query.pay_state){
            condition_list.push(`CR_PayState like '%${req.query.pay_state}%'`);
        }
        if( req.query.u_cdt){
            condition_list.push(`CR_cDt like '%${req.query.u_cdt}%'`);
        }

        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = ' WHERE '+condition_list.join(searchType);
            query += condition_stmt + ' GROUP BY sort.PH_ID'
        }else{
            query += ' GROUP BY sort.PH_ID'
        }
        

        connection.query(query,
            function(err, rows){
            if(err) throw err;
            // console.log('rows:',rows);
            res.json({data : rows})
        })
    }else{
        query += ' GROUP BY sort.PH_ID'
        connection.query(query, function(err, rows){
            if(err) throw err;
            // console.log('rows:',rows);
            res.json({data : rows})
        })
    }

})


//회원 예매 목록
router.get('/payment_list',function(req,res){

    let query = `SELECT 
                    CR_ID,
                    CR_CT_ID,
                    CR_U_ID,
                    U_Name,
                    U_Email,
                    B_Name,
                    U_Phone,
                    U_Brand,
                    U_Zip,
                    U_Addr1,
                    U_Addr2,
                    CR_SeatNum,
                    CR_Price,
                    CR_ScanPy,
                    CR_ScanSe,
                    CR_Cancel,
                    CR_CancelDt,
                    CR_PayState,
                    CR_cDt,
                    CT_ID,
                    CT_DepartureTe,
                    CT_ReturnTe,
                    CT_CarNum,
                    U_uId,
                    CR_Memo,
                    PH_PG_ID,
                    PH_ID,
                    PH_Type,
                    PH_OrderNumber,
                    PH_CodeType,
                    PH_CardName,
                    PH_BankNumber,
                    PH_BankCode,
                    DAYOFWEEK(tCT.CT_DepartureTe) AS deptDay,
                    DAYOFWEEK(tCT.CT_ReturnTe) AS retnDay,
                    DAYOFWEEK(tCR.CR_cDt ) AS payDayWeek,
                    date_format(tCR.CR_cDt ,'%y%y.%m.%d') as payDayYM,
                    date_format(tCR.CR_cDt ,'%H:%i') as payDayTm,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') AS deptTe,
                    date_format(tCT.CT_DepartureTe,'%m.%d') AS startDay,
                    date_format(tCT.CT_ReturnTe,'%m.%d') as returnDay,
                    date_format(tCT.CT_DepartureTe,'%H:%i') as startTime,
                    date_format(tCT.CT_ReturnTe,'%H:%i') as returnTime,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d') as deptTe2,
                    date_format(tCT.CT_ReturnTe,'%y%y.%m.%d') as returnTe2,
                    date_format(tCR.CR_cDt,'%y%y.%m.%d %H:%i') as PayDay2
                FROM tCR
                    INNER JOIN tCT ON tCR.CR_CT_ID = tCT.CT_ID
                    INNER JOIN tU ON tCR.CR_U_ID = tU.U_ID
                    INNER JOIN tCY ON tCY.CY_ID = tCT.CT_CY_ID
                    INNER JOIN tB ON tB.B_ID = tCY.CY_B_ID
                    INNER JOIN tPH ON tPH.PH_ID = tCR.CR_PH_ID
                WHERE PH_ID = :ph_id`

    let ph_id = req.query.ph_id;

    console.log('ph',ph_id);

    connection.query(query, {ph_id},
        function(err, rows){
            if(err) throw err;
            res.json({data : rows});
        })
})

//결제 여부 분기

router.get('/payment_cancel', function(req,res){
    let query = `SELECT * FROM tCR WHERE CR_PH_ID = :ph_id AND CR_Cancel = 'N'`
    let ph_id = req.query.ph_id;
    connection.query(query, {ph_id},
        function(err, rows){
            res.json({data : rows.length});
    })
})

//유튜브 리스트
router.get('/video',function(req, res){
    let query = `SELECT 
                    YL_id, 
                    YL_url, 
                    YL_title, 
                    left(YL_description,10) as contents, 
                    YL_description,
                    YL_ch_name, 
                    YL_d_order, 
                    YL_dDt 
                FROM tYL`

    if(req.query.type === 'search'){
        let condition_list = [];
        if( req.query.video_url){
            condition_list.push(`YL_url like '%${req.query.video_url}%'`);
        }
        if( req.query.video_title){
            condition_list.push(`YL_title like '%${req.query.video_title}%'`);
        }
        if( req.query.video_contents){
            condition_list.push(`YL_description like '%${req.query.video_contents}%'`);
        }
        if( req.query.video_channel){
            condition_list.push(`YL_ch_name like '%${req.query.video_channel}%'`);
        }
        if( req.query.video_recommend != 'null'){
            condition_list.push(`YL_d_order like '%${req.query.video_recommend}%'`);
        }
        if( req.query.video_cdt){
            condition_list.push(`YL_dDt like '%${req.query.video_cdt}%'`);
        }

        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = ' WHERE '+condition_list.join(searchType);
            query += condition_stmt;
        }

        connection.query(query,
            function(err, rows){
            if(err) throw err;

            res.json({data : rows})
        })
    }else{
        connection.query(query, function(err, rows){
            if(err) throw err;
            res.json({data : rows})
        })
    }

})



//유튜브 신규 등록
router.post('/video', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `INSERT INTO tYL (
                                YL_url, 
                                YL_title, 
                                YL_description, 
                                YL_ch_name,
                                YL_d_order,
                                YL_dDt
                                ) 
                        VALUES( 
                            :video_url,  
                            :video_title,  
                            :video_contents,  
                            :video_channel,
                            :video_recommend,
                            :video_cdt)`;

        let video_url = req.body.video_url,
            video_title = req.body.video_title,
            video_contents = req.body.video_contents,
            video_channel = req.body.video_channel,
            video_recommend = req.body.video_recommend,
            video_cdt = req.body.video_cdt;

        connection.query(query, 
                {video_url, video_title, video_contents, video_channel, video_recommend, video_cdt},
            function(err, rows){
                if (err){
                    connection.rollback(function(){
                        console.log('err! :',err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }

        })
    })
})

//유튜브 정보 수정
router.put('/video/:ylid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `UPDATE tYL SET
                        YL_url = :video_url,
                        YL_title = :video_title,
                        YL_description = :video_contents,
                        YL_ch_name = :video_channel,
                        YL_d_order = :video_recommend,
                        YL_dDt = :video_cdt
                    WHERE YL_id = :yl_id `;

        let video_url = req.body.video_url,
            video_title = req.body.video_title,
            video_contents = req.body.video_contents,
            video_channel = req.body.video_channel,
            video_recommend = req.body.video_recommend,
            video_cdt = req.body.video_cdt;
        let yl_id = req.params.ylid;
        connection.query(query,{video_url, video_title, video_contents, video_channel, video_recommend, video_cdt, yl_id}, 
            function(err,rows){
                if (err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            res.json({data : 300});
                            throw err;
                        });
                    }
                    res.json({data : 200});    
                });
            }
        })
    })
})

//특정 운송사 정보 삭제
router.delete('/video/:ylid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `DELETE FROM tYL where YL_id = :yl_id`;
        let yl_id = req.params.ylid;
        connection.query(query,{yl_id}, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })
})

//선택된 다수의 회원 삭제
router.delete('/video', async function(req, res){
    connection.beginTransaction(function(err){
        let yl_id = req.body.row_ids;
        let query = `DELETE FROM tYL where YL_id IN (${yl_id})`;

        connection.query(query, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('err!!!!',err);
                        res.json({data : 300});
                    //    throw err;
                    })
                    
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                console.log('ERROR :', err);
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })
})

//공지사항 리스트
router.get('/info',function(req, res){
    let query = `SELECT 
                    * 
                FROM tIF`

    if(req.query.type === 'search'){
        let condition_list = [];
        if( req.query.info_title){
            condition_list.push(`IF_Title like '%${req.query.info_title}%'`);
        }
        if( req.query.info_url){
            condition_list.push(`IF_Url like '%${req.query.info_url}%'`);
        }
        if( req.query.info_redirect){
            condition_list.push(`IF_Redirect like '%${req.query.info_redirect}%'`);
        }
        if( req.query.info_start){
            condition_list.push(`IF_Start >= '${req.query.info_start}'`);
        }
        if( req.query.info_end){
            condition_list.push(`IF_End <= '${req.query.info_end}'`);
        }
        if( req.query.info_state != 'null'){
            condition_list.push(`IF_State = '${req.query.info_state}'`);
        }

        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = ' WHERE '+condition_list.join(searchType);
            query += condition_stmt;
        }

        connection.query(query,
            function(err, rows){
            if(err) throw err;

            res.json({data : rows})
        })
    }else if(req.query.type === 'info_list'){
        query += ` WHERE IF_End >= NOW() AND
                         IF_State = 'Y'
                    ORDER BY IF_Start ASC
                LIMIT 1`;

        connection.query(query,
            function(err, rows){
            if(err){
                console.log('/info 에러발생',err);
                throw err;
            } 

            res.json({data : rows})
        })

        
    }else{
        connection.query(query, function(err, rows){
            if(err) throw err;
            res.json({data : rows})
        })
    }

})


//공지사항 등록
router.post('/info', upload.any(), async function (req, res, next) {
    connection.beginTransaction(function(err){
        let query = `INSERT INTO tIF(
                    IF_Title, IF_Url, IF_Redirect, IF_Start, IF_End, IF_State) 
                VALUES(:info_title, :info_url, :info_redirect, :info_start, :info_end, :info_state) `;
        // 광고입력
        if(req.files.length === 0) throw Error('Non include files');
        // let content_type = req.files[0].mimetype.split('/')[0];
        let filename = req.files[0].filename;
        let old_path = req.files[0].path;
        let new_path = path.join(config.path.info_image , filename);

        let info_url = '/img/info/'+filename;''
        let info_title = req.body.info_title,
            info_redirect = req.body.info_redirect,
            info_start = req.body.info_start,
            info_end = req.body.info_end,
            info_state = req.body.info_state;

        fs.rename(old_path, new_path, (err) => {
            if (err) throw err;
            fs.stat(new_path, (err, stats) => {
                if (err) throw err;
                console.log(`stats: ${JSON.stringify(stats)}`);
            });
        });

        connection.query(query,{info_title, info_url, info_redirect, info_start, info_end, info_state},
            function(err,rows){
                if(err){
                    connection.rollback(function(){
                        console.log('err!',err);
                        res.json({data : 301});
                    })
                }else{
                    connection.commit(function(err){
                        if(err){
                            return connection.rollback(function(){
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});
                    })
                }
        })
    })

});

//공지사항 수정
router.put('/info/:ifid', upload.any(), async function (req, res, next) {
    connection.beginTransaction(function(err){
        let query = `UPDATE tIF SET 
                        IF_Title = :info_title,
                        IF_Start = :info_start,
                        IF_Redirect = :info_redirect,
                        IF_End = :info_end,
                        IF_State = :info_state 
                    `;

        let info_url;
        let filename;
        let old_path;
        let new_path;
        // 광고입력
        if(req.files.length === 0){
            // throw Error('Non include files');
            console.log('Non include files',Error);
            query += ' WHERE IF_ID = :if_id'
        }else{
            
            filename = req.files[0].filename;
            old_path = req.files[0].path;
            new_path = path.join(config.path.info_image , filename);
            //파일 경로 지정
            fs.rename(old_path, new_path, (err) => {
                if (err) throw err;
                fs.stat(new_path, (err, stats) => {
                    if (err) throw err;
                    console.log(`stats: ${JSON.stringify(stats)}`);
                });
            });

            query += ` ,IF_Url = :info_url WHERE IF_ID = :if_id`
            info_url = '/img/info/'+filename;
        } 

        console.log('info',info_url);
        let if_id = req.params.ifid;
        let info_title = req.body.info_title,
            info_redirect = req.body.info_redirect,
            info_start = req.body.info_start,
            info_end = req.body.info_end,
            info_state = req.body.info_state;



        connection.query(query,{info_title, info_url, info_redirect, info_start, info_end, if_id, info_state},
            function(err,rows){
                if(err){
                    connection.rollback(function(){
                        console.log('err!',err);
                        res.json({data : 301});
                    })
                }else{
                    connection.commit(function(err){
                        if(err){
                            return connection.rollback(function(){
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});
                    })
                }
        })
    })

});


//특정 공지사항 정보 삭제
router.delete('/info/:ifid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `DELETE FROM tIF where IF_ID = :if_id`;
        let if_id = req.params.ifid;
        connection.query(query,{if_id}, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('ERROR ! :', err);
                        res.json({data : 300});
                        // throw err;
                    })
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })
})

//선택된 다수의 공지사항 삭제
router.delete('/info', async function(req, res){
    connection.beginTransaction(function(err){
        let if_id = req.body.row_ids;
        let query = `DELETE FROM tIF where IF_ID IN (${if_id})`;

        connection.query(query, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('err!!!!',err);
                        res.json({data : 300});
                    //    throw err;
                    })
                    
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                console.log('ERROR :', err);
                                res.json({data : 300});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })
})

//입점 상담 신청 리스트
router.get('/benefit', function(req, res){
    let query = `SELECT 
                    SI_ID,
                    SI_Name,
                    SI_Phone,
                    SI_Brand,
                    SI_Addr1,
                    SI_Addr2,
                    SI_Content,
                    left(SI_Content,10) as contents,
                    SI_cDt,
                    SI_Read 
                FROM tSI`;
    if(req.query.type == 'search'){
        let condition_list = [];
        if( req.query.benefit_name){
            condition_list.push(`SI_Name like '%${req.query.benefit_name}%'`);
        }
        if( req.query.benefit_phone){
            condition_list.push(`SI_Phone like '%${req.query.benefit_phone}%'`);
        }
        if( req.query.benefit_brand){
            condition_list.push(`SI_Brand like '%${req.query.benefit_brand}%'`);
        }
        if( req.query.benefit_addr1){
            condition_list.push(`SI_Addr1 like '%${req.query.benefit_addr1}%'`);
        }
        if( req.query.benefit_addr2){
            condition_list.push(`SI_Addr2 like '%${req.query.benefit_addr2}%'`);
        }
        if( req.query.benefit_content){
            condition_list.push(`SI_Content like '%${req.query.benefit_content}%'`);
        }
        if( req.query.benefit_check != 'null'){
            condition_list.push(`SI_Read = '${req.query.benefit_check}'`);
        }
        if( req.query.benefit_day){
            condition_list.push(`SI_cDt like '%${req.query.benefit_day}%'`);
        }
        let searchType = (req.query.searchType == "true") ? " AND " : " OR ";
        if( condition_list.length > 0){
            let condition_stmt = ' WHERE '+condition_list.join(searchType);
            query += condition_stmt;
        }

        connection.query(query,
            function(err, rows){
            if(err) throw err;

            res.json({data : rows})
        })
    }
    else{
        connection.query(query,function(err, rows){
            if(err) throw err;
            res.json({data : rows})
        })
    }
})

//신청서 읽음 처리
router.put('/benefit/:siid', async function(req, res){

    connection.beginTransaction(function(err){
        let query = `UPDATE tSI SET SI_Read = :benefit_check WHERE SI_ID = :si_id`;
        let benefit_check = req.body.benefit_check;
        let si_id = req.params.siid;
        connection.query(query, {benefit_check, si_id}, 
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('err!!!!',err);
                        res.json({data : '500'});
                    })
                    
                }else{
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                console.log('ERROR :', err);
                                res.json({data : '500'});
                                throw err;
                            });
                        }
                        res.json({data : 200});    
                    });
                }
        })
    })
})

//신청서 삭제
router.delete('/benefit/:siid', async function(req, res){
    connection.beginTransaction(function(err){
        let query = `DELETE FROM tSI WHERE SI_ID = :si_id`;
        let si_id = req.params.siid;
        connection.query(query,{si_id},
            function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('error', err);
                        res.json({data : '500'});
                    })
                }else{
                    connection.commit(function(err){
                        if(err){
                            return connection.rollback(function(){
                                console.log('error', err);
                                res.json({data : '500'});
                                throw err;
                            })
                        }
                        res.json({data : 200});
                    })
                }
    
        })
    })
})

//신청서 다중 삭제
router.delete('/benefit', async function(req, res){
    connection.beginTransaction(function(err){
        let si_id = req.body.row_ids;
        let query = `DELETE FROM tSI WHERE SI_ID IN (${si_id})`
        connection.query(query,function(err, rows){
            if(err){
                connection.rollback(function(){
                    console.log('error', err);
                    res.json({data : '500'});
                })
            }else{
                connection.commit(function(err){
                    if(err){
                        return connection.rollback(function(){
                            console.log('error', err);
                            res.json({data : '500'});
                            throw err;
                        })
                    }
                    res.json({data : 200});
                })
            }
        })
    })
})

//신청서 읽지않은 수
router.get('/benefit_length', function(req,res){
    let query = `SELECT COUNT(SI_READ) as count FROM tSI WHERE SI_READ = 'n'`
    connection.query(query, function(err, rows){
        if(err) throw err;
        res.json({data : rows});
    })
})


router.post('/filesave', upload.any(), async function (req, res, next) {

    console.log('body',req.body);
    console.log('file',req.files);
})




//카드 리턴값
router.post('/return_card', (req, res, next) =>{
    console.log('카드결제 연동값 :', req.body);
    res.send("0000")
});

//가상계좌 리턴값
router.post('/return_vbank', async function(req, res){
    console.log('가상계좌 연동값 :', req.body);
    
    if(req.body.pgResultMsg == '가상계좌입금 성공'){
        connection.beginTransaction(function(err){
            let query = `UPDATE tCR
                                INNER JOIN tPH ON tCR.CR_PH_ID = tPH.PH_ID
                            SET CR_PayState = "결제완료"
                            WHERE tPH.PH_PG_ID = '${req.body.tid}'`
            connection.query(query,function(err, rows){
                if(err){
                    connection.rollback(function(){
                        console.log('error', err);
                    })
                }else{
                    connection.commit(function(err){
                        if(err){
                            return connection.rollback(function(){
                                console.log('error', err);
                            })
                        }
                        res.send("0000");
                    })
                }
            })
        })
    }
});

//계좌이체 리턴값
router.post('/return_bank', async function(req, res){
    console.log('계좌이체 연동 값 :', req.body);
    res.send("0000");
});

//관리 페이지에서 정산 수동 요청
router.get('/pay-calculate', function(req,res){
    console.log('req!!',req.query.req_day);
    payCalculate(req.query.req_day)
        .then(result => res.send(result))
        .catch(err => console.log('promise Error :',err))
        // console.log('result',result);

})

//관리 페이지에서 정산 요청 단순 async/await 방법
// router.get('/pay-calculate', async function(req,res){
//     let await_result = await payCalculate();
//     res.json({data : await_result})
// })
 
//이노페이 정산 요청
function payCalculate(day_param){
    
    //day_param은 결제 관리 페이지에서 요청한 날짜
    //요청할 날짜
    let settlmntDt;
    //결제 관리 페이지에서 요청한 날짜가 있는 경우
    if(day_param){
        settlmntDt = day_param;
    }
    //서버단에서만 실행될 경우 금일 날짜로 요청
    else{
        settlmntDt = pgGetToday();
    }
    //request의 요청할 값들
    let data_obj = {
        uri:'https://api.innopay.co.kr/api/settlmntDownload.do', 
        method: 'POST',
        form: {
          "mid" : "pgaz369azm", //상점 아이디
          "merchantKey": "fx/UT4tcb5VWxP24BXiwH0stdJnNxFf6GpdFdvd42Bmwnurd/1QgGPORTIfioiAVy/B0cx6j5spsDwAfGsleuQ==", // 라이센스 키
          "settlmntDt" : settlmntDt, // 정산할 날짜
          "groupYn" : 'N' // N : 개별 상점 정산내역, Y : 전체 상점 정산내역 (az369는 전체 상점 내역을 지원 안함)
        },
        headers: {
            'Content-Type': 'text/html; charset=utf-8' //요청할 값의 타입 
        }
        ,encoding: null //인코딩 안함
    }

    //정산관리 API에 요청할 날짜 확인
    console.log('pgGetToday :',settlmntDt);

    //정산이 된 고유번호 배열
    let pg_number = [];
    //정산이 된 실제정산 금액
    let pg_pay = [];

    // '/pay-calculate' GET 요청에서 리턴값을 받을수 있도록 프로미스를 사용
    return new Promise(resolve=>{
        //post 요청 
        api_request.post(data_obj, function(err, res, body){
            if(err){
                console.log('err',err);  
            }
            //디코딩
            let utf8_str = iconv.decode(body,'euc-kr');
            //띄어쓰기 삭제
            let pg_data = utf8_str.trim();
            //수직선으로 구분된 텍스트 형식의 데이터를 객체로 변환
            let result = pg_data.split(/\r?\n/).map(x => x.split('|').reduce((a, o, i) => {
                                a['type' + i] = o;
                                return a;
                            }, {}));
            //변환된 값 확인
            console.log('body',result);

            //정산내역이 있는 경우 처리
            if(result[0].type0 == "0000"){

                //정산금액이 양수인 것들 (실제 정산으로 들어갈 데이터) 해당 데이터에 type29 실제 정산금액을 넣어야 함
                let int_obj = result.filter(data => data.type15 > 0);
                //재가공한 데이터
                let final_obj = [];
                console.log('int_test',int_obj);
                for(let pi=0; pi<int_obj.length; pi++){
                    //위에서 실제 DB에 저장된 주문번호를 통해 빈복문을 돌려 계산
                    //해당 승인번호를 가진 객체 찾기
                    let obj_test = result.filter(data => data.type17 == int_obj[pi].type17);

                    console.log('obj_test',obj_test);

                    //실제 정산금액
                    let type_pay =  0;
                    
                    //해당 승인번호를 가진 객체들의 정산금액을 서로 더해 실제 정산금액을 구함
                    for(let i=0; i<obj_test.length; i++){
                        type_pay += Number(obj_test[i].type15);
                    }
                    //key type29 값 추가
                    int_obj[pi].type29 = `${type_pay}`;
                    
                    //해당 배열의 수 만큼 다시 객체 배열 생성
                    final_obj.push(int_obj[pi]);
                }

                console.log('final_result',final_obj);
                
                //반복문을 통해 배열에 해당 거래고유 번호 삽입 type2에 거래 고유번호가 있음
                for(i=0; i<final_obj.length; i++){
                    pg_number.push(final_obj[i].type2);
                    pg_pay.push(final_obj[i].type29);
                }

                console.log('rows',pg_number);
                console.log('rows',pg_pay);
               
                //정산된 결제내역의 ID 가져오기
                let sel_query = `SELECT PH_ID FROM tPH 
                                    WHERE PH_PG_ID IN (:pg_number)`
                
                let ex_query = '';
                for(let i=0; i<pg_number.length; i++){
                    ex_query += `UPDATE tPH SET PH_PayConfirm = 'Y', PH_PayAmount = '${pg_pay[i]}' WHERE PH_PG_ID = '${pg_number[i]}';`
                }
                connection.beginTransaction(function(err){
                    if(err) throw err;
                    connection.query(ex_query,
                        function(err, rows){
                        if(err){
                            connection.rollback(function(){
                                console.log('정산확인 에러 , ex_query ERROR', err);
                            })
                        }
                        //정산확인 된 결제내역 찾기
                        connection.query(sel_query, 
                            {
                                pg_number : pg_number
                            },function(err, sel_rows){
                            //업데이트 성공 시 커밋하여 트랜잭션 종료
                            connection.commit(function(err) {
                                if (err) {
                                    return connection.rollback(function() {
                                        throw err;
                                    });
                                }
                                console.log('정산 확인 완료',rows);
                                console.log('정산 확인 완료',sel_rows);
                                //정산 결과를 반환함
                                resolve(sel_rows);
                                // resolve(result);
                            });
                        })
                    })
                })
            }else{
                resolve(result);
            }
        })
    })
}
// payCalculate();
//현재 날짜 계산
function pgGetToday(){
    var date = new Date();
    var year_toString = date.getFullYear().toString();
    var year = year_toString.substr(0,4) 
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    return year + month + day;
}

//                              초 | 분 | 시간 | 일 | 월 | 요일 0~7 (0과 7일 일요일 임) 
//                              아래 방식으로 하면 월~금 10:00:00에 실행
// const j = schedule.scheduleJob('00 45 14 * * 1-5', () => {
    const j = schedule.scheduleJob('00 00 10 * * 1-7', () => {
    payCalculate();
    console.log('자동정산 실행')
})

module.exports = router;
