var express = require('express');
// var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var app = express();

app.set('view engine', 'ejs');

mongoose.connect('< mongoDB connection string >');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log("Connected To MLab cloud database");
});

var codeSchema = mongoose.Schema({
	html: String,
	css: String,
	js: String,
	layout: Number,
	key: String
});

var Code = mongoose.model('Code', codeSchema);

var doodleRegister = mongoose.Schema({
	name: String,
	email: String,
	password: String
});

var register = mongoose.model('register', doodleRegister);

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.render('doodle', {data: "", data1: "", view: 1, data2: ""});
});

app.get('/login', function(req, res){
	res.render('login');
});

app.post('/login', function(req, res){
	var email = req.body.email;
	var password = req.body.password;
	register.findOne({email: email}, function(err, found){
		if(err) {
			throw err;
		}
		if(!found) {
			res.send('wrong');
			return console.log('wrong credentials');
		}
		if(found.password != password) {
			res.send('wrong');
			return console.log('wrong credentials');
		}
		res.send('success');
	});
});

app.get('/register', function(req, res){
	res.render('register');
});

app.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	// var newUser;
	// bcrypt.hash('password', 10, function(err, hash) {
	// 	console.log(hash);
 //  		password = hash;
  		
	// });
	var newUser = new register({name: name, email: email, password: password});
	register.findOne({email: email}, function(err, found){
		if(found) {
			res.send('exist');
			return console.log('email exist');
		}
		newUser.save(function(err, success){
			res.send(success);
		});
	});
});

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