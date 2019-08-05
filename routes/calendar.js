var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

// A map for colors because Microsoft hates me and doesn't provide this in response
var colorMap = {
    preset0: '#FF0000',
    preset1: '#FFA500',
    preset2: '#FFDAB9',
    preset3: '#FFFF00',
    preset4: '#008000',
    preset5: '#20B2AA',
    preset6: '#6B8E23',
    preset7: '#0000FF',
    preset8: '#9370DB',
    preset9: '#FFC0CB',
    preset10: '#D3D3D3',
    preset11: '#4682B4',
    preset12: '#808080',
    preset13: '#A9A9A9',
    preset14: '#000000',
    preset15: '#8B0000',
    preset16: '#FF8C00',
    preset17: '#A0522D',
    preset18: '#BDB76B',
    preset19: '#006400',
    preset20: '#008080',
    preset21: '#556B2F',
    preset22: '#00008B',
    preset23: '#4B0082',
    preset24: '#800080'
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
// TODO: Make sure api path is correct
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
            categories = await client
                .api('/me/outlook/masterCategories')
                .get();

            categories = categories.value;
            catColor = {}
            for (cat in categories) {
                cat = categories[cat];
                catColor[cat.displayName] = colorMap[cat.color];
            }
            console.log(catColor);

            // Uncomment x and .top lines to cap results
            let x = 100

            // For getting group calendar events
            /*
            const calendars = await client
                .api('/me/calendars')
                .get();

            console.log(calendars);
            
            let id;
            const groupResults = await client
                .api(`/groups/${id}/events`)
                .headers({
                    Prefer: "outlook.timezone=\"Pacific Standard Time\""
                })
                .select('subject,start,end,categories,isAllDay,importance,location')
                .orderby('start/dateTime DESC')
                .get();
            let groupEvents = groupResults.value;
            */
            const result = await client
                .api(`/me/calendarView?startDateTime=${start}&endDateTime=${end}`)
                .headers({
                    Prefer: "outlook.timezone=\"Pacific Standard Time\""
                })
                .top(x)
                .select('subject,start,end,categories,isAllDay,importance,location')
                .orderby('start/dateTime DESC')
                .get();

            let package = result.value;
            for (event in package) {
                event = package[event];
                if (event.categories) {
                    console.log('Event has Categories');
                    event.color = catColor[event.categories[0]];
                } else {
                    event.color = "Black";
                }
            }
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