var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'qw12',
    database : 'az369'
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


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'AZ369' });
});

router.get('/mypage', function(req, res, next) {

  let query = "SELECT u_name, u_email, u_phone, u_brand from tU where u_name = :name";
  connection.query(query, { name : "김동현"},
    function(err, rows, fields) {
      if (err) throw err;
    res.render('mypage', { title: '버스 예약시스템', data : rows[0] });
  });
  
});

router.get('/modify', function(req, res, next){
    res.render('modify_01', { title : '정보수정' });
});

router.get('/modify2', function(req, res, next){
    res.render('modify_02', { title : '정보수정' });
});

router.get('/reservation', (req, res) => {
    res.render('reservation_01');
});



router.post('/api/user/phone', (req, res, next) => {
  
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

router.get('/benefit_application', function(req, res, next){
    res.render('benefit_application', { title : '입점신청' });
});

router.get('/login', function(req, res, next){
    res.render('login', { title : '로그인' });
});



  //회원가입 페이지
router.get('/join2', function(req, res, next) {
    res.render('join_02');
});

//회원가입 완료페이지
router.get('/join3', function(req, res, next) {
    res.render('join_03');
});

//아이디 찾기 1페이지
router.get('/findId', function(req, res, next) {
    res.render('find_id_01');
  });

//아이디 찾기 완료 페이지
router.get('/findId2', function(req, res, next) {
    res.render('find_id_02');
});

//비밀번호 찾기 페이지
router.get('/findPw', function(req, res, next) {
    res.render('find_pw_01');
});

//비밀번호 수정 페이지
router.get('/findPw2', function(req, res, next) {
    res.render('find_pw_02');
});

//비밀번호 수정 완료 페이지
router.get('/findPw3', function(req, res, next) {
    res.render('find_pw_03');
});

//입점신청 페이지
router.get('/benefit_application', function(req, res, next) {
    res.render('benefit_application');
});


//회원가입 액션
router.post('/api/user/join', (req, res, next) =>{
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

//아이디 중복확인
router.post('/api/user/overlap', (req, res, next) =>{
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
router.post('/api/user/findId', (req, res, next) =>{
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
router.post('/api/user/findPw', (req, res, next) =>{
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

//비밀번호 수정
router.post('/api/user/modifyPw', (req, res, next) =>{
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
router.post('/api/user/benefitApply', (req, res, next) =>{
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
router.post('/api/user/lookUp', (req, res, next) =>{
    let query = `select SI_cDt from tsi where SI_Name = :siName and SI_Phone = :siPhone `;
    
    console.log(req.body);

    connection.query(query, 
        {          
            siName : req.body.name, 
            siPhone : req.body.phone
                                
        },
        function(err, rows, fields) {
            if (err) throw err;          
             
            //console.log(findId);
            res.json( {  data : rows[0]});
            console.log(rows);
        });
        
});

module.exports = router;
