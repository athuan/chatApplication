var Message = require('./models/message');
var User = require('./models/user');
var Online = require('./models/online');
var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');
var dateFormat = require('dateformat');

var sessionTime = 10000; // 10 seconds

module.exports = function(app, passport, io) {
	
	// home page
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	// login page
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process login
	app.post('/login', function(req, res, next) {
		passport.authenticate('login', function(err, user, info) {
			if (err) return next(err);
			if (!user) return res.redirect('/login');
			req.logIn(user, function(err) {
				if (err) return next(err);
				var redirect_to = req.session.redirect_to || '/profile';
				return res.redirect(redirect_to);
			});
		})(req, res, next);
	});

	// sign up page
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process signup
	app.post('/signup', function(req, res, next) {
		passport.authenticate('singup', function(err, user, info) {
			if (err) return next(err);
			if (!user) return res.redirect('/signup');
			req.logIn(user, function(err) {
				if (err) return(next);
				return res.redirect('/profile');
			});
		})(req, res, next);
	});

	// profile page
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', { user: req.user });
	});

	// logout
	app.get('/logout', function(req, res) {
		delete req.session.redirect_to;
		req.logout();
		res.redirect('/');	// redirect to home page
	});

	// chat page
	app.get('/chat', isLoggedIn, function(req, res) {
		console.log(req.user.username + " redirected to chat page");
		var user = req.body.user;
		if (user){
			console.log("test req.body.user: "+user.username)
		}
		res.render('chat.ejs', { user: req.user });
	});

	// process message which sent from the client
	app.post('/messages', function(req, res, next) {
		var message = req.body.message;
		var user = req.body.user;
		console.log("message: "+message+" user: "+JSON.stringify(user));
		var messageModel = new Message();
		messageModel.user_id = user._id;
		messageModel.content = message;
		messageModel.save(function(err, result) {
			if (!err) {
				Message.find({}).sort('-create_at').exec(function(err, messages) {
					findUserMessage(messages, function(data) {
						io.emit('message', { messages: data });
					});
					io.emit('message', {messages: messages, user: user});			
				});
				res.send("Message Sent!");
			} else {
				res.send("some errors occured!");
			}
		});
	});

	// get all messages from the database
	app.get('/messages', function(req, res, next) {
		Message.find({}).sort('-create_at').exec(function(err, messages) {
			findUserMessage(messages, function(data) {
				res.json({messages: data});
			});
	    });
	});

	// get all the user who is online
	app.get('/userOnline', function(req, res, next) {
		userOnline(function(data) {
			res.json(data);
		});
	});

	// update user's status (online or offline)
	io.on('connection', function(socket){
		var user;
		var isOnline = false;
		var timeOutId = 0;

		socket.on("i-am-online", function(data) {
			console.log("user online "+JSON.stringify(data));
			if (data) {
				user = data.user;
				console.log("isOnline: "+isOnline);

				if (!isOnline) {
					isOnline = true;
					setUserOnline(user);
				}

				if (timeOutId) {
					clearTimeout(timeOutId);
					timeOutId = 0;
				} 

				timeOutId = setTimeout(function() {
					setUserOffline(user);
					isOnline = false;
				}, sessionTime);
				
			}
		});
	});

	// make sure user is logged in
	function isLoggedIn(req, res, callback) {
		if (req.isAuthenticated()) return callback();
		req.session.redirect_to = req.originalUrl;
		res.redirect('/login');
	}

	// find users who are online
	function userOnline(callback) {
		var userOnline = [];
		Online.find({}, function(err, data) {
			for (var i in data) {
				if (data[i].isOnline) {
					userOnline.push(data[i]);
				}
			}
			callback(userOnline);
		})
	}

	// get all message from db and format its date
	function findUserMessage(messages, callback) {
		var allMessages = [];

		async.eachSeries(messages, function iterator(elt, cb) {
			var user_id = mongoose.Types.ObjectId(elt.user_id);
			message = JSON.parse(JSON.stringify(elt));

			var date = dateFormat(message.create_at, "dddd, mmmm dS, yyyy, h:MM:ss TT");
			message.dateFomat = date;
			User.findById(user_id, function(err, user) {
				if (err) return next(err);
				message.username = user.username;
				allMessages.push(message);
				cb();
			});
		}, function done() {
			callback(allMessages)
		});
	}

	// update user's status and send to all clients
	function setUserStatus(user, isOnline) {
		Online.findOne({'username': user.username}, function(err, data) {
			if (err) throw err;
			if (data) {
				data.isOnline = isOnline;
				data.save();
			} else { //create new user online if the user is not exist
				var newUserOnline = new Online();
				newUserOnline.username = user.username;
				newUserOnline.isOnline = isOnline;
				newUserOnline.save();
			}
			// send all users who is online for clients
			userOnline(function(data) {
				io.emit("onlines", data);
			});
		});
	}

	// set user is online
	function setUserOnline(user) {
		setUserStatus(user, true);
	}

	// set user is offline
	function setUserOffline(user) {
		setUserStatus(user, false);
	}
};