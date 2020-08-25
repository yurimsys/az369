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

router.get('/pay_test',function(req, res){
    res.render('pay_test');
})

router.get('/pay_cancel',function(req, res){
    res.render('pay_cancel');
})



router.get('/sign', function(req, res, next) {
    res.render('signage');
});


router.get('/', function(req, res, next) {
    console.log('req info : ', req);
    console.log('sessionID info : ', req.sessionID);
    res.render('index', { sessionUser : req.user });
});

router.get('/search', function(req, res, next) {
    res.render('search', { sessionUser : req.user });
});


//매장관리자 페이지
router.get('/list', function(req, res, next) {

    res.render('signageBList');
});


//매장등록 페이지
router.get('/addList', function(req, res, next) {

    res.render('signageAdd');
});

//////@@@@@ 의향서

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
                        (LSV_NAME,
                         LSV_Phone,
                         LSV_Store,
                         LSV_wContactPeriod,
                         LSV_wRentalFeeMin,
                         LSV_wRentalFeeMax,
                         LSV_wDepositMin,
                         LSV_wDepositMax, 
                         LSV_wInsuranceTy, 
                         LSV_cRentalFee, 
                         LSV_cDeposit, 
                         LSV_wModify, 
                         LSV_Question)
                    values
                        (:name, 
                         :phone,
                         :store, 
                         :wt_contact_period, 
                         :wt_rental_fee_min, 
                         :wt_rental_fee_max, 
                         :wt_deposit_min, 
                         :wt_deposit_max, 
                         :wt_insurance_type, 
                         :cur_rental_fee, 
                         :cur_deposit, 
                         :wt_modify, 
                         :opinion) `
 
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


//c4 차트
router.post('/c4/chart', function(req,res){
    // and create_dt between date_add(now(), interval -6 month) and now()
    // where date_format(create_dt , '%Y-%m') IN(select date_format(create_dt, '%Y-%m') as tes from admin_survey_test group by tes)
        let query = `select 
                        LSV_Store, 
                        LSV_wRentalFeeMin, 
                        LSV_wRentalFeeMax, 
                        LSV_cDt, 
                        concat(date_format(LSV_cDt,'%m'), '월') as day
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
            (LSV_NAME, 
            LSV_Phone, 
            LSV_Store, 
            LSV_wContactPeriod, 
            LSV_wRentalFeeMin, 
            LSV_wRentalFeeMax, 
            LSV_wDepositMin,
            LSV_wDepositMax, 
            LSV_wInsuranceTy, 
            LSV_cRentalFee, 
            LSV_cDeposit, 
            LSV_wModify, 
            LSV_Contract, 
            LSV_Question)
        VALUES
            (:NAME, 
            :Phone, 
            :Addr, 
            :WT_Contact_Period, 
            :WT_Rantal_Fee_Min,
            :WT_Rantal_Fee_Max,
            :WT_Deposit_Min,
            :WT_Deposit_Max,
            :WT_Insurance_Type, 
            :CUR_Rental_Fee, 
            :CUR_Deposit, 
            :WT_Modify, 
            :CUR_has_Contract, 
            :Opinion)`;

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

router.get('/a', function(req, res, next){
    if(req.user !== undefined){
        
        res.redirect('/reservation');
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

//기존 로그인 시 경로
// router.post('/login', 
//     passport.authenticate('local', {
//         successRedirect: '/',
//         failureRedirect: '/login',
//         failureFlash: true       
//     }) 
// );

router.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/reservation',
        failureRedirect: '/login',
        failureFlash: true       
    }) 
);

router.get('/logout', function(req, res, next){
    req.session.destroy();
    // req.logout();
    
    res.redirect('/');
});


router.get('/reservation', auth.isLoggedIn, function(req,res, next){
    let query = `select 
                    DISTINCT  date_format(CT_DepartureTe,'%H%i') as pyeongDept,
                    date_format(CT_DepartureTe,'%H:%i') as pyeongDept2
                from tCT
                    WHERE tCT.CT_DepartureTe > NOW();

                select 
                    DISTINCT date_format(CT_ReturnTe, '%H%i') as seoulDept,
                    date_format(CT_ReturnTe, '%H:%i') as seoulDept2
                from tCT
                    WHERE tCT.CT_DepartureTe > NOW()`;
                    
    connection.query(query,
        function(err, rows, fields) {
            if (err) throw err;
            console.log(rows);
            res.render('reservation_01', {sessionUser: req.user, timeone : rows[0], timetwo : rows[1]});
            
            
    });  
});

// router.get('/reservation_test', auth.isLoggedIn, function(req,res, next){
//     let query = `select 
//                     DISTINCT  date_format(CT_DepartureTe,'%H%i') as pyeongDept,
//                     date_format(CT_DepartureTe,'%H:%i') as pyeongDept2
//                 from tCT
//                     WHERE tCT.CT_DepartureTe > NOW();

//                 select 
//                     DISTINCT date_format(CT_ReturnTe, '%H%i') as seoulDept,
//                     date_format(CT_ReturnTe, '%H:%i') as seoulDept2
//                 from tCT
//                     WHERE tCT.CT_DepartureTe > NOW()`;
                    
//     connection.query(query,
//         function(err, rows, fields) {
//             if (err) throw err;
//             console.log(rows);
//             res.render('reservation_01', {sessionUser: req.user, timeone : rows[0], timetwo : rows[1]});
            
            
//     });  
// });

// router.get('/reservation', function(req,res, next){
//     let query = `select 
//                     DISTINCT  date_format(CT_DepartureTe,'%H%i') as pyeongDept,
//                     date_format(CT_DepartureTe,'%H:%i') as pyeongDept2
//                 from tCT
//                     WHERE tCT.CT_DepartureTe > NOW();

//                 select 
//                     DISTINCT date_format(CT_ReturnTe, '%H%i') as seoulDept,
//                     date_format(CT_ReturnTe, '%H:%i') as seoulDept2
//                 from tCT
//                     WHERE tCT.CT_DepartureTe > NOW()`;
                    
//     connection.query(query,
//         function(err, rows, fields) {
//             if (err) throw err;
//             console.log(rows);
//             res.render('reservation_01', {sessionUser: req.user, timeone : rows[0], timetwo : rows[1]});
//     });  
// });

router.get('/complete', auth.isLoggedIn, function(req, res, next){
    res.render('reservation_02', {sessionUser: req.user} );
});

router.get('/reservation2', auth.isLoggedIn, function(req, res, next){
    res.render('reservation_01-2', {sessionUser: req.user} );
});

//마이페이지 첫화면
router.get('/mypage',  auth.isLoggedIn, function(req, res, next) {
    let sessionId = req.user.U_ID;
    let crCancel = "N";
    //(select group_concat(CR_SeatNum ,'번')) as seatNum 마이페이지 좌석 번호 표시
    let query = `select 
                    distinct tB.B_Name as carName,
                    date_format(tCT.CT_DepartureTe,'%m.%d') as deptTe1,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d') as deptTe2,
                    date_format(tCT.CT_DepartureTe,'%H:%i') as deptTe3,
                    date_format(tCT.CT_DepartureTe,'%y%y.%m.%d %H:%i') as deptTe,
                    tCT.CT_DepartureTe,
                    tCT.CT_CarNum as carNum,
                    tCR.CR_cDt as payDay,
                    (select group_concat(CR_SeatNum)) as seatNum,
                    (select group_concat(CR_SeatNum ORDER BY CR_SeatNum asc,'번' ) ) as seatNumMo
                from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID left join tCR on tCR.CR_CT_ID = tCT.CT_ID 
                    where tCR.CR_CT_ID =tCT.CT_ID AND tCR.CR_Cancel = :crCancel
                    and tCR.CR_U_ID = :sessionId
                and tCT.CT_ReturnTe > date_add(now(),interval +4 HOUR)
                group by tCR.CR_cDt
                order by tCT.CT_DepartureTe, tCR.CR_cDt desc;

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

// footer 버튼 이동 페이지
// 서비스 이용약관
router.get('/service', function(req, res, next) {
    res.render('footer_page_service', { sessionUser : req.user });
});


// 개인정보처리방침
router.get('/privacy', function(req, res, next) {
    res.render('footer_page_privacy', { sessionUser : req.user });
});

// 환불규정
router.get('/refund', function(req, res, next) {
    res.render('footer_page_refund', { sessionUser : req.user });
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







//장차 기사전용 앱
router.get('/driver_app', function(req, res, next) {
    res.render('driver_app');
});



module.exports = router;
