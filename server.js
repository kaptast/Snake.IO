var w = 20;
var players = [];
var width = 1000;
var height = 620;
var food = new Food();

function Player(id, x, y, name, r, g, b, tail) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.name = name;
    this.r = r;
    this.g = g;
    this.b = b;
    this.tail = tail;
    this.total = 0;
    this.record = 0;
}

function Food() {
    this.x = Math.floor(Math.random() * (width / w)) * w;
    this.y = Math.floor(Math.random() * (height / w)) * w;

    this.newPos = function() {
        this.x = Math.floor(Math.random() * (width / w)) * w;
        this.y = Math.floor(Math.random() * (height / w)) * w;
    }
}

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

setInterval(heartbeat, 33);

function heartbeat() {
    io.sockets.emit('heartbeat', players);
    io.sockets.emit('foodsent', food);
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
    // We are given a websocket object in our function
    function(socket) {

        console.log("We have a new client: " + socket.id);

        socket.on('start',
            function(data) {
                //console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
                var player = new Player(socket.id, data.x, data.y, data.name, data.r, data.g, data.b, data.tail);
                players.push(player);
                console.log(player.name + " has joined the game.");
                heartbeat();
            }
        );

        socket.on('food',
            function() {
                food.newPos();
            }
        );

        socket.on('update',
            function(data) {
                //console.log(socket.id + " " + data.x + " " + data.y);
                var player;
                for (var i = 0; i < players.length; i++) {
                    if (socket.id == players[i].id) {
                        //console.log(players[i].id);
                        player = players[i];
                    }
                }
                if (player != undefined) {
                    player.x = data.x;
                    player.y = data.y;
                    player.tail = data.tail;
                    player.total = data.total;
                    player.record = data.record;
                }
            }
        );

        socket.on('disconnect',
            function() {
                console.log(socket.id + " disconnected.");
                var place;
                for (var i = players.length - 1; i >= 0; i--) {
                    if (socket.id == players[i].id) {
                        place = i;
                    }
                }
                players.splice(place, 1);
            });
    }
);