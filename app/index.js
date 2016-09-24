var express = require('express');
var FSStore = require('nv-session')(express);
var app = module.exports = express();
var domain = require('domain');
var passport = require('passport');
require('nv-config').loadConfigs();
var middleware = require('nv-middleware');
app.use(function (req, res, next) {
    var requestDomain = domain.create();
    requestDomain.add(req);
    requestDomain.add(res);
    requestDomain.on('error', next);
    requestDomain.run(next);
});

app.use(middleware.addGlobalDb());
app.use(express.bodyParser());


app.use(function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    // Following headers are needed for CORS
    res.setHeader('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept, ajax, access-key,backend,app_request');
    res.setHeader('access-control-allow-methods', 'POST,HEAD,GET,PUT,DELETE,OPTIONS');
    res.setHeader('access-control-allow-origin', '*');
    res.removeHeader("X-Powered-By");
    next();
});

app.use(express.static(__dirname + '/frontend'));

app.use(express.cookieParser());

var user_session = express.session({
    secret: 'aersda@#$32sfas2342',
    //cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 }, //2 days
    store: new FSStore({
        path: '/tmp/sessions',
        reapInterval: -1,
        maxAge: 10 * 24 * 60 * 60 * 1000
    })
});
app.use(function (req, res, next) {
    user_session(req, res, next);
});
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    req.app = require('nv-app').createAppFromRequest(req, res);
    next();
});
require('nv-customer')(app);
require('userInfo')(app);
require('nv-entity')(app);
app.use(function (req, res, next) {
    if (req.session.user && req.session.user.isLoggedIn == true) {
        if (req.session.user.role == 'instructor' && !req.session.user.payout_method) {
            var path = require('path').join(__dirname, '/frontend/login.html');
        } else {
            var path = require('path').join(__dirname, '/frontend/main.html');
        }
        res.sendfile(path);
    } else {
        var path = require('path').join(__dirname, '/frontend/login.html');
        res.sendfile(path);
    }
});
var server = express();
server.setMaxListeners(0);
server.use(express.vhost('*', app));
var port = process.env.NODE_PORT;
if (!port) port = 3000;
var httpServer = server.listen(port);
console.log('\n  listening on port ' + port + '\n');
httpServer.on('close', function () {
    console.log("SERVER EVENT: CLOSE");
});

httpServer.on('clientError', function (arguments) {
    console.log("SERVER EVENT: clientError", arguments);
});


httpServer.on('timeout', function () {
    console.log("SERVER EVENT: timeout");
});
