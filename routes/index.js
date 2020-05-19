const express = require('express');
const router = express.Router();
const passport = require('passport');
const mysql = require('mysql');
const mssql = require('mssql');
const config = require('../config');
const auth = require('../config/passport');
const dbconf = require('../config/database');
const connection = mysql.createConnection(dbconf.mysql);
const conn_ms = mssql.connect(dbconf.mssql);
const CryptoJS = require('crypto-js');
const multer = require('multer')

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
      cb(null, '/public/upload')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
const upload = multer({storage: storage})

//업로드 테스트
router.get('/upload', function(req, res){
    res.render('upload');
  });

// var test1 = multer().single('avatar')
router.post('/save',upload.any(), function(req,res){
    // upload(req, res, function(err){
    //     if(err){
    //         console.log(err)
    //         return;
    //     }
        // let file = req.file
        // let result = {
        //     originalName : file.originalname,
        //     size : file.size
        // }
        console.log('dddddddddddddddddddddddddddd');
        console.log(file.originalname);
    // })
})

router.get('/sign', function(req, res, next) {
    res.render('signage');
});

router.get('/opentest', function(req, res, next) {
    res.render('opentest');
});


router.get('/', function(req, res, next) {
    res.render('index', { sessionUser : req.user });
});

router.get('/search', function(req, res, next) {
    res.render('search', { sessionUser : req.user });
});



//매장관리자 페이지
router.get('/list', function(req, res, next) {

    res.render('signageBList');
});
router.get('/lists', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tBS', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//매장등록
router.get('/addList', function(req, res, next) {

    res.render('signageAdd');
});

//층수
router.get('/api/floor', function(req, res, next) {
    mssql.connect(dbconf.mssql, function (err, result){
        if(err) throw err;
        new mssql.Request().query('select * from tLS', (err, result) => {
            res.json({ data : result.recordset });
        })
    });
});

//매장 등록 테스트
router.post('/api/addBusiness', upload.any(), async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let BS_ThumbnailUrl, BS_ImageUrl
        let imgArr = req.files
    //업로드 파일 구분
        imgArr.forEach(function(element){
            element.fieldname == 'tumb' ? BS_ThumbnailUrl = element.originalname : BS_ImageUrl = element.originalname
        })
        console.log('썸네일', BS_ThumbnailUrl);
        console.log('메인', BS_ImageUrl);
        
        let mainDtS = '2020-05-18 '+ req.body.bsMainS;
        let mainDtF = '2020-05-18 '+ req.body.bsMainF;
        let subDtS = '2020-05-18 '+req.body.bsSubS
        let subDtF = '2020-05-18 '+req.body.bsSubF
        let breakS = '2020-05-18 '+req.body.bsBreakS
        let breakF = '2020-05-18 '+req.body.bsBreakF

        // 매장입력 BS_BC_ID == lv1Cat
        let result = await pool.request()
            .input('BS_BC_ID', mssql.Int, req.body.catLv1)
            .input('BS_LoginID', mssql.NVarChar, req.body.bsId)
            .input('BS_LoginPW', mssql.NVarChar, req.body.bsPw)
            .input('BS_CEO', mssql.NVarChar, req.body.bsCeo)
            .input('BS_NameKor', mssql.NVarChar, req.body.bsNameKo)
            .input('BS_NameEng', mssql.NVarChar, req.body.bsNameEn)
            .input('BS_ContentsKor', mssql.NVarChar, req.body.bsContKo)
            .input('BS_ContentsEng', mssql.NVarChar, req.body.bsContEn)
            .input('BS_Phone', mssql.NVarChar, req.body.bsTel)
            .input('BS_CEOPhone', mssql.NVarChar, req.body.bsCeoTel)
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
            .input('BS_PersonalDayKor', mssql.VarChar, req.body.bsPersonalKo)
            .input('BS_PersonalDayEng', mssql.VarChar, req.body.bsPersonalEn)
            .input('BS_ThumbnailUrl', mssql.VarChar, BS_ThumbnailUrl)
            .input('BS_ImageUrl', mssql.VarChar, BS_ImageUrl)
            .query(`insert into tBS(BS_BC_ID, BS_LoginID, BS_LoginPW, BS_CEO, BS_NameKor, BS_NameEng, BS_ContentsKor, BS_ContentsEng, 
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
            .input('BCRLV1', mssql.Int, req.body.catLv1)
            .input('BCRLV2', mssql.Int, req.body.catLv2)
            .query('select BCR_ID from tBCR where BCR_LV1_BC_ID = @BCRLV1 AND BCR_LV2_BC_ID = @BCRLV2')

        console.log('최근 입력된 BS_ID');
        console.log(result1.recordset[0].BS_ID)
        console.log('BCR_ID');
        console.log(result2.recordset[0].BCR_ID)

        // 업종 입력 완료
        let result3 = await pool.request()
            .input('BS_ID', mssql.Int, result1.recordset[0].BS_ID)
            .input('BCR_ID', mssql.Int, result2.recordset[0].BCR_ID)
            .query('insert into tBSxBCR(BS_ID, BCR_ID) values(@BS_ID, @BCR_ID)')

        //층수 입력
        let result4 = await pool.request()
            .input('BS_ID', mssql.Int, result1.recordset[0].BS_ID)
            .input('LS_Number', mssql.Int, req.body.storeNumber)
            .query('insert into tBSxtLS(BS_ID, LS_Number) values(@BS_ID, @LS_Number)')

        res.render('signage')
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//매장 수정
router.put('/api/modifyBusiness/:bsid', upload.any(), async function (req, res, next) {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        let BS_ThumbnailUrl, BS_ImageUrl
        let imgArr = req.files
    //업로드 파일 구분
        if(imgArr != undefined){
            imgArr.forEach(function(element){
                element.fieldname == 'tumb' ? BS_ThumbnailUrl = element.originalname : BS_ImageUrl = element.originalname
            })
        }
        let query = 'update tBS set ';
        let tBS = new Object();
            tBS.BS_BC_ID = req.body.catLv1
            tBS.BS_LoginID = req.body.bsId
            tBS.BS_LoginPW = req.body.bsPw
            tBS.BS_CEO = req.body.bsCeo
            tBS.BS_NameKor = req.body.bsNameKo
            tBS.BS_NameEng = req.body.bsNameEn
            tBS.BS_ContentsKor = req.body.bsContKo
            tBS.BS_ContentsEng = req.body.bsContEn
            tBS.BS_Phone = req.body.bsTel
            tBS.BS_CEOPhone = req.body.bsCeoTel
            tBS.BS_Addr1Kor = req.body.bsAddr1Ko
            tBS.BS_Addr1Eng = req.body.bsAddr1En
            tBS.BS_Addr2Kor = req.body.bsAddr2Ko
            tBS.BS_Addr2Eng = req.body.bsAddr2En
            tBS.BS_MainDtS = req.body.bsMainDtS
            tBS.BS_MainDtF = req.body.bsMainDtF
            tBS.BS_SubDtS = req.body.bsSubDtS
            tBS.BS_SubDtF = req.body.bsSubDtF
            tBS.BS_BreakDtS = req.body.bsBreakS
            tBS.BS_BreakDtF = req.body.bsBreakF
            tBS.BS_PersonalDayKor = req.body.bsPersonalKo
            tBS.BS_PersonalDayEng = req.body.bsPersonalEn
            tBS.BS_ThumbnailUrl = BS_ThumbnailUrl
            tBS.BS_ImageUrl = BS_ImageUrl
        
        if(req.body.bsMainDtS == undefined){
            req.body.bsMainDtS = '00:00:00'
        }
        if(req.body.bsMainDtF == undefined){
            req.body.bsMainDtF = '00:00:00'
        }
        if(req.body.bsSubDtS == undefined){
            req.body.bsSubDtS = '00:00:00'
        }
        if(req.body.bsSubDtF == undefined){
            req.body.bsSubDtF = '00:00:00'
        }
        if(req.body.bsBreakS == undefined){
            req.body.bsBreakS = '00:00:00'
        }
        if(req.body.bsBreakF == undefined){
            req.body.bsBreakF = '00:00:00'
        }

        bsMainDtS = '2020-05-18 ' + req.body.bsMainDtS;
        bsMainDtF = '2020-05-18 ' + req.body.bsMainDtF;
        bsSubDtS = '2020-05-18 ' + req.body.bsSubDtS
        bsSubDtF = '2020-05-18 ' + req.body.bsSubDtF
        bsBreakS = '2020-05-18 ' + req.body.bsBreakS
        bsBreakF = '2020-05-18 ' + req.body.bsBreakF

        let bsObj = Object.keys(tBS)
        let bodyObj = Object.keys(req.body)
        let j=0;
        for(let i=0; i<bsObj.length; i++){
            if(tBS[Object.keys(tBS)[i]] !== undefined){
                if(req.body[Object.keys(req.body)[j]] == tBS[Object.keys(tBS)[i]]){
                    query += bsObj[i]+'=' +' @'+bodyObj[j]+','
                    j++
                }
            }
        //마지막 , 제거
            if(i === bsObj.length -1){
                query = query.substring(0, query.length-1)
            }
        }
        
        query += ' where BS_ID ='+req.params.bsid
        console.log(query);


        // 매장입력 BS_BC_ID == lv1Cat
        await pool.request()
            .input('catLv1', mssql.Int, req.body.catLv1)
            .input('bsId', mssql.NVarChar, req.body.bsId)
            .input('bsPw', mssql.NVarChar, req.body.bsPw)
            .input('bsCeo', mssql.NVarChar, req.body.bsCeo)
            .input('bsNameKo', mssql.NVarChar, req.body.bsNameKo)
            .input('bsNameEn', mssql.NVarChar, req.body.bsNameEn)
            .input('bsContKo', mssql.NVarChar, req.body.bsContKo)
            .input('bsContEn', mssql.NVarChar, req.body.bsContEn)
            .input('bsTel', mssql.NVarChar, req.body.bsTel)
            .input('bsCeoTel', mssql.NVarChar, req.body.bsCeoTel)
            .input('bsAddr1Ko', mssql.NVarChar, req.body.bsAddr1Ko)
            .input('bsAddr1En', mssql.NVarChar, req.body.bsAddr1En)
            .input('bsAddr2Ko', mssql.NVarChar, req.body.bsAddr2Ko)
            .input('bsAddr2En', mssql.NVarChar, req.body.bsAddr2En)
            .input('bsMainDtS', mssql.DateTime, bsMainDtS)
            .input('bsMainDtF', mssql.DateTime, bsMainDtF)
            .input('bsSubDtS', mssql.DateTime, bsSubDtS)
            .input('bsSubDtF', mssql.DateTime, bsSubDtF)
            .input('bsBreakS', mssql.DateTime, bsBreakS)
            .input('bsBreakF', mssql.DateTime, bsBreakF)
            .input('bsPersonalKo', mssql.VarChar, req.body.bsPersonalKo)
            .input('bsPersonalEn', mssql.VarChar, req.body.bsPersonalEn)
            .input('bsTumb', mssql.VarChar, BS_ThumbnailUrl)
            .input('bsMain', mssql.VarChar, BS_ImageUrl)
            .query(query);


        if(req.body.catLv1 !== undefined && req.body.catLv2 !== undefined){
            //카테고리 업종 입력 BCR_ID 구하기
            let result2 = await pool.request()
                .input('BCRLV1', mssql.Int, req.body.catLv1)
                .input('BCRLV2', mssql.Int, req.body.catLv2)
                .query('select BCR_ID from tBCR where BCR_LV1_BC_ID = @BCRLV1 AND BCR_LV2_BC_ID = @BCRLV2')
            
            // 업종 수정
            await pool.request()
                .input('BS_ID', mssql.Int, req.params.bsid)
                .input('BCR_ID', mssql.Int, result2.recordset[0].BCR_ID)
                .query('update tBSxBCR set BCR_ID = @BCR_ID where BS_ID = @BS_ID')
        }

        if(req.body.storeNumber !== undefined){
            // 층수 수정
            await pool.request()
                .input('BS_ID', mssql.Int, req.params.bsid)
                .input('LS_Number', mssql.Int, req.body.storeNumber)
                .query('update tBSxtLS set LS_Number = @LS_Number where BS_ID = @BS_ID')
        }

    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
});

//특정 매장 리스트
router.get('/api/business/:bsid', async function(req,res){
    let bsid = req.params.bsid;
    try {
        let pool = await mssql.connect(dbconf.mssql)

        let result = await pool.request()
            .input('BSID', mssql.Int, bsid)
            .query(`select BS_NameKor, BS_NameEng, tBCR.BCR_ID, BCR_LV1_BC_ID, BCR_LV2_BC_ID, BCR_LV3_BC_ID, tBS.BS_ID, BS_BC_ID, 
                        BS_LoginID, BS_LoginPW, BS_CEO, BS_Phone, BS_CEOPhone, BS_Addr1Kor, BS_Addr2Kor, BS_Addr1Eng, BS_Addr2Eng, convert(varchar, BS_MainDtS, 108) as BS_MainDtS,
                        convert(varchar, BS_MainDtf, 108) as BS_MainDtF, convert(varchar, BS_SubDtF, 108) as BS_SubDtF, BC_NameKor, BC_NameEng,
                        convert(varchar, BS_BreakDtS, 108) as BS_BreakDtS, convert(varchar, BS_BreakDtF, 108) as BS_BreakDtF,
                        BS_ContentsKor, BS_ContentsEng, BS_ThumbnailUrl, BS_PersonalDayKor, BS_PersonalDayEng,  BS_ImageUrl,tLS.LS_Number, LS_Sector, LS_Floor 
                    from tBCR inner join tBSxBCR on tBCR.BCR_ID = tBSxBCR.BCR_ID inner join tBS on tBS.BS_ID = tBSxBCR.BS_ID
                        inner join tBSxtLS on tBSxtLS.BS_ID = tBS.BS_ID inner join tLS on tLS.LS_Number = tBSxtLS.LS_Number
                    inner join tBC on tBC.BC_ID = tBCR.BCR_LV2_BC_ID where tBS.BS_ID = @BSID`)
        console.log(result.recordset);
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

//특정 매장 수정
router.put('/api/business/modify/:bsid', function(req,res){
    let bsid = req.params.bsid;

})

// // Survey 이전버전
// router.get('/a', function(req, res){
//     res.render('az369_survey');
// });

// router.post('/a', function(req, res){
    
//     console.log(req.body);


//     let query = `
//         INSERT INTO admin_survey
//             (NAME, Phone, Addr, WT_Contact_Period, WT_Rantal_Fee_Min, WT_Rantal_Fee_Max, WT_Deposit_Min,
//             WT_Deposit_Max, WT_Insurance_Type, CUR_Rental_Fee, CUR_Deposit, WT_Modify)
//         VALUES
//             (:NAME, :Phone, :Addr, :WT_Contact_Period, :WT_Rantal_Fee_Min, :WT_Rantal_Fee_Max, :WT_Deposit_Min,
//             :WT_Deposit_Max, :WT_Insurance_Type, :CUR_Rental_Fee, :CUR_Deposit, :WT_Modify)`;

//     connection.query(query, {
//         NAME : req.body.name,
//         Phone : req.body.phone ,
//         Addr : req.body.addr ,
//         WT_Contact_Period : req.body.wt_contact_period ,
//         WT_Rantal_Fee_Min : req.body.wt_rental_fee_min ,
//         WT_Rantal_Fee_Max : req.body.wt_rental_fee_max ,
//         WT_Deposit_Min : req.body.wt_deposit_min ,
//         WT_Deposit_Max : req.body.wt_deposit_max ,
//         WT_Insurance_Type : req.body.wt_insurance_type ,
//         CUR_Rental_Fee : req.body.cur_rental_fee ,
//         CUR_Deposit : req.body.cur_deposit ,
//         WT_Modify : req.body.wt_modify 
//     }, function(err, result){
//         if(err) throw err;
//         res.render('az369_survey_send');
//     });

// });

// Survey 최근버전
router.get('/b', function(req, res){
    
    let ctrt = req.query.ctrt;
    
    if( ctrt == 'n') return res.render('az369_survey_02_N');
    if( ctrt == 'y') return res.render('az369_survey_02_Y');
    res.render('az369_survey_01');
});

router.get('/c', function(req, res){
    res.render('az369_survey_main_x');
});
router.get('/c2', function(req, res){
    res.render('az369_survey_login');
});
router.get('/c3', function(req, res){
    res.render('az369_survey_join');
});
router.get('/c4', function(req, res){
    res.render('az369_survey_main_o');
});
router.get('/c5', function(req, res){
    res.render('az369_survey_survey');
});
router.get('/d1', function(req, res){
    res.render('summary');
});

//의향서 c2 로그인 액션
router.post('/c2/action', function(req,res,done){
    let query = 'select * from tL where L_LS_Number = :storeNumber'
    let password = req.body.password;
    let storeNumber = req.body.storeNumber;
    //let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString()
    connection.query(query, 
        {          
            storeNumber      
        },
        function(err, rows) {
            if (err) {return done(err);}
            if(rows.length == 0){
                res.json( {  data : '실패'});
            }else{
                if(CryptoJS.AES.decrypt(rows[0].L_PW, config.enc_salt).toString(CryptoJS.enc.Utf8) !== password ){
                    res.json({data: "실패"});
                    return done( null, false, {message: "ID와 Password를 확인해주세요"} );
                } else {
                    //console.log("성공")
                    res.json( {  data : rows});
                }    
            }
           
       
            
        });  
})

//의향서 c2 비밀번호 휴대전화 인증
router.post('/c2/phoneChk', function(req,res,done){
    let query = 'select * from tL where L_Phone = :phone'
    let phone = req.body.phone;
    //let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString()
    connection.query(query,
        {
            phone
        },
        function(err, rows) {
            if (err) {return done(err);}
            res.json({data : rows})
        });
})

//의향서 c2 비밀번호 찾기 변경
router.post('/c2/modify', function(req,res,done){
    let query = 'update tL set L_PW = :hash_pw where L_Phone = :phone'
    let phone = req.body.phone;
    let password = req.body.password;
    let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString()
    connection.query(query,
        {
            phone, hash_pw
        },
        function(err, rows) {
            if (err) {return done(err);}
            res.json({data : '변경'})
        });
})

//상가호수 중복확인
router.post('/c3/checkAddr', (req, res, next) =>{
    let query = "select L_LS_Number from tL where L_LS_Number = :addr limit 1";
    let addr = req.body.addr;
    connection.query(query, 
        {
            addr                     
        },
        function(err, rows, fields) {
            if (err) throw err;           
            res.json( { data : rows });
        });
        
});

//의향서 c3 회원가입 액션
router.post('/c3/action', function(req,res){
    let query = 'insert into tL(L_LS_Number, L_Name, L_Phone, L_PW) values(:addr, :name, :phone, :hash_pw) '
    let password = req.body.password;
    let hash_pw = CryptoJS.AES.encrypt(password, config.enc_salt).toString()
    connection.query(query,
        {
            addr : req.body.addr,
            name : req.body.name,
            phone : req.body.phone,
            hash_pw
        },function(err, rows){
            if(err) throw err;
            res.json({data : '회원가입'})
        }
    )
})

//의향서 c5 액션
router.post('/c5/action', async function(req,res){
    let query = `insert into tLSV
                        (LSV_NAME, LSV_Phone, LSV_Store, LSV_wContactPeriod, LSV_wRentalFeeMin, LSV_wRentalFeeMax,
                         LSV_wDepositMin, LSV_wDepositMax, LSV_wInsuranceTy, LSV_cRentalFee, LSV_cDeposit, LSV_wModify, LSV_Question)
                    values(:name , :phone , :store , :wt_contact_period, :wt_rental_fee_min, :wt_rental_fee_max, 
                           :wt_deposit_min, :wt_deposit_max, :wt_insurance_type, :cur_rental_fee, :cur_deposit, :wt_modify, :opinion) `

    let name = req.body.name; //이름
    let phone = req.body.phone; //전화번호
    let store = req.body.store; //호수
    let wt_contact_period = req.body.wt_contact_period; //계약기간
    let wt_rental_fee_min = req.body.wt_rental_fee_min; //임대료 최저
    let wt_rental_fee_max = req.body.wt_rental_fee_max; //임대료 최고
    let wt_deposit_min = req.body.wt_deposit_min; //보증금 최저
    let wt_deposit_max = req.body.wt_deposit_max; //보증금 최고
    let wt_insurance_type = req.body.wt_insurance_type; //보증보험 여부
    let cur_rental_fee = req.body.cur_rental_fee; //현재 임대료 /
    let cur_deposit = req.body.cur_deposit; //현재 임대보증금 /
    let wt_modify = req.body.wt_modify; //보증보험 여부 /
    let opinion = req.body.opinion

    if(cur_rental_fee == "" || cur_rental_fee == undefined){
        cur_rental_fee = null;
    }
    if(cur_deposit == "" || cur_deposit == undefined){
        cur_deposit = null;
    }
    if(wt_modify == "" || wt_modify == undefined){
        wt_modify = null;
    }
    if(opinion == "" || opinion == undefined){
        opinion = null;
    }
    connection.query(query,
        {       
        'name'     : name,
        'phone'     : phone,
        'store'     : store,
        'wt_contact_period'     : wt_contact_period,
        'wt_rental_fee_min'     : wt_rental_fee_min,
        'wt_rental_fee_max'     : wt_rental_fee_max,
        'wt_deposit_min'     : wt_deposit_min,
        'wt_deposit_max'     : wt_deposit_max,
        'wt_insurance_type'     : wt_insurance_type,
        'cur_rental_fee'     : cur_rental_fee,
        'cur_deposit'     : cur_deposit,
        'wt_modify'     : wt_modify,
        'opinion'     : opinion,

        },function(err, rows){
            if(err) throw err;
            res.json({data : '등록'})
        }
    )
})

// //c4 차트
// router.post('/c4/chart', function(req,res){
// // and create_dt between date_add(now(), interval -6 month) and now()
// // where date_format(create_dt , '%Y-%m') IN(select date_format(create_dt, '%Y-%m') as tes from admin_survey_test group by tes)
//     let query = `select Addr, wt_rental_fee_min , wt_rental_fee_max, create_dt, concat(date_format(create_dt,'%m'), '월') as day
//                         from admin_survey_test 
//                         having Addr in ( select LS_Number from tLS where LS_Floor = :floor1 and LS_Sector in (:dataSector1)
//                         union all
//                         select LS_Number from tLS where LS_Floor = :floor2 and LS_Sector in (:dataSector2)
//                         union all
//                         select LS_Number from tLS where LS_Floor = :floor3 and LS_Sector in (:dataSector3) )
//                     order by day asc;`

//     let dataSector1 = req.body['1F']
//     let dataSector2 = req.body['2F']
//     let dataSector3 = req.body['3F']
//     let floor1 = "";
//     let floor2 = ""; 
//     let floor3 = "";

//     if(dataSector1 == "" || dataSector1 == undefined){
//         dataSector1 = ""
//     }else{
//         floor1 = '1F'
//     }

//     if(dataSector2 == "" || dataSector2 == undefined){
//         dataSector2 = ""
//     }else{
//         floor2 = '2F'
//     }

//     if(dataSector3 == "" || dataSector3 == undefined){
//         dataSector3 = ""
//     }else{
//         floor3 = '3F'
//     }

//     console.log('===========')
//     console.log('1층 지역', dataSector1)
//     console.log('===========')
//     console.log('2층 지역', dataSector2)
//     console.log('===========')
//     console.log('3층 지역', dataSector3)
//     console.log('===========')
//     console.log('층', floor1)
//     console.log('층', floor2)
//     console.log('층', floor3)
//     connection.query(query,
//         {
//             dataSector1,
//             dataSector2,
//             dataSector3,
//             floor1,
//             floor2,
//             floor3
//         },function(err, rows){
//             if(err) throw err;
//             res.json({data : rows})
//             console.log('값', rows)
//         }
//     )
// })

//c4 차트
router.post('/c4/chart', function(req,res){
    // and create_dt between date_add(now(), interval -6 month) and now()
    // where date_format(create_dt , '%Y-%m') IN(select date_format(create_dt, '%Y-%m') as tes from admin_survey_test group by tes)
        let query = `select LSV_Store, LSV_wRentalFeeMin , LSV_wRentalFeeMax, LSV_cDt, concat(date_format(LSV_cDt,'%m'), '월') as day
                            from tLSV 
                            having LSV_Store in ( select LS_Number from tLS where LS_Floor = :floor1 and LS_Sector in (:dataSector1)
                            union all
                            select LS_Number from tLS where LS_Floor = :floor2 and LS_Sector in (:dataSector2)
                            union all
                            select LS_Number from tLS where LS_Floor = :floor3 and LS_Sector in (:dataSector3) )
                        order by day asc;`
    
        let dataSector1 = req.body['1F']
        let dataSector2 = req.body['2F']
        let dataSector3 = req.body['3F']
        let floor1 = "";
        let floor2 = ""; 
        let floor3 = "";
    
        if(dataSector1 == "" || dataSector1 == undefined){
            dataSector1 = ""
        }else{
            floor1 = '1F'
        }
    
        if(dataSector2 == "" || dataSector2 == undefined){
            dataSector2 = ""
        }else{
            floor2 = '2F'
        }
    
        if(dataSector3 == "" || dataSector3 == undefined){
            dataSector3 = ""
        }else{
            floor3 = '3F'
        }
    
        console.log('===========')
        console.log('1층 지역', dataSector1)
        console.log('===========')
        console.log('2층 지역', dataSector2)
        console.log('===========')
        console.log('3층 지역', dataSector3)
        console.log('===========')
        console.log('층', floor1)
        console.log('층', floor2)
        console.log('층', floor3)
        connection.query(query,
            {
                dataSector1,
                dataSector2,
                dataSector3,
                floor1,
                floor2,
                floor3
            },function(err, rows){
                if(err) throw err;
                res.json({data : rows})
                console.log('값', rows)
            }
        )
    })

router.post('/b', function(req, res){
    
    console.log(req.body);

    let query = `
        INSERT INTO tLSV
            (LSV_NAME, LSV_Phone, LSV_Store, LSV_wContactPeriod, LSV_wRentalFeeMin, LSV_wRentalFeeMax, LSV_wDepositMin,
             LSV_wDepositMax, LSV_wInsuranceTy, LSV_cRentalFee, LSV_cDeposit, LSV_wModify, LSV_Contract, LSV_Question)
        VALUES
            (:NAME, :Phone, :Addr, :WT_Contact_Period, :WT_Rantal_Fee_Min, :WT_Rantal_Fee_Max, :WT_Deposit_Min,
            :WT_Deposit_Max, :WT_Insurance_Type, :CUR_Rental_Fee, :CUR_Deposit, :WT_Modify, :CUR_has_Contract, :Opinion)`;

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
        CUR_has_Contract : req.body.cur_has_contract,
        Opinion : req.body.opinion 
    }, function(err, result){
        if(err) throw err;
        res.render('az369_survey_03');
    });

});

router.get('/az369_survey_intro', function(req,res){
    
    res.render('az369_survey_intro');
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
    let query = `select	distinct date_format(CT_ReturnTe, '%H%i') as returnTe, date_format(CT_DepartureTe,'%H%i') as deptTe,
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


//비디오 페이징
router.get('/video', function(req, res, next) {
    res.redirect('/video/1')
});

//비디오 페이징
router.get('/video/:currentPage', function(req, res, next) {
    let query = `SELECT * FROM tYL order by YL_dDt desc limit :beginRow, :rowPerPage`; 
    let currentPage = req.params.currentPage;
    console.log("커런트 페이지지ㅣ ::", currentPage);
    //페이지 내 보여줄 수
    let rowPerPage = 6;
    let beginRow = (currentPage-1)* rowPerPage;
    connection.query(query, {beginRow, rowPerPage},
      function(err, rows, fields) {
          if (err) throw err;
          res.render('video', { data : rows,sessionUser: req.user });
          console.log("user",rows);
      });
});



//사이니지
// router.get('/sign', function(req, res, next) {
//     res.render('signage');
// });

router.get('/ddd', function(req, res){
    res.render('kbd');
})

//test
router.get('/dust', function(req, res, next) {
    res.render('dust');
});


//미세먼지
router.get(`http://openapi.airkorea.or.kr/
openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty
?stationName=수내동&dataTerm=month&pageNo=1&numOfRows=10&ServiceKey=uXHIcJ%2BlhKm9JBsvIqRvv2xwCOc%2BMBWKghuKd%2FMm00rAJ%2BdNhjd87qm%2F3t1lWQ57vodJKj%2BkC7xt8QdKCNHH9Q%3D%3D%0A
&ver=1.3`
, function(req, res, next) {
    if (err) throw err;
    res.json({ data : result});
    console.log("user");
});
module.exports = router;
//9%2FnX9SOa0SMWlpsA7NZCUezCigC36YRnyDYP2n47qUcq1Z2k%2B9Enmq7scvkknZ0Jr09Nb56jweP9uR6k7kwv4Q%3D%3D

//http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName=비전동&dataTerm=month&pageNo=1&numOfRows=10&ServiceKey=9%2FnX9SOa0SMWlpsA7NZCUezCigC36YRnyDYP2n47qUcq1Z2k%2B9Enmq7scvkknZ0Jr09Nb56jweP9uR6k7kwv4Q%3D%3D&ver=1.3
