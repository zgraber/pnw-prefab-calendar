document.addEventListener('DOMContentLoaded', function () {
    var elem = document.documentElement;

    function openFullscreen () {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullscreen) {
            elem.mozRequestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }
    openFullscreen();

    let calendarEl1 = document.getElementById('calendar1');
    let calendarEl2 = document.getElementById('calendar2');

    // Date that is today
    var date = new Date();
    // Set Start of calendar view to the first of this month
    var start = new Date(date.getFullYear(), date.getMonth(), 1);
    //var start = new Date(new Date().setHours(0,0,0));
    console.log(start)
    // Set End of calendar view to the end of next month
    var end = new Date(date.getFullYear(), date.getMonth() + 2, 0);
    //var end = new Date(new Date(start).setDate(start.getDate() + 30));
    console.log(end)
    // Gets the JSON with events of calendar 
    $.getJSON('/calendar/events?startDateTime=' + start.toISOString() + '&endDateTime=' + end.toISOString(), function () {
            console.log('Success');
        })
        .done(function (data) {
            let events = [];
            var item;
            // Process the data and push what's needed into events array
            for (item in data) {
                item = data[item];
                //console.log(item.end)
                events.push({
                    title: item.subject,
                    start: item.start.dateTime,
                    end: item.end.dateTime,
                    allDay: true,
                    color: item.color
                })
            }

            // Calendar that shows the all the events of the current month
            let calendar1 = new FullCalendar.Calendar(calendarEl1, {
                plugins: ['dayGrid'],
                events: events,
                // Height adjusts the size of the calendar itself, not the white background
                height: $(window).height() * 0.9,
                aspectRatio: 2,
                eventTextColor: '#FFFFFF',
                defaultDate: date,
                showNonCurrentDates: false,
                eventRender: function (event) {
                    //Lowers the opacity of events that have already passed
                    let now = new Date();
                    now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    let then;
                    if (event.event.end) {
                        then = new Date(event.event.end);
                    } else {
                        then = new Date (event.event.start);
                        then.setDate(then.getDate() + 1); 
                    }
                    //console.log(event.event.title);
                    //console.log(event.event);
                    if (then < now) {
                        event.el.style['opacity'] = 0.25;
                    }
                },
            });

            // Calendar that shows all the events of the next month
            let calendar2 = new FullCalendar.Calendar(calendarEl2, {
                plugins: ['dayGrid'],
                events: events,
                // Same as first calendar
                height: $(window).height() * 0.9,
                aspectRatio: 2,
                //Sets defaultDate to end of next month
                defaultDate: end.toISOString(),
                eventTextColor: '#FFFFFF',
                showNonCurrentDates: false
            });

            // Render both calendars and remove the navigation elements
            calendar1.render();
            calendar2.render();
            $('.fc-button').remove();

            $(".fc-day-grid-event").each(function(index) {
                var rgb = this.style.backgroundColor
                try {
                    rgb = rgb.substring(4, rgb.length-1)
                        .replace(/ /g, '')
                        .split(',');
                    if ( (rgb[0]*0.299 + rgb[1]*0.587 + rgb[2]*0.114) > 186) {
                        this.style.color = "Black";
                    } else {
                        this.style.color = "White";
                    }
                } catch (err){
                    this.style.color = "White";
                }
            });
        })
        .fail(function (err) {
            // Throw in an error message in the .error element
            console.log(err);
            $(".error").append("<h2 style=\"color:white\">" + err.responseJSON.error.status + "<br>Check Authentication</h2>");
        })
});