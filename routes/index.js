var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth')

router.get('/', async function (req, res, next) {
  //Gets the access token if it exists
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    res.redirect('/calendar/month');
  } else {
    signInUrl = authHelper.getAuthUrl();
    res.status(301).redirect(signInUrl);
  }
});



/* GET home page. */
router.get('/home', async function(req, res, next) {
  let parms = {title: 'Home', active: {home: true} };

  //Gets the access token if it exists
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    parms.user = userName;
    //parms.debug = `User: ${userName}\nAccess Token: ${accessToken}`;
  } else {
    parms.signInUrl = authHelper.getAuthUrl();
    //parms.debug = parms.signInUrl;
  }
  
  res.render('index', parms);
});

module.exports = router;
