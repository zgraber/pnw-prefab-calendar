function scroll(speed) {
    $('.fc-scroller').animate({ scrollTop: $('.fc-scroller').height() }, speed, function() {
        $(this).animate({ scrollTop: 0 }, speed);
    });
}

var speed = 10000;
scroll(speed);
setInterval(function(){scroll(speed)}, speed *2);