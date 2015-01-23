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

    //used to get user object
    //doesn't call isLoggedIn since it's necessary to NOT return an error if the user isn't authenticated
    //instead, the result should always be a success, but a success returning 'false' indicates to the front end that there is no profile to be loaded
    //this is so that the front-end doesn't encounter an error in the beginning when it always checks for the profile
    //which is the only way for the front-end to know whether the user is logged in or not
    app.get('/profile', function(req, res) {
        if (req.isAuthenticated()) {
            res.json(req.user);
        }
        else {
            res.json(false);
        }
    });
    
    app.get('/logout', function(req, res) {
        console.log("Logged out of the server.");
        req.logout();
        res.redirect('/');
    });

    app.get('/fail', function(req, res, next) {
        next("Fail route reached.");
    })

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/setupuser', // redirect to the secure profile section
        failureRedirect : '/fail', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/fail', // redirect back to the signup page if there is an error
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

    //processes the receive box request
    app.get('/receivebox', function (req, res, next) {

        //get the user config file to see what boxes we've created and collaborated on
        var userParams = {
            Bucket:'6.470',
            Key: 'Users/'+req.user.local.email+'/user.config'
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
                rep.on('data',function(info){ //doesn't wait until data is loaded completely sometimes
                    jsonInfo = JSON.parse(info);
                    boxes_created = jsonInfo.boxes_created;
                    boxes_collaborated = jsonInfo.boxes_collaborated;

                    //now get a list of boxes
                    var boxParams = {
                        Bucket: '6.470/',
                        Prefix: 'Boxes/',
                        Delimiter: '/'
                    }
                    
                    s3.listObjects(boxParams, function (err, data) {
                        if (err) {
                            console.error(err, err.stack);
                        }
                        else {
                            prefix_list = data.CommonPrefixes;

                            //exclude the boxes that the user has already created/collaborated
                            function excludeBoxes(value, index, array) {
                                var found = false;
                                for (i in boxes_created) {
                                    if (value.Prefix === "Boxes/" + boxes_created[i] + "/") {
                                        found = true;
                                    }
                                }
                                for (i in boxes_collaborated) {
                                    if (value.Prefix === "Boxes/" + boxes_collaborated[i] + "/") {
                                        found = true;
                                    }
                                }
                                return !found;
                            }
                            var boxes_available = prefix_list.filter(excludeBoxes);

                            //randomly pick a box to give
                            var j = Math.floor((Math.random() * boxes_available.length) + 1);
                            res.json(boxes_available[j]);
                        }
                    });
                });
            }).on('error',function(err){
                console.log(err);
            });
        });
    });

    // processes the upload
    //debug TODO: it currently uploads to Boxes folder, we need to upload it to the current folder that we are viewing
    app.post('/uploadgoodies', function(req, res) {
        bucketBox = '6.470/Boxes/' + req.body.boxname;
        params = {
            Bucket: bucketBox + "/items",
            Key: req.files.upl.originalname,
            Body: req.files.upl.buffer
        }
        s3.upload(params,function(err,data){
            if(!err){
                console.log('Successfully uploaded item.');

                //generate the item config file
                var params = {
                    Bucket: bucketBox + '/config',
                    Key: req.files.upl.originalname + '.config',
                    Body: '{ "key": "' + req.files.upl.originalname + '", "title": "placeholder title", "author": "' + req.user.local.email + '", "description": "placeholder description", "filetype": "' + req.files.upl.mimetype + '" }'
                };

                s3.upload(params,function(err,data){
                    if(!err){
                        console.log('Successfully uploaded item config.');

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
                                                                                info = JSON.parse(info);
                                                                                info.boxes_created.push(boxId);
                                                                                var userConfigParams = {
                                                                                    Bucket: '6.470/Users/'+req.body.username,
                                                                                    Key: 'user.config',
                                                                                    Body: JSON.stringify(info)
                                                                                };
                                                                                s3.upload(userConfigParams, function(err, data) {
                                                                                    if (err) {       
                                                                                        console.error(err);
                                                                                    }
                                                                                    else {
                                                                                        console.log('Successfully updated user config');
                                                                                        var boxConfigData = '{ "name" : "' + req.body.boxname + '", "id" : "' + boxId + '", "uri" : "' + bucketBox + '" }';
                                                                                        res.json(boxConfigData);
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
                //DEBUG todo, this succeeds even if no user is found (try undefined as user and see the result)
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
        	res.json('{ "key": ' + '"' + req.body.key + '"' + ', "uri": ' + '"' + url + '"' + '}');
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
    return next("User not authenticated."); //causes http request to fail with an error
}
