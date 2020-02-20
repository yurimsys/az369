const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const fs = require('fs');
const dbconf = JSON.parse( fs.readFileSync('./config/database.json') );
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

passport.use(new LocalStrategy({ usernameField: 'id' }, (username, password, done) => {
    let query = "SELECT u_id, u_username, u_pw from tU where u_username = :id";
        connection.query(query, { id: username }, (err, rows) =>{
            if (err) {return done(err);}
            if(!rows[0])
                return done( null, false );
            let user = rows[0];
            if( user.u_pw !== password ){
                return done( null, false, {message: "login fail"} );
            } else {
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
    connection.query(query, { id : id }, (err, rows) =>{
        console.log("deserializeUser");console.log(rows[0]);
        let user = rows[0];
        done( null , user );
    });
});

exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
};