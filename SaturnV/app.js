var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET, "http://localhost:3000/auth/google/callback");
google.options({ auth: oauth2Client });
var gmail = google.gmail('v1', {auth: oauth2Client });

var base64url = require('base64url')
var _ = require('underscore');
  //routes
var routes = require('./routes/index');
var auth = require('./routes/auth');

  //models
var User = require('./models/user');

var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  var connect = process.env.MONGODB_URI || require('./models/connect');
  mongoose.connect(connect);

  // Passport stuff here

  app.use(session({
    secret: process.env.SECRET,
    // name: 'Catscoookie',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    proxy: true,
    resave: true,
    saveUninitialized: true
  }));


  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
<<<<<<< HEAD
      });
    //   console.log(oauth2Client)
    // gmail.users.messages.list({
    //   auth: oauth2Client,
    //   userId: 'me'
    // }, function(err, response) {
    //   console.log(response)
    // });
=======
    });
>>>>>>> 0db394ff396a4b23d5bc2167a6881bca2d59d80e

    User.findOrCreate({
      email: profile.emails[0].value,
      name: profile.displayName,
      googleId: profile.id,
      token: oauth2Client,
      refresh: refreshToken
    }, function (err, user) {
      return done(err, user);
    });
  }
));

app.use('/', auth(passport));
app.use('/', routes(gmail, oauth2Client));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
