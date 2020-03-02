const aligoapi = require('aligoapi');
const config = require('../config');

var AuthData = config.aligo.auth;
var sms = {};

/**
 * 작성자 : 김동현
 * DEV 환경에서는 TEST 모드로 동작합니다. 
 * 따라서, 모든 발송 내역은 홈페이지 내에서 확인해야 합니다. 
 * URL : https://smartsms.aligo.in/
 * ID, PW 은 문의 주세요.
 */

/**
 * 메세지 발송 단건
 * data 필수 값 : msg, receiver
 */ 
sms.send = ( req, data ) => {
    
    if( data.msg === "" || !data.msg ) throw new Error('msg is not found');
    if( data.receiver === "" || !data.receiver ) throw new Error('receiver not found');

    // 메시지 발송하기
    req.body = {
        receiver : data.receiver, // 수신자 번호
        msg : data.msg, // (1~2,000 Byte)
        msg_type : data.msg_type || "SMS", // SMS, LMS, MMS 
        rdate: data.rdate || "", //YYYYMMDD  예약일(현재일이상)
        rtime: data.rtime || "",// HHMM (예약시간-현재시간기준 10분 이후)
        image: ""//첨부이미지  jpeg, png, gif
    }

    return aligoapi.send(req, AuthData);
}

/**
 * 인증번호 메세지 발송
 * data 필수 값 : receiver, auth_number
 */
sms.send = ( req, data ) => {
    
    if( data.receiver === "" || !data.receiver ) throw new Error('receiver not found');
    if( data.auth_number === "" || !data.auth_number ) throw new Error('auth_number not found');

    data.msg = config.message.phone_auth.replace("#auth_number#", auth_number );
    
    // 메시지 발송하기
    req.body = {
        receiver : data.receiver, // 수신자 번호
        msg : data.msg, // (1~2,000 Byte)
        msg_type : data.msg_type || "SMS", // SMS, LMS, MMS 
        rdate: data.rdate || "", //YYYYMMDD  예약일(현재일이상)
        rtime: data.rtime || "",// HHMM (예약시간-현재시간기준 10분 이후)
        image: ""//첨부이미지  jpeg, png, gif
    }

    return aligoapi.send(req, AuthData);
}


module.exports = sms;