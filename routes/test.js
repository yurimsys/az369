const express = require('express');
const router = express.Router();
const sms = require('../modules/sms');
const auth  = require('../modules/auth');

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

module.exports = router;
