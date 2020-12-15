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
    // next(createError(404));
    //404일시 아래 메세지내역을 페이지내에 출력함
    // res.status(404).send('일치하는 주소가 없습니다!');
    // console.log('404에러 발생!');
    // console.log(path.join(__dirname, "./views",'not_found.html'));
    //404일시 에러 페이지 출력
    res.status(404).sendFile(path.join(__dirname, "./views", 'not_found.html'));
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

    console.log('app.js error handler 발생');
    console.log(err);
    console.log(err.message);
    // render the error page
    //오류 발생시 에러 페이지를 출력함
    res.status(err.status || 500).sendFile(path.join(__dirname, "./views", 'errpr_page.html'));
    // res.end();
  
});
module.exports = app;
