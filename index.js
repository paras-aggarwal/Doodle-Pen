var express = require('express');
var app = express();

app.set('view engine', 'ejs');

var mongoose = require('mongoose');
mongoose.connect(' <MongoDB Connection String> ');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log("Connected To MLab cloud database");
});

var codeSchema = mongoose.Schema({
	html: String,
	css: String,
	js: String,
	key: String
});

var Code = mongoose.model('Code', codeSchema);

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.render('doodle',{data: "", data1: "", data2: ""});
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
	var k = makeId();
	console.log('key generated: '+k)
	var newCode = new Code({html: h, css: c, js: j, key: k});
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
        	res.render('doodle',{data: key.html, data1: key.css, data2: key.js});
        else if (err)
        	return console.error(err);
    });
	// console.log("redirect request for: "+key);
});

app.listen(process.env.PORT || 3000, function(){
	console.log('Server is up and running');
});