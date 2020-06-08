const express = require('express');
const router = express.Router();
const sms = require('../modules/sms');
const auth  = require('../modules/auth');
const fetch = require('node-fetch');
const app = express();


router.get('/sms', function(req, res){
    
    let data = {
        receiver : "01012341234",
        auth_number : auth.genNumber(4)
    };
    
    sms.phoneAuthSend( req, data ).then((r) => {
        console.log("sms send start");
        console.log(r);
        res.send(r);
    }).catch((e) => {
        console.log("sms send error");
        console.log(e);
        res.send(e);
    })
});

// UDI API 전송 예제 코드
router.get('/', function(req,res){
    var details = {
        'grant_type': 'client_credentials'
    };
    
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    let ClientID = 'sXAWq3uwIPk5oAYm';
    let ClientSecret = 'kwwlRwCMCaVG6Hay';
    
    let auth = `${ClientID}:${ClientSecret}`;
    
    fetch('http://udiportal.mfds.go.kr/api/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic '+Buffer.from(auth).toString('Base64'),
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': 'application/json;charset=UTF-8'
      },
      body: formBody
    }).then((response)=>{
        console.log('----- form submit result ------')
        console.log(response);
        res.send(response);
    })
        
})



module.exports = router;
