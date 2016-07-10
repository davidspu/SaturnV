var express = require('express');
var router = express.Router();
var google = require('googleapis');
/* GET home page. */

router.use(function(req,res,next){
  if (req.user) return next();
  res.redirect('/login');
})

router.get('/', function(req, res, next) {
  var planets = [];
  req.user.contacts.forEach(function(contact){
    planets.push({
      R: Math.pow((contacts.score + 2),2)*20,
      r: Math.pow((contacts.score + 2),2),
      speed: -5.00,
      phi0: 0
    })
  })
  res.render('index', { planet:JSON.stringify(planets) });
});

module.exports = router;
