var express = require('express');
var router = express.Router();
var request = require('request'); //watson
/* GET home page. */
var Contact = require('../models/contact');
var User = require('../models/user');

// var google = require('googleapis');
// var googleAuth = require('google-auth-library');
var base64url = require('base64url')
var _ = require('underscore');
var MailParser = require("mailparser").MailParser;
var mailparser = new MailParser();


// var OAuth2 = google.auth.OAuth2;
// var oauth2Client = new OAuth2(
// 	process.env.GOOGLE_CLIENT_ID,
// 	process.env.GOOGLE_CLIENT_SECRET,
// 	"http://localhost:3000/auth/google/callback"
// );

var scopes = [
	"https://www.gmail.com"
]

module.exports = function(gmail, authClient){
	// console.log(gmail);

	router.use(function(req,res,next){
	  if (req.user) return next();
	  res.redirect('/login');
	})

	router.get('/contact', function(req, res, next){
		// console.log(req.user);
		res.render('contact');
	});

	//creating a contact
	router.post('/contact', function(req, res, next){

		// var url = oauth2Client.generateAuthUrl({
		//   access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
		//   scope: scopes // If you only need one scope you can pass it as string
		// });

		var msgs = [];
	  var parsedMsgs = [];
	  var body = "";


	  var watson = function(messageBody) {
	  		// console.log('watson');

		// this function passes in a messageBody that represents the entire email history with a contact
		// and returns a sentiment score for that contact=

		    request.post({
		    	url: 'https://watson-api-explorer.mybluemix.net/alchemy-api/calls/text/TextGetTextSentiment',
		        form:{apikey: process.env.WATSON,
		        outputMode: 'json',
		        text: messageBody}},
		        function(err, httpResponse, body) {

		            var score = JSON.parse(httpResponse.body).docSentiment.score;
		            // console.log(score);
		 			var c = new Contact({
		 				email: req.body.email,
		 				name: req.body.name,
		 				score: score
		 			}).save(function(err, contact){
		 				if(err){
				          return res.status(400).render('error', {
				          message: err
				        });
				      }
				        User.findByIdAndUpdate(req.user._id, {
				        	contacts: req.user.contacts.concat(contact)
				        }, function(err, user){
				        	if(err){
					          return res.status(400).render('error', {
					          message: err
					        });
					      }
					      return res.redirect('/');
				        });
		 			})
		    })
		}

		function getMessages(nextPage, callback) {
			// console.log('getMsg');
		  gmail.users.messages.list({
		    // auth: req.user.token,
		    auth: authClient,
		    userId: 'me', //or 'me' ?
		    pageToken: nextPage,
		    q: "from:" + req.body.email + " OR to:" + req.body.email
		  }, function(err, response) {
		  	// console.log(err);
		  	// console.log(response);
		      if (err) {
		        console.log('The API returned an error: ' + err);
		        req.logout();
		        return res.redirect('/logout');

		      }
		      // console.log(msgs);
		      msgs = msgs.concat(response.messages);
		      response.messages.forEach(function(item, i){
            console.log('getting contact',i)
		        setTimeout(function() {
		          gmail.users.messages.get({
		            auth: authClient,
		            userId: 'me',
		            // from: "crisllop24@gmail.com",
		            id:item.id,
		            format: "raw"
		          },function(err,response){
		            // console.log(response.raw);
		            var isSomething = (response !== null)
		            // console.log(i, isSomething)
		            if (!isSomething) {
		              console.log(err);
		            }
		            // send the email source to the parser
		            if(response){
		              mailparser.write(base64url.decode(response.raw));
		              mailparser.end();
		            }
		          })
		        }, i * 20);
		      });
		      if(response.nextPageToken){
		        return getMessages(response.nextPageToken, callback);
		      } else {
		        return callback(msgs);
		      }
		  })
		}

		mailparser.on("end", function(mail_object){
			parsedMsgs.push(mail_object.text);
			if (parsedMsgs.length === msgs.length) {
			  body = parsedMsgs.join(" ");
			  watson(body);
			}
		});
		getMessages(null, function(messages){});
	});

	//contact wall
	router.use(function(req, res, next){
		if (req.user.contacts.length === 0) return res.redirect('/contact');
		return next();
	});

	router.get('/', function(req, res, next) {
    console.log(req.user.contacts);
    Contact.find({},function(err,response){
      if (err) console.error(err);
      var planets = [];
  	  response.forEach(function(contact,i){
        var score = Math.floor((Number(contact.score)+4)*50);
  	    planets.push({
  	      R: score,
  	      r: 10,
  	      name: contact.name,
  	      speed: (7 - (i+1)*10 % 7) * (-1),
  	      phi0: i*10+15,
          moons:[{ R: 1, r:   1, speed: -0.10, phi0:  10 } ]
  	    })
  	  })
  	  console.log(planets);
  	  res.render('index', { planets:JSON.stringify(planets) });
  	});
    })


	return router
}
