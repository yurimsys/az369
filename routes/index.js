var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'qw12',
    database : 'BusReservation'
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

router.get('/findId1', function(req, res, next) {
    res.render('find_id_01');
  });

router.get('/findId2', function(req, res, next) {
    res.render('find_id_02');
});


  //회원가입 페이지
router.get('/join2', function(req, res, next) {
    res.render('join_02');
});

//회원가입 액션
router.post('/join/user', (req, res, next) =>{
    let query = `insert into tu (U_UserName, U_Pw, U_Name, U_Phone, U_Brand, U_Zip, U_Addr1, U_Addr2) 
            values( :uUserName,  :uPw,  :uName,  :uPhone , :uBrand,  :uZip,  :uAddr1,  :uAddr2)`;
    //console.log(req.body);

    connection.query(query, 
        {
            uUserName : req.body.id,
            uPw : req.body.password,
            uName : req.body.name,
            uPhone : req.body.phone,
            uBrand : req.body.brand,
            uZip : req.body.postcode,
            uAddr1 : req.body.address,
            uAddr2 : req.body.detailAddress           
        },
        function(err, rows, fields) {
            if (err) throw err;
            res.json({
                statusCode : 200
            });
        });
});

//아이디 중복확인
router.post('/join/overlap', (req, res, next) =>{
    let query = "select U_UserName from tu where U_UserName = :uUserName";
    
    console.log(req.body);

    connection.query(query, 
        {
            uUserName : req.body.id                      
        },
        function(err, rows, fields) {
            if (err) throw err;
            // if(rows.length == 0){
            //     check = 1;
            // }else{
            //     check = 0;
            // }
            //console.log(rows);
            // res.json({ data : check })
            //console.log(check);
            res.json( {  data : rows[0] });
        });
        
});


router.get('/join3', function(req, res, next) {
    res.render('join_03');
});
module.exports = router;
