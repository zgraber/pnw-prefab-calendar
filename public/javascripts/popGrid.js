document.addEventListener('DOMContentLoaded', function () {
    let calendarEl = document.getElementById('grid');

    var date = new Date();
    // Set Start of calendar view to today at midnight
    var start = new Date(new Date().setHours(0, 0, 0));

    // Set End of calendar view to a week from now
    var end = new Date(new Date(start).setDate(start.getDate() + 8));

    $.getJSON('/calendar/events?startDateTime=' + start.toISOString() + '&endDateTime=' + end.toISOString(), function () {
            console.log('Success');
        })
        .done(function (data) {
            let events = [];
            var item;
            for (item in data) {
                item = data[item];
                events.push({
                    title: item.subject,
                    start: item.start.dateTime,
                    end: item.end.dateTime,
                    allDay: item.isAllDay
                })
            }


            let calendar = new FullCalendar.Calendar(calendarEl, {
                plugins: ['timeGrid'],
                defaultView: 'timeGridWeek',
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,timeGridDay'
                },
                events: events
            });

            calendar.render();
        })
        .fail(function (err) {
            console.log(err);
            $(".error").append("<h2 style=\"color:white\">" + err.responseJSON.error.status + "<br>Check Authentication</h2>");
        })
});