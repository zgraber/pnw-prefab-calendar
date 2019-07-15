var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

/* GET /calendar */
router.get('/', async function(req, res, next){
    const userName = req.cookies.graph_user_name;
    if (userName) {
        let parms = {};
        parms.title = 'Calendar';
        parms.active = {calendar:true};
        
        parms.user = userName;
        parms.scroll = true;
        
        res.render('calendar', parms);
    } else {
        console.log('User name sucks');
        console.log(userName);
        res.redirect('/')
    }
    
});

router.get('/events', async function(req, res, next){
    const accessToken = await authHelper.getAccessToken(req.cookies, res);
    if (accessToken) {
        //Initialize Graph client
        const client = graph.Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });

        // Set Start of calendar view to today at midnight
        const start = new Date(new Date().setHours(0,0,0));

        // Set End of calendar view to 7 days from start
        const end = new Date(new Date(start).setDate(start.getDate() + 7));

        try {
            // Get the first x events for the coming week
            let x = 20
            const result = await client
            .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
            .headers({
                Prefer: "outlook.timezone=\"Pacific Standard Time\""
            })
            .top(x)
            .select('subject,start,end,categories,isAllDay,importance,location')
            .orderby('start/dateTime DESC')
            .get();

            let package = result.value;
            console.log(result.value);
            res.json(package);
        } catch (err) {
            var parms = {};
            parms.message = 'Error retrieving events';
            parms.error = { status: `${err.code}: ${err.message}`};
            parms.debug = JSON.stringify(err.body, null, 2);
            res.status(500).json(parms);
        }
    } else {
        console.log('Redirecting');
        console.log(accessToken);
        res.redirect('/');
    }
});

module.exports = router;