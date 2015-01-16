var AWS = require('aws-sdk');
var fs = require('fs'); //debug
AWS.config.loadFromPath('./config/aws/config.json');

var s3 = new AWS.S3();
/*
s3.createBucket( {Bucket: 'myBucket2'}, function (err, data) {
    if (err) {       
        console.log(err);
    }
    else {
        console.log("SUCCESSFULLY CREATED bucket"); //debug
    }
});*/

bucketFolder = "6.470/folder4/";
s3.headBucket({Bucket:bucketFolder},function(err,data){
    if(err){
        s3.createBucket({Bucket:bucketFolder},function(err,data){
            if (err) {       
                console.log(err);
            }
            else {
                console.log("Successfully created folder!");   
            }
        });
     } else {
         console.log("Bucket (folder) already exists!");
     }
 });
/*
var params = {
    Bucket: '6.470',
    Key: "troll",
    ContentType: "image/png",
    ACL: 'public-read'
};*/
var fileStream = fs.createReadStream('./public/troll.png');
fileStream.on('error', function (err) {
    if (err) { throw err; }
}); 
fileStream.on('open', function () {
    var s3 = new AWS.S3();
    s3.putObject({
        Bucket: '6.470/folder4',
        Key: 'trolla.png',
        Body: fileStream
    }, function (err) {
        if (err) { throw err; }
    });
});
/*
s3.upload(params, function(err, data) {
    if (err) {       
        console.log(err);
    }
    else {
        console.log("Successfully uploaded data!");   
    }
});*/

s3.listBuckets (function (err, data) {
    for (var index in data.Buckets) {
        var bucket = data.Buckets[index];
        console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationData);
    }
});

// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    /*
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });*/

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    /*
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });*/

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    
    //used to get user object
    //debug might need to add IsLoggedIn
    app.get('/profile', function(req, res) {
        res.json(req.user);
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    
    app.get('/logout', function(req, res) {
        console.log("logged out"); //debug
        req.logout();
        res.redirect('/');
    });


    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('*', function(req, res) {
        res.sendFile("./public/index.html"); //debug
        //res.render('index.ejs'); // load the index.ejs file
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    console.log("isLoggedIn reached"); //debug

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
