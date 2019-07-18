var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

/* GET /calendar/timeline */
router.get('/timeline', async function(req, res, next){
    const userName = req.cookies.graph_user_name;
    if (userName) {
        let parms = {};
        parms.title = 'Timeline View';
        parms.active = {timeline:true};
        
        parms.user = userName;
        parms.scroll = true;
        
        res.render('timeline', parms);
    } else {
        console.log('User Invalid:');
        console.log(userName);
        res.redirect('/')
    }
    
});

router.get('/month', async function(req, res, next) {
    const userName = req.cookies.graph_user_name;
    if (userName) {
        let parms = {};
        parms.title = 'Month View';
        parms.active = {full: true, month:true};
        
        parms.user = userName;
        
        res.render('month', parms);
    } else {
        console.log('User Invalid:');
        console.log(userName);
        res.redirect('/')
    }
})

router.get('/grid', async function(req, res, next){
    const userName = req.cookies.graph_user_name;
    if(userName) {
        let parms = {};
        parms.title = 'Time Grid';
        parms.active = {full: true, grid: true};
        parms.user = userName;
        res.render('grid', parms);
    } else {
        console.log('User Invalid:');
        console.log(userName);
        res.redirect('/');
    }
})

router.get('/events', async function(req, res, next){
    const accessToken = await authHelper.getAccessToken(req.cookies, res);
    if (accessToken) {
        //Initialize Graph client
        const client = graph.Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });
        console.log(req.query);
        // Set Start of calendar view to today at midnight
        const start = req.query.startDateTime;

        // Set End of calendar view to 7 days from start
        const end = req.query.endDateTime;

        try {
            // Get the first x events for the coming week
            //let x = 100
            const result = await client
            .api(`/me/calendarView?startDateTime=${start}&endDateTime=${end}`)
            .headers({
                Prefer: "outlook.timezone=\"Pacific Standard Time\""
            })
            //.top(x)
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