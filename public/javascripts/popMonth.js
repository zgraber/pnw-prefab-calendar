document.addEventListener('DOMContentLoaded', function () {
    let calendarEl1 = document.getElementById('calendar1');
    let calendarEl2 = document.getElementById('calendar2');

    var date = new Date();
    // Set Start of calendar view to today at midnight
    var start = new Date(date.getFullYear(), date.getMonth(), 1);

    // Set End of calendar view to a week from now
    var end = new Date(date.getFullYear(), date.getMonth() + 2, 0);

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
                    allDay: item.allDay,
                    eventColor: '#0000FF'
                })
            }


            let calendar1 = new FullCalendar.Calendar(calendarEl1, {
                plugins: ['dayGrid'],
                events: events,
                height: $(window).height() * 0.9,
                aspectRatio: 2,
                eventColor: '#000000',
                eventTextColor: '#FFFFFF',
                eventRender: function (event) {
                    let now = new Date();
                    now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    let then = new Date(event.event.end);
                    if (then < now) {
                        //event.el.style['background-color'] = 'grey';
                        event.el.style['opacity'] = 0.2;
                    }
                },
                controls: false
            });

            let calendar2 = new FullCalendar.Calendar(calendarEl2, {
                plugins: ['dayGrid'],
                events: events,
                height: $(window).height() * 0.9,
                aspectRatio: 2,
                defaultDate: end.toISOString(),
                eventColor: '#000000',
                eventTextColor: '#FFFFFF'
            });

            calendar1.render();
            calendar2.render();
            $('.fc-button').remove();
        })
        .fail(function (err) {
            console.log(err);
            $(".error").append("<h2 style=\"color:white\">" + err.responseJSON.error.status + "<br>Check Authentication</h2>");
        })
});