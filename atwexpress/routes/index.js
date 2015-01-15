var express = require('express');
var multer = require('multer');
var router = express.Router();
var done = false;

/*Configure multer*/
router.use(multer({ dest: './UPLOADS/',
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

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Home' });
});



module.exports = router;

/* Get upload page. */
router.get('/upload',function(req,res){
	res.render('upload',{title: 'Upload'})
});

/* POSTS */

router.post('/api/photo',function(req,res){
  if(done==true){
    console.log(req.files);
    res.end("File uploaded.");
  }
});