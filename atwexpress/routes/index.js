var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Home' });
});

module.exports = router;

/* Get upload page. */
router.get('/upload',function(req,res){
	res.render('upload',{title: 'Upload'})
});
