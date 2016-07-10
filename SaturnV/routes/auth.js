var express = require('express');
var router = express.Router();
var User = require('../models/user');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// function randomCode() {
//   var min = 1000;
//   var max = 9999;
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

module.exports = function(passport) {

	// GET /auth/google
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  The first step in Google authentication will involve
	//   redirecting the user to google.com.  After authorization, Google
	//   will redirect the user back to this application at /auth/google/callback
	router.get('/auth/google',
	  passport.authenticate('google', { scope: ['openid profile email https://mail.google.com/'] }));

	// GET /auth/google/callback
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
	router.get('/auth/google/callback',
	  passport.authenticate('google', { failureRedirect: '/login' }),
	  function(req, res) {
	    res.redirect('/');
	  });

  // GET Login page
  router.get('/login', function(req, res) {
    if(req.user){
      res.redirect('/');
      return;
    }
    res.render('login');
  });

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  return router;
};
