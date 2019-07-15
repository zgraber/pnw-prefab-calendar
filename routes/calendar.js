var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

/* GET /calendar */
router.get('/', async function(req, res, next){
    let parms = {};

    const accessToken = await authHelper.getAccessToken(req.cookies, res);
    const userName = req.cookies.graph_user_name;


    if (accessToken && userName) {
        parms.user = userName;

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

            parms.events = result.value;
            console.log(result.value);
            res.render('calendar', {encodedJson: encodeURIComponent(JSON.stringify(parms)), user: userName, title: 'Calendar', active: { calendar:true }, scroll: true });
        } catch (err) {
            parms.message = 'Error retrieving events';
            parms.error = { status: `${err.code}: ${err.message}`};
            parms.debug = JSON.stringify(err.body, null, 2);
            res.render('error', parms);
        }
    } else {
        console.log(userName);
        // Access token okay but userName not because req.cookies not refreshed
        if (accessToken) {
            res.redirect('/calendar');
        // Access token undefined and user undefined so redirect to home
        } else {
            res.redirect('/');
        }
    }
});

module.exports = router;