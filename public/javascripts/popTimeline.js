var decodedJson = decodeURIComponent("{{{encodedJson}}}");
var jsonObj = JSON.parse(decodedJson);
//console.log(jsonObj);

var groups = new vis.DataSet();
var categoryGroups = {};

function addGroup(id, content) {
    groups.add({
        id: id,
        content: content
    });
    categoryGroups[content] = id;
}

function getDateTime(dateStr) {
    var date = new Date(dateStr);
    var time = date.toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
    var myDate = date.toLocaleString(undefined, {
        day: 'numeric',
        month: 'numeric'
    });
    return [time, myDate];
}

addGroup(0, 'Unclassified');
var data = new vis.DataSet();
var i = 1;
var j = 1;
var events = jsonObj.events;
//console.log(events);
for (event in events) {
    event = events[event];
    var dateTime = getDateTime(event.start.dateTime);
    var startTime = dateTime[0];
    var date = dateTime[1];
    var content = date;
    if (!event.isAllDay){
        content += (', ' + startTime)
    }
    content += ('<br>' + event.subject);
    if(event.location.displayName) {
        content += (';<br>' + event.location.displayName);
    } 

    var className = "";
    if (event.importance === "high"){
        className = "red";
    } else if (event.importance === "low") {
        className = "blue";
    }

    if (event.categories.length === 0) {
        data.add({
            id: j,
            className: className,
            group: 0,
            content: content,
            start: event.start.dateTime,
            //end: event.end.dateTime
        })
        j++;
    } else {
        for (category in event.categories) {
            category = event.categories[category];
            if (!categoryGroups[category]) {
                
                addGroup(i, category);
                i++;
            }
            data.add({
                id: j,
                className: className,
                group: categoryGroups[category],
                content: content,
                start: event.start.dateTime,
                //end: event.end.dateTime
            })
            j++;
        }
    }
}

var options = {
    editable: false,
    margin: {
        item: 20,
        axis: 40
    },
    orientation: {
        axis: 'top',
        item: 'top'
    }
};
//console.log(data)
var container = document.getElementById('visualization');
var timeline = new vis.Timeline(container, data, groups, options);

function move(percentage) {
    var range = timeline.getWindow();
    var interval = range.end - range.start;
    timeline.setWindow({
        start: range.start.valueOf() - interval * percentage,
        end: range.end.valueOf() - interval * percentage
    });
}