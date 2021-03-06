var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');

/* GET /authorize. */
router.get('/', async function(req, res, next){
    //Get auth code
    const code = req.query.code;

    if (code) {
        try {
            // Stores access token in session cookie
            await authHelper.getTokenFromCode(code, res);
            // Redirect to home
            res.redirect('/calendar/month');
        } catch (error) {
            res.render('error', {title: 'Error', message: 'Error exchanging code for token', error: error});
        }
    } else {
        res.render('error', {title: 'Error', message: 'Authorization error', error: {status: 'Missing code parameter'} });
    }
})

/* GET /authorize/signout */
router.get('/signout', function(req, res, next){
    authHelper.clearCookies(res);

    // Redirect to home
    res.redirect('/home')
})

module.exports = router;