const createError = require('http-errors');
const express = require('express');
const session =  require('express-session');
const fileStore = require('session-file-store')(session)
const passport = require('passport');
const passportConfig = require('./config/passport');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index'),
    apiRouter = require('./routes/api'),
    usersRouter = require('./routes/users');

const app = express();
const fs = require('fs');
// const dbconf = JSON.parse( fs.readFileSync('./config/database.json') );

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Debuging 용도
// app.use(function(req, res, next) {
//     console.log('handling request for: ' + req.url);
//     next();
// });

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session Path
let fileStoreOption = {
    path : path.join(__dirname, 'sessions')
}
app.use(session({
    secret : 'qw12!@#yurimsys!@#',
    store: new fileStore(fileStoreOption),
    resave: false,
    saveUninitialized: false 
}));

// Sessions Config
app.use(passport.initialize());
app.use(passport.session());

// Flash Set
app.use(flash());

// Router Config
app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.end();
  // res.render('error');
});

module.exports = app;
