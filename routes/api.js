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
const path = require('path');
const fs = require('fs');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

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
    let query = `insert into tCP(
                        CP_U_ID, 
                        CP_PreferDays, 
                        CP_DepartureTe, 
                        CP_ReturnTe) 
                    values( 
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
    let query = `select U_uId from tU where U_Name =:uName and U_Phone =:uPhone limit 1`;
    
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
    let query = `insert into tSI (
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
    let password = req.body.pw;
    let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString();
    
    console.log("유저아이디 :", uUserName);
    console.log("password :", password);
    console.log("hash :", hash_pw);
    console.log("phone ::", uPhone);
    console.log("uZip :", uZip);
    console.log("uAddr1 :", uAddr1);
    console.log("uAddr2 ::", uAddr2);

    let query = `UPDATE tU SET 
                    U_Pw = :hash_pw, 
                    U_Phone = :uPhone, 
                    U_Brand = :uBrand,
                    U_Zip = :uZip, 
                    U_Addr1 = :uAddr1, 
                    U_Addr2 = :uAddr2, 
                    U_uDt = now() 
                WHERE U_uId =:uUserName`;

    let query2 = `UPDATE tU SET 
                    U_Brand = :uBrand,
                    U_Zip = :uZip, 
                    U_Addr1 = :uAddr1, 
                    U_Addr2 = :uAddr2, 
                    U_uDt = now() 
                WHERE U_uId =:uUserName`;

    let query3 = `UPDATE tU SET  
                    U_Pw = :hash_pw, 
                    U_Brand = :uBrand,
                    U_Zip = :uZip, 
                    U_Addr1 = :uAddr1, 
                    U_Addr2 = :uAddr2, 
                    U_uDt = now() 
                WHERE U_uId =:uUserName`;

    let query4 = `UPDATE tU SET 
                    U_Phone = :uPhone, 
                    U_Brand = :uBrand,
                    U_Zip = :uZip, 
                    U_Addr1 = :uAddr1, 
                    U_Addr2 = :uAddr2, 
                    U_uDt = now() 
                WHERE U_uId =:uUserName`;

    if(password === "" && uPhone === "" ){
        connection.query(query2,{uBrand, uZip, uAddr1, uAddr2, uUserName},
            function(err, rows){
                if (err) throw err;                     
                res.json( {  data : "성공"});
            })
            
    } else if(password != "" && uPhone != "" ) {
        connection.query(query,{hash_pw, uPhone, uBrand, uZip, uAddr1, uAddr2, uUserName},
            function(err, rows){
                if (err) throw err;                     
                res.json( {  data : "성공"});
            })
    } else if(password != "" && uPhone === "" ) {
        connection.query(query3,{hash_pw, uBrand, uZip, uAddr1, uAddr2, uUserName},
            function(err, rows){
                if (err) throw err;  
                res.json( {  data : "성공"});
        })
    } else if(password === "" && uPhone != "" ) {
        connection.query(query4,{uPhone, uBrand, uZip, uAddr1, uAddr2, uUserName},
            function(err, rows){
                if (err) throw err;  
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
router.get('/user/delchoice',  auth.isLoggedIn, (req, res, next) =>{
   
    let query = `select * from tCR 
                    where 
                        CR_U_ID = :sessionId AND 
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
    console.log("dddd :", sessionId);
    //console.log(seatNum);
    // let query = `
    //             select
    //                 tCR.CR_ID,
    //                 tCR.CR_CT_ID as ctId,
    //                 tCR.CR_cDt as payDay,
    //                 date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') AS deptTe,
    //                 date_format(tCT.CT_DepartureTe,'%m.%d') AS startDay,
    //                 date_format(tCT.CT_ReturnTe,'%m.%d') as returnDay,
    //                 date_format(tCT.CT_DepartureTe,'%H:%i') as startTime,
    //                 date_format(tCT.CT_ReturnTe,'%H:%i') as returnTime,
    //                 date_format(tCT.CT_DepartureTe,'%y%y.%m.%d') as deptTe2,
    //                 date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
    //                 tCR.CR_cDt as cDt,
    //                 tB.B_Name as carName,
    //                 tCT.CT_CarNum,
    //                 (SELECT right(CT_CarNum, 4)) AS carNum,
    //                 tPH.PH_Type as payType,
    //                 tPH.PH_Price as price,
    //                 tPH.PH_ID as pId,
    //                 count(CR_SeatNum) as seatCnt
    //             from tCT 
    //                 left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
    //                 left join tB on tCY.CY_B_ID = tB.B_ID 
    //                 left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
    //                 left join tPH on tPH.PH_ID = tCR.CR_PH_ID
    //             where tCR.CR_CT_ID = tCT.CT_ID AND tCR.CR_Cancel = 'N'
    //                     and tCR.CR_U_ID = :sessionId and tCR.CR_cDt IN ( :seatNum)
    //                 and tCT.CT_DepartureTe > NOW()
    //             group by tCR.CR_cDt
    //             order by tCT.CT_DepartureTe desc
    //             `;

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
                    tCR.CR_QrCode,
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
                    INNER JOIN tCT ON tCT.CT_ID = tCR.CR_CT_ID
                    INNER JOIN tCY ON tCY.CY_ID = tCT.CT_CY_ID
                    INNER JOIN tB ON tB.B_ID = tCY.CY_B_ID
                    INNER JOIN tPH ON tPH.PH_ID = tCR.CR_PH_ID

                where 
                    tCR.CR_CT_ID = tCT.CT_ID AND tCR.CR_Cancel = 'N'
                    and tCR.CR_U_ID = :sessionId and tCR.CR_cDt IN ( :seatNum)
                    and tCT.CT_DepartureTe > NOW()
                    order by tCT.CT_DepartureTe desc`;
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

//예매취소
router.post('/user/cancelRes', auth.isLoggedIn, (req, res, next) =>{
    let query = `update tCR
                    inner join tCT on tCR.CR_CT_ID = tCT.CT_ID
                    set CR_Cancel = :crCancel, CR_CancelDt = now()
                    where CR_ID = :cr_id AND  CR_U_Id = :sessionId AND
                    tCT.CT_DepartureTe > date_add(now(),interval +4 day);`;
                    // and tCT.CT_DepartureTe > date_add(now(),interval +4 day);
    //pID  cr_cdt
    let select_query = `select CR_SeatNum, CR_Price from tCR where CR_ID = :cr_id AND tCR.CR_U_ID = :sessionId`;
    let sessionId = req.user.U_ID;
    let cr_id = req.body.cr_id;
    let crCancel = 'Y';

    connection.query(query,
        {
            crCancel, sessionId, cr_id

        },
        function(err, rows, fields) {
            if (err) throw err;

            connection.query(select_query,
                {
                    cr_id, sessionId
                },
                function(err, result, fields){
                    let over_lap = [];
                    for(let i=0; i <result.length; i++){
                          over_lap.push(result[i].CR_SeatNum)
                    }
                    let seat_number = over_lap.join('번,')+'번';
                    res.json({data : rows.affectedRows, seats : seat_number, cancelPay : result.length *result[0].CR_Price})

                })
            // //console.log(findId);
            // res.json( {  data : rows.affectedRows});
            // console.log("rows : ",rows.affectedRows);

        });

});

//마이페이지 예매 및 결제내역
router.post('/user/resPay',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let query = `select 
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID,
                    tCR.CR_cDt as no	
                from tCT
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                where tCR.CR_CT_ID = tCT.CT_ID and 
                      tCR.CR_U_ID = :sessionId
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

//마이페이지 예매 및 결제내역 모바일
router.post('/user/resPayMo',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let query = `select 
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_cDt as crCdt,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID,
                    tCR.CR_cDt as no
                from tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                where 
                    tCR.CR_CT_ID = tCT.CT_ID and 
                    tCR.CR_U_ID = :sessionId
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
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_cDt as crCdt,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID,
                    tCR.CR_cDt as no
                from tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                where 
                    tCR.CR_CT_ID = tCT.CT_ID and 
                    tCR.CR_U_ID = :sessionId and 
                    tCR.CR_cDt between date(:deptDay) and 
                    date(:endDay)+1
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



//마이페이지 예매 및 결제내역 상세보기 모바일
router.post('/user/resPayDetailMo',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let moCtId = req.body.ctId;
    let moPhId = req.body.phId;
    let query = `select
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d') as deptYM,
                    date_format(tCT.CT_DepartureTe,'%H:%i') as deptTM,
                    DAYOFWEEK(tCT.CT_DepartureTe) AS deptWeek,
                    DAYOFWEEK(tCT.CT_DepartureTe) AS payWeek,
                    tB.B_Name as carName,
                    tCT.CT_CarNum as carNum,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_cDt as crCdt,
                    tCR.CR_CT_ID as crCTID,
                    tCR.CR_PH_ID as crPHID
                from tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                where 
                    tCR.CR_CT_ID = tCT.CT_ID and 
                    tCR.CR_CT_ID = :moCtId and 
                    tCR.CR_PH_ID = :moPhId and 
                    tCR.CR_U_ID = :sessionId
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
router.get('/user/resCancelList', auth.isLoggedIn, (req, res, next) =>{
    let query = `   select
                        date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                        date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                        date_format(tCR.CR_CancelDt,'%y%y.%m.%d %H:%i') as cancelDay,
                        tCR.CR_CancelDt as cancelDay,
                        count(CR_SeatNum) as seatCnt,
                        tPH.PH_Type as payType,
                        tPH.PH_Price as price,
                        CR_CT_ID as ctId,
                        CR_PH_ID as phId
                    from tCT 
                        left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                        left join tB on tCY.CY_B_ID = tB.B_ID 
                        left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                        left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    where 
                        tCR.CR_CT_ID = tCT.CT_ID AND 
                        tCR.CR_Cancel = :crCancel and 
                        tCR.CR_U_ID = :sessionId
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
                        date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                        date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                        date_format(tCR.CR_CancelDt,'%y%y.%m.%d %H:%i') as cancelDay,
                        count(CR_SeatNum) as seatCnt,
                        tPH.PH_Type as payType,
                        CR_CT_ID as ctId,
                        CR_PH_ID as phId,
                        tPH.PH_Price as price	
                    from tCT 
                        left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                        left join tB on tCY.CY_B_ID = tB.B_ID 
                        left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                        left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                    where 
                        tCR.CR_CT_ID = tCT.CT_ID AND 
                        tCR.CR_Cancel = :crCancel and 
                        tCR.CR_U_ID = :sessionId and 
                        tCR.CR_CancelDt between date(:cancelDeptDay) AND 
                        date(:cancelEndDay)+1
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
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    date_format(tCR.CR_CancelDt,'%y%y.%m.%d %H:%i') as cancelDay,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    CR_CT_ID as ctId,
                    CR_PH_ID as phId	
                from tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                where 
                    tCR.CR_CT_ID = tCT.CT_ID AND 
                    tCR.CR_Cancel = :crCancel and 
                    tCR.CR_U_ID = :sessionId
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
                    date_format(tCR.CR_cDt,'%y%y.%m.%d') as PayDay,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    date_format(tCR.CR_CancelDt,'%y%y.%m.%d %H:%i') as cancelDay,
                    count(CR_SeatNum) as seatCnt,
                    tPH.PH_Type as payType,
                    tPH.PH_Price as price,
                    tB.B_Name as carName,
                    CR_CT_ID as ctId,
                    CR_PH_ID as phId	
                from tCT 
                    left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
                    left join tB on tCY.CY_B_ID = tB.B_ID 
                    left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    left join tPH on tPH.PH_ID = tCR.CR_PH_ID
                where 
                    tCR.CR_CT_ID = tCT.CT_ID AND 
                    tCR.CR_Cancel = :crCancel and 
                    tCR.CR_U_ID = :sessionId and 
                    CR_CT_ID = :ctId and 
                    CR_PH_ID = :phId
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

// //결제완료
// router.post('/payment', auth.isLoggedIn, (req, res) =>{

//     let str_values_list = [],
//         str_values ="",
//         seatNums = req.body['seatNums'],
//         ct_id = req.body.ct_id,
//         oPrice = req.body.oPrice,
//         sPrice = req.body.sPrice,
//         price = ((oPrice-sPrice) < 0) ? 0 : (oPrice-sPrice),
//         ph_type = '-'; // 무료기간동안만 - 으로 넣음.
    
//     //결제 전 중복확인 쿼리
//     let selectQuery = `SELECT * FROM tCR WHERE tCR.CR_CT_ID = :ct_id and CR_Cancel = 'N' and tCR.CR_SeatNum IN (:seatNums)`;

//     /**
//      * TODO : 무료기간 끝나면 PH_TYPE 값 결제 수단으로 변경해야함.
//      */
//     let ph_query = `
//         INSERT INTO tPH
//             (PH_U_ID, PH_PG_ID, PH_Price, PH_OPrice, PH_SPrice, PH_Type)
//         VALUES
//             (:u_id, :pg_id, :price, :oPrice, :sPrice, :ph_type)
//     `;

//     //결제 전 중복확인
//     connection.query(selectQuery, {ct_id, seatNums},
//         function(err, rows, fields) {
//             if (err) throw err;                       
//             // //console.log(findId);
//             console.log("rows : ",rows);         
//             let one_price = req.body.oPrice / req.body.seatNums.length;
//             if(rows.length == 0){
//                 //  결제 내역 먼저 추가. 
//                 connection.query(ph_query, {
//                     u_id    : req.user.U_ID,
//                     pg_id   : 1,    // pg_id :  PG 사 결정되면 결제 정보 입력해야함.
//                     oPrice  : oPrice,
//                     sPrice  : sPrice,
//                     price   : (oPrice-sPrice),
//                     ph_type : ph_type
//                 }, function (err, result){

//                     let ph_id = result.insertId;

//                     let cr_query = `
//                         INSERT INTO tCR
//                             (CR_CT_ID, CR_U_ID, CR_PH_ID, CR_SeatNum, CR_Price)
//                         VALUES
//                     `;
                    
//                     if( typeof(seatNums) === "object"){ //선택한 좌석이 2개 이상
//                         seatNums.map((seatNum)=>{
//                             str_values_list.push(`(${ct_id}, ${req.user.U_ID}, ${ph_id}, ${seatNum}, ${one_price})`);
//                         });
//                         str_values = str_values_list.join(', ');
//                     } else if(typeof(seatNums) === "string" ){ // 선택한 좌석이 1개
//                         str_values = `(${ct_id}, ${req.user.U_ID}, ${ph_id}, ${seatNums}, ${oPrice})`;
//                     }
                
//                     cr_query += str_values;

//                     //  예약 정보 추가
//                     connection.query(cr_query, null,
//                         function(err, result) {
//                             if(err) throw err;
                            
//                             let qr_query = 'select CR_ID, CR_CT_ID, CR_U_ID, CR_PH_ID, CR_SeatNum FROM tCR where CR_CT_ID = :cr_ct_id AND CR_U_ID = :cr_u_id AND CR_SeatNum IN(:cr_seatnum) AND CR_Cancel = "N" ';
//                             let qr_update = 'update tCR SET CR_QrCode = :cr_qrcode where CR_ID = :cr_id';
//                             connection.query(qr_query,
//                                 {
//                                     cr_ct_id : req.body.ct_id,
//                                     cr_u_id : req.user.U_ID,
//                                     cr_seatnum : req.body.seatNums
//                                 },
//                                 function(err, selResult, fields) {
//                                     if (err) throw err;
//                                     let cr_qrcode = [];
//                                     let cr_seat = [];
//                                     let cr_id = [];
//                                     if(selResult.length > 1){
//                                         for(let i=0; i<selResult.length; i++){
//                                             cr_qrcode.push(selResult[i].CR_ID+'-'+selResult[i].CR_CT_ID+'-'+selResult[i].CR_U_ID+'-'+selResult[i].CR_PH_ID);
//                                             cr_seat.push(selResult[i].CR_SeatNum);
//                                             cr_id.push(selResult[i].CR_ID);
//                                         }
//                                         console.log('qrcode :',cr_qrcode);
//                                         console.log('qrcode :',cr_seat);
//                                     }
                                    
                                    
//                                     res.json({
//                                         ph_type : ph_type,
//                                         price : price,
//                                         data : '1'
//                                     });    
//                                 });  


//                         });
//                 });

//             }else{
//                 let over_lap = [];
//                 for(let i=0; i <rows.length; i++){
//                       over_lap.push(rows[i].CR_SeatNum)
//                 }
//                 let seat_number = over_lap.join('번,')+'번';
//                 res.json({data : '0', seats : seat_number})
//             }

            
//         }); 
    

    
// });


//결제완료
router.post('/payment', auth.isLoggedIn, (req, res) =>{
    connection.beginTransaction(function(err){

        let str_values_list = [],
        str_values ="",
        seatNums = req.body['seatNums'],
        ct_id = req.body.ct_id,
        oPrice = req.body.oPrice,
        sPrice = req.body.sPrice,
        price = ((oPrice-sPrice) < 0) ? 0 : (oPrice-sPrice),
        ph_type = '-'; // 무료기간동안만 - 으로 넣음.
    
        //결제 전 중복확인 쿼리
        let selectQuery = `SELECT * FROM tCR WHERE tCR.CR_CT_ID = :ct_id and CR_Cancel = 'N' and tCR.CR_SeatNum IN (:seatNums)`;

        /**
         * TODO : 무료기간 끝나면 PH_TYPE 값 결제 수단으로 변경해야함.
         */
        let ph_query = `
            INSERT INTO tPH
                (PH_U_ID, PH_PG_ID, PH_Price, PH_OPrice, PH_SPrice, PH_Type)
            VALUES
                (:u_id, :pg_id, :price, :oPrice, :sPrice, :ph_type)
        `;

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
                        u_id    : req.user.U_ID,
                        pg_id   : 1,    // pg_id :  PG 사 결정되면 결제 정보 입력해야함.
                        oPrice  : oPrice,
                        sPrice  : sPrice,
                        price   : (oPrice-sPrice),
                        ph_type : ph_type
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
                            origin_qrcode.push(ct_id+'-'+req.user.U_ID+'-'+ph_id+'-'+seatNums[i]);
                            hash_qrcode.push(CryptoJS.AES.encrypt(origin_qrcode[i], config.enc_salt).toString());
                        }
                        console.log('origin:',origin_qrcode);
                         

                        let cr_query = `
                            INSERT INTO tCR
                                (CR_CT_ID, CR_U_ID, CR_PH_ID, CR_SeatNum, CR_Price, CR_QrCode)
                            VALUES
                        `;
                        
                        if( typeof(seatNums) === "object"){ //선택한 좌석이 2개 이상
                            for(let i=0; i<seatNums.length; i++){
                                str_values_list.push(`(${ct_id}, ${req.user.U_ID}, ${ph_id}, ${seatNums[i]}, ${one_price}, '${hash_qrcode[i]}')`)
                            }
                            // seatNums.map((seatNum)=>{
                            //     str_values_list.push(`(${ct_id}, ${req.user.U_ID}, ${ph_id}, ${seatNum}, ${one_price}, ${hash_qrcode})`);
                            // });
                            str_values = str_values_list.join(', ');
                        } else if(typeof(seatNums) === "string" ){ // 선택한 좌석이 1개
                            str_values = `(${ct_id}, ${req.user.U_ID}, ${ph_id}, ${seatNums}, ${oPrice}, '${hash_qrcode}')`;
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
    })

});


//장차예매 리스트
router.post('/user/resDept', auth.isLoggedIn, (req, res, next) =>{
    let query = `
                select 
                    distinct date_format(CT_DepartureTe,'%H%i') as deptTe, 
                    date_format(CT_DepartureTe,'%H:%i') as deptTe2
                 from tCT`;

    connection.query(query,
        function(err, rows, fields) {
            if (err) throw err;                       
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows : ",rows);            
        });       
});

// //장차예매 리스트 로그인 포함
// router.post('/user/resCarList', auth.isLoggedIn, (req, res, next) =>{

//     let query = `SELECT
//                     tCT.CT_ID as ctID,
//                     tB.B_Name as b_name,
//                     date_format(tCT.CT_DepartureTe,'%Y.%m.%d %H:%i') as deptTe,
//                     date_format(tCT.CT_ReturnTe,'%Y.%m.%d %H:%i') as retuTe,
//                     DAYOFWEEK(tCT.CT_DepartureTe) AS deptDay,
//                     DAYOFWEEK(tCT.CT_ReturnTe) AS retnDay,
//                     tCT.CT_CarNum as carNum,
//                     (select count(tCR.CR_SeatNum) from tCR where tCR.CR_CT_ID =tCT.CT_ID AND CR_Cancel = 'N') as available_seat_cnt,
//                     tCY.CY_Totalpassenger as total_passenger,
//                     tCY.CY_SeatPrice as seatPrice,
//                     tCY.CY_ID,
//                     tCY.CY_Ty,
//                     tCY.CY_TotalPassenger,
//                             DATE_ADD(NOW(),INTERVAL +21 MInute),
//                         DATE_ADD(NOW(),INTERVAL +21 DAY),
//                         NOW()
//                 FROM tCT 
//                     left join tCY on tCT.CT_CY_ID = tCY.CY_ID 
//                     left join tB on tCY.CY_B_ID = tB.B_ID
//                 WHERE 
//                     tCT.CT_DepartureTe < DATE_ADD(NOW(),INTERVAL +21 DAY) 
//                         AND tCT.CT_DepartureTe > NOW()`

//         if(req.query.type == 'bus_start'){
//             query += `ORDER BY tCT.CT_DepartureTe ASC LIMIT 1`
//         }else{
//             query += `AND tCT.CT_DepartureTe > DATE_ADD(NOW(),INTERVAL -20 MINUTE)
//                         ORDER BY tCT.CT_DepartureTe ASC LIMIT 1`
//         }

//     connection.query(query,
//         function(err, rows, fields) {
//             if (err) throw err;                       
//             // //console.log(findId);
//             res.json( {  data : rows});
//             console.log("rows : ",rows);
            
//         });
// });

//장차예매 리스트 로그인 제외
router.post('/user/resCarList', (req, res, next) =>{

    let query = `SELECT
                    tCT.CT_ID as ctID,
                    tB.B_Name as b_name,
                    date_format(tCT.CT_DepartureTe,'%Y.%m.%d %H:%i') as deptTe,
                    date_format(tCT.CT_ReturnTe,'%Y.%m.%d %H:%i') as retuTe,
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
`
        if(req.query.type == 'bus_start'){
            query += `tCT.CT_DepartureTe > NOW()
                        ORDER BY tCT.CT_DepartureTe ASC LIMIT 1`
        }else{
            query += `tCT.CT_DepartureTe > DATE_ADD(NOW(),INTERVAL -20 MINUTE)
                        ORDER BY tCT.CT_DepartureTe ASC LIMIT 1`
        }

    connection.query(query,
        function(err, rows, fields) {
            if (err) throw err;                       
            // //console.log(findId);
            res.json( {  data : rows});
            console.log("rows : ",rows);
            
        });
});


// CT_ID로 예약된 좌석 정보 가져오기
router.get('/useSeat/:ct_id', auth.isLoggedIn, (req, res, next) =>{
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

router.get('/useSeat2/:ct_id', auth.isLoggedIn, (req, res, next) =>{
    let query = `select 
                    CY_SeatPrice 
                from tCR 
                    inner join tCT on tCR.CR_CT_ID = tCT.CT_ID 
                    inner join tCY on tCT.CT_CY_ID = tCY.CY_ID
                where 
                    CR_CT_ID = :ct_id and CR_Cancel = 'N'`;
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
router.get('/video/best', function(req, res, next) {
    let query = `select * from tYL where YL_d_order order by rand() limit 1`; 
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
        new mssql.Request().query('select distinct(BCR_LV1_BC_ID), BC_NameEng, BC_NameKor from tBCR inner join tBC on tBCR.BCR_LV1_BC_ID = tBC.BC_ID', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//중분류 카테고리
router.get('/categoryLV2', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tBC inner join tBCR on tBC.BC_ID = tBCR.BCR_LV2_BC_ID', (err, result) => {
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
                inner join tBSxtBCR on tBCR.BCR_ID = tBSxtBCR.BCR_ID 
                inner join tBS on tBS.BS_ID = tBSxtBCR.BS_ID
                inner join tBSxtLS on tBSxtLS.BS_ID = tBS.BS_ID 
                inner join tLS on tLS.LS_Number = tBSxtLS.LS_Number
                inner join tBC on tBC.BC_ID = tBCR.BCR_LV2_BC_ID`,
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
//
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
                inner join tBS on tBSxtLS.BS_ID = tBS.BS_ID 
                inner join tBC on tBC.BC_ID = tBS.BS_BC_ID`, 
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
                        inner join tBSxtBCR on tBCR.BCR_ID = tBSxtBCR.BCR_ID 
                        inner join tBS on tBS.BS_ID = tBSxtBCR.BS_ID
                        inner join tBSxtLS on tBSxtLS.BS_ID = tBS.BS_ID 
                        inner join tLS on tLS.LS_Number = tBSxtLS.LS_Number
                        inner join tBC on tBC.BC_ID = tBCR.BCR_LV2_BC_ID
                        `

        // 관리 페이지 상세검색
        if(req_type === 'admin'){
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
                        inner join tBSxtBCR on tBCR.BCR_ID = tBSxtBCR.BCR_ID 
                        inner join tBS on tBS.BS_ID = tBSxtBCR.BS_ID
                        inner join tBSxtLS on tBSxtLS.BS_ID = tBS.BS_ID 
                        inner join tLS on tLS.LS_Number = tBSxtLS.LS_Number
                        inner join tBC on tBC.BC_ID = tBCR.BCR_LV2_BC_ID where tBS.BS_ID = @bsId`)
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
        let tumb_name = req.files[0].filename;
        let img_name = req.files[1].filename;
        //이전 저장소
        let old_tumb_path = req.files[0].path;
        let old_img_path = req.files[1].path;
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

        
        let mainDtS = '2020-05-18 '+ req.body.bsMainOpen;
        let mainDtF = '2020-05-18 '+ req.body.bsMainClose;
        let subDtS = '2020-05-18 '+req.body.bsSubOpen
        let subDtF = '2020-05-18 '+req.body.bsSubClose
        let breakS = '2020-05-18 '+req.body.bsBreakOpen
        let breakF = '2020-05-18 '+req.body.bsBreakClose

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
            .input('BS_ThumbnailUrl', mssql.NVarChar, '/img/'+req.files[1].originalname)
            .input('BS_ImageUrl', mssql.NVarChar, '/img/'+req.files[0].originalname)
            .query(`insert into tBS(
                                BS_BC_ID, BS_LoginID, BS_LoginPW, BS_CEO, BS_NameKor, BS_NameEng, BS_ContentsKor, BS_ContentsEng, 
                                BS_Phone, BS_CEOPhone, BS_Addr1Kor, BS_Addr2Kor, BS_Addr1Eng, BS_Addr2Eng, BS_MainDtS, BS_MainDtF,
                                BS_SubDtS, BS_SubDtF, BS_BreakDtS, BS_BreakDtF,BS_PersonalDayKor, BS_PersonalDayEng, BS_ThumbnailUrl,
                                BS_ImageUrl)
                        values(@BS_BC_ID, @BS_LoginID, @BS_LoginPW, @BS_CEO, @BS_NameKor, @BS_NameEng, @BS_ContentsKor,
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

// //매장 수정
// router.put('/tbs/:bsId', upload.any(), async function (req, res, next) {
//     try {
//         let pool = await mssql.connect(dbconf.mssql)

//         // 광고입력
//         // if(req.files.length === 0) throw Error('Non include files');
//         //입력된 파일들과 새로운 경로로 저장
//         // let content_type = req.files[0].mimetype.split('/')[0];

//         //수정되는 파일이 있을때

//         let tumb_url, img_url
//         let tumb_name, img_name;
//         let old_tumb_path, old_img_path;
//         let new_tumb_path, new_img_path;
//         img_url = req.body.bsImgUrl;
//         tumb_url = req.body.bsTumbUrl;

//         //이미지만 바꿀때
//         if(req.files.length == 1 && req.files[0] != undefined && req.files[0].fieldname == 'store_img'){
//             onlyImg();
//         }
//         //썸네일만 바꿀때
//         else if(req.files.length == 1 && req.files[0] != undefined && req.files[0].fieldname == 'store_thumb'){
//             onlyThumb();
//         }
//         //둘다 바꿀때
//         else if(req.files.length === 2){
//             allImgUpdate();
//         }
        
//         function onlyImg(){
//             img_name = req.files[0].filename;
//             old_img_path = req.files[0].path;old_img_path
//             new_img_path = path.join(config.path.bs_image , img_name);
//             //이미지 재지정 함수
//             fs.rename(old_img_path, new_img_path, (err) => {
//                 if (err) throw err;
//                 fs.stat(new_img_path, (err, stats) => {
//                 if (err) throw err;
//                 console.log(`stats: ${JSON.stringify(stats)}`);
//                 });
//             });
//             img_url = req.files[0].originalname;
//             tumb_url = req.body.bsTumbUrl;
//         }

//         function onlyThumb(){
//             tumb_name = req.files[0].filename;
//             old_tumb_path = req.files[0].path;
//             new_tumb_path = path.join(config.path.bs_image , tumb_name);
//             //썸네일 재지정 함수
//             fs.rename(old_tumb_path, new_tumb_path, (err) => {
//                 if (err) throw err;
//                 fs.stat(new_tumb_path, (err, stats) => {
//                 if (err) throw err;
//                 console.log(`stats: ${JSON.stringify(stats)}`);
//                 });
//             });
//             tumb_url = req.files[0].originalname;
//             img_url = req.body.bsImgUrl;
//         }

//         function allImgUpdate(){
//             img_name = req.files[0].filename;
//             tumb_name = req.files[1].filename;
//             //이전 저장소
//             old_img_path = req.files[0].path;
//             old_tumb_path = req.files[1].path;
//             //새 저장소
//             new_tumb_path = path.join(config.path.bs_image , tumb_name);
//             new_img_path = path.join(config.path.bs_image , img_name);
//             //이미지 재지정 함수
//             fs.rename(old_img_path, new_img_path, (err) => {
//                 if (err) throw err;
//                 fs.stat(new_img_path, (err, stats) => {
//                 if (err) throw err;
//                 console.log(`stats: ${JSON.stringify(stats)}`);
//                 });
//             });
//             //썸네일 재지정 함수
//             fs.rename(old_tumb_path, new_tumb_path, (err) => {
//                 if (err) throw err;
//                 fs.stat(new_tumb_path, (err, stats) => {
//                 if (err) throw err;
//                 console.log(`stats: ${JSON.stringify(stats)}`);
//                 });
//             });
//             img_url = req.files[0].originalname;
//             tumb_url = req.files[1].originalname;
    
//         }
        
//         let mainDtS = '2020-05-18 '+ req.body.bsMainOpen;
//         let mainDtF = '2020-05-18 '+ req.body.bsMainClose;
//         let subDtS = '2020-05-18 '+req.body.bsSubOpen
//         let subDtF = '2020-05-18 '+req.body.bsSubClose
//         let breakS = '2020-05-18 '+req.body.bsBreakOpen
//         let breakF = '2020-05-18 '+req.body.bsBreakClose
        
//         let query = `
//                 UPDATE tBS SET 
//                     BS_BC_ID = @BS_BC_ID,
//                     BS_LoginID = @BS_LoginID,
//                     BS_LoginPW = @BS_LoginPW,
//                     BS_CEO = @BS_CEO,
//                     BS_NameKor = @BS_NameKor,
//                     BS_NameEng = @BS_NameEng,
//                     BS_ContentsKor = @BS_ContentsKor,
//                     BS_ContentsEng = @BS_ContentsEng,
//                     BS_Phone = @BS_Phone,
//                     BS_CEOPhone = @BS_CEOPhone,
//                     BS_Addr1Kor = @BS_Addr1Kor,
//                     BS_Addr2Kor = @BS_Addr2Kor,
//                     BS_Addr1Eng = @BS_Addr1Eng,
//                     BS_Addr2Eng = @BS_Addr2Eng,
//                     BS_MainDtS = @BS_MainDtS,
//                     BS_MainDtF = @BS_MainDtF,
//                     BS_SubDtS = @BS_SubDtS,
//                     BS_SubDtF = @BS_SubDtF,
//                     BS_BreakDtS = @BS_BreakDtS,
//                     BS_BreakDtF = @BS_BreakDtF,
//                     BS_PersonalDayKor = @BS_PersonalDayKor,
//                     BS_PersonalDayEng = @BS_PersonalDayEng,
//                     BS_ThumbnailUrl = @BS_ThumbnailUrl,
//                     BS_ImageUrl = @BS_ImageUrl
//                 WHERE BS_ID = @BS_ID`

//         // 매장입력 BS_BC_ID == lv1Cat
//         await pool.request()
//             .input('BS_ID', mssql.Int, req.params.bsId)
//             .input('BS_BC_ID', mssql.Int, req.body.bsBcId)
//             .input('BS_LoginID', mssql.NVarChar, req.body.bsLoginId)
//             .input('BS_LoginPW', mssql.NVarChar, req.body.bsLoginPw)
//             .input('BS_CEO', mssql.NVarChar, req.body.bsCeo)
//             .input('BS_NameKor', mssql.NVarChar, req.body.bsNameKo)
//             .input('BS_NameEng', mssql.NVarChar, req.body.bsNameEn)
//             .input('BS_ContentsKor', mssql.NVarChar, req.body.bsContentsKo)
//             .input('BS_ContentsEng', mssql.NVarChar, req.body.bsContentsEn)
//             .input('BS_Phone', mssql.NVarChar, req.body.bsPhone)
//             .input('BS_CEOPhone', mssql.NVarChar, req.body.bsCeoPhone)
//             .input('BS_Addr1Kor', mssql.NVarChar, req.body.bsAddr1Ko)
//             .input('BS_Addr1Eng', mssql.NVarChar, req.body.bsAddr1En)
//             .input('BS_Addr2Kor', mssql.NVarChar, req.body.bsAddr2Ko)
//             .input('BS_Addr2Eng', mssql.NVarChar, req.body.bsAddr2En)
//             .input('BS_MainDtS', mssql.DateTime, mainDtS)
//             .input('BS_MainDtF', mssql.DateTime, mainDtF)
//             .input('BS_SubDtS', mssql.DateTime, subDtS)
//             .input('BS_SubDtF', mssql.DateTime, subDtF)
//             .input('BS_BreakDtS', mssql.DateTime, breakS)
//             .input('BS_BreakDtF', mssql.DateTime, breakF)
//             .input('BS_PersonalDayKor', mssql.NVarChar, req.body.bsPersonalKo)
//             .input('BS_PersonalDayEng', mssql.NVarChar, req.body.bsPersonalEn)
//             .input('BS_ThumbnailUrl', mssql.NVarChar, '/img/'+tumb_url)
//             .input('BS_ImageUrl', mssql.NVarChar, '/img/'+img_url)
//             .query(query);


//         if(req.body.bsBcId !== undefined && req.body.bsBcId2 !== undefined){
//             //카테고리 업종 입력 BCR_ID 구하기
//             let result2 = await pool.request()
//                 .input('BCRLV1', mssql.Int, req.body.bsBcId)
//                 .input('BCRLV2', mssql.Int, req.body.bsBcId2)
//                 .query('select BCR_ID from tBCR where BCR_LV1_BC_ID = @BCRLV1 AND BCR_LV2_BC_ID = @BCRLV2')
            
//             // 업종 수정
//             await pool.request()
//                 .input('BS_ID', mssql.Int, req.params.bsId)
//                 .input('BCR_ID', mssql.Int, result2.recordset[0].BCR_ID)
//                 .query('update tBSxtBCR set BCR_ID = @BCR_ID where BS_ID = @BS_ID')
//         }

//         if(req.body.bsStoreNumber !== undefined){
//             // 층수 수정
//             await pool.request()
//                 .input('BS_ID', mssql.Int, req.params.bsId)
//                 .input('LS_Number', mssql.Int, req.body.bsStoreNumber)
//                 .query('update tBSxtLS set LS_Number = @LS_Number where BS_ID = @BS_ID')
//         }
//         res.json({result : 1})
//     } catch (err) {
//         console.log(err);
//         console.log('error fire')
//     }
// });

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
            .input('BS_ThumbnailUrl', mssql.NVarChar, '/img/'+tumb_url)
            .input('BS_ImageUrl', mssql.NVarChar, '/img/'+img_url)
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



        let filename 
        let old_path 
        let new_path 
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
    let cr_seatnum = req.query.cr_seatnum
    let query = `select 
                    U_NAME, 
                    U_PHONE, 
                    tCR.CR_SeatNum 
                from tCR 
                    INNER JOIN tu ON tcr.CR_U_ID = tu.U_ID 
                WHERE tcr.CR_CT_ID = :ct_id AND 
                      tcr.CR_SeatNum = :cr_seatnum AND 
                      tcr.CR_Cancel = 'N';`; 
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

module.exports = router;
