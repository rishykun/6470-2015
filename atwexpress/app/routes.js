var AWS = require('aws-sdk');
var uuid = require('node-uuid'); //used for generating unique UUID numbers
var fs = require('fs'); //used for file streaming
var multer = require("multer");
var s2json = require("string-to-json");
AWS.config.loadFromPath('./config/aws/config.json');
var s3 = new AWS.S3();

/*
s3.createBucket( {Bucket: 'myBucket2'}, function (err, data) {
    if (err) {       
        console.error(err);
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
        console.error(err);
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
        successRedirect : '/setupuser', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    //middleware that handles the format of the post data in uploads
    app.use(multer({ inMemory: true }));

    //only gets called when a user signs up successfully
    //creates the user's folder in the server and adds a user configuration file
    app.get('/setupuser', function(req, res) {
        bucketUser = "6.470/Users/" + req.user.local.email + "/";
        s3.headBucket({Bucket:bucketUser}, function(err,data){
            if(err){
                s3.createBucket({Bucket:bucketUser},function(err,data){
                    if (err) {       
                        console.error(err);
                    }
                    else {
                        console.log("Successfully created user folder.");

                        //create a config file for each newly-created box
                        var params = {
                            Bucket: bucketUser.substring(0,bucketUser.length-1),
                            Key: 'user.config',
                            Body: '{ "username" : "' + req.user.local.email + '", "boxes_created": [], "boxes_collaborated" : [] }'
                        };
                        //debug todo: change body: req.user.local.email to req.user.local.user when available
                        s3.upload(params, function(err, data) {
                            if (err) {       
                                console.error(err);
                            }
                            else {
                                console.log("Successfully generated user configuration.");
                                res.redirect('/');
                            }
                        });
                    }
                });
             } else {
                 console.error("User folder (bucket) already exists!");
             }
        });
    })

    // processes the upload
    //debug TODO: it currently uploads to Boxes folder, we need to upload it to the current folder that we are viewing
    app.post('/upload', function(req, res) {
        console.log(req.files.userPhoto); //debug
        params = {
            Bucket: '6.470/Boxes',
            Key: req.files.userPhoto.originalname,
            Body: req.files.userPhoto.buffer
        }
        s3.upload(params,function(err,data){
            if(!err){
                console.log('Successfully uploaded item.');

                //generate the item config file
                var params = {
                    Bucket: bucketBox.substring(0,bucketBox.length-1),
                    Key: req.files.userPhoto.originalname + '.config',
                    Body: '{ "boxname" : "' + req.body.boxname + '", "capacity" : "3", "itemcount" : "0", "owner" : "' + req.user.local.email + '", "collaborators" : [] }'
                };

                s3.upload(params,function(err,data){
                    if(!err){
                        console.log('Successfully uploaded item.');

                        //res.status(200);
                        res.redirect('/');
                    }
                    else{
                        console.error(err);
                        //res.status(500);
                        res.redirect('/upload');
                    }
                });
            }
            else{
                console.error(err);
                //res.status(500);
                res.redirect('/upload');
            }
        });
    });

    // process the create form
    app.post('/create', function(req, res) {
        var boxId = uuid.v4(); //generate a unique uuid for the box
        bucketBox = "6.470/Boxes/" + boxId + "/";
        s3.headBucket({Bucket:bucketBox}, function(err,data){
            if(err){
                s3.createBucket({Bucket:bucketBox},function(err,data){
                    if (err) {       
                        console.error(err);
                    }
                    else {
                        console.log("Successfully created box.");

                        //create a config file for each newly-created box
                        var params = {
                            Bucket: bucketBox.substring(0,bucketBox.length-1),
                            Key: 'box.config',
                            Body: '{ "boxname" : "' + req.body.boxname + '", "capacity" : "3", "itemcount" : "0", "owner" : "' + req.user.local.email + '", "collaborators" : [] }'
                        };
                        //debug todo: change body: req.user.local.email to req.user.local.user when available
                        s3.upload(params, function(err, data) {
                            if (err) {       
                                console.error(err);
                            }
                            else {
                                console.log("Successfully generated box configuration.");

                                //create the config folder
                                s3.headBucket({Bucket:bucketBox + "Config/"}, function(err,data){
                                    if(err){
                                        s3.createBucket({Bucket:bucketBox + "Config/"},function(err,data){
                                            if (err) {       
                                                console.error(err);
                                            }
                                            else {
                                                console.log("Successfully created config folder.");

                                                //create the thumbnails folder
                                                s3.headBucket({Bucket:bucketBox + "Thumbnails/"}, function(err,data){
                                                    if(err){
                                                        s3.createBucket({Bucket:bucketBox + "Thumbnails/"},function(err,data){
                                                            if (err) {       
                                                                console.error(err);
                                                            }
                                                            else {
                                                                console.log("Successfully created thumbnails folder.");
                                                                res.json('{ "name" : "' + req.body.boxname + '", "id" : "' + boxId + '", "uri" : "' + bucketBox + '" }');
                                                            }
                                                        });
                                                     } else {
                                                         console.error("Thumbnails folder already exists!");
                                                     }
                                                });
                                            }
                                        });
                                     } else {
                                         console.error("Config already exists!");
                                     }
                                });
// --------------Updating User Config File --------------
                                var userParams = {
                                    Bucket:'6.470',
                                    Key: 'Users/'+req.body.username+'/user.config'
                                }


                                s3.getSignedUrl('getObject', userParams, function (err, url) {
                                    var http = require('http');
                                    var options = {
                                        host: url.slice(8,24),
                                        port: 80,
                                        path: url.slice(24,url.length)
                                    };

                                    http.get(options,function(rep){
                                        rep.setEncoding('utf8');
                                        rep.on('data',function(info){
                                            console.log(info);
                                            info = s2json.convert(info);
                                            console.log(info);
                                            info.boxes_created.push(boxId);
                                            var userConfigParams = {
                                                Bucket: '6.470/Users/'+req.body.username+'/',
                                                Key: 'user.config',
                                                Body: info
                                            };
                                            s3.upload(userConfigParams, function(err, data) {
                                                if (err) {       
                                                    console.error(err);
                                                }
                                                else {
                                                    console.log('Successfully updated user config');
                                                }
                                            });
                                        }).on('error',function(err){
                                            console.log(err);
                                        });
                                        
                                    });
                                });
//-------------------------------------------------------

                            }
                        });
                    }
                });
             } else {
                 console.error("Box (bucket) already exists!");
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
                console.error(err, err.stack);
            }
            else {
                console.log(data.Contents); //debug
                res.json(data.Contents);
            }
        });
    });
    
    //Get user config
    app.post('/getuserconfig', function(req, res) {
        //TODO: handle not logged in user -> redirect to somewhere else?
        var userParams = {
            Bucket:'6.470',
            Key: 'Users/'+req.body.username+'/user.config'
        }
  

          s3.getSignedUrl('getObject', userParams, function (err, url) {
                var http = require('http');
                var options = {
                    host: url.slice(8,24),
                    port: 80,
                    path: url.slice(24,url.length)
                };
                
                http.get(options,function(rep){
                    rep.setEncoding('utf8');
                    rep.on('data',function(info){
                        res.json(info);
                    });
                }).on('error',function(err){
                    console.log(err);
                });
        
            });
    });

    //Get box config file
    app.post('/getboxconfig', function(req, res) {
        //TODO: handle not logged in user -> redirect to somewhere else?
        var userParams = {
            Bucket:'6.470',
            Key: 'Boxes/'+req.body.boxid+'/box.config'
        }
  

          s3.getSignedUrl('getObject', userParams, function (err, url) {
            var http = require('http');
            var options = {
                host: url.slice(8,24),
                port: 80,
                path: url.slice(24,url.length)
            };
            
            http.get(options,function(rep){
                rep.setEncoding('utf8');
                rep.on('data',function(info){
                    //console.log(info);
                    res.json(info);
                });
            }).on('error',function(err){
                console.log(err);
            });
    
        });
    });

    app.post('/getitemconfig', function(req, res) {
        //TODO: handle not logged in user -> redirect to somewhere else?
        var itemParams = {
            Bucket: req.body.uri,
            Key: req.body.key
        }
          s3.getSignedUrl('getObject', itemParams, function (err, url) {
                var http = require('http');
                var options = {
                    host: url.slice(8,24),
                    port: 80,
                    path: url.slice(24,url.length)
                };
                
                http.get(options,function(rep){
                    rep.setEncoding('utf8');
                    rep.on('data',function(info){
                        console.log(info);
                        res.json(info);
                    });
                }).on('error',function(err){
                    console.log(err);
                });
        
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
            res.json('{ "name": ' + '"batman"' + ', "uri": ' + '"' + url + '"' + '}');
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
