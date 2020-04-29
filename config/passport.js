const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const mssql = require('mssql');
const CryptoJS = require('crypto-js');
const dbconf = require('../config/database');
const connection = mysql.createConnection(dbconf.mysql);
mssql.connect(dbconf.mssql, function (err, result){
    if(err) throw err;
    console.log("connection mssql ok")
    new mssql.Request().query('select 1 as t', (err, result) => {
        console.log(result);
    })
});

const conn = mssql.connect(dbconf.mssql);
conn.then(() => {
   return mssql.query`select 1 as number` 
}).then(result1 => {
    console.log('pormise!')
    console.log(result1);
});

(async function () {
    try {
        let pool = await mssql.connect(dbconf.mssql)
        let result1 = await pool.request()
            .input('id', mssql.Int, 1002)
            .query('select * from tLS where LS_Number = @id')
        
        console.log('ddd');
        console.dir(result1)
        
        
        let result2 = await pool.request()
        .input('sector', mssql.VarChar(10), 'a2')
        .query('select * from tLS where LS_Sector = @sector')
        
        console.log('result2');
        console.dir(result2)
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})();
 



const config = require('../config');

connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    }.bind(this));
};
passport.use(new LocalStrategy({ usernameField: 'id' }, (username, password, done) => {
    let query = "SELECT u_id, U_uId, u_pw, u_isAdmin  from tU where U_uId = :id";
    //let query2 = 'select u_id, U_uId, u_pw, u_isAdmin from tU where U_uId = :id';
        connection.query(query, { id: username }, (err, rows) =>{
            if (err) {return done(err);}
            if(!rows[0])
                return done( null, false, {message: "ID와 Password를 확인해주세요"} );
            let user = rows[0];

            
            if( CryptoJS.AES.decrypt(user.u_pw, config.enc_salt).toString(CryptoJS.enc.Utf8) !== password ){
                return done( null, false, {message: "ID와 Password를 확인해주세요"} );
            }else {
                return done( null , user );
            }
        }
        
    );
}));

passport.serializeUser((user, done) => {
    console.log("serializeUser");console.log(user);
    done(null, user.u_id);
});

passport.deserializeUser((id, done) => {
    let query = `SELECT * from tU where u_id = ${id}`;
    connection.query(query, (err, rows) =>{
        console.log("deserializeUser");console.log(rows[0]);
        let user = rows[0];
        done( null , user );
    });
});

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
};
