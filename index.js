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

mongoose.connect(MONGODB_CONNECTION_URI);
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
	key: String,
	title : String,
	createdBy: String
});

var Code = mongoose.model('Code', codeSchema);

app.get('/', function(req, res){
	if(!req.user)
		res.redirect('/login?url=/library');
	else
		res.render('doodle', {data: "", data1: "", view: 1, data2: ""});
});

app.get('/login', function(req, res){
	res.render('login');
});

app.post('/login', passport.authenticate("local", {
	successRedirect:'/library', failureRedirect:"/login", failureFlash :true
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
    	var combination = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
    	for(var i=0; i < 7; i++)
        	text += combination.charAt(Math.floor(Math.random() * combination.length));
    	return text;
	}
	var h = req.body.html;
	var c = req.body.css;
	var j = req.body.js;
	var v = req.body.layout;
	var title = req.body.title;
	var createdBy = "";
	if(req.user)
		createdBy = req.user.username;
	var k = makeId();
	console.log("title: "+title);
	console.log('key generated: '+k);
	var newCode = new Code({html: h, css: c, js: j, layout: v, key: k, title: title, createdBy: createdBy});
	newCode.save(function(err, testEvent) {
  		if (err) 
  			return console.error(err);
  		else {
  			res.send(k);
  			console.log("Code Saved!");
		}
	});
});

app.get('/library', function(req, res){
	if(!req.user)
		res.redirect('/login?url=/library');
	else {
		Code.find({createdBy: req.user.username}, function (err, key) {
			if (err)
				return console.error('Oops! We got an error '+err);
			else if(key)
				res.render('library',{key:key});
			else
				res.render('error');
		});
	}
});
app.get('/:link', function(req, res){
	var link = req.params.link;
	Code.findOne({key:link},function (err, key) {
		if (err)
			return console.error(err);
        else if(key)
        {
        	console.log(key.layout);
        	res.render('doodle',{data: key.html, data1: key.css, view: key.layout, data2: key.js});
        }
		else
			res.render('error');
    });
});

app.listen(process.env.PORT || 3000, function(){
	console.log('Server started at port 3000');
});