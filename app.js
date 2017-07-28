var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];
var messages = [];
var rooms = ['general', 'samsung'];
var currentRoom = 'general';

app.use("/", express.static(__dirname + "/public"));

io.on('connection', function (socket) {
    var loggedUser;

    socket.join('general');

    socket.emit('rooms', rooms);

    for (var i = 0; i < users.length; i++) {
        socket.emit('user-login', users[i]);
    }
    socket.on('disconnect', function () {
        if (loggedUser !== undefined) {
            var userIndex = users.indexOf(loggedUser);
            if (userIndex !== -1) {
                users.splice(userIndex, 1);
            }
            io.emit('user-logout', loggedUser);
        }
    });
    socket.on('user-login', function (user, callback) {
        var userIndex = -1;
        for (i = 0; i < users.length; i++) {
            if (users[i].username === user.username) {
                userIndex = i;
            }
        }
        if (user !== undefined && userIndex === -1) {
            loggedUser = user;
            users.push(loggedUser);
            io.emit('user-login', loggedUser);
            callback(currentRoom);
        }
    });
        socket.on('user-list', function(user){
            for(var i = 0; i < users.length; i++) {
                io.sockets.emit('user-list', users[i].username);
            }
        });

    socket.on('chat-message', function (data) {
        if (data.message.text.indexOf("/") !== -1) {
            commandTodo(data.message, loggedUser);
        }
        else {
            data.message.username = loggedUser.username;
            io.sockets.in(data.rooms).emit('chat-message', data.message);
            messages.push(data.message);
        }
    });

});

http.listen(3000, function () {
    console.log('ok go  3000 port.');
});

