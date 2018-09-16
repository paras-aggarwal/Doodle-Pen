var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require("passport");
var localStatergy = require("passport-local");
var flash = require("connect-flash");
var user = require("./db");
var flashMessages = require('flash-messages');

var app = express();

app.set('view engine', 'ejs');

mongoose.connect('mongodb://paras:paras@ds211029.mlab.com:11029/paras_db');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log("Connected To MLab cloud database");
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public'));
app.use(require("express-session")({
    secret:"hello friends",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req ,res , next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success= req.flash("success");
    next();
});

passport.use(new localStatergy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser()); 

var codeSchema = mongoose.Schema({
	html: String,
	css: String,
	js: String,
	layout: Number,
	key: String
});

var Code = mongoose.model('Code', codeSchema);

app.get('/', require('connect-ensure-login').ensureLoggedIn(), function(req, res){
	res.render('doodle', {data: "", data1: "", view: 1, data2: ""});
});

app.get('/login', function(req, res){
	res.render('login');
});

app.post('/login', passport.authenticate("local", {
	successRedirect:"/", failureRedirect:"/login", failureFlash :true
}), function(req , res) {
});

app.get('/register', function(req, res){
	res.render('register');
});

app.post('/register', function(req, res) {
    var newUser= ({
		name:req.body.name,
		username:req.body.username,
		isVerified:'false'
	});
    user.register(newUser , req.body.password , function(err , user){
        if(err)
        {
            console.log("Error in registering");
            req.flash("error" , err.message);
            res.redirect("/signup");
		}
		req.flash("success" , "You are successfully registered!");
        res.redirect("/login");
        // passport.authenticate("local")(req , res , function(){
        //     req.flash("success" , "You are logged in" + user.username);
        //     res.redirect("/");
        // });
    });
});

app.get('/logout', function(req, res) {
    req.logout();
    req.flash("success" , "Successfully logged out");
    res.redirect('/');
})

app.post('/save', function(req, res){
	function makeId(){
		var text = "";
    	var combination = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    	for(var i=0; i < 7; i++)
        	text += combination.charAt(Math.floor(Math.random() * combination.length));
    	return text;
	}

	console.log("redirect success");
	var h = req.body.html;
	var c = req.body.css;
	var j = req.body.js;
	var v = req.body.layout;
	var k = makeId();
	console.log('key generated: '+k)
	var newCode = new Code({html: h, css: c, js: j, layout: v, key: k});
	newCode.save(function(err, testEvent) {
  		if (err) 
  			return console.error(err);
  		else {
  			res.send(k);
  			console.log("Code Saved!");
		}
	});
});

app.get('/:link', function(req, res){
	var link = req.params.link;
	Code.findOne({key:link},function (err, key) {
		//console.log(key);
        if(key)
        {
        	console.log(key.layout);
        	res.render('doodle',{data: key.html, data1: key.css, view: key.layout, data2: key.js});
        }
        else if (err)
        	return console.error(err);
    });
});

app.listen(process.env.PORT || 3000, function(){
	console.log('Server is up and running');
});