var express = require('express');
var router = express.Router();
var google = require('googleapis');
/* GET home page. */

router.use(function(req,res,next){
  if (req.user) return next();
  res.redirect('/login');
})


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
