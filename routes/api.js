var express = require('express');
var router = express.Router();

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
    let query = `insert into tu (U_UserName, U_Pw, U_Name, U_Phone, U_Email, U_Brand, U_Zip, U_Addr1, U_Addr2) 
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
router.post('/user/carPool', (req, res, next) =>{
    let query = `insert into tcp(CP_PreferDays, CP_DepartureTe, CP_ReturnTe) values(:preferDays, :departureTe, :returnTe) 
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
router.post('/user/overlap', (req, res, next) =>{
    let query = "select U_UserName from tu where U_UserName = :uUserName";
    
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
    let query = "select U_UserName from tu where U_Name =:uName and U_Phone =:uPhone";
    
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
    let query = "select U_UserName from tu where U_UserName =:uId and U_Name =:uName";
    
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
    let query = "update tu set U_Pw = :uPw where U_UserName = :uUserName";
    
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
    let query = `insert into tsi (SI_Name, SI_Phone, SI_Brand, SI_Addr1, SI_Content) 
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
    let query = `select SI_cDt from tsi where SI_Name = :siName and SI_Phone = :siPhone `;
    
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
router.post('/user/confirm', auth.isLoggedIn, (req, res, next) =>{1

    //console.log(req.body.pw);
    let uPw = req.body.pw
    let uId = req.user.U_UserName
    console.log(uPw);
    console.log("내 아이이디 :",req.user.U_UserName);
    let query = "select U_Pw from tu where U_UserName =:uId and U_Pw =:uPw";
    
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
router.post('/user/modifyInfo', auth.isLoggedIn, (req, res, next) =>{
    

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

    let query = `UPDATE tu SET U_Pw = :uPw, U_Phone = :uPhone, U_Brand = :uBrand,
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
router.post('/user/deleteUser', auth.isLoggedIn, (req, res, next) =>{
    let query = `delete from tu where U_UserName = :uUserName`;   
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

module.exports = router;
