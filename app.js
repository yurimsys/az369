require('./config/init');
const createError = require('http-errors');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session =  require('express-session');
const fileStore = require('session-file-store')(session);
const passport = require('passport');
const passportConfig = require('./config/passport');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const livereload = require('livereload');
const livereloadMiddleware = require('connect-livereload');
const expressStatusMonitor  = require('express-status-monitor');
const indexRouter = require('./routes/index'),
    apiRouter = require('./routes/api'),
    testRouter = require('./routes/test'),
    usersRouter = require('./routes/users'),
    adminRouter = require('./routes/admin');
const multer = require('multer');
const { logger, stream }  = require('./config/winston');
const app = express();

const fs = require('fs');
const https = require('https');
const PORT = 443;

//인증서 경로
const optionsForHTTPS = {
    ca : fs.readFileSync("/home/hosting_users/yurimsys12/apps/yurimsys12_az369/ssl_key/ca_bundle.crt"),
    key : fs.readFileSync('/home/hosting_users/yurimsys12/apps/yurimsys12_az369/ssl_key/private.key'),
    cert : fs.readFileSync('/home/hosting_users/yurimsys12/apps/yurimsys12_az369/ssl_key/certificate.crt')
    // key : fs.readFileSync('C:/WorkSpace/firebase_test/real_keys/private.key'),
    // cert : fs.readFileSync('C:/WorkSpace/firebase_test/real_keys/private.crt')
};

    
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(multer);

app.use(expressStatusMonitor());
// 개발환경일 경우만 실행
if( app.get('env') == "development"){
    // Debuging 용도
    app.use(function(req, res, next) {
        // console.log('handling request for: ' + req.url);
        next();
    });

    // Live Reload Server Config
    const liveServer = livereload.createServer({
        // observe exts
        exts: ['js', 'css', 'ejs', 'png', 'gif', 'jpg'],
        debug: true
    });

    liveServer.watch(__dirname);
    app.use(livereloadMiddleware());
}

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

// Session Path
let fileStoreOption = {
    path : path.join(__dirname, 'sessions')
}
app.use(session({
    secret : 'qw12!@#yurimsys!@#',
    // store: new fileStore(fileStoreOption),
    resave: false,
    saveUninitialized: false 
}));

// Sessions Config
app.use(passport.initialize());
app.use(passport.session());

// Logging Config
morgan.token('remote-user', function(req){
    return (req.user == "undefined") ? req.user.U_ID : ''});
app.use(morgan('combined', { stream }));

// Flash Set
app.use(flash());

// Router Config
app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/test', testRouter);
app.use('/users', usersRouter);

// Admin Layout 적용
app.use(expressLayouts);

app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  let apiError = err;

  if(!err.status){
      apiError = createError(err);
  }
  let errObj = {
      user : req.user,
      req: {
          headers: req.headers,
          query : req.query,
          body : req.body,
          route: req.route
      },
      error: {
          message: apiError.message,
          stack: apiError.status
      }
  }
  

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  console.log(err);
  console.log(err.message);
  // render the error page
  res.status(err.status || 500);
  res.end();
  
});

// 지정된 3000 포트로 https 연결
https.createServer(optionsForHTTPS, app).listen(PORT, function(){
    console.log('HTTPS Server Start PORT:' + PORT);
});

// https.createServer(optionsForHTTPS, (req, res) => {
//     res.writeHead(200);
//     // res.end('hello world\n');
//   }).listen(8000);

module.exports = app;
