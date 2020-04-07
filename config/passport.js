const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const CryptoJS = require('crypto-js');
const dbconf = require('../config/database');
const connection = mysql.createConnection(dbconf);
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
