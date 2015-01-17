// server.js

// set up ======================================================================
// get all the tools we need
var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = parseInt(process.env.PORT, 10) || 3000;

var mongoose = require('mongoose'),
    passport = require('passport'),
    flash    = require('connect-flash'),
    morgan   = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser'),
    session      = require('express-session'),
    configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(methodOverride());
app.use(express.static(__dirname + '/public'));

require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(port, hostname);
console.log("Simple static server listening at http://" + hostname + ":" + port);