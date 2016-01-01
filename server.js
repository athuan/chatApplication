
var app 		= require('express')();
var http 		= require('http').Server(app);
var io 			= require('socket.io')(http);
var path 		= require('path');
var mongoose 	= require('mongoose');
var bodyParser  = require('body-parser');
var morgan 		= require('morgan');
var port 		= process.env.PORT || 3000;
var cookieParser = require('cookie-parser');
var session 	= require('express-session');
var flash 		= require('connect-flash');
var passport 	= require('passport');

var configDB 	= require('./config/database.js');

// connect to database
mongoose.connect(configDB.url);

app.use(bodyParser());	// get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));	// log every request to the console
app.set('view engine', 'ejs');	// set up ejs for templating

// require for passport
app.use(session({ secret: 'sessionsecretforpassport' }));
app.use(passport.initialize());
app.use(passport.session());	// persistent login session
app.use(flash());

// routes
require('./app/routes.js')(app, passport, io);
require('./config/passport')(passport); // config passport

// lauch server
http.listen(port, function() {
	console.log('listening on *: ' + port);
});