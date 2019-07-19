var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

// A map for colors because Microsoft hates me and doesn't provide this in response
var colorMap = {
    preset0: 'Red',
    preset1: 'Orange',
    preset2: 'PeachPuff',
    preset3: 'Yellow',
    preset4: 'Green',
    preset5: 'LightSeaGreen',
    preset6: 'OliveDrab',
    preset7: 'Blue',
    preset8: 'MediumPurple',
    preset9: 'Pink',
    preset10: 'LightGrey',
    preset11: 'SteelBlue',
    preset12: 'Grey',
    preset13: 'DarkGrey',
    preset14: 'Black',
    preset15: 'DarkRed',
    preset16: 'DarkOrange',
    preset17: 'Sienna',
    preset18: 'DarkKhaki',
    preset19: 'DarkGreen',
    preset20: 'Teal',
    preset21: 'DarkOliveGreen',
    preset22: 'DarkBlue',
    preset23: 'Indigo',
    preset24: 'Purple'
}

/* GET /calendar/timeline */
router.get('/timeline', async function (req, res, next) {
    const userName = req.cookies.graph_user_name;
    if (userName) {
        let parms = {};
        parms.title = 'Timeline View';
        parms.active = {
            timeline: true
        };

        parms.user = userName;
        parms.scroll = true;

        res.render('timeline', parms);
    } else {
        console.log('User Invalid:');
        console.log(userName);
        res.redirect('/')
    }

});

// Renders the Calendar month view
router.get('/month', async function (req, res, next) {
    const userName = req.cookies.graph_user_name;
    if (userName) {
        let parms = {};
        parms.title = 'Month View';
        parms.active = {
            full: true,
            month: true
        };

        parms.user = userName;

        res.render('month', parms);
    } else {
        console.log('User Invalid:');
        console.log(userName);
        res.redirect('/')
    }
})

// Renders the Time Grid View
router.get('/grid', async function (req, res, next) {
    const userName = req.cookies.graph_user_name;
    if (userName) {
        let parms = {};
        parms.title = 'Time Grid';
        parms.active = {
            full: true,
            grid: true
        };
        parms.user = userName;
        res.render('grid', parms);
    } else {
        console.log('User Invalid:');
        console.log(userName);
        res.redirect('/');
    }
})

// A route to get all events from startDateTime to endDateTime
// TODO: Add category color to each event and make a color key for the categories
router.get('/events', async function (req, res, next) {
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
            // Get the categories to assign colors
            // Don't have permissions for this yet
            /*categories = await client
                .api('/me/outlook/masterCategories')
                .get();

            categories = categories.value;
            catColor = {}
            for (cat in categories) {
                cat = categories[cat];
                catColor[cat.displayName] = colorMap[cat.color];
            }
            console.log(catColor);*/

            // Uncomment x and .top lines to cap results
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
            //send results as json to client
            res.json(package);
        } catch (err) {
            console.log(err);
            var parms = {};
            parms.message = 'Error retrieving events';
            parms.error = {
                status: `${err.code}: ${err.message}`
            };
            parms.debug = JSON.stringify(err.body, null, 2);
            //send error json to client
            res.status(500).json(parms);
        }
    } else {
        console.log('Redirecting');
        console.log(accessToken);
        res.redirect('/');
    }
});

module.exports = router;