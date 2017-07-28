var socket = io();
var currentRoom;

function scrollToBottom() {
    if ($(window).scrollTop() + $(window).height() + 2 * $('#messages li').last().outerHeight() >= $(document).height()) {
        $("html, body").animate({scrollTop: $(document).height()}, 0);
    }
}

$('#login form').submit(function (e) {
    e.preventDefault();

    var user = { 
        username: $('#login input').val().trim()
    };
    if (user.username.length > 0) {
        socket.emit('user-login', user, function (success) {
            currentRoom = success;
            if (success) {
                $('body').removeAttr('id');
                $('#login').hide();
                $('#chat input').focus();
            }
        });
    }
});

$('#chat form').submit(function (e) {
    e.preventDefault();
    var message = {
        text: $('#m').val() 
    };
    if (message.text.trim().length !== 0) {
        $('#m').val(''); 
        if(message.text.trim() == "/users") {
            socket.emit('user-list', function (user) {
            });
        }
        else {
            socket.emit('chat-message', {message: message, rooms: currentRoom});
        }
    }
    $('#chat input').focus();
});

socket.on('chat-message', function (message) {
    $('#messages').append($('<li>').html('<span class="username">' + message.username + '</span> ' + message.text));
    scrollToBottom();
});
socket.on('user-login', function (user) {
    $('#users').append($('<li class="' + user.username + ' new">').html(user.username));
    setTimeout(function () {
        $('#users li.new').removeClass('new');
    }, 1000);
});
socket.on('user-list', function (user) {
    $('#messages').append($('<li class="' + user + ' inline-list">').html(user));
    scrollToBottom();
});
socket.on('user-logout', function (user) {
    var selector = '#users li.' + user.username;
    $(selector).remove();
});
socket.on('rooms', function (rooms) {
});