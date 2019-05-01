var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//GOOGLE PASSPORT
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
//GOOGLE PASSPORT END

const session = require('express-session');
//SESSION SUPPORT
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitalized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {  
  done(null, user);
});

passport.deserializeUser((userDataFromCookie, done) => {  
  done(null, userDataFromCookie);
});

const accessProtectionMiddleware = (req, res, next) => {  
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({
      message: 'must be logged in to continue',
    });
  }
};
//SESSION END

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//PASSPORT STUFF
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: 'https://rocky-sands-44213.herokuapp.com/auth/google/callback',
    scope: ['email', 'profile'],
  },
  //VERIFY REQUIRED BY PASSPORT
  (accessToken, refreshToken, profile, cb) => {
    console.log('Our user authenticated with Google, and Google sent us back this profile info identifying the authenticated user:', profile);
    return cb(null, profile);
  },
));

passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_OAUTH_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
    callbackURL: 'https://rocky-sands-44213.herokuapp.com/auth/facebook/callback',
  },
  //VERIFY REQUIRED BY PASSPORT
  (accessToken, refreshToken, profile, cb) => {
    console.log('Our user authenticated with Facebook, and Facebook sent us back this profile info identifying the authenticated user:', profile);
    return cb(null, profile);
  },
));
//END PASSPORT

const pg = require('pg')
const connectionString = 'postgres://qjjtrndhexdzup:fbcfc7bec66236640e0d1348d40cc444fd414759376cf5dd2a458a02eea8e0f2@ec2-54-243-223-245.compute-1.amazonaws.com:5432/d75siuapddel2u'

pg.connect(connectionString, function(err, client, done) {
  client.query('SELECT * FROM users', function(err, result) {
     done();
     if(err) return console.log('error happened during query', err);
     console.log(result.rows);
  });
});

module.exports = app;
