var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var utool = require('./libs/utool');
var logger = require('./libs/logger');
var config = require('./libs/config');

var app = express();

app.set('port', config.api_provider.port);
// view engine setup
app.set('views', path.join(__dirname, app.get('env') === 'development' ? 'public/views' : 'dist/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, app.get('env') === 'development' ? 'public/images' : 'dist/images', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, app.get('env') === 'development' ? 'public' : 'dist')));
//app.use(express.static(path.join(__dirname, './webshare')));
app.use(express.static(path.join(__dirname, './node_modules')));

app.use(session({
    cookieName: 'session_apiprovider',
    secret: 'session_apiprovider',
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5,
    resave: false,
    saveUninitialized: true
}));

//app.use('/', routes);
//app.use('/users', users);
routes(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('common/error', {
            message: err.message,
            error: err,
            status: 500
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log('afdfefe')

    //res.status(err.status || 500);
    res.render('common/error', {
        message: err.message,
        error: {},
        status: 500
    });
});


require('./libs/mysql');

//启动
//NODE_ENV = produciton node app.js
app.listen(app.get('port'), function () {
    if (app.get('env') == 'development') {
        console.log('开发环境...');
    }
    console.log('server listening on port ' + app.get('port'));
});

//module.exports = app;