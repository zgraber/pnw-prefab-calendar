document.addEventListener('DOMContentLoaded', function() {
    let calendarEl = document.getElementById('calendar');
    
    var date = new Date();
    // Set Start of calendar view to today at midnight
    var start = new Date(new Date().setHours(0,0,0));

    // Set End of calendar view to a week from now
    var end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    $.getJSON('/calendar/events?startDateTime=' + start.toISOString() + '&endDateTime=' + end.toISOString(), function() {
        console.log('Success');
    })
    .done(function(data){
        let events = [];
        var item;
        for (item in data) {
            item = data[item];
            events.push({
                title: item.subject,
                start: item.start.dateTime
            })
        }


        let calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: ['dayGrid'],
            defaultView: 'dayGridMonth',
            events: events
        });

        calendar.render();
    })
    .fail(function(err){
        console.log(err);
        $(".error").append("<h2 style=\"color:white\">"+ err.responseJSON.error.status +"<br>Check Authentication</h2>");
    })    
});