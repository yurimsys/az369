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
// let a = connection.query('select * from tu where u_id =2');

// debugger;
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



//아이디 중복확인
router.post('/user/overlap', (req, res, next) =>{
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
router.post('/user/modifyPw', (req, res, next) =>{
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
    

    // let query = `UPDATE tu SET U_Pw = :?, U_Phone = :?, U_Brand = :?,
    //             U_Zip = :?, U_Addr1 = :?, U_Addr2 = :? WHERE U_UserName =:UserName`;           

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

    let query = `UPDATE tU SET U_Pw = :hash_pw, U_Phone = :uPhone, U_Brand = :uBrand,
                U_Zip = :uZip, U_Addr1 = :uAddr1, U_Addr2 = :uAddr2, U_uDt = now() WHERE U_UserName =:uUserName`;
    connection.query(query, 
        {          
            hash_pw, uPhone, uBrand, uZip, uAddr1, uAddr2, uUserName
                              
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            
            res.json( {  data : "성공"});
            console.log(rows);
        });
        
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
//마이페이지 예매 및 결제내역
router.post('/user/resPay',  auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let query = `select 
                    count(cr_seatnum) as seat_cnt,
                    sum(cr_price) as total_price,
                    (select ct_carnum from tCT where tCT.ct_id = tCR.CR_CT_ID) as carnum,
                    (select CT_DepartureTe from tCT where tCT.ct_id = tCR.CR_CT_ID) as dept_te,
                    CR_cDt
                    from tCR
                    where cr_u_id=:sessionId
                    group by cr_ct_id order by tCR.CR_cDt desc;
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
router.post('/user/payCancel', auth.isLoggedIn, (req, res, next) =>{
    let sessionId = req.user.U_ID;
    let seatNum = req.body['sendArray[]'];
   // let seatNum2 = req.body.sendJson;
    //console.log("num2 :", seatNum2);
    // for(var i in seatNum){
    //     seatNum[i] = JSON.stringify(seatNum[i]);
        
    // }
    console.log(seatNum);
    console.log("dddd :", sessionId);
    //console.log(seatNum);    
    let query = `
                select 
                CR_CT_ID,
                CR_cDt,
                (select CT_DepartureTe from tCT where tCT.CT_ID = tCR.CR_CT_ID) as dept_te,
                (select CT_CarNum from tCT where tCT.CT_ID= tCR.CR_CT_ID) as carnum,
                CR_cDt,
                CR_Price,
                CR_SeatNum
                from tCR
                where CR_U_ID= :sessionId and CR_SeatNum IN (:seatNum)
                group by CR_CT_ID, CR_SeatNum order by tCR.CR_cDt desc
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
    let query = `update tCR set CR_Cancel = :crCancel, CR_CancelDt = now() where CR_U_Id = :sessionId and CR_CT_ID IN (:ctId) and CR_SeatNum IN (:crSeatNum)`;

    let sessionId = req.user.U_ID;
    let crCancel = 'Y';
    let ctId = req.body['trVal[]'];
    let crSeatNum = req.body['tdVal[]'];
    
    console.log("ctId :", ctId);
    console.log("crSeatNum :", crSeatNum);

    connection.query(query, 
        {          
            sessionId, crCancel, ctId, crSeatNum
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            // //console.log(findId);
            res.json( {  data : "성공"});
            console.log("rows : ",rows);
            
        });
        
});


//마이페이지 취소 및 환불조회
router.post('/user/resCancelList', auth.isLoggedIn, (req, res, next) =>{
    let query = `   select 
                    CR_cDt,
                    (select CT_DepartureTe from tCT where tCT.ct_id = tCR.CR_CT_ID) as dept_te,
                    CR_CancelDt,
                    CR_Price
                    from tCR
                    where cr_u_id= :sessionId and CR_Cancel = :crCancel
                    order by tCR.CR_cDt desc`;

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

//결제완료
router.post('/payment', auth.isLoggedIn, (req, res) =>{
    
    let str_values_list = [],
        str_values ="",
        seatNums = req.body['seatNums[]'],
        ct_id = req.body.ct_id,
        oPrice = req.body.oPrice,
        sPrice = req.body.sPrice;
    
    let query = `
        INSERT INTO tCR
            (CR_CT_ID, CR_U_ID, CR_SeatNum, CR_OPrice, CR_SPrice, CR_Price, CR_PMethod)
        VALUES
    `;
    
    if( typeof(seatNums) === "object"){ //선택한 좌석이 2개 이상
        seatNums.map((seatNum)=>{
            str_values_list.push(`(${ct_id}, ${req.user.U_ID}, ${seatNum}, ${oPrice}, ${sPrice}, ${(oPrice-sPrice)}, '신용카드')`);
        });
        str_values = str_values_list.join(', ');
    } else if(typeof(seatNums) === "string" ){ // 선택한 좌석이 1개
        str_values = `(${ct_id}, ${req.user.U_ID}, ${seatNums}, ${oPrice}, ${sPrice}, ${(oPrice-sPrice)}, '신용카드')`;
    }

    query += str_values;

    connection.query(query, null,
        function(err, result) {
            if(err) throw err;
            
            res.json({ 
                price : (oPrice - sPrice)
            });
        });
});

//장차예매 리스트
//마이페이지 취소 및 환불조회 //,'%m%d'
router.post('/user/resCarList', auth.isLoggedIn, (req, res, next) =>{
    let query = `select 
	tCT.CT_ID as ctID,
	tB.B_Name as carName,
	date_format(tCT.CT_DepartureTe,'%y%y-%m-%d') as deptTe, 
	tCT.CT_CarNum as carNum,
	(select count(tCR.CR_SeatNum) from tCR where tCR.CR_CT_ID =tCT.CT_ID AND CR_Cancel = 'N') as seatNum,
	(select CY_Totalpassenger from tCY where tCY.CY_ID = tCT.Ct_CY_ID) as total

from tCT left join tCY on tCT.CT_CY_ID = tCY.CY_ID left join tB on tCY.CY_B_ID = tB.B_ID
where date_format(CT_DepartureTe,'%H%i') = :deptTe AND date_format(CT_ReturnTe,'%H%i') = :retuTe AND tCT.CT_DepartureTe > now() order by tCT.CT_DepartureTe asc`;

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

module.exports = router;
