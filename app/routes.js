var AWS = require('aws-sdk');
var uuid = require('node-uuid'); //used for generating unique UUID numbers
var fs = require('fs'); //used for file streaming
var multer = require("multer"); //used to interpret/handle file data
AWS.config.loadFromPath('./config/aws/config.json');
var s3 = new AWS.S3();
var nodemailer = require("nodemailer"); //email transporter

var transporter = nodemailer.createTransport({
    service: "Yahoo",
    auth: {
        user: "schrodingersblackbox@yahoo.com",
        pass: "3cr8410zy4"
    }
});

// app/routes.js
module.exports = function(app, passport, mongoose) {

    //for handling configuration information about the user, boxes, and items in the database
    var userConfigSchema = new mongoose.Schema({
        username: String,
        email: String,
        boxes_created: [String],
        boxes_collaborated: [String],
        showEmail: Boolean
    });

    var boxConfigSchema = new mongoose.Schema({
        boxid: String,
        boxname: String,
        capacity: Number,
        itemcount: Number,
        owner: String,
        ownerusername: String,
        collaborators: [String],
        completed: String,
        fileFilter: [String],
        regionFilter: [String],
        showEmail: Boolean
    });

    var itemConfigSchema = new mongoose.Schema({
        boxid: String,
        key: String,
        title: String,
        author: String,
        authoremail: String,
        description: String,
        filetype: String,
        showEmail: Boolean
    });

    var userConfigModel = mongoose.model('UserConfig', userConfigSchema);
    var boxConfigModel = mongoose.model('BoxConfig', boxConfigSchema);
    var itemConfigModel = mongoose.model('ItemConfig', itemConfigSchema);

    //used to get user object
    //doesn't call isLoggedIn since it's necessary to NOT return an error if the user isn't authenticated
    //instead, the result should always be a success, but a success returning 'false' indicates to the front end that there is no profile to be loaded
    //this is so that the front-end doesn't encounter an error in the beginning when it always checks for the profile
    //which is the only way for the front-end to know whether the user is logged in or not
    app.get('/profile', function (req, res) {
        if (req.isAuthenticated()) {
            userConfigModel.findOne(
                {email: req.user.local.email},
                function (err, data) {
                    if (err) {
                        console.error(err);
                        res.redirect('/fail');
                    }
                    else {
                        newData = {};
                        newData["local"] = req.user.local;
                        newData["username"] = data.username; //set username that was just retrieved
                        newData["showEmail"] = data.showEmail;
                        res.json(newData);
                    }
                }
            );
        }
        else {
            res.json(false);
        }
    });
    
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/fail', function (req, res, next) {
        res.statusCode = 500;
        res.json({});
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
    app.get('/setupuser', isLoggedIn, function (req, res) {
        var userConfig = new userConfigModel({
            username: '',
            email: req.user.local.email,
            boxes_created: [],
            boxes_collaborated: [],
            showEmail: true
        });
        userConfig.save(function(err) {
            if (err) {
                console.error(err);
                res.redirect('/fail');
            }
            else {
                res.redirect('/');
            }
        });
    });

    app.post('/setupusername', isLoggedIn, function (req, res) {
        //update user configuration to update the username
        userConfigModel.findOneAndUpdate(
            {email: req.user.local.email},
            {username: req.body.username},
            {upsert: false},
            function (err, data) {
                if (err) {
                    console.error(err);
                    res.redirect('/fail');
                }
                else {

                    boxConfigModel.update(
                    {owner: req.user.local.email},
                    {ownerusername: req.body.username},
                    {
                        upsert: false,
                        multi: true
                    },
                    function (err, data2) {
                        if (err) {
                            console.error(err);
                            res.redirect('/fail');
                        }
                        else {

                            itemConfigModel.update(
                            {authoremail: req.user.local.email},
                            {author: req.body.username},
                            {
                                upsert: false,
                                multi: true
                            },
                            function (err, data3) {
                                if (err) {
                                    console.error(err);
                                    res.redirect('/fail');
                                }
                                else {
                                    res.json(data);
                                }
                            });
                        }
                    });
                }
            }
        );
    });

    app.post('/toggleshowemail', isLoggedIn, function (req, res) {
        //update user configuration to add this box as a box collaborated
        userConfigModel.findOneAndUpdate(
        {email: req.user.local.email},
        {$set: {showEmail: req.body.showemail}},
        {upsert: false},
        function (err, data) {
            if (err) {
                console.error(err);
                res.redirect('/fail');
            }
            else {

                boxConfigModel.update(
                {owner: req.user.local.email},
                {showEmail: req.body.showemail},
                {
                    upsert: false,
                    multi: true
                },
                function (err, data2) {
                    if (err) {
                        console.error(err);
                        res.redirect('/fail');
                    }
                    else {

                        itemConfigModel.update(
                        {authoremail: req.user.local.email},
                        {showEmail: req.body.showemail},
                        {
                            upsert: false,
                            multi: true
                        },
                        function (err, data3) {
                            if (err) {
                                console.error(err);
                                res.redirect('/fail');
                            }
                            else {
                                res.json(data);
                            }
                        });
                    }
                });
            }
        });
    });

    //processes the receive box request
    app.post('/receivebox', isLoggedIn, function (req, res, next) {
        //get the user config file to see what boxes we've created and collaborated on
        var fileFilter = req.body.files;
        var regionFilter = req.body.regions;
        userConfigModel.findOne(
            {email: req.user.local.email},
            function (err, data) {
                if (err) {
                    console.error(err);
                    res.redirect('/fail');
                }
                else {
                    boxes_created = data.boxes_created;
                    boxes_collaborated = data.boxes_collaborated;

                    boxConfigModel.find(function (err, data) {
                        if (err) {
                            console.error(err);
                            res.redirect('/fail');
                        }
                        else {
                            boxes_list = data;

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
                                if (!(value.fileFilter.every(function (val) { return fileFilter.indexOf(val) >= 0; })) || 
                                	!(value.regionFilter.every(function (val) { return regionFilter.indexOf(val) >= 0; })) ||
                                    (value.regionFilter === [] && value.regionFilter !== [])
                                    ) {
                                	return false;
                                }
                                return true; //if box is incomplete and it's not a box that the user has created or collaborated, return true
                            }
                            var boxes_available = boxes_list.filter(excludeBoxes);

                            //check if boxes_available > 0
                            if (boxes_available.length > 0) {
                                //randomly pick a box to give
                                var j = Math.floor((Math.random() * boxes_available.length));

                                //update user configuration to add this box as a box collaborated
                                userConfigModel.findOneAndUpdate(
                                    {email: req.user.local.email},
                                    {$push: {boxes_collaborated: boxes_available[j].boxid}},
                                    {upsert: true},
                                    function (err, data) {
                                        if (err) {
                                            console.error(err);
                                            res.redirect('/fail');
                                        }
                                        else {

                                            //update box configuration to add this box as a box collaborated
                                            boxConfigModel.findOneAndUpdate(
                                                {boxid: boxes_available[j].boxid},
                                                {$push: {collaborators: req.user.local.email}},
                                                {upsert: true},
                                                function (err, data) {
                                                    if (err) {
                                                        console.error(err);
                                                        res.redirect('/fail');
                                                    }
                                                    else {
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

    app.post('/getusernumuploads', isLoggedIn, function (req, res, next) {
        itemConfigModel.find(
            {
                authoremail: req.user.local.email,
                boxid: req.body.boxid
            },
            function (err, data) {
                if (err) {
                    console.error(err);
                    res.redirect('/fail');
                }
                else {
                    numuploadsLeft = 4 - data.length; //max upload per user
                    uploadsLeftObj = {
                        uploadsLeft: numuploadsLeft
                    }
                    res.json(uploadsLeftObj);
                }
            }
        );
    });

    //this is required for upload.tpl.html
    app.get('/uploadgoodies', isLoggedIn, function (req, res, next) {
        res.json({});
    });

    // processes the upload
    app.post('/uploadgoodies', isLoggedIn, function (req, res) {
        var thisFile = req.files['files[]'];
        bucketBox = '6.470/Boxes/' + req.body.boxname;


        itemConfigModel.find(
            {
                authoremail: req.user.local.email,
                boxid: req.body.boxname
            },
            function (err, data) {
                if (err) {
                    console.error(err);
                    res.redirect('/fail');
                }
                else {
                    var numuploadsLeft = 4 - data.length; //max upload per user
                    numuploadsLeft = parseInt(numuploadsLeft);
                    //Does not pass upload if number of uploaded items total will exceed user upload capacity for this box
                    var trycount = parseInt(req.body.numuploads);
                    if (trycount <= numuploadsLeft) {
                        boxConfigModel.findOne({"boxid": req.body.boxname},
                        function(err,data){
                            if (err) {
                                console.error(err);
                                res.redirect('/fail');
                            }
                            else {
                                params = {
                                    Bucket: bucketBox + "/items",
                                    Key: thisFile.name,
                                    Body: thisFile.buffer,
                                    ContentType: thisFile.mimetype
                                }
                                var itemsLeft = parseInt(data.capacity)-parseInt(data.itemcount);
                                //Does not pass upload if number of uploaded items total will exceed box capacity
                                var newcount = parseInt(data.itemcount) + parseInt(req.body.numuploads);
                                if(newcount<=data.capacity){
                                        s3.upload(params,function(err,data){
                                            if (!err) {
                                                if(thisFile.mimetype.indexOf("video")>-1||thisFile.mimetype.indexOf("image")>-1){
                                                       thumbnailParams = {
                                                          Bucket: bucketBox + "/Thumbnails",
                                                         Key: thisFile.name+"-t.tbl",
                                                         Body: req.files[thisFile.originalname].buffer
                                                         }
                                                         s3.upload(thumbnailParams,function(err,data1){
                                                            if (!err) {
                                                            }
                                                            else
                                                            {
                                                                //upload default thumbnail?
                                                                console.error(err);
                                                                res.redirect('/fail');
                                                            }
                                                            });
                                                    }
                                                else if(thisFile.mimetype.indexOf("audio")>-1)
                                                {                                        
                                                    fs.readFile('./public/img/mp3icon.png', function(err, data) {
                                                        if(err){
                                                            console.error(err);
                                                            res.redirect('/fail');
                                                        }
                                                        else{
                                                    thumbnailParams = {
                                                         Bucket: bucketBox + "/Thumbnails",
                                                         Key: thisFile.name+"-t.tbl",
                                                         Body: data
                                                         }
                                                         s3.upload(thumbnailParams,function(err,data1){
                                                            if (!err) {
                                                            }
                                                            else
                                                            {
                                                                //upload default thumbnail?
                                                                console.error(err);
                                                                res.redirect('/fail');
                                                            }
                                                            });
                                                        }
                                                    });
                                                }
                                                else if(thisFile.mimetype.indexOf("pdf")>-1)
                                                {
                                                    fs.readFile('./public/img/pdficon.png', function(err, data) {
                                                        if(err){
                                                            console.error(err);
                                                            res.redirect('/fail');
                                                        }
                                                        else{
                                                            thumbnailParams = {
                                                            Bucket: bucketBox + "/Thumbnails",
                                                            Key: thisFile.name+"-t.tbl",
                                                            Body: data
                                                             }
                                                            s3.upload(thumbnailParams,function(err,data1){
                                                            if (!err) {
                                                            }
                                                            else
                                                            {
                                                                //upload default thumbnail?
                                                                console.error(err);
                                                                res.redirect('/fail');
                                                            }
                                                            });
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    fs.readFile('./public/img/unknownicon.png', function(err, data) {
                                                        if(err){
                                                            console.error(err);
                                                            res.redirect('/fail');
                                                        }
                                                        else{
                                                            thumbnailParams = {
                                                             Bucket: bucketBox + "/Thumbnails",
                                                             Key: thisFile.name+"-t.tbl",
                                                             Body: data
                                                          }
                                                            s3.upload(thumbnailParams,function(err,data1){
                                                            if (!err) {
                                                            }
                                                            else
                                                            {
                                                                //upload default thumbnail?
                                                                console.error(err);
                                                                res.redirect('/fail');
                                                            }
                                                            });
                                                        }
                                                    });
                                                }
                                                
                                                //create item configuration in the database
                                                var itemConfig = new itemConfigModel({
                                                    boxid: req.body.boxname,
                                                    key: thisFile.name,
                                                    title: req.body.title,
                                                    author: req.body.username,
                                                    authoremail: req.user.local.email,
                                                    description: req.body.description || "",
                                                    filetype: thisFile.mimetype,
                                                    showEmail: true
                                                });
                                                itemConfig.save(function(err) {
                                                    if (err) {
                                                        console.error(err);
                                                        res.redirect('/fail');
                                                    }
                                                    else {

                                                        //update box configuration
                                                        boxConfigModel.findOneAndUpdate(
                                                            {boxid: req.body.boxname},
                                                            {$inc: {itemcount: 1}},
                                                            function (err, data) {
                                                                if (err) {
                                                                    console.error(err);
                                                                    res.redirect('/fail');
                                                                }
                                                                else {
                                                                    //mark our boxes as complete once the number of items has reached the capacity
                                                                    if (parseInt(data.itemcount) === parseInt(data.capacity)){
                                                                        data.completed = "true";
                                                                        data.save();
                                                                        //send email notifying the owner and collaborators that their box is complete
                                                                        for (var k in data.collaborators) {
                                                                            transporter.sendMail({
                                                                                from: 'schrodingersblackbox@yahoo.com',
                                                                                to: data.collaborators[k],
                                                                                subject: "[Shrödinger's Black Box] Created Box Complete!",
                                                                                text: 'Hello,\n\n\tOne of your created boxes is complete. Please visit atwexpress.nodejitsu.com to view the box.\n\nSincerely,\nThe Shrödinger\'s Black Box Team'
                                                                            }, function (err, res) {
                                                                                if (err) {
                                                                                    console.error(err);
                                                                                    res.redirect('/fail');
                                                                                }
                                                                                else {
                                                                                }
                                                                            });
                                                                        }
                                                                        transporter.sendMail({
                                                                            from: "schrodingersblackbox@yahoo.com",
                                                                            to: data.owner,
                                                                            subject: "[Shrödinger's Black Box] Collaborated Box Complete!",
                                                                            text: 'Hello,\n\n\tOne of your collaborated boxes is complete. Please visit atwexpress.nodejitsu.com to view the box.\n\nSincerely,\nThe Shrödinger\'s Black Box Team'
                                                                        }, function (err, res) {
                                                                            if (err) {
                                                                                console.error(err);
                                                                                res.redirect('/fail');
                                                                            }
                                                                            else {
                                                                            }
                                                                        });
                                                                    }

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
                                else {
                                    console.error("Exceeds box capacity!");
                                    res.json({"files": [
                                    {
                                        "name": thisFile.name,
                                        "size": thisFile.size,
                                        "error": "Upload Fail! "+req.body.numuploads+" upload(s) will exceed the box capacity! There are only " + itemsLeft +" item spots left in the box."
                                    }
                                    ]});
                                }

                            }
                        });
                    }
                    else {
                        console.error("Exceeds user upload cap!");
                        res.json({"files": [
                        {
                            "name": thisFile.name,
                            "size": thisFile.size,
                            "error": "Upload Fail! "+trycount+" upload(s) will exceed the user upload capacity! There are only " + numuploadsLeft +" item spots left in the box."
                        }
                        ]});
                    }
                }
            }
        );
    
    });

    // process the create form
    app.post('/create', isLoggedIn, function (req, res) {
        var boxId = uuid.v4(); //generate a unique uuid for the box
        bucketBox = "6.470/Boxes/" + boxId + "/";
        s3.headBucket({Bucket:bucketBox}, function(err,data){
            if(err){
                s3.createBucket({Bucket:bucketBox},function(err,data){
                    if (err) {       
                        console.error(err);
                        res.redirect('/fail');
                    }
                    else {

                        //create box configuration in the database
                        var ownername = "";
                        if (req.body.username !== '') {
                            var ownername = req.body.username;
                        }
                        var boxConfig = new boxConfigModel({
                            boxid: boxId,
                            boxname: req.body.boxname,
                            capacity: req.body.boxSize,
                            itemcount: 0,
                            owner: req.user.local.email,
                            ownerusername: ownername,
                            collaborators: [],
                            completed: "false",
                            fileFilter: req.body.filters.files,
                            regionFilter: req.body.filters.regions,
                            showEmail: true
                        });
                        boxConfig.save(function(err) {
                            if (err) {
                                console.error(err);
                                res.redirect('/fail');
                            }
                            else {

                                //update user configuration to add this box as a box created
                                userConfigModel.findOneAndUpdate(
                                    {email: req.user.local.email},
                                    {$push: {boxes_created: boxId}},
                                    {upsert: true},
                                    function (err, data) {
                                        if (err) {
                                            console.error(err);
                                            res.redirect('/fail');
                                        }
                                        else {

                                            //create the thumbnails folder
                                            s3.headBucket({Bucket:bucketBox + "Thumbnails/"}, function(err,data){
                                                if(err){
                                                    s3.createBucket({Bucket:bucketBox + "Thumbnails/"},function(err,data){
                                                        if (err) {       
                                                            console.error(err);
                                                            res.redirect('/fail');
                                                        }
                                                        else {
                                                            res.json(boxConfig);
                                                        }
                                                    });
                                                 } else {
                                                     console.error("Thumbnails folder already exists!");
                                                     res.redirect('/fail');
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
                 res.redirect('/fail');
             }
        });
    });

    // get contents of the form
    app.post('/getbox', isLoggedIn, function (req, res) {

        var boxParams = {
            Bucket: '6.470/',
            Prefix: 'Boxes/' + req.body.boxname
        }
        
        s3.listObjects(boxParams, function (err, data) {
            if (err) {
                console.error(err, err.stack);
                res.redirect('/fail');
            }
            else {
                res.json(data.Contents);
            }
        });
    });
    
    //retrieve user configuration from the database
    app.get('/getuserconfig', isLoggedIn, function (req, res) {
        userConfigModel.findOne(
            {email: req.user.local.email},
            function (err, data) {
                if (err) {
                    console.error(err);
                    res.redirect('/fail');
                }
                else {
                    res.json(data);
                }
            }
        );
    });

    //retrieve box configuration from the database
    app.post('/getboxconfig', isLoggedIn, function (req, res) {
        boxConfigModel.findOne(
            {boxid: req.body.boxid},
            function (err, data) {
                if (err) {
                    console.error(err);
                    res.redirect('/fail');
                }
                else {
                    res.json(data);
                }
            }
        );
    });

    app.post('/getitemconfig', isLoggedIn, function (req, res) {
        itemConfigModel.findOne(
            {key: req.body.key},
            function (err, data) {
                if (err) {
                    console.error(err);
                    res.redirect('/fail');
                }
                else {
                    res.json(data);
                }
            }
        );
    });

    app.post('/getitem', isLoggedIn, function (req, res) {

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
function isLoggedIn (req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        return next();
    }

    return next("User not authenticated."); //causes http request to fail with an error
}
