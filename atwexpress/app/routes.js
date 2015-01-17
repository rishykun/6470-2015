var AWS = require('aws-sdk');
var uuid = require('node-uuid'); //used for generating unique UUID numbers
var fs = require('fs'); //used for file streaming
var multer = require("multer");

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

/*
var params = {
    Bucket: '6.470',
    Key: "troll",
    ContentType: "image/png",
    ACL: 'public-read'
};*/
/*
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
});*/
/*
s3.upload(params, function(err, data) {
    if (err) {       
        console.log(err);
    }
    else {
        console.log("Successfully uploaded data!");   
    }
});*/

/*
s3.listBuckets (function (err, data) {
    for (var index in data.Buckets) {
        var bucket = data.Buckets[index];
        console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationData);
    }
});*/

// app/routes.js
module.exports = function(app, passport) {

    //used to get user object, check if logged in first
    app.get('/profile',isLoggedIn, function(req, res) {
        res.json(req.user);
    });
    
    app.get('/logout', function(req, res) {
        console.log("Logged out of the server.");
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

    //--start multer
    var done = false;

    app.use(multer({ dest: './uploads/',
        rename: function (fieldname, filename) {
            return filename+Date.now();
        },
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...')
        },
        onFileUploadComplete: function (file) {
            console.log(file.fieldname + ' uploaded to  ' + file.path)
            done=true;
        }
    }));

    app.post('/api/photo',function(req,res){
        if(done==true){
            console.log(req.files);
            res.end("File uploaded.");
        }
    });
    //--end multer


    // processes the upload
    app.post('/upload', function(req, res) {
        console.log(req); //debug
    });

    // process the create form
    app.post('/create', function(req, res) {
        var boxId = uuid.v4(); //generate a unique uuid for the box
        bucketBox = "6.470/Boxes/" + boxId + "/";
        s3.headBucket({Bucket:bucketBox}, function(err,data){
            if(err){
                s3.createBucket({Bucket:bucketBox},function(err,data){
                    if (err) {       
                        console.log(err);
                    }
                    else {
                        console.log("Successfully created box.");

                        //create a config file for each newly-created box
                        var params = {
                            Bucket: bucketBox.substring(0,bucketBox.length-1),
                            Key: 'box.config',
                            Body: '{ "boxname" : "' + req.body.boxname + '", "itemcount" : "0", "owner" : "' + req.user.local.email + '", "collaborators" : "{}" }'
                        };
                        //debug todo: change body: req.user.local.email to req.user.local.user when available
                        s3.upload(params, function(err, data) {
                            if (err) {       
                                console.log(err);
                            }
                            else {
                                console.log("Successfully generated box configuration.");
                                res.json('{ "name" : "' + req.body.boxname + '", "id" : "' + boxId + '", "uri" : "' + bucketBox + '" }');
                            }
                        });
                    }
                });
             } else {
                 console.log("Box (bucket) already exists!");
             }
         });
    });

    // get contents of the form
    app.post('/getbox', function(req, res) {

        var boxParams = {
            Bucket: '6.470/',
            Prefix: 'Boxes/' + req.body.boxname
        }
        s3.listObjects(boxParams, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            }
            else {
                res.json(data.Contents);
            }
        });
    });

    app.post('/getitem', function (req, res) {
        console.log(req.body.uri); //debug
        console.log(req.body.key); //debug

        var itemParams = {
            Bucket: req.body.uri,
            Key: req.body.key
        };
                
        //downloads the file directly onto the server
        /*
        var file = fs.createWriteStream('./public/temp.pdf');
        item = s3.getObject(itemParams);
        item.createReadStream().pipe(file);
        */

        //creates a signed url to be accessible by the front-end
        s3.getSignedUrl('getObject', itemParams, function (err, url) {
            res.json("{ 'name': " + "'batman'" + ", 'uri': " + url + "}");
        });
    });

    app.get('*', function(req, res) {
        res.sendFile("./public/index.html");
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        console.log("User authenticated.");
        return next();
    }

    console.log("User not authenticated.");
    return false;
}
