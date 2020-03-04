const sms = require('./sms');
const config = require('../config');
const mysql = require('mysql');
const dbconf = require('../config/database');
const connection = mysql.createConnection(dbconf);

connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    }.bind(this));
};


// 인증번호 4자리 생성
const genNumber = ( digit_length = 4) => {
    if( digit_length <= 0 ) digit_length = 4;

    let number = 0;
    while(1){
        number = Math.round( Math.random() * Math.pow( 10, digit_length ));
        if(number.toString().length === digit_length) return number;
    }    
}

// 인증번호 DB 저장
// 인증번호 유효 시간 30분
const saveNumber = ( phone_number ) => {
    let auth_number = genNumber(4);
    let query = `insert into phone_auth values( ${phone_number}, ${auth_number}, date_add(now(), interval 30 minute))`;
    
    return new Promise( function (resolve, reject) {
        connection.query( query, null, (err, result) => {
            if(err) reject(err);
            
            result.auth_number = auth_number;
            result.phone_number = phone_number;            
            resolve(result);
        });
    });
}

// 인증번호 Check
const checkNubmer = ( phone_number, auth_number ) => {
    let query = `
        select auth_number 
        from phone_auth 
        where phone_number = :phone_number
        and expire_dt > now() 
        order by expire_dt desc 
        limit 1`;
    return new Promise( function (resolve, reject) {

        connection.query( query, { phone_number : phone_number }, (err, result) => {
            if(err) reject( err );
            
            console.log(result);
            let res_data = {};
            if( result.length === 1 ){
                if( result[0].auth_number == auth_number ){

                    res_data = {
                        msg : "success",
                        status_code : 200
                    }
        
                    resolve( res_data );
                } else {
                    res_data = {
                        msg : "인증번호를 잘못 입력하셨습니다.",
                        status_code : 400
                    }
                    resolve( res_data );    
                }
            } else {
                res_data = {
                    msg : "인증시간이 만료 되었습니다.",
                    status_code : 400
                }
                
                resolve( res_data );
            }
        });
    });
    
}

module.exports = {
    genNumber,
    saveNumber,
    checkNubmer
}
