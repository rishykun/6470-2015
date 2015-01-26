var AWS = require('aws-sdk');
var uuid = require('node-uuid'); //used for generating unique UUID numbers
var fs = require('fs'); //used for file streaming
var multer = require("multer"); //used to interpret/handle file data
AWS.config.loadFromPath('./config/aws/config.json');
var s3 = new AWS.S3();

// app/routes.js
module.exports = function(app, passport, mongoose) {

    //for handling configuration information about the user, boxes, and items in the database
    var userConfigSchema = new mongoose.Schema({
        username: String,
        boxes_created: [String],
        boxes_collaborated: [String]
    });

    var boxConfigSchema = new mongoose.Schema({
        boxid: String,
        boxname: String,
        capacity: Number,
        itemcount: Number,
        owner: String,
        collaborators: [String],
        completed: String
    });

    var itemConfigSchema = new mongoose.Schema({
        boxid: String,
        key: String,
        title: String,
        author: String,
        description: String,
        filetype: String
    });

    var userConfigModel = mongoose.model('UserConfig', userConfigSchema);
    var boxConfigModel = mongoose.model('BoxConfig', boxConfigSchema);
    var itemConfigModel = mongoose.model('ItemConfig', itemConfigSchema);

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
        var userConfig = new userConfigModel({
            username: req.user.local.email,
            boxes_created: [],
            boxes_collaborated: []
        });
        userConfig.save(function(err) {
            if (err) {
                console.error(err);
            }
            else {
                console.log("Successfully registered user configuration in the database."); //debug
                console.log(userConfig); //debug
                res.redirect('/');
            }
        });       
    })

    //processes the receive box request
    app.get('/receivebox', isLoggedIn, function (req, res, next) {
        //get the user config file to see what boxes we've created and collaborated on
        userConfigModel.findOne(
            {username: req.user.local.email},
            function (err, data) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log("Successfully retrieved user configuration in the database."); //debug
                    console.log(data); //debug

                    boxes_created = data.boxes_created;
                    boxes_collaborated = data.boxes_collaborated;

                    console.log("\nboxes created"); //debug
                    console.log(boxes_created); //debug

                    boxConfigModel.find(function (err, data) {
                        if (err) {
                            console.error(err);
                        }
                        else {
                            boxes_list = data;
                            console.log("\nall box list"); //debug
                            console.log(boxes_list); //debug

                            //exclude the boxes that the user has already created/collaborated
                            //or are already complete
                            function excludeBoxes(value, index, array) {
                                if (value.completed === "true") {
                                    return false;
                                }
                                for (i in boxes_created) {
                                    if (value.boxid === boxes_created[i]) {
                                        return false;
                                    }
                                }
                                for (i in boxes_collaborated) {
                                    if (value.boxid === boxes_collaborated[i]) {
                                        return false;
                                    }
                                }
                                return true; //if box is incomplete and it's not a box that the user has created or collaborated, return true
                            }
                            var boxes_available = boxes_list.filter(excludeBoxes);
                            console.log("\nboxes available"); //debug
                            console.log(boxes_available); //debug

                            //check if boxes_available > 0
                            if (boxes_available.length > 0) {
                                //randomly pick a box to give
                                var j = Math.floor((Math.random() * boxes_available.length));
                                console.log("box returned, index: " + j); //debug
                                console.log(boxes_available[j]); //debug

                                //update user configuration to add this box as a box collaborated
                                userConfigModel.findOneAndUpdate(
                                    {username: req.user.local.email},
                                    {$push: {boxes_collaborated: boxes_available[j].boxid}},
                                    {upsert: true},
                                    function (err, data) {
                                        if (err) {
                                            console.error(err);
                                        }
                                        else {
                                            console.log("Successfully updated user configuration in the database."); //debug
                                            console.log(data); //debug

                                            //update user configuration to add this box as a box collaborated
                                            boxConfigModel.findOneAndUpdate(
                                                {boxid: boxes_available[j].boxid},
                                                {$push: {collaborators: req.user.local.email}},
                                                {upsert: true},
                                                function (err, data) {
                                                    if (err) {
                                                        console.error(err);
                                                    }
                                                    else {
                                                        console.log("Successfully updated box configuration in the database."); //debug
                                                        console.log(data); //debug
                                                        res.json(boxes_available[j]);
                                                    }
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                            else {
                                next("\nNo available boxes.");
                            }
                        }
                    });
                }
            }
        );
    });
    //this is required for upload.tpl.html
    app.get('/uploadgoodies', function(req, res, next) {
        console.log(req.files);
        res.json({});
    });

    // processes the upload
    app.post('/uploadgoodies', isLoggedIn, function(req, res, next) {
        //if we have at least one file to upload
        if (req.hasOwnProperty('files') && req.files.hasOwnProperty('files[]')) {
            var thisFile = req.files['files[]'];
            bucketBox = '6.470/Boxes/' + req.body.boxname;
            params = {
                Bucket: bucketBox + "/items",
                Key: thisFile.name,
                Body: thisFile.buffer
            }
            console.log("boxname is: " + req.body.boxname); //debug
            boxConfigModel.findOne({"boxid": req.body.boxname},
                function(err,data){
                    if(err){
                        console.error(err);
                    }
                    else{

                        console.log(data); //debug
                        var itemsLeft = parseInt(data.capacity)-parseInt(data.itemcount);
                        //Does not pass upload if number of uploaded items total will exceed box capacity
                        var newcount = parseInt(data.itemcount) + parseInt(req.body.numuploads);
                        if(newcount<=data.capacity){
                                s3.upload(params,function(err,data){
                                    if (!err) {
                                        console.log('Successfully uploaded item to box: ' + req.body.boxname + "."); //debug
                                        //create item configuration in the database
                                        var itemConfig = new itemConfigModel({
                                            boxid: req.body.boxname,
                                            key: thisFile.name,
                                            title: req.body.title,
                                            author : req.user.local.email,
                                            description: req.body.description || "",
                                            filetype: thisFile.mimetype
                                        });
                                        itemConfig.save(function(err) {
                                            if (err) {
                                                console.error(err);
                                            }
                                            else {
                                                console.log("Successfully registered item configuration in the database."); //debug
                                                console.log(itemConfig); //debug

                                                //update box configuration
                                                boxConfigModel.findOneAndUpdate(
                                                    {boxid: req.body.boxname},
                                                    {$inc: {itemcount: 1}},
                                                    function (err, data) {
                                                        if (err) {
                                                            console.error(err);
                                                        }
                                                        else {
                                                            //mark our boxes as complete once the number of items has reached the capacity
                                                            if (data.itemcount == data.capacity){
                                                                data.completed = "true";
                                                                data.save();
                                                                console.log("Setting upload capacity to true"); //debug
                                                            }
                                                            console.log("Successfully updated box configuration in the database."); //debug
                                                            console.log(data); //debug

                                                            res.writeHead(200, {
                                                                'Content-Type': req.headers.accept
                                                                    .indexOf('application/json') !== -1 ?
                                                                            'application/json' : 'text/plain'
                                                            });
                                                            response = {
                                                                "files": [
                                                                    {
                                                                        "name": thisFile.name,
                                                                        "size": thisFile.size,
                                                                        "url": "http://localhost:3000",
                                                                        "thumbnailUrl": "http://localhost:3000",
                                                                        "deleteUrl": "http://localhost:3000",
                                                                        "deleteType": "DELETE"
                                                                    }
                                                                ]
                                                            };
                                                            res.end(JSON.stringify(response));
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    }
                                    else{
                                        console.error(err);
                                        res.redirect('/fail');
                                    }
                                });
                        }
                        else{
                            res.json({"files": [
                        {
                            "name": thisFile.name,
                            "size": thisFile.size,
                            "error": "Upload Fail! "+req.body.numuploads+" upload(s) will exceed the box capacity! There are only " + itemsLeft +" item spots left in the box."
                        }
                        ]});
                            console.error("Exceeds box capacity!");
                        }

                    }
                }
            )
        }
        else {
            next("No files have been set to upload");
        }
    });

    // process the create form
    app.post('/create', isLoggedIn, function(req, res) {
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

                        //create box configuration in the database
                        var boxConfig = new boxConfigModel({
                            boxid: boxId,
                            boxname: req.body.boxname,
                            capacity: 3, //default
                            itemcount: 0,
                            owner: req.user.local.email,
                            collaborators: [],
                            completed: "false"
                        });
                        boxConfig.save(function(err) {
                            if (err) {
                                console.error(err);
                            }
                            else {
                                console.log("Successfully registered box configuration in the database."); //debug
                                console.log(boxConfig); //debug

                                //update user configuration to add this box as a box created
                                userConfigModel.findOneAndUpdate(
                                    {username: req.user.local.email},
                                    {$push: {boxes_created: boxId}},
                                    {upsert: true},
                                    function (err, data) {
                                        if (err) {
                                            console.error(err);
                                        }
                                        else {
                                            console.log("Successfully updated user configuration in the database."); //debug
                                            console.log(data); //debug

                                            //create the thumbnails folder
                                            s3.headBucket({Bucket:bucketBox + "Thumbnails/"}, function(err,data){
                                                if(err){
                                                    s3.createBucket({Bucket:bucketBox + "Thumbnails/"},function(err,data){
                                                        if (err) {       
                                                            console.error(err);
                                                        }
                                                        else {
                                                            console.log("Successfully created thumbnails folder.");
                                                            res.json(boxConfig);
                                                        }
                                                    });
                                                 } else {
                                                     console.error("Thumbnails folder already exists!");
                                                 }
                                            });
                                        }
                                    }
                                );
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
    app.post('/getbox', isLoggedIn, function(req, res) {

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
    
    //retrieve user configuration from the database
    app.get('/getuserconfig', isLoggedIn, function(req, res) {
        userConfigModel.findOne(
            {username: req.user.local.email},
            function (err, data) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log("Successfully retrieved user configuration in the database."); //debug
                    console.log(data); //debug
                    res.json(data);
                }
            }
        );
    });

    //retrieve box configuration from the database
    app.post('/getboxconfig', isLoggedIn, function(req, res) {
        boxConfigModel.findOne(
            {boxid: req.body.boxid},
            function (err, data) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log("Successfully retrieved box configuration in the database."); //debug
                    console.log(data); //debug
                    res.json(data);
                }
            }
        );
    });

    app.post('/getitemconfig', isLoggedIn, function(req, res) {
        itemConfigModel.findOne(
            {key: req.body.key},
            function (err, data) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log("Successfully retrieved item configuration in the database."); //debug
                    console.log(data); //debug
                    res.json(data);
                }
            }
        );
    });

    app.post('/getitem', isLoggedIn, function (req, res) {
        console.log(req.body.uri); //debug
        console.log(req.body.key); //debug

        var itemParams = {
            Bucket: req.body.uri,
            Key: req.body.key
        };

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
