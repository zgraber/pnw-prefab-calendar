document.addEventListener('DOMContentLoaded', function () {
    let calendarEl1 = document.getElementById('calendar1');
    let calendarEl2 = document.getElementById('calendar2');

    // Date that is today
    var date = new Date();
    // Set Start of calendar view to the first of this month
    var start = new Date(date.getFullYear(), date.getMonth(), 1);

    // Set End of calendar view to the end of next month
    var end = new Date(date.getFullYear(), date.getMonth() + 2, 0);

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
                events.push({
                    title: item.subject,
                    start: item.start.dateTime,
                    end: item.end.dateTime,
                    allDay: item.allDay,
                    eventColor: '#0000FF'
                })
            }

            // Calendar that shows the all the events of the current month
            let calendar1 = new FullCalendar.Calendar(calendarEl1, {
                plugins: ['dayGrid'],
                events: events,
                // Height adjusts the size of the calendar itself, not the white background
                height: $(window).height() * 0.9,
                aspectRatio: 2,
                eventColor: '#000000',
                eventTextColor: '#FFFFFF',
                eventRender: function (event) {
                    //Lowers the opacity of events that have already passed
                    let now = new Date();
                    now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    let then = new Date(event.event.end);
                    if (then < now) {
                        event.el.style['opacity'] = 0.2;
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
                eventColor: '#000000',
                eventTextColor: '#FFFFFF'
            });

            // Render both calendars and remove the navigation elements
            calendar1.render();
            calendar2.render();
            $('.fc-button').remove();
        })
        .fail(function (err) {
            // Throw in an error message in the .error element
            console.log(err);
            $(".error").append("<h2 style=\"color:white\">" + err.responseJSON.error.status + "<br>Check Authentication</h2>");
        })
});